variable "project_name" {
  description = "Short project name used in AWS resource names."
  type        = string
  default     = "ayotom-web"
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
  default     = "prod"
}

variable "aws_region" {
  description = "AWS region for regional resources."
  type        = string
  default     = "us-east-1"
}


variable "domain_name" {
  description = "Primary public domain name served by CloudFront, for example example.com."
  type        = string
  default     = "test"

}


variable "additional_domain_names" {
  description = "Optional extra CloudFront aliases, for example www.example.com."
  type        = list(string)
  default     = []
}

variable "route53_zone_id" {
  description = "Existing Route53 hosted zone ID. If null, hosted_zone_name is used."
  type        = string
  default     = null
}

variable "hosted_zone_name" {
  description = "Existing Route53 hosted zone name, for example example.com."
  type        = string
  default     = null
}

variable "create_route53_records" {
  description = "Whether Terraform should create DNS validation and CloudFront alias records."
  type        = bool
  default     = true
}

variable "acm_certificate_arn" {
  description = "Optional ACM certificate ARN in us-east-1 for CloudFront. If null, Terraform creates one."
  type        = string
  default     = null
}

variable "cloudfront_price_class" {
  description = "CloudFront price class."
  type        = string
  default     = "PriceClass_100"
}

variable "lambda_image_tag" {
  description = "ECR image tag for the backend Lambda (e.g. v3). Set via manage.sh deploy-backend."
  type        = string
  default     = "v1"
}

variable "ecr_image_tag_mutability" {
  description = "Whether ECR image tags are MUTABLE or IMMUTABLE. Use IMMUTABLE with v1, v2, ... tags from manage.sh."
  type        = string
  default     = "IMMUTABLE"
}

variable "ecr_force_delete" {
  description = "Whether Terraform can delete the ECR repository even when it contains images."
  type        = bool
  default     = true
}

variable "ecr_max_image_count" {
  description = "Maximum number of backend images to keep in ECR."
  type        = number
  default     = 10
}

variable "lambda_memory_size" {
  description = "Lambda memory size in MB."
  type        = number
  default     = 512
}

variable "lambda_timeout" {
  description = "Lambda timeout in seconds."
  type        = number
  default     = 30
}

variable "api_version" {
  description = "API version segment used by the FastAPI app, for example v1."
  type        = string
  default     = "v1"
}

variable "uploads_key_prefix" {
  description = "Optional S3 key prefix for backend-managed markdown and image uploads."
  type        = string
  default     = ""
}

variable "lambda_environment_variables" {
  description = "Extra environment variables for the backend Lambda."
  type        = map(string)
  default     = {}
}

variable "cors_allowed_origins" {
  description = "Allowed CORS origins for API Gateway."
  type        = list(string)
  default     = []
}

variable "games_lambda_image_tag" {
  description = "ECR image tag for the games Lambda (e.g. v2). Set via manage.sh deploy-games."
  type        = string
  default     = "v1"
}

variable "games_lambda_memory_size" {
  description = "Games Lambda memory size in MB."
  type        = number
  default     = 512
}

variable "games_lambda_timeout" {
  description = "Games Lambda timeout in seconds."
  type        = number
  default     = 30
}

variable "games_lambda_environment_variables" {
  description = "Extra environment variables for the games Lambda."
  type        = map(string)
  default     = {}
}

variable "games_ecr_max_image_count" {
  description = "Maximum number of games images to keep in ECR."
  type        = number
  default     = 10
}
