# Integration Layer Architecture Diagrams
## MADFAM Academy Marketplace Platform

### System Overview Diagram

```mermaid
graph TB
    subgraph "External Systems"
        CONOCER[CONOCER API<br/>Mexican Labor Standards]
        Analytics[Analytics Services<br/>Google Analytics, Mixpanel]
        Payment[Payment Gateways<br/>Stripe, PayPal]
        Email[Email Services<br/>SendGrid, Mailgun]
        Storage[Cloud Storage<br/>AWS S3, GCS]
    end

    subgraph "API Gateway Layer"
        Gateway[API Gateway<br/>Multi-tenant Routing]
        RateLimit[Rate Limiter]
        Auth[Authentication<br/>JWT + Persona-based]
        Transform[Request/Response<br/>Transformation]
    end

    subgraph "Core Platform"
        Web[Web Frontend<br/>React + TypeScript]
        Mobile[Mobile App<br/>React Native]
        Admin[Admin Dashboard<br/>Next.js]
        
        Core[Core API<br/>Node.js + Express]
        Domain[Domain Services<br/>DDD Architecture]
        Database[(PostgreSQL<br/>Multi-tenant RLS)]
    end

    subgraph "Integration Services"
        CONOCERSync[CONOCER Integration<br/>Certification Sync]
        Pipeline[Data Pipeline<br/>Analytics & Reporting]
        Queue[Message Queue<br/>RabbitMQ/Redis]
        Cache[Cache Layer<br/>Redis]
    end

    subgraph "Infrastructure"
        Monitor[Monitoring<br/>Prometheus + Grafana]
        Logs[Centralized Logging<br/>ELK Stack]
        Backup[Backup & DR<br/>Automated]
    end

    %% Client connections
    Web --> Gateway
    Mobile --> Gateway
    Admin --> Gateway

    %% Gateway routing
    Gateway --> RateLimit
    RateLimit --> Auth
    Auth --> Transform
    Transform --> Core

    %% Core platform
    Core --> Domain
    Domain --> Database
    Core --> Queue
    Core --> Cache

    %% Integration flows
    CONOCERSync --> CONOCER
    Pipeline --> Analytics
    Core --> CONOCERSync
    Core --> Pipeline

    %% External integrations
    Core --> Payment
    Core --> Email
    Core --> Storage

    %% Infrastructure
    Core --> Monitor
    Core --> Logs
    Database --> Backup

    classDef external fill:#e1f5fe
    classDef gateway fill:#f3e5f5
    classDef core fill:#e8f5e8
    classDef integration fill:#fff3e0
    classDef infrastructure fill:#fce4ec

    class CONOCER,Analytics,Payment,Email,Storage external
    class Gateway,RateLimit,Auth,Transform gateway
    class Web,Mobile,Admin,Core,Domain,Database core
    class CONOCERSync,Pipeline,Queue,Cache integration
    class Monitor,Logs,Backup infrastructure
```

### API Gateway Architecture

