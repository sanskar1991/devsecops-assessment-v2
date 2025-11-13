# DevSecOps Assessment – End-to-End Implementation

This repository demonstrates a complete DevSecOps workflow, including:

- Secure application development
- Secure containerization (non-root, hardened Dockerfile)
- CI/CD with GitHub Actions, SonarCloud, Snyk & GHCR
- Infrastructure as Code with Terraform
- Production-ready Kubernetes deployment
- Security best practices across the stack

## 📌 1. Project Overview

This project consists of a **Node.js + Express API** with a **MongoDB backend**.

The application exposes:

- `/healthz` – Liveness probe
- `/readyz` – Readiness probe
- Rate-limited GET endpoints

The solution is deployed inside a secure CI/CD pipeline and production-like Kubernetes environment following industry DevSecOps standards.

## 📌 2. Section 1 – Application & Secure Containerization

### Node.js Application Features

- Express-based REST API
- Rate limiting (configurable)
- MongoDB connection using least-privilege DB user
- Structured error handling
- Environment-based configuration

### Security-Focused Dockerfile

- **Multi-stage build**
- **Final image**: non-root user (UID 10001)
- **Drop all Linux capabilities**
- **Read-only root filesystem**
- `/tmp` mounted as tmpfs
- **Zero secrets baked into the image**
- Healthcheck endpoint available

### Docker Compose

Two environments supported:

#### `dev`
- Local development
- ARM-compatible behavior for M1 Macs

#### `prod`
- Non-root runtime
- Read-only FS
- tmpfs for `/tmp`
- Persistent MongoDB volume
- App user auto-created via JS init script
- Separate root/admin credentials

## 📌 3. Section 2 – CI/CD Pipeline (GitHub Actions + SonarCloud + Snyk + GHCR)

### Pipeline Steps

1. Checkout repo
2. Install Node.js
3. Install dependencies
4. Run ESLint & tests
5. SonarCloud code scanning
6. Build Docker image
7. Snyk Open Source scan
8. Snyk Container scan
9. Push image to GitHub Container Registry (GHCR)

### Security Controls in CI

- Fail pipeline on High/Critical vulnerabilities
- Secrets stored in GitHub Secrets
- PRs to master require SAST + Snyk + build success
- Images tagged with SHA + latest

## 📌 4. Section 3 – Terraform (IaC)

Terraform templates demonstrate:

- Cloud provider initialization
- Secure variable handling
- IaC validation
- Clean resource creation workflow

### Terraform Issue Resolved

**Error:**
```
Failed to load plugin schemas
```

**Fix:**
```bash
rm -rf .terraform
terraform init -upgrade
```

## 📌 5. Section 4 – Kubernetes Deployment

A production-oriented K8s deployment was created using separate YAML manifests.

### Kubernetes Objects Implemented

| Component | Purpose |
|-----------|---------|
| Namespace | Isolated environment (devsecops) |
| ConfigMaps | App config + DB name |
| Secrets | DB credentials + connection URI |
| ServiceAccount/RBAC | Least privilege access |
| MongoDB StatefulSet | Persistent, stable database |
| MongoDB Service | ClusterIP DB access |
| NodeApp Deployment | Non-root, read-only FS |
| NodeApp Service | ClusterIP frontend |
| NetworkPolicy | Default deny + allow app→DB |
| PodDisruptionBudget | High availability |
| HorizontalPodAutoscaler | Auto-scaling |
| Ingress | Host-based routing |

### Security Controls on Kubernetes

- PodSecurity (restricted)
- Non-root pods
- readOnlyRootFilesystem
- NetworkPolicy default-deny
- RBAC least privilege
- HPA for resilience
- PDB for safe node drains

## 📌 6. Ingress Configuration

NGINX Ingress exposes the app via:

```
http://nodeapp.localtest.me/
```

### To Enable:

```bash
minikube addons enable ingress
```

Add in `/etc/hosts`:
```
<minikube-ip> nodeapp.localtest.me
```

### Test:

```bash
curl http://nodeapp.localtest.me/healthz
```

## 📌 7. Issues & Resolutions

### 1. Platform Mismatch on Mac M1

**Error:**
```
platform (linux/amd64) does not match linux/arm64
```

**Fix:**
Added `platform: linux/amd64` in Docker Compose.

### 2. MongoDB Healthcheck Failing (EISDIR)

Healthcheck using `mongosh` fails on ARM architecture.

**Fix:**
Removed strict healthcheck and changed:
```yaml
depends_on:
  - mongodb
```
Node app handles retrying connection automatically.

### 3. Snyk Action Version Not Found

Used incorrect action version `snyk/actions@v4`.

**Fix:**
Switched to:
```yaml
uses: snyk/actions/setup@v1
```

### 4. SonarCloud API 404

Project key/name mismatch.

**Fix:**
Correct `sonar.projectKey` + `sonar.projectName`.

### 5. MongoDB StatefulSet Stuck in Pending

No default StorageClass in Minikube.

**Fix:**
```bash
minikube addons enable storage-provisioner
minikube addons enable default-storageclass
```

### 6. Node App Pods Stuck in Rollout

Wrong or missing secrets in K8s.

**Fix:**
- Updated `secret-app.yaml`
- Recreated pods

### 7. Ingress Not Routing

Ingress controller not running.

**Fix:**
Enabled via:
```bash
minikube addons enable ingress
```

## 📌 8. Architecture Diagram (Simplified)

```
                   ┌──────────────────────────┐
                   │     GitHub Actions       │
                   │  (Snyk + Sonar + GHCR)   │
                   └────────────┬─────────────┘
                                │ CI/CD Push
                                ▼
                      ┌───────────────────┐
                      │   GHCR Registry   │
                      └───────────────────┘
                                │ pull
                                ▼
  ┌───────────────┐    ┌───────────────────────┐     ┌────────────────────────┐
  │   Ingress      │───▶│   NodeApp Service     │────▶│  NodeApp Deployment     │
  └───────────────┘    └───────────────────────┘     └────────────────────────┘
                                      │ DB connection
                                      ▼
                          ┌─────────────────────────┐
                          │  MongoDB StatefulSet    │
                          │  + Persistent Volume    │
                          └─────────────────────────┘
```

## 📌 9. How to Deploy on Kubernetes

From project root:

```bash
cd k8s

kubectl apply -f namespace.yaml
kubectl apply -f configmap-app.yaml
kubectl apply -f secret-app.yaml
kubectl apply -f configmap-mongo-init.yaml
kubectl apply -f serviceaccount-rbac.yaml
kubectl apply -f mongodb-service.yaml
kubectl apply -f mongodb-statefulset.yaml
kubectl apply -f nodeapp-service.yaml
kubectl apply -f nodeapp-deployment.yaml
kubectl apply -f networkpolicy.yaml
kubectl apply -f hpa.yaml
kubectl apply -f pdb.yaml
kubectl apply -f ingress.yaml
```

## 📌 10. Conclusion

This project fully implements a robust DevSecOps workflow:

- ✔ Secure coding
- ✔ Secure Docker containers
- ✔ Automated CI/CD with scanning
- ✔ GHCR image management
- ✔ Terraform IaC
- ✔ Hardened Kubernetes deployment

It applies real-world DevSecOps principles end-to-end and meets all assessment requirements.
