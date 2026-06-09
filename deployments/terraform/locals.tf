data "aws_caller_identity" "current" {}

locals {
  name_prefix = lower(replace("${var.project_name}-${var.environment}", "_", "-"))
  domain_names = concat(
    [var.domain_name],
    var.additional_domain_names,
  )

  route53_zone_id        = var.route53_zone_id != null ? var.route53_zone_id : try(data.aws_route53_zone.selected[0].zone_id, null)
  create_certificate     = var.acm_certificate_arn == null
  lambda_image_uri       = "${aws_ecr_repository.backend.repository_url}:${var.lambda_image_tag}"
  games_lambda_image_uri = "${aws_ecr_repository.games.repository_url}:${var.games_lambda_image_tag}"

  common_lambda_environment = merge(
    {
      API_VERSION                = var.api_version
      APP_TABLE_NAME             = aws_dynamodb_table.app.name
      DATABASE_BACKEND           = "dynamodb"
      FILE_DISK_BACKEND          = "s3"
      MARKDOWN_FILE_BACKEND      = "github"
      AWS_S3_MARKDOWN_BUCKET     = aws_s3_bucket.uploads.bucket
      MARKDOWN_CDN_BASE_URL      = "https://${var.domain_name}"
      AWS_S3_MARKDOWN_KEY_PREFIX = var.uploads_key_prefix
    }
  )

  common_games_lambda_environment = merge(
    {
      API_VERSION      = var.api_version
      DATABASE_BACKEND = "dynamodb"
      APP_TABLE_NAME   = aws_dynamodb_table.app.name
    },
    var.games_lambda_environment_variables,
  )

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

data "aws_route53_zone" "selected" {
  count = var.create_route53_records && var.route53_zone_id == null && var.hosted_zone_name != null ? 1 : 0

  name         = var.hosted_zone_name
  private_zone = false
}
