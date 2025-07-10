# MADFAM Academy Deployment & Infrastructure Guide
**Version 1.0** | **Date: 2024-07-10** | **Status: Production Ready**

## Overview

This guide provides comprehensive instructions for deploying and managing the MADFAM Academy platform infrastructure. The platform is designed for cloud-native deployment with support for multiple environments, auto-scaling, and high availability.

## Infrastructure Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph "Internet"
        Users[Users]
        Admins[Administrators]
    end

    subgraph "CDN & Load Balancing"
        CDN[CloudFront/CloudFlare CDN]
        WAF[Web Application Firewall]
        ALB[Application Load Balancer]
    end

    subgraph "API Gateway Cluster"
        AGW1[API Gateway 1]
        AGW2[API Gateway 2]
        AGW3[API Gateway 3]
        AGWCache[Gateway Cache<br/>Redis Cluster]
    end

    subgraph "Application Services"
        subgraph "Core Services"
            UserSvc[User Service]
            CourseSvc[Course Service]
            CertSvc[Certification Service]
            ProgressSvc[Progress Service]
        end
        
        subgraph "Integration Services"
            CONOCERSvc[CONOCER Integration]
            AnalyticsSvc[Analytics Service]
            NotificationSvc[Notification Service]
        end
    end

    subgraph "Data Layer"
        subgraph "Primary Database"
            PGPrimary[(PostgreSQL Primary)]
            PGReplica1[(Read Replica 1)]
            PGReplica2[(Read Replica 2)]
        end
        
        subgraph "Analytics & Cache"
            AnalyticsDB[(Analytics Database)]
            RedisCluster[Redis Cluster]
            MessageQueue[RabbitMQ Cluster]
        end
    end

    subgraph "External Services"
        CONOCER[CONOCER API]
        PaymentGW[Payment Gateways]
        EmailSvc[Email Services]
        ObjectStorage[Object Storage]
    end

    subgraph "Monitoring & Observability"
        Prometheus[Prometheus]
        Grafana[Grafana]
        ELK[ELK Stack]
        AlertManager[Alert Manager]
    end

    %% User flow
    Users --> CDN
    Admins --> CDN
    CDN --> WAF
    WAF --> ALB
    
    %% Load balancer to API Gateway
    ALB --> AGW1
    ALB --> AGW2
    ALB --> AGW3
    
    %% API Gateway to services
    AGW1 --> UserSvc
    AGW1 --> CourseSvc
    AGW2 --> CertSvc
    AGW2 --> ProgressSvc
    AGW3 --> CONOCERSvc
    AGW3 --> AnalyticsSvc
    
    %% Cache connections
    AGW1 -.-> AGWCache
    AGW2 -.-> AGWCache
    AGW3 -.-> AGWCache
    
    %% Database connections
    UserSvc --> PGPrimary
    CourseSvc --> PGPrimary
    CertSvc --> PGPrimary
    ProgressSvc --> PGReplica1
    AnalyticsSvc --> AnalyticsDB
    
    %% Replication
    PGPrimary --> PGReplica1
    PGPrimary --> PGReplica2
    
    %% Cache and messaging
    UserSvc -.-> RedisCluster
    CertSvc -.-> MessageQueue
    NotificationSvc -.-> MessageQueue
    
    %% External integrations
    CONOCERSvc --> CONOCER
    UserSvc --> PaymentGW
    NotificationSvc --> EmailSvc
    CourseSvc --> ObjectStorage
    
    %% Monitoring
    AllServices[All Services] -.-> Prometheus
    Prometheus --> Grafana
    AllServices -.-> ELK
    Prometheus --> AlertManager

    classDef users fill:#e3f2fd
    classDef edge fill:#f1f8e9
    classDef gateway fill:#fff3e0
    classDef services fill:#e8f5e8
    classDef data fill:#f3e5f5
    classDef external fill:#fce4ec
    classDef monitoring fill:#e1f5fe

    class Users,Admins users
    class CDN,WAF,ALB edge
    class AGW1,AGW2,AGW3,AGWCache gateway
    class UserSvc,CourseSvc,CertSvc,ProgressSvc,CONOCERSvc,AnalyticsSvc,NotificationSvc services
    class PGPrimary,PGReplica1,PGReplica2,AnalyticsDB,RedisCluster,MessageQueue data
    class CONOCER,PaymentGW,EmailSvc,ObjectStorage external
    class Prometheus,Grafana,ELK,AlertManager monitoring
