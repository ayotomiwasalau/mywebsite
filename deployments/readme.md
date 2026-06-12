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

### Required GitHub Variables

Configure under **Settings → Secrets and variables → Actions → Variables**:

| Variable | Used by |
|----------|---------|
| `SITE_BUCKET_NAME` | Frontend deploy |
| `CLOUDFRONT_DISTRIBUTION_ID` | Frontend deploy |
| `NEXT_PUBLIC_API_BASE_URL` | Frontend build (e.g. `https://votenigeria.com`) |
| `TF_VAR_domain_name` | Deployments plan/apply |
| `TF_VAR_hosted_zone_name` | Deployments plan/apply |
| `AWS_REGION` | All deploy jobs (optional, default `us-east-1`) |
| `BACKEND_ECR_REPOSITORY_NAME` | Backend deploy (optional, default `ayotom-web-prod-backend`) |
| `BACKEND_LAMBDA_FUNCTION_NAME` | Backend deploy (optional, default `ayotom-web-prod-api`) |
| `GAMES_ECR_REPOSITORY_NAME` | Games deploy (optional, default `ayotom-web-prod-games`) |
| `GAMES_LAMBDA_FUNCTION_NAME` | Games deploy (optional, default `ayotom-web-prod-games`) |

Optional variables: `NEXT_PUBLIC_API_VERSION`, `NEXT_PUBLIC_SITE_URL`, `TF_VAR_project_name`, `TF_VAR_environment`, `TF_VAR_api_version`, `TF_VAR_create_route53_records`.

### Required GitHub Secrets

| Secret | Used by |
|--------|---------|
| `AWS_ACCESS_KEY_ID` | All deploy jobs |
| `AWS_SECRET_ACCESS_KEY` | All deploy jobs |
| `TF_VAR_lambda_environment_variables` | Deployments plan/apply (JSON map) |

Do **not** commit `terraform.tfvars` — copy from `deployments/terraform/terraform.tfvars.example` locally and mirror sensitive values into GitHub Secrets; non-sensitive deploy config goes in GitHub Variables.

### IAM permissions (CI user)

**Backend / games deploy** (`backend.yml`, `backend-games.yml`):

- ECR: `GetAuthorizationToken`, push, `DescribeImages`, `DescribeRepositories`
- Lambda: `GetFunction`, `UpdateFunctionCode` on `ayotom-web-prod-api` and `ayotom-web-prod-games`

**Frontend deploy** (`frontend.yml`):

- S3: sync to site bucket
- CloudFront: create invalidation

**Infrastructure** (`deployments.yml` only):

- Terraform remote state (S3 + DynamoDB locks)
- Full apply permissions for managed resources

### Remote state bootstrap (one-time)

See [terraform/README.md](terraform/README.md#remote-state-bootstrap-one-time). Summary:

```bash
cd deployments/terraform
# Comment out backend "s3" in versions.tf, then:
terraform init -reconfigure
terraform apply -target=aws_s3_bucket.terraform_state ... -target=aws_dynamodb_table.terraform_locks
# Uncomment backend block, then:
terraform init -migrate-state
```

Required before CI can run `terraform plan/apply`.

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
