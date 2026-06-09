![](/images/blog/containers-and-kubernetes-notes/kubernetes-kubelet.png)

## System overview

Data scientists and ML engineers who ship models into products eventually hit the same wall: the notebook runs locally, the demo works on one machine, and production is a different environment entirely. **Containers** package an application with its dependencies so the same artifact runs on a laptop, a CI runner, or a cloud cluster. **Kubernetes** orchestrates those containers at scale — scheduling, healing, load balancing, and rolling updates. **CI/CD** closes the loop by building, testing, and deploying on every merge.

This essay outlines how those three layers fit together for ML and API services, with trade-offs that matter before you buy hardware or wire a pipeline. For a concrete walkthrough — Docker image, JWT-secured Flask API, EKS manifests, Parameter Store secrets, and CodePipeline — see the [Flask JWT on EKS case study](/work/projects/deploying-flask-jwt-api-kubernetes-eks).

## Why containers for ML deployment

An ML-powered product combines a front end, REST endpoints, a database, and an inference engine — each with different runtime requirements. Containerization bakes dependencies into an immutable **Dockerfile** image: pinned libraries, application code, and a production entrypoint (**Gunicorn** or **Uvicorn**, not a dev server). The same artifact runs on a laptop, CI runner, or cloud cluster.

For ML, containers enable **reproducible inference** (model + preprocessing in one versioned tag), **resource isolation** (CPU/memory limits per workload), and **horizontal scale** (stateless replicas behind a load balancer). The cost is registry and base-image maintenance — worthwhile once traffic exceeds a single host.

A typical ML product stacks four components: front end, API layer, database, and scoring engine. Containerizing each layer — or the whole app as one image — eliminates the "it worked on my machine" gap between notebook and production.

## Microservices: when to split containers

Not every app should become twelve services on day one. **Microservices** mean decomposing an application into independently deployable units — for example, separating authentication, payment, and model inference into distinct containers with their own release cadence and scaling policy.

Split when boundaries are clear and load patterns differ:

| Service | Why separate |
|---|---|
| Auth / JWT issuance | Security patches and token logic change often; isolate secrets and rate limits |
| Inference API | GPU or CPU-heavy; scale on request volume |
| Batch retraining | Spiky, long-running jobs; scale to zero between schedules |
| Static front end | CDN-served assets; no need to co-locate with Python workers |

Keep a **modular monolith** in one container when the team is small and network hops add latency without benefit. Split when failure domains or scaling needs demand it.

## Kubernetes orchestration

**Kubernetes** declares desired state — "run three replicas of this API" — and reconciles reality continuously. **Pods** run containers; **Deployments** manage replica count and rolling updates; **Services** provide stable DNS to healthy pods; **nodes** (or **EKS** node groups) host scheduled workloads. Crashed pods are replaced; traffic spikes raise `replicas` or trigger a **Horizontal Pod Autoscaler**. That elasticity matters when campaign traffic overlaps batch scoring jobs on the same cluster.

![](/images/blog/containers-and-kubernetes-notes/containerization.png)

Managed **EKS**, **GKE**, and **AKS** reduce control-plane toil; you still own VPC networking, IAM, and upgrades.

## Load balancing and traffic management

Kubernetes **Services** spread traffic in-cluster; an **Ingress** or **AWS ALB** terminates TLS at the edge. Use **readiness probes** so pods join rotation only when ready (model loaded, DB pool warm); **liveness probes** restart stuck processes. Avoid session stickiness for stateless APIs; allow **graceful shutdown** so in-flight JWT or inference requests finish before pod termination. Gateways should enforce **timeouts** and **concurrency limits** on ML endpoints.

## Persistent storage

Containers are ephemeral by design. Anything written to a container filesystem disappears when the pod is rescheduled. That is correct for stateless APIs but wrong for databases, uploaded files, or shared model caches on disk.

Use **PersistentVolumes** for data that outlives pods, but prefer **managed databases** (RDS) and **S3** for transactional data and large model artifacts. ReadWriteMany volumes can mount shared read-only model directories when many inference pods need the same weights.

Inject JWT secrets and API keys via **Parameter Store** or **Kubernetes Secrets** — never bake them into images or git. The EKS project uses Parameter Store for `JWT_SECRET`.

## CI/CD: from commit to cluster

**CI/CD** automates build, test, and deploy on every push: `docker build`, run unit tests, push to **ECR**, update Kubernetes manifests, rolling deploy. **CodePipeline** and **CodeBuild** integrate natively with EKS via CloudFormation and `buildspec.yml`; **GitHub Actions**, **GitLab CI**, and **Jenkins** follow the same shape. Failing tests block promotion; image tags trace to git SHAs for rollbacks. Manual deploys — SCP to a server, restart Gunicorn — do not scale with team size or audit requirements.

## Design decisions

**Containers first** — environment parity before orchestration. **Secrets outside git** — Parameter Store with IAM-scoped access. **Stateless pods, external state** — RDS and S3 hold durable data. **Monolith until proven otherwise** — split services when scaling or ownership boundaries demand it.

## Trade-offs

| Pros | Cons |
|---|---|
| Reproducible deploys across environments | Learning curve for K8s YAML and debugging |
| Auto-healing and horizontal scale | Cluster cost even at low traffic |
| CI/CD audit trail and fast rollbacks | Persistent storage and networking need upfront design |
| Industry-standard path for ML APIs | Overkill for single static sites |

## Scaling considerations

A small EKS node group and two to three replicas suffice at moderate traffic. At high scale, add **cluster autoscaling**, **pod disruption budgets**, **multi-AZ** nodes, and **GitOps** (Argo CD, Flux). For ML, use **GPU node pools** or dedicated inference servers. Airbnb, Reddit, and Tinder run large Kubernetes fleets because declarative desired state and rolling updates match continuous delivery.

## Link

Implementation details, Dockerfile, EKS manifests, and CodePipeline setup: [View project case study](/work/projects/deploying-flask-jwt-api-kubernetes-eks).