```

## Environment Setup

### Development Environment

#### Prerequisites
- **Docker Desktop** 4.0+
- **Node.js** 18+ LTS
- **npm** 8+
- **Git** 2.30+
- **PostgreSQL** 14+ (local or Docker)
- **Redis** 7+ (local or Docker)

#### Local Development Setup

1. **Clone Repository**
```bash
git clone https://github.com/madfam/madfam-academy.git
cd madfam-academy
```

2. **Environment Configuration**
```bash
# Copy environment template
cp .env.example .env.development

# Configure environment variables
cat > .env.development << EOF
# Database Configuration
DATABASE_URL=postgresql://madfam:password@localhost:5432/madfam_academy_dev
ANALYTICS_DATABASE_URL=postgresql://madfam:password@localhost:5432/madfam_analytics_dev

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Application Configuration
NODE_ENV=development
PORT=3000
API_VERSION=v1

# JWT Configuration
JWT_SECRET=your-development-jwt-secret-key
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d

# Multi-tenant Configuration
TENANT_RESOLUTION_STRATEGY=subdomain
DEFAULT_TENANT_DOMAIN=localhost

# External Services (Development)
CONOCER_API_URL=https://sandbox.conocer.gob.mx/api
CONOCER_CLIENT_ID=dev_client_id
CONOCER_CLIENT_SECRET=dev_client_secret

# Email Configuration
EMAIL_PROVIDER=smtp
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASSWORD=

# File Storage
STORAGE_PROVIDER=local
STORAGE_LOCAL_PATH=./uploads

# Logging
LOG_LEVEL=debug
LOG_FORMAT=pretty

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090
EOF
```

3. **Database Setup**
```bash
# Start PostgreSQL with Docker
docker run --name postgres-dev \
  -e POSTGRES_DB=madfam_academy_dev \
  -e POSTGRES_USER=madfam \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:14

# Start Redis
docker run --name redis-dev \
  -p 6379:6379 \
  -d redis:7-alpine

# Run database migrations
npm run migrate:latest

# Seed development data
npm run seed:dev
```

4. **Start Development Services**
```bash
# Install dependencies
npm install

# Start backend in development mode
npm run dev

# In another terminal, start frontend
cd frontend
npm install
npm run dev
```

#### Docker Compose Development

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: madfam_academy_dev
      POSTGRES_USER: madfam
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_dev_data:/data

  mailhog:
    image: mailhog/mailhog
    ports:
      - "1025:1025"  # SMTP
      - "8025:8025"  # Web UI

  api:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
      - "9090:9090"  # Metrics
    environment:
      - DATABASE_URL=postgresql://madfam:password@postgres:5432/madfam_academy_dev
      - REDIS_URL=redis://redis:6379
      - SMTP_HOST=mailhog
      - SMTP_PORT=1025
    depends_on:
      - postgres
      - redis
      - mailhog
    volumes:
      - .:/app
      - /app/node_modules

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:3000/v1
    depends_on:
      - api
    volumes:
      - ./frontend:/app
      - /app/node_modules

volumes:
  postgres_dev_data:
  redis_dev_data:
```

Start development environment:
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Staging Environment

#### Infrastructure as Code (Terraform)