```mermaid
graph TD
    subgraph "Client Layer"
        WebApp[Web Application]
        MobileApp[Mobile Application]
        AdminPanel[Admin Panel]
        ThirdParty[Third-party APIs]
    end

    subgraph "API Gateway Cluster"
        LB[Load Balancer<br/>NGINX/HAProxy]
        
        subgraph "Gateway Instances"
            GW1[Gateway Instance 1]
            GW2[Gateway Instance 2]
            GW3[Gateway Instance 3]
        end
        
        subgraph "Middleware Stack"
            TenantResolver[Tenant Resolution<br/>Subdomain/Header/Path]
            AuthMiddleware[Authentication<br/>JWT Validation]
            AuthzMiddleware[Authorization<br/>Persona-based RBAC]
            RateLimiter[Rate Limiting<br/>Redis-backed]
            Validator[Request Validation<br/>Schema-based]
            Transformer[Request/Response<br/>Transformation]
            CircuitBreaker[Circuit Breaker<br/>Resilience Pattern]
            Logger[Request Logging<br/>Structured Logs]
        end
    end

    subgraph "Backend Services"
        UserService[User Service]
        CourseService[Course Service]
        CertService[Certification Service]
        AnalyticsService[Analytics Service]
        CONOCERService[CONOCER Integration]
    end

    subgraph "Infrastructure"
        Redis[(Redis Cache<br/>Rate Limits + Sessions)]
        Metrics[Metrics Collection<br/>Prometheus]
        Tracing[Distributed Tracing<br/>Jaeger]
    end

    %% Client to Gateway
    WebApp --> LB
    MobileApp --> LB
    AdminPanel --> LB
    ThirdParty --> LB

    %% Load Balancer to Instances
    LB --> GW1
    LB --> GW2
    LB --> GW3

    %% Middleware Flow
    GW1 --> TenantResolver
    GW2 --> TenantResolver
    GW3 --> TenantResolver
    
    TenantResolver --> AuthMiddleware
    AuthMiddleware --> AuthzMiddleware
    AuthzMiddleware --> RateLimiter
    RateLimiter --> Validator
    Validator --> Transformer
    Transformer --> CircuitBreaker
    CircuitBreaker --> Logger

    %% Gateway to Services
    Logger --> UserService
    Logger --> CourseService
    Logger --> CertService
    Logger --> AnalyticsService
    Logger --> CONOCERService

    %% Infrastructure connections
    RateLimiter -.-> Redis
    AuthMiddleware -.-> Redis
    Logger -.-> Metrics
    Logger -.-> Tracing

    classDef client fill:#e3f2fd
    classDef gateway fill:#f1f8e9
    classDef middleware fill:#fff8e1
    classDef service fill:#fce4ec
    classDef infra fill:#f3e5f5

    class WebApp,MobileApp,AdminPanel,ThirdParty client
    class LB,GW1,GW2,GW3 gateway
    class TenantResolver,AuthMiddleware,AuthzMiddleware,RateLimiter,Validator,Transformer,CircuitBreaker,Logger middleware
    class UserService,CourseService,CertService,AnalyticsService,CONOCERService service
    class Redis,Metrics,Tracing infra
```

### CONOCER Integration Flow

```mermaid
sequenceDiagram
    participant Student
    participant Platform as MADFAM Platform
    participant CONOCERService as CONOCER Integration
    participant CONOCER as CONOCER API
    participant Analytics as Analytics Pipeline
    participant Queue as Message Queue

    Note over Student,Queue: Course Completion & Certification Flow

    Student->>Platform: Complete final assessment
    Platform->>Platform: Validate course completion
    Platform->>Platform: Generate internal certificate
    
    Platform->>Analytics: Track completion event
    Platform->>CONOCERService: Request CONOCER certification
    
    CONOCERService->>CONOCERService: Validate Solarpunk compliance
    
    alt Solarpunk Compliant
        CONOCERService->>CONOCER: Submit certification request
        CONOCER-->>CONOCERService: Return submission ID
        CONOCERService->>Queue: Queue status check job
        CONOCERService->>Platform: Return pending status
        Platform->>Student: Notify submission in progress
        
        loop Status Polling
            Queue->>CONOCER: Check certification status
            CONOCER-->>Queue: Return current status
            
            alt Status: Approved
                Queue->>Platform: Update certificate status
                Platform->>Student: Notify certification approved
                Platform->>Analytics: Track certification success
            else Status: Rejected
                Queue->>Platform: Update certificate status
                Platform->>Student: Notify rejection + reason
                Platform->>Analytics: Track certification failure
            end
        end
        
    else Non-Compliant
        CONOCERService->>Platform: Return compliance error
        Platform->>Student: Notify compliance requirements
        Platform->>Analytics: Track compliance failure
    end

    Note over Student,Queue: Periodic Standards Sync

    loop Daily Sync
        CONOCERService->>CONOCER: Request standards update
        CONOCER-->>CONOCERService: Return updated standards
        CONOCERService->>CONOCERService: Apply Solarpunk filtering
        CONOCERService->>Platform: Update course alignments
        Platform->>Analytics: Track sync metrics
    end
```

