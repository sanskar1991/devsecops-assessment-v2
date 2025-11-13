# Kubernetes Deployment Manifests

This directory contains Kubernetes manifests for deploying the DevSecOps Node.js application stack to Kubernetes clusters.

## Directory Structure

```
k8s/
├── README.md                    # This file
├── dev_local/                   # Local development manifests (see dev_local/README.md)
│   ├── namespace.yaml
│   ├── config-secrets.yaml
│   ├── mongodb.yaml
│   ├── api.yaml
│   ├── ingress.yaml
│   └── networkpolicy.yaml
├── namespace.yaml               # Production namespace with pod security policies
├── config-secrets.yaml          # ConfigMap and Secret for base deployment
├── configmap-app.yaml           # Application ConfigMap
├── configmap-mongo-init.yaml    # MongoDB initialization scripts
├── secret-app.yaml              # Application secrets
├── mongodb-statefulset.yaml     # MongoDB StatefulSet with persistent storage
├── mongodb-service.yaml         # MongoDB service
├── nodeapp-deployment.yaml      # Node.js application deployment
├── nodeapp-service.yaml         # Node.js application service
├── ingress.yaml                 # Ingress configuration
├── networkpolicy.yaml           # Network policies for security
├── hpa.yaml                     # Horizontal Pod Autoscaler
├── pdb.yaml                     # Pod Disruption Budget
├── serviceaccount-rbac.yaml    # Service account and RBAC
└── kustomization.yaml          # Kustomize configuration
```

## Prerequisites

### Required Tools

- `kubectl` installed and configured to connect to your cluster
- Kubernetes cluster (v1.24+ recommended)
- Access to the container image: `ghcr.io/sanskar1991/devsecops-assessment-v2:latest`

### Cluster Requirements

- **Storage**: PersistentVolume support for MongoDB (StatefulSet)
- **Ingress Controller**: NGINX Ingress Controller (or compatible)
- **RBAC**: Cluster must support RBAC
- **Pod Security**: Namespace uses restricted pod security standards

### For Local Development

If you want to test locally, see [dev_local/README.md](./dev_local/README.md) for local development setup using minikube or kind.

## Quick Start

### Option 1: Deploy All Manifests Directly

```bash
# Apply all manifests in order
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/config-secrets.yaml
kubectl apply -f k8s/serviceaccount-rbac.yaml
kubectl apply -f k8s/mongodb-statefulset.yaml
kubectl apply -f k8s/mongodb-service.yaml
kubectl apply -f k8s/nodeapp-deployment.yaml
kubectl apply -f k8s/nodeapp-service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/networkpolicy.yaml
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/pdb.yaml
```

### Option 2: Using Kustomize (if configured)

```bash
# If kustomization.yaml is properly configured
kubectl apply -k k8s/
```

### Option 3: Local Development

```bash
# Use the simplified local development setup
kubectl apply -f k8s/dev_local/
```

## Deployment Steps

### Step 1: Create Namespace

```bash
kubectl apply -f k8s/namespace.yaml
```

The namespace `devsecops` is created with restricted pod security standards.

### Step 2: Configure Secrets and ConfigMaps

**Important**: Update secrets with your actual values before applying:

```bash
# Edit the secret file or create it manually
kubectl create secret generic nodeapp-secret \
  --from-literal=MONGO_ROOT_USERNAME='your-root-username' \
  --from-literal=MONGO_ROOT_PASSWORD='your-root-password' \
  --from-literal=APP_DB_USERNAME='your-app-username' \
  --from-literal=APP_DB_PASSWORD='your-app-password' \
  --from-literal=MONGODB_URI='mongodb://mongodb:27017/devsecops?authSource=devsecops' \
  -n devsecops \
  --dry-run=client -o yaml | kubectl apply -f -
```

Apply ConfigMaps:

```bash
kubectl apply -f k8s/config-secrets.yaml
# Or apply individual config files
kubectl apply -f k8s/configmap-app.yaml
kubectl apply -f k8s/configmap-mongo-init.yaml
```

### Step 3: Deploy MongoDB

```bash
kubectl apply -f k8s/mongodb-statefulset.yaml
kubectl apply -f k8s/mongodb-service.yaml
```

Wait for MongoDB to be ready:

```bash
kubectl -n devsecops wait --for=condition=ready pod -l app=mongodb --timeout=300s
```

### Step 4: Deploy Application

```bash
# Create service account and RBAC first
kubectl apply -f k8s/serviceaccount-rbac.yaml

# Deploy the application
kubectl apply -f k8s/nodeapp-deployment.yaml
kubectl apply -f k8s/nodeapp-service.yaml
```