```hcl
# infrastructure/staging/main.tf
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket = "madfam-terraform-state"
    key    = "staging/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC and Networking
module "vpc" {
  source = "../modules/vpc"
  
  environment = "staging"
  cidr_block  = "10.1.0.0/16"
  
  availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]
  
  public_subnets  = ["10.1.1.0/24", "10.1.2.0/24", "10.1.3.0/24"]
  private_subnets = ["10.1.10.0/24", "10.1.20.0/24", "10.1.30.0/24"]
  
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Environment = "staging"
    Project     = "madfam-academy"
  }
}

# EKS Cluster
module "eks" {
  source = "../modules/eks"
  
  cluster_name    = "madfam-staging"
  cluster_version = "1.27"
  
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets
  
  node_groups = {
    main = {
      desired_capacity = 2
      max_capacity     = 5
      min_capacity     = 1
      
      instance_types = ["t3.medium"]
      
      k8s_labels = {
        Environment = "staging"
        NodeGroup   = "main"
      }
    }
  }
  
  tags = {
    Environment = "staging"
    Project     = "madfam-academy"
  }
}

# RDS Database
module "database" {
  source = "../modules/rds"
  
  identifier = "madfam-staging"
  
  engine         = "postgres"
  engine_version = "14.9"
  instance_class = "db.t3.micro"
  
  allocated_storage     = 20
  max_allocated_storage = 100
  storage_encrypted     = true
  
  db_name  = "madfam_academy"
  username = "madfam"
  
  vpc_security_group_ids = [module.database_security_group.security_group_id]
  db_subnet_group_name   = module.vpc.database_subnet_group
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  skip_final_snapshot = true
  
  tags = {
    Environment = "staging"
    Project     = "madfam-academy"
  }
}

# ElastiCache Redis
module "redis" {
  source = "../modules/elasticache"
  
  cluster_id = "madfam-staging"
  
  engine               = "redis"
  node_type           = "cache.t3.micro"
  num_cache_nodes     = 1
  parameter_group_name = "default.redis7"
  port                = 6379
  
  subnet_group_name = module.vpc.elasticache_subnet_group
  security_group_ids = [module.redis_security_group.security_group_id]
  
  tags = {
    Environment = "staging"
    Project     = "madfam-academy"
  }
}

# Load Balancer
module "alb" {
  source = "../modules/alb"
  
  name = "madfam-staging-alb"
  
  vpc_id  = module.vpc.vpc_id
  subnets = module.vpc.public_subnets
  
  security_group_ids = [module.alb_security_group.security_group_id]
  
  tags = {
    Environment = "staging"
    Project     = "madfam-academy"
  }
}
```

#### Kubernetes Manifests

```yaml
# k8s/staging/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: madfam-staging
  labels:
    environment: staging
    project: madfam-academy

---
# k8s/staging/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: madfam-staging
data:
  NODE_ENV: "staging"
  API_VERSION: "v1"
  LOG_LEVEL: "info"
  LOG_FORMAT: "json"
  TENANT_RESOLUTION_STRATEGY: "subdomain"
  ENABLE_METRICS: "true"
  METRICS_PORT: "9090"

---
# k8s/staging/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: madfam-staging
type: Opaque
stringData:
  DATABASE_URL: "postgresql://madfam:$(DATABASE_PASSWORD)@$(DATABASE_HOST):5432/madfam_academy"
  REDIS_URL: "redis://$(REDIS_HOST):6379"
  JWT_SECRET: "$(JWT_SECRET)"
  CONOCER_CLIENT_SECRET: "$(CONOCER_CLIENT_SECRET)"

---
# k8s/staging/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: madfam-api
  namespace: madfam-staging
  labels:
    app: madfam-api
    version: v1
spec:
  replicas: 2
  selector:
    matchLabels:
      app: madfam-api
  template:
    metadata:
      labels:
        app: madfam-api
        version: v1
    spec:
      containers:
      - name: api
        image: madfam/api:staging-latest
        ports:
        - containerPort: 3000
          name: http
        - containerPort: 9090
          name: metrics
        env:
        - name: PORT
          value: "3000"
        envFrom:
        - configMapRef:
            name: app-config
        - secretRef:
            name: app-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        securityContext:
          allowPrivilegeEscalation: false
          runAsNonRoot: true
          runAsUser: 1001
          capabilities:
            drop:
            - ALL

---
# k8s/staging/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: madfam-api-service
  namespace: madfam-staging
  labels:
    app: madfam-api
spec:
  selector:
    app: madfam-api
  ports:
  - name: http
    port: 80
    targetPort: 3000
  - name: metrics
    port: 9090
    targetPort: 9090
  type: ClusterIP

---
# k8s/staging/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: madfam-api-ingress
  namespace: madfam-staging
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012
    alb.ingress.kubernetes.io/ssl-redirect: '443'
spec:
  rules:
  - host: staging-api.madfam.academy
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: madfam-api-service
            port:
              number: 80

---
# k8s/staging/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: madfam-api-hpa
  namespace: madfam-staging
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: madfam-api
  minReplicas: 2
  maxReplicas: 5
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Production Environment

#### Production Infrastructure (Terraform)

```hcl
# infrastructure/production/main.tf
terraform {
  required_version = ">= 1.0"
  
  backend "s3" {
    bucket = "madfam-terraform-state"
    key    = "production/terraform.tfstate"
    region = "us-east-1"
  }
}

# Multi-AZ VPC
module "vpc" {
  source = "../modules/vpc"
  
