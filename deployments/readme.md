## Infrastructure

Terraform for the AWS architecture in the deployment diagram lives in `deployments/terraform`.

It provisions:

- Route53 DNS records for the public domain.
- A CloudFront CDN in front of private S3 buckets.
- An S3 bucket for static frontend files and an S3 bucket for admin-uploaded images.
- API Gateway HTTP API routes for backend traffic.
- A Lambda function for the backend application.
- A DynamoDB table for application data.

## Usage

```bash
cd deployments/terraform
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
terraform apply
```

Before applying, edit `terraform.tfvars` with your real domain, Route53 hosted zone, and Lambda image tag.

The backend Lambda uses a container image. Apply the ECR resources first, push the backend image with `backend/deploy.sh`, then apply the remaining Terraform resources.


cd deployments/terraform

terraform apply \
  -target=aws_ecr_repository.backend \
  -target=aws_ecr_lifecycle_policy.backend

terraform apply \
  -target=aws_dynamodb_table.app \
  -target=aws_s3_bucket.site \
  -target=aws_s3_bucket.uploads \
  -target=aws_s3_bucket_public_access_block.site \
  -target=aws_s3_bucket_public_access_block.uploads \
  -target=aws_s3_bucket_ownership_controls.site \
  -target=aws_s3_bucket_ownership_controls.uploads \
  -target=aws_s3_bucket_server_side_encryption_configuration.site \
  -target=aws_s3_bucket_server_side_encryption_configuration.uploads \
  -target=aws_s3_bucket_versioning.site \
  -target=aws_s3_bucket_versioning.uploads \
  -target=aws_s3_bucket_cors_configuration.uploads