### Step 5: Configure Networking

```bash
# Apply network policies
kubectl apply -f k8s/networkpolicy.yaml

# Apply ingress (if using ingress)
kubectl apply -f k8s/ingress.yaml
```

### Step 6: Configure High Availability

```bash
# Apply Horizontal Pod Autoscaler
kubectl apply -f k8s/hpa.yaml

# Apply Pod Disruption Budget
kubectl apply -f k8s/pdb.yaml
```

### Step 7: Verify Deployment

```bash
# Check all resources
kubectl -n devsecops get all

# Check pod status
kubectl -n devsecops get pods

# Check services
kubectl -n devsecops get svc

# Check ingress
kubectl -n devsecops get ingress

# View application logs
kubectl -n devsecops logs -l app=nodeapp

# View MongoDB logs
kubectl -n devsecops logs -l app=mongodb
```

## Accessing the Application

### Using Ingress

The ingress is configured with host `nodeapp.localtest.me`. Update your `/etc/hosts` or DNS:

```bash
# Get ingress IP
INGRESS_IP=$(kubectl -n devsecops get ingress nodeapp -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

# Add to /etc/hosts (macOS/Linux)
echo "$INGRESS_IP nodeapp.localtest.me" | sudo tee -a /etc/hosts

# Access the application
curl http://nodeapp.localtest.me/healthz
```

### Using Port Forwarding

```bash
# Port forward the service
kubectl -n devsecops port-forward svc/nodeapp 3000:3000

# In another terminal, test
curl http://localhost:3000/healthz
```

### Using NodePort (if service type is NodePort)

```bash
# Get the NodePort
kubectl -n devsecops get svc nodeapp

# Access via <node-ip>:<nodeport>
```

## Configuration

### ConfigMap Values

The application uses ConfigMaps for non-sensitive configuration:

- `APP_ENV`: Application environment
- `NODE_ENV`: Node.js environment
- `PORT`: Application port (default: 3000)
- `RATE_LIMIT_WINDOW_MS`: Rate limit window in milliseconds
- `RATE_LIMIT_MAX`: Maximum requests per window
- `APP_DB_NAME`: Database name
- `APP_DB_AUTHDB`: Authentication database

### Secret Values

Secrets contain sensitive information:

- `MONGO_ROOT_USERNAME`: MongoDB root username
- `MONGO_ROOT_PASSWORD`: MongoDB root password
- `APP_DB_USERNAME`: Application database username
- `APP_DB_PASSWORD`: Application database password
- `MONGODB_URI`: MongoDB connection URI

**Security Note**: Never commit secrets to version control. Use sealed-secrets, external secret operators, or your cloud provider's secret management.

## Architecture Overview

### Components

1. **Namespace**: `devsecops` with restricted pod security
2. **MongoDB StatefulSet**: Persistent MongoDB instance with initialization scripts
3. **Node.js Application Deployment**: Multi-replica deployment with security hardening
4. **Services**: ClusterIP services for internal communication
5. **Ingress**: External access via NGINX ingress
6. **Network Policies**: Restrictive network policies for security
7. **HPA**: Auto-scaling based on CPU utilization
8. **PDB**: Ensures availability during disruptions
9. **RBAC**: Service account with least-privilege access

### Security Features

- **Pod Security Standards**: Restricted policy enforced at namespace level
- **Non-root containers**: Runs as UID 10001
- **Read-only root filesystem**: Application containers use read-only filesystem
- **Dropped capabilities**: All containers drop ALL capabilities
- **Network policies**: Default deny-all with explicit allow rules
- **No privilege escalation**: `allowPrivilegeEscalation: false`
- **Seccomp profile**: RuntimeDefault seccomp profile
- **AppArmor**: Runtime default AppArmor profile

### High Availability

- **Replicas**: 2 replicas minimum
- **HPA**: Auto-scales 2-6 replicas based on CPU (60% threshold)
- **PodDisruptionBudget**: Ensures at least 1 pod available
- **Health checks**: Liveness and readiness probes
- **Persistent storage**: MongoDB uses StatefulSet with persistent volumes

### Resource Limits

**Node.js Application**:
- Requests: 100m CPU, 128Mi memory
- Limits: 500m CPU, 512Mi memory

**MongoDB**:
- Requests: 50m CPU, 128Mi memory
- Limits: 200m CPU, 256Mi memory

## Troubleshooting

### Pods Not Starting