  environment = "production"
  cidr_block  = "10.0.0.0/16"
  
  availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]
  
  public_subnets  = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  private_subnets = ["10.0.10.0/24", "10.0.20.0/24", "10.0.30.0/24"]
  database_subnets = ["10.0.100.0/24", "10.0.101.0/24", "10.0.102.0/24"]
  
  enable_nat_gateway = true
  enable_vpn_gateway = false
  
  tags = {
    Environment = "production"
    Project     = "madfam-academy"
  }
}

# Production EKS Cluster
module "eks" {
  source = "../modules/eks"
  
  cluster_name    = "madfam-production"
  cluster_version = "1.27"
  
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets
  
  # Multiple node groups for different workloads
  node_groups = {
    general = {
      desired_capacity = 3
      max_capacity     = 10
      min_capacity     = 3
      
      instance_types = ["m5.large"]
      
      k8s_labels = {
        Environment = "production"
        NodeGroup   = "general"
      }
    }
    
    compute_intensive = {
      desired_capacity = 2
      max_capacity     = 5
      min_capacity     = 1
      
      instance_types = ["c5.xlarge"]
      
      k8s_labels = {
        Environment = "production"
        NodeGroup   = "compute-intensive"
      }
      
      taints = [
        {
          key    = "workload"
          value  = "compute-intensive"
          effect = "NO_SCHEDULE"
        }
      ]
    }
  }
  
  # Enable cluster logging
  cluster_enabled_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"]
  
  tags = {
    Environment = "production"
    Project     = "madfam-academy"
  }
}

# Production RDS with Multi-AZ
module "database" {
  source = "../modules/rds"
  
  identifier = "madfam-production"
  
  engine         = "postgres"
  engine_version = "14.9"
  instance_class = "db.r5.large"
  
  allocated_storage     = 100
  max_allocated_storage = 1000
  storage_encrypted     = true
  kms_key_id           = aws_kms_key.rds.arn
  
  db_name  = "madfam_academy"
  username = "madfam"
  
  # Multi-AZ deployment
  multi_az = true
  
  # Read replicas
  read_replica_count = 2
  
  vpc_security_group_ids = [module.database_security_group.security_group_id]
  db_subnet_group_name   = module.vpc.database_subnet_group
  
  backup_retention_period = 30
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  # Performance Insights
  performance_insights_enabled = true
  performance_insights_retention_period = 7
  
  # Enhanced monitoring
  monitoring_interval = 60
  monitoring_role_arn = aws_iam_role.rds_enhanced_monitoring.arn
  
  deletion_protection = true
  
  tags = {
    Environment = "production"
    Project     = "madfam-academy"
  }
}

# Production Redis Cluster
module "redis" {
  source = "../modules/elasticache"
  
  replication_group_id = "madfam-production"
  
  engine               = "redis"
  node_type           = "cache.r5.large"
  port                = 6379
  parameter_group_name = "default.redis7.cluster.on"
  
  # Cluster mode enabled
  num_cache_clusters         = 3
  num_node_groups           = 3
  replicas_per_node_group   = 1
  
  # Multi-AZ with automatic failover
  automatic_failover_enabled = true
  multi_az_enabled          = true
  
  subnet_group_name = module.vpc.elasticache_subnet_group
  security_group_ids = [module.redis_security_group.security_group_id]
  
  # Backup configuration
  snapshot_retention_limit = 5
  snapshot_window         = "03:00-05:00"
  
  tags = {
    Environment = "production"
    Project     = "madfam-academy"
  }
}
```

#### Production Kubernetes Configuration

```yaml
# k8s/production/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: madfam-production

resources:
- namespace.yaml
- deployment.yaml
- service.yaml
- ingress.yaml
- hpa.yaml
- pdb.yaml
- service-monitor.yaml
- network-policy.yaml

configMapGenerator:
- name: app-config
  literals:
  - NODE_ENV=production
  - API_VERSION=v1
  - LOG_LEVEL=info
  - LOG_FORMAT=json
  - ENABLE_METRICS=true
  - METRICS_PORT=9090

secretGenerator:
- name: app-secrets
  files:
  - database-url=secrets/database-url
  - redis-url=secrets/redis-url
  - jwt-secret=secrets/jwt-secret
  - conocer-client-secret=secrets/conocer-client-secret

images:
- name: madfam/api
  newTag: v1.2.3

