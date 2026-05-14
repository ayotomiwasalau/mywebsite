output "site_bucket_name" {
  description = "S3 bucket for built frontend static assets."
  value       = aws_s3_bucket.site.bucket
}

output "uploads_bucket_name" {
  description = "S3 bucket for admin-uploaded images."
  value       = aws_s3_bucket.uploads.bucket
}

output "dynamodb_table_name" {
  description = "Application DynamoDB table name."
  value       = aws_dynamodb_table.app.name
}

output "backend_ecr_repository_url" {
  description = "ECR repository URL for the backend Lambda image."
  value       = aws_ecr_repository.backend.repository_url
}

output "backend_lambda_image_uri" {
  description = "Full ECR image URI used by the backend Lambda."
  value       = local.lambda_image_uri
}

output "api_gateway_url" {
  description = "HTTP API Gateway invoke URL."
  value       = aws_apigatewayv2_stage.default.invoke_url
}

output "lambda_function_name" {
  description = "Backend Lambda function name."
  value       = aws_lambda_function.api.function_name
}

# output "cloudfront_distribution_id" {
#   description = "CloudFront distribution ID for cache invalidations."
#   value       = aws_cloudfront_distribution.web.id
# }

# output "cloudfront_domain_name" {
#   description = "CloudFront distribution domain name."
#   value       = aws_cloudfront_distribution.web.domain_name
# }


