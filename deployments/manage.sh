#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TERRAFORM_DIR="${TERRAFORM_DIR:-$SCRIPT_DIR/terraform}"
BACKEND_DIR="${BACKEND_DIR:-$REPO_ROOT/backend}"
GAMES_DIR="${GAMES_DIR:-$REPO_ROOT}"
IMAGE_TAGS_FILE="${IMAGE_TAGS_FILE:-$SCRIPT_DIR/image-tags.env}"
LOCAL_IMAGE_NAME="${LOCAL_IMAGE_NAME:-portfolio-blog-backend}"
LOCAL_GAMES_IMAGE_NAME="${LOCAL_GAMES_IMAGE_NAME:-portfolio-blog-games}"
DOCKER_PLATFORM="${DOCKER_PLATFORM:-linux/amd64}"

usage() {
  cat <<EOF
Usage:
  ./deployments/manage.sh <command> [options]

Commands:
  deploy-ecr                 Deploy only main backend ECR resources.
  deploy-ecr-games           Deploy only games ECR resources.
  deploy-s3-dynamo           Deploy only S3 and DynamoDB resources.
  build-deploy-image [tag]   Build and push backend image (auto vN if omitted).
  build-deploy-games-image [tag]
                             Build and push games image (auto vN if omitted).
  deploy-backend [tag]       Build, push, and update backend Lambda (auto vN if omitted).
  deploy-games [tag]         Build, push, and update games Lambda (auto vN if omitted).
  show-image-tags            Show current tag counters and next vN tags.
  deploy-all                 Deploy all Terraform resources in deployments/terraform.

Image tags:
  Auto tags are sequential per repo: v1, v2, v3, ...
  Counters live in deployments/image-tags.env (gitignored).

Environment overrides:
  TERRAFORM_DIR              Terraform directory. Default: $TERRAFORM_DIR
  BACKEND_DIR                Main backend build context. Default: $BACKEND_DIR
  GAMES_DIR                  Games Docker build context (repo root). Default: $GAMES_DIR
  IMAGE_TAGS_FILE            Tag counter file. Default: $IMAGE_TAGS_FILE
  LOCAL_IMAGE_NAME           Local main image name. Default: $LOCAL_IMAGE_NAME
  LOCAL_GAMES_IMAGE_NAME     Local games image name. Default: $LOCAL_GAMES_IMAGE_NAME
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

init_image_tags_file() {
  if [[ ! -f "$IMAGE_TAGS_FILE" ]]; then
    cp "$SCRIPT_DIR/image-tags.env.example" "$IMAGE_TAGS_FILE"
    echo "Created $IMAGE_TAGS_FILE from image-tags.env.example"
  fi
}

read_image_seq() {
  local key="$1"
  local default_value="${2:-0}"
  init_image_tags_file
  local value
  value="$(grep -E "^${key}=" "$IMAGE_TAGS_FILE" | tail -1 | cut -d= -f2- | tr -d ' \"'"'"'')"
  if [[ -z "$value" ]]; then
    echo "$default_value"
  else
    echo "$value"
  fi
}

write_image_seq() {
  local key="$1"
  local value="$2"
  init_image_tags_file
  local tmp
  tmp="$(mktemp)"
  if [[ -f "$IMAGE_TAGS_FILE" ]]; then
    grep -v "^${key}=" "$IMAGE_TAGS_FILE" >"$tmp" || true
  fi
  echo "${key}=${value}" >>"$tmp"
  mv "$tmp" "$IMAGE_TAGS_FILE"
}

format_version_tag() {
  local seq="$1"
  echo "v${seq}"
}

next_backend_tag() {
  local seq next_seq
  seq="$(read_image_seq BACKEND_IMAGE_SEQ 0)"
  next_seq=$((seq + 1))
  write_image_seq BACKEND_IMAGE_SEQ "$next_seq"
  format_version_tag "$next_seq"
}

next_games_tag() {
  local seq next_seq
  seq="$(read_image_seq GAMES_IMAGE_SEQ 0)"
  next_seq=$((seq + 1))
  write_image_seq GAMES_IMAGE_SEQ "$next_seq"
  format_version_tag "$next_seq"
}

resolve_backend_tag() {
  local requested="${1:-}"
  if [[ -n "$requested" ]]; then
    echo "$requested"
  else
    next_backend_tag
  fi
}

resolve_games_tag() {
  local requested="${1:-}"
  if [[ -n "$requested" ]]; then
    echo "$requested"
  else
    next_games_tag
  fi
}

show_image_tags() {
  init_image_tags_file
  local backend_seq games_seq
  backend_seq="$(read_image_seq BACKEND_IMAGE_SEQ 0)"
  games_seq="$(read_image_seq GAMES_IMAGE_SEQ 0)"
  cat <<EOF
Image tag counters ($IMAGE_TAGS_FILE):
  BACKEND_IMAGE_SEQ=$backend_seq  -> next auto tag: $(format_version_tag $((backend_seq + 1)))
  GAMES_IMAGE_SEQ=$games_seq      -> next auto tag: $(format_version_tag $((games_seq + 1)))
EOF
}

ecr_login() {
  local repo_url="$1"
  local registry aws_region
  registry="$(echo "$repo_url" | cut -d/ -f1)"
  aws_region="$(echo "$registry" | cut -d. -f4)"
  echo "Logging in to ECR registry: $registry"
  aws ecr get-login-password --region "$aws_region" \
    | docker login --username AWS --password-stdin "$registry"
}

verify_lambda_image() {
  local function_name="$1"
  local image_tag="$2"
  local actual
  actual="$(aws lambda get-function --function-name "$function_name" --query 'Code.ImageUri' --output text)"
  if [[ "$actual" != *":${image_tag}"* ]] && [[ "$actual" != *":${image_tag}@"* ]]; then
    echo "Lambda image mismatch for $function_name" >&2
    echo "  expected tag: $image_tag" >&2
    echo "  actual uri:   $actual" >&2
    exit 1
  fi
  echo "Verified Lambda $function_name uses tag $image_tag"
}

deploy_ecr() {
  terraform_apply \
    -target=aws_ecr_repository.backend \
    -target=aws_ecr_lifecycle_policy.backend
}

deploy_ecr_games() {
  terraform_apply \
    -target=aws_ecr_repository.games \
    -target=aws_ecr_lifecycle_policy.games
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

  local image_tag
  image_tag="$(resolve_backend_tag "${1:-}")"
  local repo_url image_uri
  repo_url="$(terraform -chdir="$TERRAFORM_DIR" output -raw backend_ecr_repository_url)"
  image_uri="$repo_url:$image_tag"

  ecr_login "$repo_url"

  echo "Building backend image for $DOCKER_PLATFORM (tag: $image_tag)"
  docker build \
    --platform "$DOCKER_PLATFORM" \
    -f "$BACKEND_DIR/Dockerfile" \
    -t "$LOCAL_IMAGE_NAME:$image_tag" \
    "$BACKEND_DIR"

  echo "Tagging image: $image_uri"
  docker tag "$LOCAL_IMAGE_NAME:$image_tag" "$image_uri"

  echo "Pushing image to ECR"
  docker push "$image_uri"

  echo "Pushed backend image: $image_uri"
}

build_deploy_games_image() {
  require_command terraform
  require_command aws
  require_command docker

  local image_tag
  image_tag="$(resolve_games_tag "${1:-}")"
  local repo_url image_uri
  repo_url="$(terraform -chdir="$TERRAFORM_DIR" output -raw games_ecr_repository_url)"
  image_uri="$repo_url:$image_tag"

  ecr_login "$repo_url"

  echo "Building games image for $DOCKER_PLATFORM (tag: $image_tag)"
  docker build \
    --platform "$DOCKER_PLATFORM" \
    -f "$REPO_ROOT/backend_games/Dockerfile" \
    -t "$LOCAL_GAMES_IMAGE_NAME:$image_tag" \
    "$GAMES_DIR"

  echo "Tagging image: $image_uri"
  docker tag "$LOCAL_GAMES_IMAGE_NAME:$image_tag" "$image_uri"

  echo "Pushing image to ECR"
  docker push "$image_uri"

  echo "Pushed games image: $image_uri"
}

deploy_backend() {
  require_command aws
  local image_tag function_name
  image_tag="$(resolve_backend_tag "${1:-}")"
  build_deploy_image "$image_tag"

  echo "Updating backend Lambda to tag: $image_tag"
  terraform_apply -auto-approve \
    -var="lambda_image_tag=$image_tag" \
    -target=aws_lambda_function.api

  function_name="$(terraform -chdir="$TERRAFORM_DIR" output -raw lambda_function_name)"
  verify_lambda_image "$function_name" "$image_tag"
}

deploy_games() {
  require_command aws
  local image_tag function_name
  image_tag="$(resolve_games_tag "${1:-}")"
  build_deploy_games_image "$image_tag"

  echo "Updating games Lambda to tag: $image_tag"
  terraform_apply -auto-approve \
    -var="games_lambda_image_tag=$image_tag" \
    -target=aws_lambda_function.games

  function_name="$(terraform -chdir="$TERRAFORM_DIR" output -raw games_lambda_function_name)"
  verify_lambda_image "$function_name" "$image_tag"
}

deploy_all() {
  terraform_apply
}

command="${1:-}"
case "$command" in
  deploy-ecr)
    deploy_ecr
    ;;
  deploy-ecr-games)
    deploy_ecr_games
    ;;
  deploy-s3-dynamo)
    deploy_s3_dynamo
    ;;
  build-deploy-image)
    shift
    build_deploy_image "${1:-}"
    ;;
  build-deploy-games-image)
    shift
    build_deploy_games_image "${1:-}"
    ;;
  deploy-backend)
    shift
    deploy_backend "${1:-}"
    ;;
  deploy-games)
    shift
    deploy_games "${1:-}"
    ;;
  show-image-tags)
    show_image_tags
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
