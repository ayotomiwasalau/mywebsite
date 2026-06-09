#!/usr/bin/env bash
# Print the next incremental ECR tag (v1, v2, v3, ...) for a repository.
# Usage: next-ecr-tag.sh <repository-name> [aws-region]
set -euo pipefail

REPOSITORY_NAME="${1:?repository name required}"
AWS_REGION="${2:-${AWS_REGION:-${AWS_DEFAULT_REGION:-us-east-1}}}"

if ! command -v aws >/dev/null 2>&1; then
  echo "aws CLI is required" >&2
  exit 1
fi

MAX_SEQ=0
while IFS= read -r tag; do
  [[ -z "$tag" ]] && continue
  if [[ "$tag" =~ ^v([0-9]+)$ ]]; then
    seq="${BASH_REMATCH[1]}"
    if ((10#${seq} > MAX_SEQ)); then
      MAX_SEQ=$((10#${seq}))
    fi
  fi
done < <(
  aws ecr describe-images \
    --region "$AWS_REGION" \
    --repository-name "$REPOSITORY_NAME" \
    --query 'imageDetails[].imageTags[]' \
    --output text 2>/dev/null \
    | tr '\t' '\n' \
    | sort -u
)

echo "v$((MAX_SEQ + 1))"
