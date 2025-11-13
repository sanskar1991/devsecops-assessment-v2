# DevSecOps Assessment v2

A comprehensive DevSecOps assessment project demonstrating secure application development, containerization, infrastructure as code, and Kubernetes orchestration. This project showcases best practices for building, securing, and deploying a production-ready Node.js application with MongoDB.

## 📋 Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Components](#components)
- [Quick Start](#quick-start)
- [Deployment Options](#deployment-options)
- [Security Features](#security-features)
- [CI/CD Integration](#cicd-integration)
- [Documentation](#documentation)
- [Prerequisites](#prerequisites)

## 🎯 Overview

This project demonstrates a complete DevSecOps pipeline including:

- **Secure Node.js Application**: Express.js REST API with MongoDB
- **Container Security**: Multi-stage Docker builds with security hardening
- **Kubernetes Deployment**: Production-ready K8s manifests with security policies
- **Infrastructure as Code**: Terraform modules for AWS EKS provisioning
- **Security Scanning**: Trivy vulnerability scanning integration
- **Code Quality**: SonarQube configuration for static analysis

## 📁 Project Structure

```
devsecops-assessment-v2/
├── node-app/                 # Node.js application
│   ├── src/                  # Application source code
│   ├── db-init/              # MongoDB initialization scripts
│   ├── Dockerfile            # Multi-stage production Dockerfile
│   ├── docker-compose.yml    # Docker Compose configuration
│   └── README.md             # Application documentation
│
├── k8s/                      # Kubernetes manifests
│   ├── dev_local/            # Local development K8s setup
│   ├── namespace.yaml        # Namespace with pod security
│   ├── nodeapp-deployment.yaml
│   ├── mongodb-statefulset.yaml
│   ├── networkpolicy.yaml    # Network security policies
│   ├── hpa.yaml              # Horizontal Pod Autoscaler
│   └── README.md             # Kubernetes deployment guide
│
├── Terraform/                # Infrastructure as Code
│   ├── main.tf               # EKS cluster and VPC
│   ├── variables.tf          # Input variables
│   ├── outputs.tf            # Output values
│   └── README.md             # Terraform documentation
│
├── trivy-scan-*.txt          # Security scan results
├── sonar-project.properties  # SonarQube configuration
└── README.md                 # This file
```

## 🏗️ Architecture

### Application Stack

```
┌─────────────────────────────────────────────────────────┐
│                    Client/User                           │
└────────────────────┬──────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Ingress Controller (NGINX)                 │
└────────────────────┬──────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│         Node.js Application (Express API)                │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Security: Helmet, Rate Limiting, Sanitization   │   │
│  │  Logging: Pino, Morgan                          │   │
│  │  Health: /healthz, /readyz                      │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────────┬──────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              MongoDB (StatefulSet)                       │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Persistent Storage                               │   │
│  │  Authentication Enabled                           │   │
│  │  Network Policy Restricted                        │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Infrastructure Components

- **VPC**: Isolated network with public/private subnets
- **EKS Cluster**: Managed Kubernetes control plane
- **Node Groups**: Auto-scaling worker nodes
- **Load Balancer**: Application load balancer via ingress
- **Storage**: Persistent volumes for MongoDB

## 🧩 Components

### 1. Node.js Application (`node-app/`)

A secure Express.js REST API with MongoDB integration.

**Features:**
- RESTful API for CRUD operations on items
- Security middleware (Helmet, rate limiting, input sanitization)
- Structured logging with Pino
- Health check endpoints
- Graceful shutdown handling
- MongoDB connection with retry logic

**Tech Stack:**
- Node.js 20 (Alpine)
- Express.js 4.x
- Mongoose 8.x
- Security: Helmet, express-rate-limit, express-mongo-sanitize

**See:** [node-app/README.md](./node-app/README.md)

### 2. Kubernetes Manifests (`k8s/`)

Production-ready Kubernetes deployment configurations.

**Includes:**
- Namespace with restricted pod security standards
- Deployment with security contexts
- StatefulSet for MongoDB with persistent storage
- Services (ClusterIP)
- Ingress configuration
- Network policies for traffic isolation
- Horizontal Pod Autoscaler (HPA)
- Pod Disruption Budget (PDB)
- RBAC with service accounts

**Environments:**
- **Base**: Production-ready manifests
- **dev_local**: Simplified local development setup

**See:** [k8s/README.md](./k8s/README.md)

### 3. Terraform Infrastructure (`Terraform/`)

Infrastructure as Code for AWS EKS cluster provisioning.

**Creates:**
- VPC with public/private subnets across multiple AZs
- EKS cluster with managed node groups
- IAM roles and policies
- Network configuration for Kubernetes

**Modules Used:**
- `terraform-aws-modules/vpc/aws`
- `terraform-aws-modules/eks/aws`

**See:** [Terraform/README.md](./Terraform/README.md)

### 4. Docker Configuration

**Multi-stage Dockerfile:**
- Stage 1: Dependency installation
- Stage 2: Application build
- Stage 3: Minimal runtime image

**Security Features:**
- Non-root user execution
- Read-only filesystem
- Dropped capabilities
- Health checks

**Docker Compose:**
- MongoDB service with initialization
- Application service with security hardening
- Network isolation
- Volume persistence

## 🚀 Quick Start

### Prerequisites

- **Node.js**: >= 18.17
- **Docker**: Latest version
- **Docker Compose**: v2.0+
- **kubectl**: For Kubernetes deployment
- **Terraform**: >= 1.0 (for infrastructure)

### Option 1: Local Development (Docker Compose)

```bash
# Navigate to application directory
cd node-app

# Create .env file with required variables
cat > .env << EOF
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=secure-password
APP_DB_NAME=devsecops
APP_DB_USERNAME=app_user
APP_DB_PASSWORD=app-password
APP_DB_AUTHDB=devsecops
APP_PORT=3000
EOF

# Start the stack
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f app

# Test the application
curl http://localhost:3000/healthz
```

### Option 2: Local Development (Node.js)

```bash
# Navigate to application directory
cd node-app

# Install dependencies
npm install

# Start MongoDB (using Docker)
docker run -d -p 27017:27017 --name mongodb mongo:7.0

# Create .env file
cat > .env << EOF
PORT=3000
MONGODB_URI=mongodb://localhost:27017/devsecops
NODE_ENV=development
EOF

# Run the application
npm run dev
```

### Option 3: Kubernetes (Local - minikube/kind)

```bash
# Start local Kubernetes cluster
minikube start
minikube addons enable ingress

# Build and load image
eval $(minikube docker-env)
cd node-app
docker build -t node-app-app:latest .

# Deploy to Kubernetes
cd ../k8s/dev_local
kubectl apply -f .

# Check status
kubectl -n devsecopsv1 get pods

# Port forward
kubectl -n devsecopsv1 port-forward svc/api-service 3000:80
```

### Option 4: Kubernetes (Production)

```bash
# Apply base manifests
cd k8s
kubectl apply -f namespace.yaml
kubectl apply -f config-secrets.yaml
kubectl apply -f mongodb-statefulset.yaml
kubectl apply -f mongodb-service.yaml
kubectl apply -f nodeapp-deployment.yaml
kubectl apply -f nodeapp-service.yaml
kubectl apply -f ingress.yaml
kubectl apply -f networkpolicy.yaml
kubectl apply -f hpa.yaml
kubectl apply -f pdb.yaml

# Verify deployment
kubectl -n devsecops get all
```

## 🔒 Security Features

### Application Security

- ✅ **Helmet.js**: Security headers (XSS, HSTS, CSP, etc.)
- ✅ **Rate Limiting**: Configurable request throttling
- ✅ **Input Sanitization**: MongoDB injection prevention
- ✅ **JSON Size Limits**: Request body size restrictions
- ✅ **Structured Logging**: Security event logging

### Container Security

- ✅ **Non-root User**: Containers run as unprivileged user
- ✅ **Read-only Filesystem**: Immutable container filesystem
- ✅ **Dropped Capabilities**: All Linux capabilities removed
- ✅ **No Privilege Escalation**: `no-new-privileges` enabled
- ✅ **Minimal Base Image**: Alpine Linux for reduced attack surface
- ✅ **Multi-stage Build**: Excludes dev dependencies from production

### Kubernetes Security

- ✅ **Pod Security Standards**: Restricted policy enforcement
- ✅ **Network Policies**: Traffic isolation and least privilege
- ✅ **RBAC**: Service accounts with minimal permissions
- ✅ **Secrets Management**: Kubernetes secrets (use external secrets in production)
- ✅ **Resource Limits**: CPU and memory constraints
- ✅ **Security Contexts**: Non-root, read-only filesystem

### Infrastructure Security

- ✅ **VPC Isolation**: Private subnets for workloads
- ✅ **IAM Roles**: Least privilege access
- ✅ **Network Segmentation**: Public/private subnet separation
- ✅ **Encryption**: EBS volume encryption (configurable)

## 🔄 CI/CD Integration

### Security Scanning

The project includes Trivy vulnerability scanning:

```bash
# Scan Docker image
trivy image ghcr.io/sanskar1991/devsecops-assessment-v2:latest

# Scan filesystem
trivy fs node-app/

# Scan Kubernetes manifests
trivy k8s cluster --namespace devsecops
```

### Code Quality

SonarQube configuration included (`sonar-project.properties`):

```bash
# Run SonarQube analysis
sonar-scanner \
  -Dsonar.organization=${SONAR_ORG} \
  -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
  -Dsonar.projectName=${SONAR_PROJECT_NAME}
```

### CI/CD Pipeline Example

```yaml
# Example GitHub Actions workflow
name: CI/CD Pipeline

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker image
        run: docker build -t app:latest node-app/
      - name: Trivy scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: app:latest
      - name: Push to registry
        run: docker push ghcr.io/user/app:latest
      
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Kubernetes
        run: kubectl apply -f k8s/
```

## 📚 Documentation

Each component has detailed documentation:

- **[node-app/README.md](./node-app/README.md)**: Application setup, API documentation, and development guide
- **[k8s/README.md](./k8s/README.md)**: Kubernetes deployment guide, troubleshooting, and production considerations
- **[k8s/dev_local/README.md](./k8s/dev_local/README.md)**: Local Kubernetes development setup
- **[Terraform/README.md](./Terraform/README.md)**: Infrastructure provisioning guide

## 🛠️ Prerequisites

### Development

- Node.js >= 18.17
- npm or yarn
- MongoDB 7.0+ (or Docker)
- Docker & Docker Compose

### Kubernetes Deployment

- kubectl
- Kubernetes cluster (minikube, kind, or cloud provider)
- Ingress controller (NGINX recommended)

### Infrastructure

- Terraform >= 1.0
- AWS CLI configured (for EKS deployment)
- AWS account with appropriate permissions

## 📊 API Endpoints

### Health Checks

- `GET /healthz` - Liveness probe
- `GET /readyz` - Readiness probe

### Items API

- `GET /api/items` - List all items
- `GET /api/items/:id` - Get item by ID
- `POST /api/items` - Create new item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

**Example:**

```bash
# Create item
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Item", "description": "Description"}'

# List items
curl http://localhost:3000/api/items
```

## 🧪 Testing

### Manual Testing

```bash
# Health check
curl http://localhost:3000/healthz

# Create item
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "description": "Test item"}'

# Get all items
curl http://localhost:3000/api/items
```

### Security Testing

```bash
# Run Trivy scan
trivy image node-app:latest

# Check for vulnerabilities in dependencies
npm audit

# Run SonarQube analysis
sonar-scanner
```

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Verify MongoDB is running
   - Check connection string in environment variables
   - Ensure network policies allow traffic

2. **Container Won't Start**
   - Check logs: `docker-compose logs app`
   - Verify environment variables
   - Check health endpoint: `curl http://localhost:3000/healthz`

3. **Kubernetes Pods Not Ready**
   - Check pod status: `kubectl get pods -n devsecops`
   - View logs: `kubectl logs <pod-name> -n devsecops`
   - Describe pod: `kubectl describe pod <pod-name> -n devsecops`

4. **Image Pull Errors**
   - Verify image exists in registry
   - Check image pull secrets
   - For local dev, ensure image is loaded: `kind load docker-image <image>`

## 📝 Environment Variables

### Application

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Application port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/devsecops` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `60000` |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |

### Docker Compose

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_ROOT_USERNAME` | MongoDB root username | Yes |
| `MONGO_ROOT_PASSWORD` | MongoDB root password | Yes |
| `APP_DB_USERNAME` | Application DB user | Yes |
| `APP_DB_PASSWORD` | Application DB password | Yes |
| `APP_DB_NAME` | Database name | No (default: devsecops) |

## 🎯 Production Checklist

Before deploying to production:

- [ ] Update all default passwords and secrets
- [ ] Use external secret management (AWS Secrets Manager, HashiCorp Vault)
- [ ] Enable SSL/TLS for all connections
- [ ] Configure proper backup strategy for MongoDB
- [ ] Set up monitoring and alerting (Prometheus, Grafana)
- [ ] Configure centralized logging (ELK, Loki)
- [ ] Review and adjust resource limits
- [ ] Enable network encryption
- [ ] Set up disaster recovery plan
- [ ] Perform security audit
- [ ] Configure auto-scaling policies
- [ ] Set up CI/CD pipeline with security scanning

## 📄 License

This project is part of a DevSecOps assessment.

## 🤝 Contributing

This is an assessment project. For questions or issues, please refer to the project maintainer.

## 📞 Support

For detailed documentation on each component, refer to:
- [Node.js Application Guide](./node-app/README.md)
- [Kubernetes Deployment Guide](./k8s/README.md)
- [Terraform Infrastructure Guide](./Terraform/README.md)

---

**Built with security in mind** 🔒