patches:
- path: production-resources.yaml
  target:
    kind: Deployment
    name: madfam-api

---
# k8s/production/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: madfam-api
  labels:
    app: madfam-api
    version: v1
spec:
  replicas: 5
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 1
  selector:
    matchLabels:
      app: madfam-api
  template:
    metadata:
      labels:
        app: madfam-api
        version: v1
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "9090"
        prometheus.io/path: "/metrics"
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001
      containers:
      - name: api
        image: madfam/api:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 3000
          name: http
        - containerPort: 9090
          name: metrics
        env:
        - name: PORT
          value: "3000"
        - name: POD_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        - name: POD_NAMESPACE
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
        envFrom:
        - configMapRef:
            name: app-config
        - secretRef:
            name: app-secrets
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 60
          periodSeconds: 30
          timeoutSeconds: 10
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 10
          timeoutSeconds: 5
          successThreshold: 1
          failureThreshold: 3
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL
        volumeMounts:
        - name: tmp
          mountPath: /tmp
        - name: logs
          mountPath: /app/logs
      volumes:
      - name: tmp
        emptyDir: {}
      - name: logs
        emptyDir: {}
      tolerations:
      - key: "node.kubernetes.io/unreachable"
        operator: "Exists"
        effect: "NoExecute"
        tolerationSeconds: 30
      - key: "node.kubernetes.io/not-ready"
        operator: "Exists"
        effect: "NoExecute"
        tolerationSeconds: 30

---
# k8s/production/pdb.yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: madfam-api-pdb
spec:
  minAvailable: 3
  selector:
    matchLabels:
      app: madfam-api

---
# k8s/production/network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: madfam-api-network-policy
spec:
  podSelector:
    matchLabels:
      app: madfam-api
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 3000
  - from:
    - namespaceSelector:
        matchLabels:
          name: monitoring
    ports:
    - protocol: TCP
      port: 9090
  egress:
  - to: []
    ports:
    - protocol: TCP
      port: 5432  # PostgreSQL
    - protocol: TCP
      port: 6379  # Redis
    - protocol: TCP
      port: 443   # HTTPS
    - protocol: TCP
      port: 53    # DNS
    - protocol: UDP
      port: 53    # DNS
```

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy to'
        required: true
        default: 'staging'
        type: choice
        options:
        - staging
        - production

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: madfam/api

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run linting
      run: npm run lint

    - name: Run type checking
      run: npm run type-check

    - name: Run unit tests
      run: npm run test:unit
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
        REDIS_URL: redis://localhost:6379

    - name: Run integration tests
      run: npm run test:integration
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
        REDIS_URL: redis://localhost:6379

    - name: Generate test coverage
      run: npm run test:coverage

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3

  security-scan:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        scan-type: 'fs'
        scan-ref: '.'
        format: 'sarif'
        output: 'trivy-results.sarif'

    - name: Upload Trivy scan results to GitHub Security tab
      uses: github/codeql-action/upload-sarif@v2
      with:
        sarif_file: 'trivy-results.sarif'

  build:
    needs: [test, security-scan]
    runs-on: ubuntu-latest
    outputs:
      image-tag: ${{ steps.meta.outputs.tags }}
      image-digest: ${{ steps.build.outputs.digest }}
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3

    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=semver,pattern={{version}}
          type=semver,pattern={{major}}.{{minor}}
          type=sha

    - name: Build and push Docker image
      id: build
      uses: docker/build-push-action@v5
      with:
        context: .
        platforms: linux/amd64,linux/arm64
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max
        build-args: |
          NODE_ENV=production
          BUILD_DATE=${{ steps.meta.outputs.date }}
          VCS_REF=${{ github.sha }}

  deploy-staging:
    if: github.ref == 'refs/heads/main' || github.event.inputs.environment == 'staging'
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1

    - name: Update kubeconfig
      run: |
        aws eks update-kubeconfig --region us-east-1 --name madfam-staging

    - name: Deploy to staging
      run: |
        cd k8s/staging
        kustomize edit set image madfam/api=${{ needs.build.outputs.image-tag }}
        kubectl apply -k .

    - name: Wait for deployment
      run: |
        kubectl rollout status deployment/madfam-api -n madfam-staging --timeout=300s

    - name: Run smoke tests
      run: |
        npm run test:smoke
      env:
        API_BASE_URL: https://staging-api.madfam.academy

  deploy-production:
    if: startsWith(github.ref, 'refs/tags/v') || github.event.inputs.environment == 'production'
    needs: [build, deploy-staging]
    runs-on: ubuntu-latest
    environment: production
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1

    - name: Update kubeconfig
      run: |
        aws eks update-kubeconfig --region us-east-1 --name madfam-production

    - name: Deploy to production
      run: |
        cd k8s/production
        kustomize edit set image madfam/api=${{ needs.build.outputs.image-tag }}
        kubectl apply -k .

    - name: Wait for deployment
      run: |
        kubectl rollout status deployment/madfam-api -n madfam-production --timeout=600s

    - name: Run production health checks
      run: |
        npm run test:health-check
      env:
        API_BASE_URL: https://api.madfam.academy

    - name: Notify deployment success
      uses: 8398a7/action-slack@v3
      with:
        status: success
        channel: '#deployments'
        message: "✅ Successfully deployed version ${{ github.ref_name }} to production"
      env:
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## Monitoring & Observability

### Prometheus Configuration

```yaml
# monitoring/prometheus/values.yaml
prometheus:
  prometheusSpec:
    retention: 30d
    resources:
      requests:
        memory: 2Gi
        cpu: 1000m
      limits:
        memory: 4Gi
        cpu: 2000m
    
    storageSpec:
      volumeClaimTemplate:
        spec:
          storageClassName: fast-ssd
          accessModes: ["ReadWriteOnce"]
          resources:
            requests:
              storage: 50Gi
    
    additionalScrapeConfigs:
    - job_name: 'madfam-api'
      kubernetes_sd_configs:
      - role: endpoints
        namespaces:
          names:
          - madfam-production
          - madfam-staging
      relabel_configs:
      - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)

