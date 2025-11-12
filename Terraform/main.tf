locals {
  name = "${var.project_name}-${var.environment}"

  # For demo we keep AZ identifiers a, b, c
  # In a real deploy, we would fetch available AZs via data sources
  az_letters = ["a", "b", "c"]

  # Limit to requested az_count
  azs = [
    for i in range(var.az_count) :
    "${var.aws_region}${local.az_letters[i]}"
  ]
}

# ----------------------
# VPC
# ----------------------
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.5"

  name = "${local.name}-vpc"
  cidr = var.vpc_cidr

  azs             = local.azs
  # 10.0.0.0/20, 10.0.16.0/20...
  private_subnets = [for i, az in local.azs : cidrsubnet(var.vpc_cidr, 4, i)]
  # 10.0.128.0/24, ...
  public_subnets  = [for i, az in local.azs : cidrsubnet(var.vpc_cidr, 8, i + 128)]

  enable_nat_gateway     = var.create_nat_gateway
  single_nat_gateway     = var.create_nat_gateway && length(local.azs) == 1 ? true : false
  enable_dns_hostnames   = true
  enable_dns_support     = true
  map_public_ip_on_launch = false

  # Least-privilege-ish NACLs/SGs are provided by the module defaults
  public_subnet_tags = {
    "kubernetes.io/role/elb" = "1"
  }
  private_subnet_tags = {
    "kubernetes.io/role/internal-elb" = "1"
  }
}

# ----------------------
# EKS
# ----------------------
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name                   = "${local.name}-eks"
  cluster_version                = var.eks_cluster_version
  # For prod, we can consider private or restricted CIDRs
  cluster_endpoint_public_access = true

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  # Minimal managed node group
  eks_managed_node_groups = {
    default = {
      instance_types = var.node_instance_types
      min_size       = var.min_size
      max_size       = var.max_size
      desired_size   = var.desired_size
    }
  }

  # Optional: extra security group rules for cluster
  cluster_security_group_additional_rules = {
    # ingress_allow_api = {
    #   description = "Allow API access from the office CIDR"
    #   type        = "ingress"
    #   protocol    = "tcp"
    #   from_port   = 443
    #   to_port     = 443
    #   cidr_blocks = ["203.0.113.0/24"]
    # }
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}
