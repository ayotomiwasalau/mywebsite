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

The backend Lambda uses a container image. Apply the ECR resources first, push the backend image with `deployments/manage.sh build-deploy-image`, then apply the remaining Terraform resources.


./deployments/manage.sh deploy-ecr

./deployments/manage.sh build-deploy-image latest

./deployments/manage.sh deploy-s3-dynamo

./deployments/manage.sh deploy-all