grafana:
  adminPassword: "secure-admin-password"
  persistence:
    enabled: true
    size: 10Gi
  
  dashboardProviders:
    dashboardproviders.yaml:
      apiVersion: 1
      providers:
      - name: 'default'
        orgId: 1
        folder: ''
        type: file
        disableDeletion: false
        editable: true
        options:
          path: /var/lib/grafana/dashboards/default

  dashboards:
    default:
      madfam-api:
        gnetId: 1860
        revision: 27
        datasource: Prometheus
      
      solarpunk-impact:
        url: https://raw.githubusercontent.com/madfam/grafana-dashboards/main/solarpunk-impact.json
        datasource: Prometheus

alertmanager:
  config:
    global:
      smtp_smarthost: 'smtp.sendgrid.net:587'
      smtp_from: 'alerts@madfam.academy'
    
    route:
      group_by: ['alertname', 'cluster', 'service']
      group_wait: 10s
      group_interval: 10s
      repeat_interval: 1h
      receiver: 'web.hook'
      routes:
      - match:
          severity: critical
        receiver: 'critical-alerts'
      - match:
          severity: warning
        receiver: 'warning-alerts'
    
    receivers:
    - name: 'web.hook'
      webhook_configs:
      - url: 'http://webhook-service.monitoring.svc.cluster.local:8080/webhook'
    
    - name: 'critical-alerts'
      email_configs:
      - to: 'engineering@madfam.academy'
        subject: 'CRITICAL: {{ .GroupLabels.alertname }}'
        body: |
          {{ range .Alerts }}
          Alert: {{ .Annotations.summary }}
          Description: {{ .Annotations.description }}
          {{ end }}
      slack_configs:
      - api_url: '{{ .SlackWebhookURL }}'
        channel: '#alerts-critical'
        title: 'CRITICAL Alert'
        text: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'
    
    - name: 'warning-alerts'
      email_configs:
      - to: 'engineering@madfam.academy'
        subject: 'WARNING: {{ .GroupLabels.alertname }}'