### Data Pipeline Architecture

```mermaid
graph TD
    subgraph "Data Sources"
        UserEvents[User Interaction Events]
        LearningEvents[Learning Progress Events]
        SolarpunkEvents[Solarpunk Impact Events]
        SystemEvents[System Performance Events]
        ExternalData[External Data Sources]
    end

    subgraph "Event Ingestion Layer"
        EventAPI[Event Ingestion API]
        EventBuffer[Event Buffer<br/>Redis Streams]
        EventValidator[Event Validation<br/>Schema Enforcement]
    end

    subgraph "Stream Processing"
        KafkaCluster[Apache Kafka<br/>Event Streaming]
        
        subgraph "Real-time Processors"
            LearningProcessor[Learning Analytics<br/>Processor]
            EngagementProcessor[Engagement Metrics<br/>Processor]
            SolarpunkProcessor[Solarpunk Impact<br/>Processor]
            AlertProcessor[Real-time Alerts<br/>Processor]
        end
    end

    subgraph "Batch Processing"
        Scheduler[Apache Airflow<br/>Workflow Orchestration]
        
        subgraph "Batch Jobs"
            DailyAggregation[Daily Aggregation<br/>Job]
            WeeklyReports[Weekly Reports<br/>Generation]
            MonthlyMetrics[Monthly Solarpunk<br/>Impact Reports]
            DataWarehouseETL[Data Warehouse<br/>ETL Job]
        end
    end

    subgraph "Storage Layer"
        AnalyticsDB[(Analytics Database<br/>PostgreSQL)]
        DataWarehouse[(Data Warehouse<br/>Snowflake/BigQuery)]
        CacheLayer[Cache Layer<br/>Redis]
        FileStorage[File Storage<br/>S3/GCS]
    end

    subgraph "Analytics & Reporting"
        Dashboard[Real-time Dashboard<br/>Grafana]
        ReportingAPI[Reporting API<br/>GraphQL]
        ExportService[Data Export<br/>Service]
        MLPipeline[ML Pipeline<br/>Predictive Analytics]
    end

    subgraph "Monitoring & Observability"
        MetricsCollector[Metrics Collection<br/>Prometheus]
        LogAggregator[Log Aggregation<br/>ELK Stack]
        AlertManager[Alert Manager<br/>PagerDuty Integration]
    end

    %% Data flow
    UserEvents --> EventAPI
    LearningEvents --> EventAPI
    SolarpunkEvents --> EventAPI
    SystemEvents --> EventAPI
    ExternalData --> EventAPI

    EventAPI --> EventBuffer
    EventBuffer --> EventValidator
    EventValidator --> KafkaCluster

    %% Real-time processing
    KafkaCluster --> LearningProcessor
    KafkaCluster --> EngagementProcessor
    KafkaCluster --> SolarpunkProcessor
    KafkaCluster --> AlertProcessor

    LearningProcessor --> AnalyticsDB
    EngagementProcessor --> AnalyticsDB
    SolarpunkProcessor --> AnalyticsDB
    AlertProcessor --> AlertManager

    %% Batch processing
    Scheduler --> DailyAggregation
    Scheduler --> WeeklyReports
    Scheduler --> MonthlyMetrics
    Scheduler --> DataWarehouseETL

    DailyAggregation --> AnalyticsDB
    WeeklyReports --> FileStorage
    MonthlyMetrics --> FileStorage
    DataWarehouseETL --> DataWarehouse

    %% Storage connections
    AnalyticsDB --> CacheLayer
    DataWarehouse --> ReportingAPI

    %% Analytics & Reporting
    AnalyticsDB --> Dashboard
    AnalyticsDB --> ReportingAPI
    DataWarehouse --> ExportService
    DataWarehouse --> MLPipeline

    %% Monitoring
    KafkaCluster -.-> MetricsCollector
    AnalyticsDB -.-> MetricsCollector
    EventAPI -.-> LogAggregator
    Scheduler -.-> LogAggregator

    classDef source fill:#e8f5e8
    classDef ingestion fill:#e1f5fe
    classDef processing fill:#fff3e0
    classDef storage fill:#f3e5f5
    classDef analytics fill:#fce4ec
    classDef monitoring fill:#f1f8e9

    class UserEvents,LearningEvents,SolarpunkEvents,SystemEvents,ExternalData source
    class EventAPI,EventBuffer,EventValidator ingestion
    class KafkaCluster,LearningProcessor,EngagementProcessor,SolarpunkProcessor,AlertProcessor,Scheduler,DailyAggregation,WeeklyReports,MonthlyMetrics,DataWarehouseETL processing
    class AnalyticsDB,DataWarehouse,CacheLayer,FileStorage storage
    class Dashboard,ReportingAPI,ExportService,MLPipeline analytics
    class MetricsCollector,LogAggregator,AlertManager monitoring
```