```bash
# Check pod events
kubectl -n devsecops describe pod <pod-name>

# Check pod logs
kubectl -n devsecops logs <pod-name>

# Check for image pull errors
kubectl -n devsecops get events --sort-by='.lastTimestamp'
```

### Application Can't Connect to MongoDB

```bash
# Verify MongoDB is running
kubectl -n devsecops get pods -l app=mongodb

# Check MongoDB logs
kubectl -n devsecops logs -l app=mongodb

# Check MongoDB service
kubectl -n devsecops get svc mongodb

# Test DNS resolution from app pod
kubectl -n devsecops exec -it <nodeapp-pod> -- nslookup mongodb

# Test connection
kubectl -n devsecops exec -it <nodeapp-pod> -- sh
# Inside pod: ping mongodb
```

### Persistent Volume Issues

```bash
# Check PVC status
kubectl -n devsecops get pvc

# Check PV status
kubectl get pv

# Describe PVC for events
kubectl -n devsecops describe pvc data-mongodb-0
```

### Ingress Not Working

```bash
# Check ingress controller
kubectl get pods -n ingress-nginx

# Check ingress status
kubectl -n devsecops describe ingress nodeapp

# Check ingress controller logs
kubectl -n ingress-nginx logs -l app.kubernetes.io/component=controller
```

### Network Policy Blocking Traffic

```bash
# Check network policies
kubectl -n devsecops get networkpolicies

# Describe network policy
kubectl -n devsecops describe networkpolicy <policy-name>

# Temporarily test without network policies (for debugging only)
kubectl -n devsecops delete networkpolicy --all
```

### HPA Not Scaling

```bash
# Check HPA status
kubectl -n devsecops get hpa

# Describe HPA
kubectl -n devsecops describe hpa nodeapp

# Check metrics server
kubectl top pods -n devsecops
```

## Monitoring and Observability

### Check Resource Usage

```bash
# Pod resource usage
kubectl top pods -n devsecops

# Node resource usage
kubectl top nodes
```

### View Logs

```bash
# Application logs
kubectl -n devsecops logs -l app=nodeapp --tail=100 -f

# MongoDB logs
kubectl -n devsecops logs -l app=mongodb --tail=100 -f

# All logs in namespace
kubectl -n devsecops logs --all-containers=true --tail=100
```

### Health Checks

```bash
# Test health endpoint
curl http://nodeapp.localtest.me/healthz

# Test readiness endpoint
curl http://nodeapp.localtest.me/readyz
```

## Cleanup

### Remove All Resources

```bash
# Delete all resources
kubectl delete -f k8s/

# Or delete namespace (removes everything)
kubectl delete namespace devsecops
```

### Remove Specific Components

```bash
# Remove application
kubectl delete -f k8s/nodeapp-deployment.yaml
kubectl delete -f k8s/nodeapp-service.yaml

# Remove MongoDB (WARNING: This will delete persistent data)
kubectl delete -f k8s/mongodb-statefulset.yaml
kubectl delete -f k8s/mongodb-service.yaml
```

## Differences: Base vs dev_local

| Feature | Base (Production-like) | dev_local |
|---------|----------------------|-----------|
| MongoDB | StatefulSet with PVC | Deployment (ephemeral) |
| Namespace | `devsecops` | `devsecopsv1` |
| Pod Security | Restricted | Standard |
| Image | `ghcr.io/.../devsecops-assessment-v2:latest` | `node-app-app:latest` |
| RBAC | Full RBAC with service account | Minimal |
| Network Policy | Default deny-all | Allow from API only |
| Storage | Persistent volumes | No persistence |

## Production Considerations

Before deploying to production:

1. **Secrets Management**: Use external secret management (e.g., AWS Secrets Manager, Azure Key Vault, HashiCorp Vault)
2. **Image Security**: Scan images for vulnerabilities, use signed images
3. **Resource Limits**: Adjust based on actual usage patterns
4. **Monitoring**: Set up Prometheus/Grafana or cloud monitoring
5. **Logging**: Configure centralized logging (e.g., ELK, Loki)
6. **Backup**: Set up MongoDB backups
7. **Disaster Recovery**: Plan for data recovery and cluster failures
8. **SSL/TLS**: Configure TLS for ingress
9. **Network Policies**: Review and tighten network policies
10. **Pod Security**: Consider using Pod Security Admission or OPA Gatekeeper

## Additional Resources

- [dev_local/README.md](./dev_local/README.md) - Local development setup
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Kustomize Documentation](https://kustomize.io/)
