![](/images/project/deploying-flask-jwt-api-kubernetes-eks/k8s-eks-hero.webp)

A Flask API that works locally is not production-ready until it is **containerized, secured, and deployed with CI/CD**. This project walks through **Docker → EKS → CodePipeline** for a JWT-protected Flask service.

## Problem

Teams need a repeatable path from code to cluster:

- Container image built and tested on every commit
- Secrets (e.g. `JWT_SECRET`) stored safely — not in git
- Production server (**Gunicorn**) instead of Flask dev server
- Kubernetes deployment on **AWS EKS** with automated pipeline

## Solution

Deploy a small Flask API ([GitHub](http://github.com/ayotomiwasalau/Deploy-Flask-App-to-Kubernetes-Using-EKS)) with three endpoints:

| Route | Purpose |
|---|---|
| `GET /` | Health check — returns `Healthy` |
| `POST /auth` | Issue JWT from email + password |
| `GET /contents` | Return token payload (requires valid JWT) |

Delivery pipeline:

1. **Dockerfile** — containerize app + Gunicorn
2. **Local build/test** — validate image before push
3. **EKS cluster** — run workloads on Kubernetes
4. **AWS Parameter Store** — inject `JWT_SECRET`
5. **CodePipeline + CodeBuild** — build, test, deploy on GitHub push (`buildspec.yml`, `ci-cd-codepipeline.cfn.yml`)

![](/images/project/deploying-flask-jwt-api-kubernetes-eks/containers-kubernetes.webp)

## Architecture breakdown

### Container

Multi-stage Dockerfile; `requirements.txt` pins Flask/Gunicorn dependencies; `test_main.py` for CI checks.

### Kubernetes

Manifests under `examples/` — deploy JWT API with cluster secrets wired from Parameter Store.

### CI/CD

CloudFormation for pipeline; CodeBuild runs tests and pushes images; EKS rolls out new versions.

## Tech stack

| Layer | Tools |
|---|---|
| App | Python, Flask, Gunicorn |
| Auth | Custom JWT (`JWT_SECRET`) |
| Containers | Docker |
| Orchestration | Kubernetes, AWS EKS |
| CI/CD | AWS CodePipeline, CodeBuild |
| Secrets | AWS Systems Manager Parameter Store |

## Impact

- **Production deployment pattern** — not just `flask run`
- **Secret management** outside source control
- **Automated deploys** on git push — foundation for team workflows

## Links

- [GitHub — Deploy-Flask-App-to-Kubernetes-Using-EKS](http://github.com/ayotomiwasalau/Deploy-Flask-App-to-Kubernetes-Using-EKS)
