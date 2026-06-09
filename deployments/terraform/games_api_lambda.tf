resource "aws_ecr_repository" "games" {
  name                 = "${local.name_prefix}-games"
  image_tag_mutability = var.ecr_image_tag_mutability
  force_delete         = var.ecr_force_delete

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }
}

resource "aws_ecr_lifecycle_policy" "games" {
  repository = aws_ecr_repository.games.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep the most recent games images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = var.games_ecr_max_image_count
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

resource "aws_cloudwatch_log_group" "games" {
  name              = "/aws/lambda/${local.name_prefix}-games"
  retention_in_days = 30
}

resource "aws_iam_role" "games_lambda" {
  name               = "${local.name_prefix}-games-lambda"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

data "aws_iam_policy_document" "games_lambda" {
  statement {
    sid = "WriteLogs"
    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]
    resources = ["${aws_cloudwatch_log_group.games.arn}:*"]
  }

  statement {
    sid = "UseDynamoDb"
    actions = [
      "dynamodb:BatchGetItem",
      "dynamodb:BatchWriteItem",
      "dynamodb:DeleteItem",
      "dynamodb:DescribeTable",
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:Query",
      "dynamodb:Scan",
      "dynamodb:UpdateItem",
    ]
    resources = [
      aws_dynamodb_table.app.arn,
      "${aws_dynamodb_table.app.arn}/index/*",
    ]
  }
}

resource "aws_iam_role_policy" "games_lambda" {
  name   = "${local.name_prefix}-games-lambda"
  role   = aws_iam_role.games_lambda.id
  policy = data.aws_iam_policy_document.games_lambda.json
}

resource "aws_lambda_function" "games" {
  function_name = "${local.name_prefix}-games"
  role          = aws_iam_role.games_lambda.arn
  package_type  = "Image"
  image_uri     = local.games_lambda_image_uri
  memory_size   = var.games_lambda_memory_size
  timeout       = var.games_lambda_timeout

  environment {
    variables = local.common_games_lambda_environment
  }

  depends_on = [
    aws_cloudwatch_log_group.games,
    aws_iam_role_policy.games_lambda,
  ]
}

resource "aws_apigatewayv2_integration" "games" {
  api_id                 = aws_apigatewayv2_api.api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.games.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "games_proxy" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "ANY /api/${var.api_version}/games/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.games.id}"
}

resource "aws_lambda_permission" "games_api_gateway" {
  statement_id  = "AllowExecutionFromApiGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.games.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}
