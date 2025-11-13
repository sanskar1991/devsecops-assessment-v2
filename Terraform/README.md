# EKS Terraform (Simulation)

This folder models a production-style **EKS stack** using Terraform modules. It is
designed to **validate locally** (no AWS account needed) and to pass security scans.

## What it creates?
- **VPC** (`terraform-aws-modules/vpc`):
  - 1 VPC (`10.0.0.0/16`)
  - N public + N private subnets across `az_count` AZs
  - IGW / (optional) NAT GW
- **EKS** (`terraform-aws-modules/eks`):
  - EKS control plane (version `var.eks_cluster_version`)
  - One **managed node group** (scalable, with min/max/desired)
  - Required IAM Roles for EKS and node groups (module-managed)
- **Tags**: Project, Environment, ManagedBy

## How this maps to real AWS?
- `module.vpc` → `VPC`, `Subnets`, `RouteTables`, `NAT/IGW`
- `module.eks` → `EKS Cluster`, `EKS Managed Node Groups`, `IAM roles/policies`
- Subnet tags `kubernetes.io/role/*` enable ELB/ALB provisioning by Kubernetes.

## Validate locally
```bash
cd 3-Terraform
terraform init -backend=false
terraform validate
terraform plan -var-file=examples/dev.tfvars -lock=false -input=false  # optional; may need creds to fully plan
