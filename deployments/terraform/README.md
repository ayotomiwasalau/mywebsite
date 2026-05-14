# Portfolio Blog Terraform

This Terraform setup models the AWS architecture from the deployment diagram:

- Route53 points the public domain at CloudFront.
- CloudFront serves static frontend assets from a private S3 bucket.
- CloudFront serves uploaded images from a private uploads S3 bucket under `/uploads/*`.
- CloudFront forwards `/api/*`, `/api`, and `/healthz` requests to API Gateway.
- API Gateway invokes the backend Lambda.
- DynamoDB is provisioned as the application database.
- Lambda can read/write DynamoDB and upload markdown/images to S3.

## Prerequisites

- Terraform 1.6 or newer.
- AWS credentials configured for the target account.
- An existing Route53 public hosted zone for `domain_name`, unless `create_route53_records = false`.
- A backend Lambda container image pushed to the ECR repository created by Terraform.
- A Lambda-compatible FastAPI image entrypoint. For FastAPI, add a Mangum adapter and expose a handler, for example:

```python
from mangum import Mangum

handler = Mangum(app)
```

## Quick Start

```bash
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
terraform apply
```

After apply, upload your built static frontend files to the `site_bucket_name` output and invalidate the `cloudfront_distribution_id` output.

## Frontend Upload Example

```bash
cd ../../frontend
npm run build
aws s3 sync out/ "s3://$(terraform -chdir=../deployments/terraform output -raw site_bucket_name)" --delete
aws cloudfront create-invalidation \
  --distribution-id "$(terraform -chdir=../deployments/terraform output -raw cloudfront_distribution_id)" \
  --paths "/*"
```

The command above assumes the frontend is configured for static export and writes files to `frontend/out`.

## Backend Notes

The Terraform creates an ECR repository and an image-based Lambda backend. Build your backend Docker image, push it to the `backend_ecr_repository_url` output, and set `lambda_image_tag` to the tag Lambda should use.

AWS Lambda does not pull container images directly from Docker Hub. If Docker Hub is your source repository, mirror or promote the image into this ECR repository before applying the Lambda resources.

After applying the ECR repository, build and push the backend image with:

```bash
../../backend/deploy.sh latest
```

The script reads `backend_ecr_repository_url` from Terraform outputs, logs in to ECR, builds `backend/Dockerfile`, tags the image, and pushes it to ECR.

The Lambda receives these environment variables automatically:

- `API_VERSION`
- `APP_TABLE_NAME`
- `DATABASE_BACKEND=dynamodb`
- `FILE_DISK_BACKEND=s3`
- `MARKDOWN_FILE_BACKEND=github`
- `AWS_S3_MARKDOWN_BUCKET`
- `MARKDOWN_CDN_BASE_URL`
- `AWS_S3_MARKDOWN_KEY_PREFIX`

Markdown writes are committed to GitHub when you provide these values through `lambda_environment_variables`:

- `GITHUB_TOKEN`
- `GITHUB_REPOSITORY`, for example `owner/repo`
- `GITHUB_BRANCH`, optional, defaults to `main`
- `GITHUB_MARKDOWN_BASE_PATH`, optional
- `GITHUB_MARKDOWN_PUBLIC_BASE_URL`, optional raw/CDN base URL
- `GITHUB_COMMIT_AUTHOR_NAME` and `GITHUB_COMMIT_AUTHOR_EMAIL`, optional

Use `lambda_environment_variables` for app-specific values such as `SKIP_JSON_SEED` and the GitHub settings above. Do not commit real GitHub tokens to `terraform.tfvars`.

For CI/CD deployments, publish an immutable image tag and update `lambda_image_tag` when deploying a new backend image.

#Todo
- implement the s3 connection for images
- tests
- markdowns should be stored in github update
- lambda installation
- fastapi auth