```

### Custom Alerting Rules

```yaml
# monitoring/prometheus/alerts.yaml
groups:
- name: madfam-api.rules
  rules:
  - alert: HighErrorRate
    expr: |
      (
        rate(http_requests_total{status=~"5.."}[5m]) / 
        rate(http_requests_total[5m])
      ) > 0.1
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "High error rate detected"
      description: "Error rate is {{ $value | humanizePercentage }} for {{ $labels.service }}"

  - alert: HighLatency
    expr: |
      histogram_quantile(0.95, 
        rate(http_request_duration_seconds_bucket[5m])
      ) > 2
    for: 10m
    labels:
      severity: warning
    annotations:
      summary: "High latency detected"
      description: "95th percentile latency is {{ $value }}s for {{ $labels.service }}"

  - alert: DatabaseConnectionPoolExhausted
    expr: |
      database_connections_active / database_connections_max > 0.9
    for: 2m
    labels:
      severity: critical
    annotations:
      summary: "Database connection pool nearly exhausted"
      description: "{{ $labels.instance }} connection pool usage is {{ $value | humanizePercentage }}"

  - alert: RedisConnectionFailure
    expr: |
      redis_connected_clients == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Redis connection failure"
      description: "No Redis connections available on {{ $labels.instance }}"

  - alert: CONOCERIntegrationDown
    expr: |
      up{job="conocer-integration"} == 0
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "CONOCER integration service is down"
      description: "The CONOCER integration service has been down for more than 5 minutes"

  - alert: SolarpunkImpactCalculationFailure
    expr: |
      rate(solarpunk_impact_calculation_errors_total[5m]) > 0.1
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High failure rate in Solarpunk impact calculations"
      description: "Solarpunk impact calculation error rate is {{ $value }} errors/second"

- name: infrastructure.rules
  rules:
  - alert: KubernetesPodCrashLooping
    expr: |
      increase(kube_pod_container_status_restarts_total[1h]) > 5
    for: 15m
    labels:
      severity: critical
    annotations:
      summary: "Pod {{ $labels.pod }} is crash looping"
      description: "Pod {{ $labels.pod }} in namespace {{ $labels.namespace }} has restarted {{ $value }} times in the last hour"

  - alert: KubernetesNodeNotReady
    expr: |
      kube_node_status_condition{condition="Ready",status="true"} == 0
    for: 10m
    labels:
      severity: critical
    annotations:
      summary: "Kubernetes node {{ $labels.node }} is not ready"
      description: "Node {{ $labels.node }} has been not ready for more than 10 minutes"

  - alert: HighMemoryUsage
    expr: |
      (
        node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes
      ) / node_memory_MemTotal_bytes > 0.9
    for: 10m
    labels:
      severity: warning
    annotations:
      summary: "High memory usage on {{ $labels.instance }}"
      description: "Memory usage is {{ $value | humanizePercentage }} on {{ $labels.instance }}"

  - alert: HighDiskUsage
    expr: |
      (
        node_filesystem_size_bytes{fstype!="tmpfs"} - 
        node_filesystem_avail_bytes{fstype!="tmpfs"}
      ) / node_filesystem_size_bytes{fstype!="tmpfs"} > 0.85
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High disk usage on {{ $labels.instance }}"
      description: "Disk usage is {{ $value | humanizePercentage }} on {{ $labels.instance }} ({{ $labels.mountpoint }})"
```

## Backup & Disaster Recovery

### Database Backup Strategy

```bash
#!/bin/bash
# scripts/backup-database.sh

set -euo pipefail

# Configuration
BACKUP_BUCKET="madfam-database-backups"
BACKUP_PREFIX="postgresql"
RETENTION_DAYS=30
ENVIRONMENT=${ENVIRONMENT:-production}

# Database connection
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-madfam_academy}
DB_USER=${DB_USER:-madfam}

# Generate backup filename
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_PREFIX}_${ENVIRONMENT}_${TIMESTAMP}.sql.gz"

# Create backup
echo "Creating database backup: ${BACKUP_FILE}"
pg_dump \
  --host="${DB_HOST}" \
  --port="${DB_PORT}" \
  --username="${DB_USER}" \
  --dbname="${DB_NAME}" \
  --no-password \
  --verbose \
  --format=custom \
  --compress=9 \
  --no-privileges \
  --no-owner \
  | gzip > "/tmp/${BACKUP_FILE}"

# Upload to S3
echo "Uploading backup to S3..."
aws s3 cp \
  "/tmp/${BACKUP_FILE}" \
  "s3://${BACKUP_BUCKET}/${ENVIRONMENT}/${BACKUP_FILE}" \
  --storage-class STANDARD_IA

# Clean up local file
rm "/tmp/${BACKUP_FILE}"

