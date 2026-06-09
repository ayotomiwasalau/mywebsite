resource "aws_acm_certificate" "web" {
  count = local.create_certificate ? 1 : 0

  provider                  = aws.us_east_1
  domain_name               = var.domain_name
  subject_alternative_names = var.additional_domain_names
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "certificate_validation" {
  for_each = local.create_certificate && var.create_route53_records && local.route53_zone_id != null ? {
    for option in aws_acm_certificate.web[0].domain_validation_options : option.domain_name => {
      name   = option.resource_record_name
      record = option.resource_record_value
      type   = option.resource_record_type
    }
  } : {}

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = local.route53_zone_id
}

resource "aws_acm_certificate_validation" "web" {
  count = local.create_certificate && var.create_route53_records && local.route53_zone_id != null ? 1 : 0

  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.web[0].arn
  validation_record_fqdns = [for record in aws_route53_record.certificate_validation : record.fqdn]
}

locals {
  certificate_arn = local.create_certificate ? try(aws_acm_certificate_validation.web[0].certificate_arn, aws_acm_certificate.web[0].arn) : var.acm_certificate_arn
}

resource "aws_route53_record" "web_ipv4" {
  for_each = var.create_route53_records && local.route53_zone_id != null ? toset(local.domain_names) : toset([])

  name    = each.value
  type    = "A"
  zone_id = local.route53_zone_id

  alias {
    evaluate_target_health = false
    name                   = aws_cloudfront_distribution.web.domain_name
    zone_id                = aws_cloudfront_distribution.web.hosted_zone_id
  }
}

resource "aws_route53_record" "web_ipv6" {
  for_each = var.create_route53_records && local.route53_zone_id != null ? toset(local.domain_names) : toset([])

  name    = each.value
  type    = "AAAA"
  zone_id = local.route53_zone_id

  alias {
    evaluate_target_health = false
    name                   = aws_cloudfront_distribution.web.domain_name
    zone_id                = aws_cloudfront_distribution.web.hosted_zone_id
  }
}
