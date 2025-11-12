provider "aws" {
  region                      = var.aws_region

  skip_credentials_validation = true
  skip_requesting_account_id  = true

  # Optional: default tags
  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
