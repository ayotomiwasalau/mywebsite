## Infrastructure

Terraform for the AWS architecture lives in `deployments/terraform`.

## Deploy Docker images (v1, v2, v3, …)

```bash
./deployments/manage.sh deploy-games
./deployments/manage.sh deploy-backend
./deployments/manage.sh show-image-tags
```

Counters are in `deployments/image-tags.env` (gitignored). GitHub Actions uses ECR to compute the next `vN` tag automatically.

## GitHub Actions CI/CD

Four workflows under `.github/workflows/`:

| Workflow | Paths | CI | Deploy (main + manual) |
|----------|-------|-----|------------------------|
| `frontend.yml` | `frontend/**` | lint, test, build | S3 sync + CloudFront invalidation |
| `backend.yml` | `backend/**` | pytest | ECR push + Lambda update |
| `backend-games.yml` | `backend_games/**` | pytest | ECR push + games Lambda update |
| `deployments.yml` | `deployments/**` | fmt, validate, plan | `terraform apply` |

Deploy jobs run on **push to `main`** when matching paths change, or via **workflow_dispatch** on any branch.

### Required GitHub Secrets

| Secret | Used by |
|--------|---------|
| `AWS_ACCESS_KEY_ID` | All deploy jobs |
| `AWS_SECRET_ACCESS_KEY` | All deploy jobs |
| `AWS_REGION` | All deploy jobs (optional, default `us-east-1`) |
| `SITE_BUCKET_NAME` | Frontend deploy |
| `CLOUDFRONT_DISTRIBUTION_ID` | Frontend deploy |
| `NEXT_PUBLIC_API_BASE_URL` | Frontend build (e.g. `https://votenigeria.com`) |
| `NEXT_PUBLIC_API_VERSION` | Frontend build (optional, default `v1`) |
| `NEXT_PUBLIC_SITE_URL` | Frontend build (optional) |
| `TF_VAR_domain_name` | Deployments plan/apply |
| `TF_VAR_hosted_zone_name` | Deployments plan/apply |
| `TF_VAR_lambda_environment_variables` | Deployments plan/apply (JSON map) |

Optional Terraform overrides: `TF_VAR_project_name`, `TF_VAR_environment`, `TF_VAR_api_version`, `TF_VAR_create_route53_records`.

Do **not** commit `terraform.tfvars` — copy from `deployments/terraform/terraform.tfvars.example` locally and mirror values into GitHub Secrets for CI.

### IAM permissions (CI user)

- ECR: push/describe images
- Lambda: update function code, get-function
- S3: sync to site bucket
- CloudFront: create invalidation
- Terraform-managed resources (full apply for deployments workflow)

### Remote state bootstrap (one-time)

See [terraform/README.md](terraform/README.md#remote-state-bootstrap-one-time). Required before CI can run `terraform plan/apply`.

## Local bootstrap

```bash
./deployments/manage.sh deploy-ecr
./deployments/manage.sh deploy-ecr-games
./deployments/manage.sh deploy-backend
./deployments/manage.sh deploy-games
./deployments/manage.sh deploy-s3-dynamo
./deployments/manage.sh deploy-all
```

Remove `lambda_image_tag = "latest"` from local `terraform.tfvars` if present — use `vN` tags via `manage.sh` or CI.
