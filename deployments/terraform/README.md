# Portfolio Blog Terraform

This Terraform setup models the AWS architecture from the deployment diagram:

- Route53 points the public domain at CloudFront.
- CloudFront serves static frontend assets from a private S3 bucket.
- CloudFront serves uploaded images from a private uploads S3 bucket under `/images/*` (with fallback to the site bucket for static markdown images).
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

## Remote state bootstrap (one-time)

Terraform state is stored in S3 with DynamoDB locking (`state_backend.tf`). If you already have local state:

```bash
cd deployments/terraform
terraform apply \
  -target=aws_s3_bucket.terraform_state \
  -target=aws_s3_bucket_versioning.terraform_state \
  -target=aws_s3_bucket_server_side_encryption_configuration.terraform_state \
  -target=aws_s3_bucket_public_access_block.terraform_state \
  -target=aws_dynamodb_table.terraform_locks
terraform init -migrate-state
```

New environments: run the targeted apply above before the first full `terraform apply`.

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

After applying the ECR repository, deploy with incremental tags (`v1`, `v2`, …):

```bash
../manage.sh deploy-backend
../manage.sh deploy-games
```

Each command auto-increments the counter in `deployments/image-tags.env`, pushes to ECR, updates the Lambda, and verifies the image URI.

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

Admin API routes require these auth values through `lambda_environment_variables`:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD_HASH`, preferred for deployed environments
- `ADMIN_PASSWORD`, local/simple fallback when no password hash is set
- `JWT_SECRET`, a long random secret used to sign admin tokens
- `JWT_EXPIRES_MINUTES`, optional, defaults to `60`

Use `lambda_environment_variables` for app-specific values such as `SKIP_JSON_SEED`, auth secrets, and the GitHub settings above. Do not commit real GitHub tokens, admin passwords, or JWT secrets to `terraform.tfvars`.

For CI/CD deployments, publish an immutable image tag and update `lambda_image_tag` when deploying a new backend image.

#Todo
- implement the s3 connection for images - done
- markdowns should be stored in github update - done
- lambda installation - done
- fastapi auth - done

- notification (webhooks)
- monitoring (uptime check)
- implement cloudfront
- g.analytics/seo

- tests
- fix frontend tags, edit that sorting with tags - done
- add animation, add special effect on button - done
- fix getting releated items in tags - done
- try diff fonts - done
- the cta at the bottom should show my work - done
- edit about personal edge & impact - done
- check db contet is not init twice - done

- animation for about page - done
- setup games - done


  - structure markdown/image content edit the content of the portfolio website to suit (blogs/project) - done
  - work on images - done
  - project should hav links at the top -done
  - opening a blog shld not open a new tab sometimes - done
  - add a switch tab under work and decide a the api endpoint to use - done

  - work on repo names, work on github for each project - done
  - change the description of the project - done
  - set the order in work, time too - done
  - cheking loading page and how its used - done
    - open a new tab on home or not? - done
  - click the nav button should respond - done


- review icons
- explore linking tiptier
  - review the loading speed of each page - 
  - retouch project one more time - done?










* chatpdfdoc 

* data warehousing with snowflake 
* dbt 
* how to create and deploy job on emr 
* building reproducible pipeline 
* club-football match 

* confluent kafka - using python sdk to stream data 
* confluent kafka - using cli to pub and sub 

* metaflow - data science workflow 

* distributed computing
* technology as a service
* container,k8s, and ci/cd 

* Data visualization
* Report generation 

* stock price prediction app - project
* movie recommender system - project
* Music song datapipelines - project
* jokes and riddle api project - project
* song and user data processing - project
* auth app deployment - project
* Data streaming application - project