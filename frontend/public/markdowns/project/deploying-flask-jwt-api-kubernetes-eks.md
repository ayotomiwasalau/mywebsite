![](/images/project/deploying-flask-jwt-api-kubernetes-eks/container-k8s.png)

A Flask API that works locally is not production-ready until it is **containerized, secured, and deployed with CI/CD**. This project walks through **Docker → ECR → EKS → CodePipeline** for a small JWT-protected Flask service—image build, secret injection, cluster rollout, and automated deploys on every push. It is the hands-on companion to the [containers and Kubernetes design notes](/work/blogs/containers-and-kubernetes-notes).

[GitHub — Deploy-Flask-App-to-Kubernetes-Using-EKS](https://github.com/ayotomiwasalau/Deploy-Flask-App-to-Kubernetes-Using-EKS) · [Design essay (blog)](/work/blogs/containers-and-kubernetes-notes)

## Context

Shipping a tutorial Flask app to a real cluster surfaces gaps that `flask run` never exposes: how images are built and versioned, where signing secrets live, and who triggers a rollout when main changes. The deployment had to satisfy four constraints without baking credentials into the repo:

- Container image built and tested on every commit
- `JWT_SECRET` and other credentials stored safely outside source control
- Production server (**Gunicorn**) instead of Flask's development server
- Kubernetes deployment on **AWS EKS** with an automated pipeline triggered by GitHub pushes

## Approach

A minimal JWT API pairs with an AWS-native delivery chain: developers push to GitHub, CodeBuild produces a tested image, ECR stores it, and EKS rolls pods forward from manifests in `examples/`. The application surface is intentionally small so the pipeline—not business logic—stays in focus.

| Route | Purpose |
|---|---|
| `GET /` | Health check — returns `Healthy` |
| `POST /auth` | Issue JWT from email + password |
| `GET /contents` | Return token payload (requires valid JWT) |

End to end, six components wire local development to automated cluster deploys:

1. **Dockerfile** — multi-stage build; pins Flask and Gunicorn in `requirements.txt`
2. **Local build/test** — validate the image and run `test_main.py` before push
3. **Amazon ECR** — store versioned images for the cluster to pull
4. **EKS cluster** — run workloads from Kubernetes manifests under `examples/`
5. **AWS Parameter Store** — inject `JWT_SECRET` at runtime; never commit secrets
6. **CodePipeline + CodeBuild** — on GitHub push, build, test, push image, and roll out to EKS (`buildspec.yml`, `ci-cd-codepipeline.cfn.yml`)


The CloudFormation template provisions the pipeline; CodeBuild executes the buildspec, runs tests, pushes to ECR, and updates the EKS deployment. Kubernetes pulls the new image tag and performs a rolling update — no manual SSH or server restarts.

## Architecture breakdown

Three layers stack on top of each other: the runnable image, the Kubernetes objects that schedule it, and the CI/CD automation that keeps cluster state aligned with git. Each layer has a single responsibility so failures are easy to localize.

**Container** — Dockerfile copies application code, installs dependencies, and starts Gunicorn. CI runs the same build path developers use locally.

**Kubernetes** — Deployment, Service, and secret references wire the JWT API into the cluster. Parameter Store values map into pod environment variables via IAM-scoped access.

**CI/CD** — CodePipeline stages: source (GitHub), build (CodeBuild), deploy (EKS). Failed tests block promotion; image tags trace to commits for one-command rollbacks. The `buildspec.yml` and `ci-cd-codepipeline.cfn.yml` in the repo document the full automation path.

## Tech stack

The stack stays within common AWS managed services so the project reads as a template for other stateless Python APIs—not a bespoke platform build.

| Layer | Tools |
|---|---|
| App | Python, Flask, Gunicorn |
| Auth | Custom JWT (`JWT_SECRET`) |
| Containers | Docker, Amazon ECR |
| Orchestration | Kubernetes, AWS EKS |
| CI/CD | AWS CodePipeline, CodeBuild, CloudFormation |
| Secrets | AWS Systems Manager Parameter Store |

## Impact

Beyond proving the API runs in a cluster, the repo documents an end-to-end pattern teams can copy: build once, store images in ECR, inject secrets at runtime, and promote only after tests pass.

- **Production deployment pattern** — not `flask run` on a bare VM
- **Secret management** outside source control with Parameter Store
- **Automated deploys** on git push — foundation for team workflows and rollbacks via image tags
- **Reference manifests** under `examples/` reusable for other stateless Python APIs on EKS
- **End-to-end AWS pattern** — ECR, EKS, Parameter Store, and CodePipeline wired through CloudFormation

## Links

Manifests, CloudFormation, and buildspec live in the repository; the blog post explains the design choices behind containers, Kubernetes, and CI/CD on AWS.

- [GitHub — Deploy-Flask-App-to-Kubernetes-Using-EKS](https://github.com/ayotomiwasalau/Deploy-Flask-App-to-Kubernetes-Using-EKS)
- [Blog — containers, Kubernetes, and CI/CD design](/work/blogs/containers-and-kubernetes-notes)