### Multi-Tenant Request Flow

```mermaid
graph TD
    subgraph "Request Journey"
        Client[Client Request<br/>subdomain.madfam.academy/api/v1/courses]
        
        subgraph "API Gateway Processing"
            Step1[1. DNS Resolution<br/>Route to API Gateway]
            Step2[2. Tenant Resolution<br/>Extract tenant from subdomain]
            Step3[3. Load Tenant Config<br/>Get tenant-specific settings]
            Step4[4. Authentication<br/>Validate JWT token]
            Step5[5. Authorization<br/>Check persona permissions]
            Step6[6. Rate Limiting<br/>Apply tenant-specific limits]
            Step7[7. Request Validation<br/>Schema validation]
            Step8[8. Request Transformation<br/>Add tenant context]
        end
        
        subgraph "Backend Processing"
            Step9[9. Route to Service<br/>Based on endpoint pattern]
            Step10[10. Apply Tenant Context<br/>Set database schema/filter]
            Step11[11. Business Logic<br/>Process request]
            Step12[12. Data Access<br/>Tenant-isolated queries]
        end
        
        subgraph "Response Journey"
            Step13[13. Response Transformation<br/>Remove sensitive data]
            Step14[14. Add Metadata<br/>Tenant info, rate limit headers]
            Step15[15. Logging & Metrics<br/>Record request metrics]
            Step16[16. Return Response<br/>JSON response to client]
        end
    end

    subgraph "Tenant Context Store"
        TenantDB[(Tenant Database<br/>Configuration & Limits)]
        Cache[Redis Cache<br/>Tenant configs]
    end

    subgraph "Rate Limiting Store"
        RateLimitDB[Redis<br/>Rate limit counters]
    end

    Client --> Step1
    Step1 --> Step2
    Step2 --> Step3
    Step3 --> Step4
    Step4 --> Step5
    Step5 --> Step6
    Step6 --> Step7
    Step7 --> Step8
    Step8 --> Step9
    Step9 --> Step10
    Step10 --> Step11
    Step11 --> Step12
    Step12 --> Step13
    Step13 --> Step14
    Step14 --> Step15
    Step15 --> Step16

    %% External connections
    Step3 -.-> TenantDB
    Step3 -.-> Cache
    Step6 -.-> RateLimitDB
    Step15 -.-> Cache

    classDef step fill:#e3f2fd
    classDef store fill:#f1f8e9
    classDef client fill:#fce4ec

    class Step1,Step2,Step3,Step4,Step5,Step6,Step7,Step8,Step9,Step10,Step11,Step12,Step13,Step14,Step15,Step16 step
    class TenantDB,Cache,RateLimitDB store
    class Client client
```

### Solarpunk Impact Tracking Flow

