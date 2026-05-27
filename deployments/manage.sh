#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TERRAFORM_DIR="${TERRAFORM_DIR:-$SCRIPT_DIR/terraform}"
BACKEND_DIR="${BACKEND_DIR:-$REPO_ROOT/backend}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
LOCAL_IMAGE_NAME="${LOCAL_IMAGE_NAME:-portfolio-blog-backend}"
DOCKER_PLATFORM="${DOCKER_PLATFORM:-linux/amd64}"

usage() {
  cat <<EOF
Usage:
  ./deployments/manage.sh <command> [options]

Commands:
  deploy-ecr                 Deploy only ECR resources with Terraform targets.
  deploy-s3-dynamo           Deploy only S3 and DynamoDB resources with Terraform targets.
  build-deploy-image [tag]   Build backend Docker image and push it to ECR.
  deploy-all                 Deploy all Terraform resources in deployments/terraform.

Environment overrides:
  TERRAFORM_DIR              Terraform directory. Default: $TERRAFORM_DIR
  BACKEND_DIR                Backend build context. Default: $BACKEND_DIR
  IMAGE_TAG                  Docker/ECR image tag. Default: $IMAGE_TAG
  LOCAL_IMAGE_NAME           Local Docker image name. Default: $LOCAL_IMAGE_NAME
  DOCKER_PLATFORM            Docker build platform. Default: $DOCKER_PLATFORM
EOF
}

require_command() {
  local command_name="$1"
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "$command_name is required but was not found in PATH." >&2
    exit 1
  fi
}

terraform_apply() {
  require_command terraform
  terraform -chdir="$TERRAFORM_DIR" apply "$@"
}

deploy_ecr() {
  terraform_apply \
    -target=aws_ecr_repository.backend \
    -target=aws_ecr_lifecycle_policy.backend
}

deploy_s3_dynamo() {
  terraform_apply \
    -target=aws_dynamodb_table.app \
    -target=aws_s3_bucket.site \
    -target=aws_s3_bucket.uploads \
    -target=aws_s3_bucket_public_access_block.site \
    -target=aws_s3_bucket_public_access_block.uploads \
    -target=aws_s3_bucket_ownership_controls.site \
    -target=aws_s3_bucket_ownership_controls.uploads \
    -target=aws_s3_bucket_server_side_encryption_configuration.site \
    -target=aws_s3_bucket_server_side_encryption_configuration.uploads \
    -target=aws_s3_bucket_cors_configuration.uploads
}

build_deploy_image() {
  require_command terraform
  require_command aws
  require_command docker

  local image_tag="${1:-$IMAGE_TAG}"
  local repo_url registry aws_region image_uri

  repo_url="$(terraform -chdir="$TERRAFORM_DIR" output -raw backend_ecr_repository_url)"
  registry="$(echo "$repo_url" | cut -d/ -f1)"
  aws_region="$(echo "$registry" | cut -d. -f4)"
  image_uri="$repo_url:$image_tag"

  echo "Logging in to ECR registry: $registry"
  aws ecr get-login-password --region "$aws_region" \
    | docker login --username AWS --password-stdin "$registry"

  echo "Building backend image for $DOCKER_PLATFORM"
  docker build \
    --platform "$DOCKER_PLATFORM" \
    -t "$LOCAL_IMAGE_NAME:$image_tag" \
    "$BACKEND_DIR"

  echo "Tagging image: $image_uri"
  docker tag "$LOCAL_IMAGE_NAME:$image_tag" "$image_uri"

  echo "Pushing image to ECR"
  docker push "$image_uri"

  cat <<EOF

Pushed backend image:
  $image_uri

Make sure deployments/terraform/terraform.tfvars has:
  lambda_image_tag = "$image_tag"
EOF
}

deploy_all() {
  terraform_apply
}

command="${1:-}"
case "$command" in
  deploy-ecr)
    deploy_ecr
    ;;
  deploy-s3-dynamo)
    deploy_s3_dynamo
    ;;
  build-deploy-image)
    shift
    build_deploy_image "${1:-$IMAGE_TAG}"
    ;;
  deploy-all)
    deploy_all
    ;;
  -h|--help|help|"")
    usage
    ;;
  *)
    echo "Unknown command: $command" >&2
    usage >&2
    exit 1
    ;;
esac
