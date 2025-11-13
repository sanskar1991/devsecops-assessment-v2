# Kubernetes Local Development Setup

This directory contains Kubernetes manifests for running the DevSecOps application stack locally.

## Prerequisites

- `kubectl` installed and configured
- A local Kubernetes cluster running:
  - **minikube**: `minikube start && minikube addons enable ingress`
  - **kind**: `kind create cluster` (with ingress controller installed)
  - **Docker Desktop**: Enable Kubernetes in settings
- Docker image `node-app-app:latest` built and loaded into your cluster:
  ```bash
  # For minikube
  eval $(minikube docker-env)
  docker build -t node-app-app:latest ../node-app
  
  # For kind
  kind load docker-image node-app-app:latest
  ```

## Directory Structure

- `namespace.yaml` - Creates the `devsecopsv1` namespace
- `config-secrets.yaml` - ConfigMap and Secret for application configuration
- `mongodb.yaml` - MongoDB deployment and service
- `api.yaml` - API deployment, service, HPA, and PodDisruptionBudget
- `ingress.yaml` - Ingress resource for external access
- `networkpolicy.yaml` - Network policy restricting MongoDB access to API pods only

## Deployment

### 1. Apply all manifests

```bash
kubectl apply -f k8s/dev_local/
```

Or apply individually:

```bash
kubectl apply -f k8s/dev_local/namespace.yaml
kubectl apply -f k8s/dev_local/config-secrets.yaml
kubectl apply -f k8s/dev_local/mongodb.yaml
kubectl apply -f k8s/dev_local/api.yaml
kubectl apply -f k8s/dev_local/ingress.yaml
kubectl apply -f k8s/dev_local/networkpolicy.yaml
```

### 2. Wait for pods to be ready

```bash
kubectl -n devsecopsv1 get pods -w
```

### 3. Verify deployment

```bash
# Check all resources
kubectl -n devsecopsv1 get all

# Check pod status
kubectl -n devsecopsv1 get pods

# View logs
kubectl -n devsecopsv1 logs -l app=api
kubectl -n devsecopsv1 logs -l app=mongodb
```

## Accessing the Application

### Option 1: Using Ingress (if ingress controller is enabled)

```bash
# Get ingress IP/URL
kubectl -n devsecopsv1 get ingress

# For minikube
minikube service api-service -n devsecopsv1

# Test health endpoint
curl http://<ingress-ip>/healthz
```

### Option 2: Port Forwarding

```bash
# Port forward the API service
kubectl -n devsecopsv1 port-forward svc/api-service 3000:80

# In another terminal, test
curl http://localhost:3000/healthz
```

## Configuration

### ConfigMap (`api-config`)

Contains non-sensitive configuration:
- `PORT`: Application port (default: 3000)
- `NODE_ENV`: Environment (default: production)
- `RATE_LIMIT_WINDOW_MS`: Rate limit window (default: 60000)
- `RATE_LIMIT_MAX`: Max requests per window (default: 100)
- `MONGODB_DB_NAME`: Database name (default: devsecops)

### Secret (`mongodb-secret`)

Contains sensitive MongoDB connection string:
- `MONGODB_URI`: MongoDB connection URI

To update secrets:

```bash
kubectl -n devsecopsv1 create secret generic mongodb-secret \
  --from-literal=MONGODB_URI='mongodb://mongodb:27017/devsecops' \
  --dry-run=client -o yaml | kubectl apply -f -
```

## Features

### Security

- **Non-root containers**: API runs as UID 1000, MongoDB as UID 999
- **Read-only root filesystem**: API containers use read-only filesystem
- **Dropped capabilities**: All containers drop ALL capabilities
- **Network policies**: MongoDB only accepts connections from API pods
- **No privilege escalation**: `allowPrivilegeEscalation: false`

### High Availability

- **Replicas**: API runs 2 replicas by default
- **HPA**: Auto-scales between 2-5 replicas based on CPU (70% threshold)
- **PodDisruptionBudget**: Ensures at least 1 API pod is available during disruptions
- **Health checks**: Liveness and readiness probes configured

### Resource Management

- **API resources**:
  - Requests: 100m CPU, 128Mi memory
  - Limits: 500m CPU, 256Mi memory
- **MongoDB resources**:
  - Requests: 100m CPU, 256Mi memory
  - Limits: 500m CPU, 512Mi memory

## Troubleshooting

### Pods not starting

```bash
# Check pod events
kubectl -n devsecopsv1 describe pod <pod-name>

# Check pod logs
kubectl -n devsecopsv1 logs <pod-name>

# Check image pull errors
kubectl -n devsecopsv1 get events --sort-by='.lastTimestamp'
```

### API can't connect to MongoDB

```bash
# Verify MongoDB is running
kubectl -n devsecopsv1 get pods -l app=mongodb

# Check MongoDB logs
kubectl -n devsecopsv1 logs -l app=mongodb

# Test connection from API pod
kubectl -n devsecopsv1 exec -it <api-pod-name> -- sh
# Inside pod: ping mongodb
```

### Image pull errors

Ensure the image is loaded into your cluster:

```bash
# For minikube
eval $(minikube docker-env)
docker images | grep node-app-app

# For kind
docker images | grep node-app-app
kind load docker-image node-app-app:latest
```

### Ingress not working

```bash
# Check ingress controller
kubectl get pods -n ingress-nginx

# Check ingress status
kubectl -n devsecopsv1 describe ingress api-ingress
```

## Cleanup

To remove all resources:

```bash
kubectl delete -f k8s/dev_local/
```

Or delete the entire namespace:

```bash
kubectl delete namespace devsecopsv1
```

## Notes

- MongoDB uses a Deployment (not StatefulSet) for simplicity in local dev
- No persistent volumes configured - data is ephemeral
- Network policy restricts MongoDB to only accept connections from API pods
- The API image name is `node-app-app:latest` - ensure this matches your build
