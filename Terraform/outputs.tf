output "region" {
  value       = var.aws_region
  description = "AWS Region"
}

output "vpc_id" {
  value       = module.vpc.vpc_id
  description = "VPC ID"
}

output "private_subnets" {
  value       = module.vpc.private_subnets
  description = "Private subnets used by EKS"
}

output "public_subnets" {
  value       = module.vpc.public_subnets
  description = "Public subnets"
}

output "cluster_name" {
  value       = module.eks.cluster_name
  description = "EKS Cluster name"
}

output "node_group_names" {
  value       = [for k, v in module.eks.eks_managed_node_groups : v.node_group_name]
  description = "Managed node group names"
}