```mermaid
graph TD
    subgraph "Learning Activities"
        CourseCompletion[Course Completion]
        CommunityProject[Community Project]
        SkillSharing[Skill Sharing Session]
        SustainabilityAction[Sustainability Action]
        RegenerativeProject[Regenerative Project]
    end

    subgraph "Event Processing"
        EventCapture[Event Capture<br/>Automatic & Manual]
        SolarpunkScoring[Solarpunk Impact<br/>Scoring Algorithm]
        ComplianceCheck[CONOCER Compliance<br/>Validation]
    end

    subgraph "Metrics Calculation"
        SustainabilityMetrics[Sustainability<br/>Impact Score]
        CommunityMetrics[Community<br/>Engagement Score]
        RegenerativeMetrics[Regenerative<br/>Value Score]
        SocialJusticeMetrics[Social Justice<br/>Alignment Score]
        CircularityMetrics[Circularity<br/>Contribution Score]
    end

    subgraph "Aggregation & Reporting"
        IndividualDashboard[Individual<br/>Impact Dashboard]
        CommunityDashboard[Community<br/>Impact Dashboard]
        TenantDashboard[Tenant<br/>Impact Dashboard]
        GlobalReport[Global Solarpunk<br/>Impact Report]
    end

    subgraph "External Integration"
        CONOCERSubmission[CONOCER<br/>Certification Submission]
        CarbonTracking[Carbon Footprint<br/>Tracking APIs]
        CommunityPlatforms[Community<br/>Platform Integration]
    end

    %% Flow connections
    CourseCompletion --> EventCapture
    CommunityProject --> EventCapture
    SkillSharing --> EventCapture
    SustainabilityAction --> EventCapture
    RegenerativeProject --> EventCapture

    EventCapture --> SolarpunkScoring
    SolarpunkScoring --> ComplianceCheck

    ComplianceCheck --> SustainabilityMetrics
    ComplianceCheck --> CommunityMetrics
    ComplianceCheck --> RegenerativeMetrics
    ComplianceCheck --> SocialJusticeMetrics
    ComplianceCheck --> CircularityMetrics

    SustainabilityMetrics --> IndividualDashboard
    CommunityMetrics --> IndividualDashboard
    RegenerativeMetrics --> IndividualDashboard
    SocialJusticeMetrics --> IndividualDashboard
    CircularityMetrics --> IndividualDashboard

    IndividualDashboard --> CommunityDashboard
    CommunityDashboard --> TenantDashboard
    TenantDashboard --> GlobalReport

    %% External integrations
    ComplianceCheck --> CONOCERSubmission
    SustainabilityMetrics --> CarbonTracking
    CommunityMetrics --> CommunityPlatforms

    classDef activity fill:#e8f5e8
    classDef processing fill:#e1f5fe
    classDef metrics fill:#fff3e0
    classDef reporting fill:#f3e5f5
    classDef external fill:#fce4ec

    class CourseCompletion,CommunityProject,SkillSharing,SustainabilityAction,RegenerativeProject activity
    class EventCapture,SolarpunkScoring,ComplianceCheck processing
    class SustainabilityMetrics,CommunityMetrics,RegenerativeMetrics,SocialJusticeMetrics,CircularityMetrics metrics
    class IndividualDashboard,CommunityDashboard,TenantDashboard,GlobalReport reporting
    class CONOCERSubmission,CarbonTracking,CommunityPlatforms external
```

### Infrastructure Deployment Architecture

