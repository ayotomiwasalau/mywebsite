#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TERRAFORM_DIR="${TERRAFORM_DIR:-$SCRIPT_DIR/../deployments/terraform}"
BACKEND_DIR="${BACKEND_DIR:-$SCRIPT_DIR}"
IMAGE_TAG="${1:-${LAMBDA_IMAGE_TAG:-latest}}"
LOCAL_IMAGE_NAME="${LOCAL_IMAGE_NAME:-portfolio-blog-backend}"
DOCKER_PLATFORM="${DOCKER_PLATFORM:-linux/amd64}"

if ! command -v terraform >/dev/null 2>&1; then
  echo "terraform is required but was not found in PATH." >&2
  exit 1
fi

if ! command -v aws >/dev/null 2>&1; then
  echo "aws CLI is required but was not found in PATH." >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required but was not found in PATH." >&2
  exit 1
fi

REPO_URL="$(terraform -chdir="$TERRAFORM_DIR" output -raw backend_ecr_repository_url)"
REGISTRY="$(echo "$REPO_URL" | cut -d/ -f1)"
AWS_REGION="$(echo "$REGISTRY" | cut -d. -f4)"
IMAGE_URI="$REPO_URL:$IMAGE_TAG"

echo "Logging in to ECR registry: $REGISTRY"
aws ecr get-login-password --region "$AWS_REGION" \
  | docker login --username AWS --password-stdin "$REGISTRY"

echo "Building backend image for $DOCKER_PLATFORM"
docker build \
  --platform "$DOCKER_PLATFORM" \
  -t "$LOCAL_IMAGE_NAME:$IMAGE_TAG" \
  "$BACKEND_DIR"

echo "Tagging image: $IMAGE_URI"
docker tag "$LOCAL_IMAGE_NAME:$IMAGE_TAG" "$IMAGE_URI"

echo "Pushing image to ECR"
docker push "$IMAGE_URI"

cat <<EOF

Pushed backend image:
  $IMAGE_URI

Next, make sure terraform.tfvars has:
  lambda_image_tag = "$IMAGE_TAG"

Then run:
  terraform -chdir="$TERRAFORM_DIR" apply
EOF