# Remove old backups
echo "Cleaning up old backups (older than ${RETENTION_DAYS} days)..."
aws s3 ls "s3://${BACKUP_BUCKET}/${ENVIRONMENT}/" | \
  awk '{print $4}' | \
  while read -r file; do
    if [[ -n "$file" ]]; then
      file_date=$(echo "$file" | grep -o '[0-9]\{8\}_[0-9]\{6\}' | head -1)
      if [[ -n "$file_date" ]]; then
        file_timestamp=$(date -d "${file_date:0:8} ${file_date:9:2}:${file_date:11:2}:${file_date:13:2}" +%s)
        cutoff_timestamp=$(date -d "${RETENTION_DAYS} days ago" +%s)
        
        if [[ $file_timestamp -lt $cutoff_timestamp ]]; then
          echo "Deleting old backup: $file"
          aws s3 rm "s3://${BACKUP_BUCKET}/${ENVIRONMENT}/$file"
        fi
      fi
    fi
  done

echo "Database backup completed successfully"
```

### Kubernetes Backup (Velero)

```yaml
# velero/backup-schedule.yaml
apiVersion: velero.io/v1
kind: Schedule
metadata:
  name: madfam-daily-backup
  namespace: velero
spec:
  schedule: "0 3 * * *"  # Daily at 3 AM UTC
  template:
    metadata:
      name: madfam-daily-backup
    spec:
      includedNamespaces:
      - madfam-production
      - madfam-staging
      excludedResources:
      - events
      - events.events.k8s.io
      storageLocation: default
      ttl: 720h  # 30 days

---
apiVersion: velero.io/v1
kind: Schedule
metadata:
  name: madfam-weekly-backup
  namespace: velero
spec:
  schedule: "0 2 * * 0"  # Weekly on Sunday at 2 AM UTC
  template:
    metadata:
      name: madfam-weekly-backup
    spec:
      includedNamespaces:
      - madfam-production
      - madfam-staging
      storageLocation: default
      ttl: 2160h  # 90 days
```

### Disaster Recovery Procedures

```bash
#!/bin/bash
# scripts/disaster-recovery.sh

set -euo pipefail

ENVIRONMENT=${1:-production}
BACKUP_DATE=${2:-latest}

echo "Starting disaster recovery for environment: ${ENVIRONMENT}"
echo "Using backup date: ${BACKUP_DATE}"

# 1. Restore database
echo "Restoring database..."
if [[ "${BACKUP_DATE}" == "latest" ]]; then
  BACKUP_FILE=$(aws s3 ls "s3://madfam-database-backups/${ENVIRONMENT}/" | \
    sort | tail -n 1 | awk '{print $4}')
else
  BACKUP_FILE=$(aws s3 ls "s3://madfam-database-backups/${ENVIRONMENT}/" | \
    grep "${BACKUP_DATE}" | awk '{print $4}' | head -n 1)
fi

if [[ -z "${BACKUP_FILE}" ]]; then
  echo "ERROR: No backup found for date ${BACKUP_DATE}"
  exit 1
fi

echo "Downloading backup: ${BACKUP_FILE}"
aws s3 cp \
  "s3://madfam-database-backups/${ENVIRONMENT}/${BACKUP_FILE}" \
  "/tmp/${BACKUP_FILE}"

# Restore database
echo "Restoring database from backup..."
gunzip -c "/tmp/${BACKUP_FILE}" | \
  pg_restore \
    --host="${DB_HOST}" \
    --port="${DB_PORT}" \
    --username="${DB_USER}" \
    --dbname="${DB_NAME}" \
    --clean \
    --if-exists \
    --verbose

# 2. Restore Kubernetes resources
echo "Restoring Kubernetes resources..."
velero restore create \
  --from-backup="madfam-daily-backup-$(date -d yesterday +%Y%m%d)" \
  --include-namespaces="${ENVIRONMENT}" \
  --wait

# 3. Verify services
echo "Verifying service health..."
kubectl get pods -n "madfam-${ENVIRONMENT}"
kubectl rollout status deployment/madfam-api -n "madfam-${ENVIRONMENT}"

# 4. Run health checks
echo "Running health checks..."
API_URL="https://api.madfam.academy"
if [[ "${ENVIRONMENT}" == "staging" ]]; then
  API_URL="https://staging-api.madfam.academy"
fi

curl -f "${API_URL}/health" || {
  echo "ERROR: Health check failed"
  exit 1
}

echo "Disaster recovery completed successfully"
```

---

**Document Version**: 1.0  
**Last Updated**: 2024-07-10  
**Maintained By**: MADFAM Academy Engineering Team