```mermaid
graph TB
    subgraph "Production Environment"
        subgraph "Load Balancer Tier"
            ALB[Application Load Balancer<br/>AWS ALB / GCP LB]
            WAF[Web Application Firewall<br/>AWS WAF / Cloudflare]
        end

        subgraph "API Gateway Tier"
            GWCluster[API Gateway Cluster<br/>3 instances + Auto Scaling]
            GWCache[Gateway Cache<br/>Redis Cluster]
        end

        subgraph "Application Tier"
            subgraph "Core Services"
                CoreAPI1[Core API - Instance 1]
                CoreAPI2[Core API - Instance 2]
                CoreAPI3[Core API - Instance 3]
            end
            
            subgraph "Integration Services"
                CONOCERService[CONOCER Integration<br/>Service]
                PipelineService[Data Pipeline<br/>Service]
                AnalyticsService[Analytics<br/>Service]
            end
        end

        subgraph "Data Tier"
            subgraph "Primary Database"
                PrimaryDB[(PostgreSQL Primary<br/>Multi-tenant with RLS)]
                ReadReplica1[(Read Replica 1)]
                ReadReplica2[(Read Replica 2)]
            end
            
            subgraph "Analytics Storage"
                AnalyticsDB[(Analytics Database<br/>PostgreSQL)]
                DataWarehouse[(Data Warehouse<br/>BigQuery/Snowflake)]
            end
            
            subgraph "Cache & Queue"
                RedisCluster[Redis Cluster<br/>Cache + Sessions]
                MessageQueue[Message Queue<br/>RabbitMQ Cluster]
            end
        end

        subgraph "External Services"
            CDN[Content Delivery Network<br/>CloudFront/Cloudflare]
            ObjectStorage[Object Storage<br/>S3/GCS]
            MonitoringStack[Monitoring Stack<br/>Prometheus + Grafana]
        end
    end

    subgraph "Development Environment"
        DevCluster[Development Cluster<br/>Minikube/Kind]
        DevDB[(Development Database<br/>PostgreSQL)]
        DevCache[Development Cache<br/>Redis]
    end

    subgraph "Staging Environment"
        StagingCluster[Staging Cluster<br/>Reduced scale production]
        StagingDB[(Staging Database<br/>PostgreSQL)]
        StagingCache[Staging Cache<br/>Redis]
    end

    %% Traffic flow
    Internet[Internet Traffic] --> WAF
    WAF --> ALB
    ALB --> GWCluster
    GWCluster --> CoreAPI1
    GWCluster --> CoreAPI2
    GWCluster --> CoreAPI3

    %% Cache connections
    GWCluster -.-> GWCache
    CoreAPI1 -.-> RedisCluster
    CoreAPI2 -.-> RedisCluster
    CoreAPI3 -.-> RedisCluster

    %% Database connections
    CoreAPI1 --> PrimaryDB
    CoreAPI2 --> PrimaryDB
    CoreAPI3 --> PrimaryDB
    
    PrimaryDB --> ReadReplica1
    PrimaryDB --> ReadReplica2

    %% Integration services
    CONOCERService --> PrimaryDB
    PipelineService --> AnalyticsDB
    AnalyticsService --> DataWarehouse

    %% Message queue
    CoreAPI1 -.-> MessageQueue
    CONOCERService -.-> MessageQueue
    PipelineService -.-> MessageQueue

    %% External services
    CoreAPI1 -.-> ObjectStorage
    CoreAPI2 -.-> ObjectStorage
    CoreAPI3 -.-> ObjectStorage
    
    All[All Services] -.-> MonitoringStack

    %% Static content
    CDN -.-> ObjectStorage

    classDef loadbalancer fill:#e1f5fe
    classDef gateway fill:#f3e5f5
    classDef application fill:#e8f5e8
    classDef database fill:#fff3e0
    classDef external fill:#fce4ec
    classDef environment fill:#f1f8e9

    class ALB,WAF loadbalancer
    class GWCluster,GWCache gateway
    class CoreAPI1,CoreAPI2,CoreAPI3,CONOCERService,PipelineService,AnalyticsService application
    class PrimaryDB,ReadReplica1,ReadReplica2,AnalyticsDB,DataWarehouse,RedisCluster,MessageQueue database
    class CDN,ObjectStorage,MonitoringStack external
    class DevCluster,DevDB,DevCache,StagingCluster,StagingDB,StagingCache environment
```

These diagrams provide a comprehensive view of the MADFAM Academy integration layer architecture, showing the relationships between components, data flows, and deployment strategies. The architecture emphasizes scalability, resilience, and the unique Solarpunk educational mission of the platform.