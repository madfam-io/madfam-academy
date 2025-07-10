# MADFAM Academy Developer Onboarding Guide
**Version 1.0** | **Date: 2024-07-10** | **Welcome to the Team! 🌱**

## Welcome to MADFAM Academy

Welcome to the MADFAM Academy engineering team! This guide will help you get up and running with our multi-tenant educational marketplace platform that integrates CONOCER certification standards with Solarpunk educational principles.

## Table of Contents

1. [Platform Overview](#platform-overview)
2. [Development Environment Setup](#development-environment-setup)
3. [Architecture Deep Dive](#architecture-deep-dive)
4. [Development Workflow](#development-workflow)
5. [Code Standards & Best Practices](#code-standards--best-practices)
6. [Testing Strategy](#testing-strategy)
7. [Deployment Process](#deployment-process)
8. [Monitoring & Debugging](#monitoring--debugging)
9. [Team Resources](#team-resources)
10. [First Contributions](#first-contributions)

## Platform Overview

### Mission Statement
MADFAM Academy empowers learners and instructors through a sustainable, regenerative educational marketplace that aligns with Solarpunk principles while providing officially recognized CONOCER certifications.

### Core Concepts

#### 🌍 **Solarpunk Education**
- **Sustainability-First**: Every course and action contributes to environmental regeneration
- **Community-Centered**: Learning that benefits entire communities, not just individuals
- **Social Justice**: Equitable access to education and economic opportunities
- **Regenerative Design**: Systems that heal rather than extract

#### 🎓 **CONOCER Integration**
- **Official Recognition**: Mexican labor competency certification standards
- **Skills-Based Learning**: Practical, applicable competencies
- **Quality Assurance**: Rigorous validation of learning outcomes
- **Career Pathways**: Clear progression routes for learners

#### 🏢 **Multi-Tenancy**
- **Complete Isolation**: Each organization has its own secure space
- **Customizable Features**: Configurable limits, branding, and functionality
- **Scalable Architecture**: Supports growth from startup to enterprise
- **Unified Platform**: Shared infrastructure with isolated data

### Key Features Overview

```mermaid
mindmap
  root((MADFAM Academy))
    Course Management
      Creation & Publishing
      Multi-media Content
      Progress Tracking
      Analytics
    Certification System
      CONOCER Integration
      Digital Certificates
      Verification System
      Portfolio Management
    Solarpunk Impact
      Sustainability Metrics
      Community Contributions
      Regenerative Projects
      Carbon Tracking
    Multi-tenancy
      Organization Isolation
      Custom Branding
      Feature Configuration
      Billing Management
    Learning Experience
      Personalized Paths
      Social Learning
      Real-time Collaboration
      Mobile Support
```

## Development Environment Setup

### Prerequisites Checklist

- [ ] **Git** 2.30+ installed and configured
- [ ] **Node.js** 18+ LTS installed (use nvm for version management)
- [ ] **npm** 8+ installed
- [ ] **Docker Desktop** 4.0+ installed and running
- [ ] **VS Code** or preferred IDE installed
- [ ] **PostgreSQL** 14+ (Docker recommended)
- [ ] **Redis** 7+ (Docker recommended)

### Quick Start (5 Minutes)

```bash
# 1. Clone the repository
git clone https://github.com/madfam/madfam-academy.git
cd madfam-academy

# 2. Start infrastructure services
docker-compose -f docker-compose.dev.yml up -d postgres redis mailhog

# 3. Install dependencies
npm install
cd frontend && npm install && cd ..

# 4. Set up environment
cp .env.example .env.development
# Edit .env.development with your settings (see configuration section below)

# 5. Run database migrations
npm run migrate:latest

# 6. Seed development data
npm run seed:dev

# 7. Start the development servers
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev

# 8. Open your browser
# Backend: http://localhost:3000
# Frontend: http://localhost:5173
# Email UI: http://localhost:8025 (MailHog)
```

### Detailed Environment Configuration

#### `.env.development` Configuration

```bash
# Database Configuration
DATABASE_URL=postgresql://madfam:password@localhost:5432/madfam_academy_dev
ANALYTICS_DATABASE_URL=postgresql://madfam:password@localhost:5432/madfam_analytics_dev

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Application Configuration
NODE_ENV=development
PORT=3000
API_VERSION=v1

# JWT Configuration (Use secure secrets in production)
JWT_SECRET=your-super-secret-jwt-key-for-development-only
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d

# Multi-tenant Configuration
TENANT_RESOLUTION_STRATEGY=subdomain
DEFAULT_TENANT_DOMAIN=localhost

# External Services (Development/Sandbox)
CONOCER_API_URL=https://sandbox.conocer.gob.mx/api
CONOCER_CLIENT_ID=dev_client_id
CONOCER_CLIENT_SECRET=dev_client_secret

# Email Configuration (MailHog for development)
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

# Development Tools
ENABLE_METRICS=true
METRICS_PORT=9090
ENABLE_DEBUG=true
ENABLE_CORS=true

# Frontend Configuration
VITE_API_URL=http://localhost:3000/v1
VITE_WEBSOCKET_URL=ws://localhost:3000
VITE_SENTRY_DSN=
VITE_ANALYTICS_ENABLED=false
```

### IDE Setup (VS Code)

#### Recommended Extensions
Install these extensions for the best development experience:

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-jest",
    "ms-vscode-remote.remote-containers",
    "ms-kubernetes-tools.vscode-kubernetes-tools",
    "ms-vscode.vscode-docker",
    "redhat.vscode-yaml",
    "ms-vscode.vscode-json"
  ]
}
```

#### VS Code Settings
Create `.vscode/settings.json`:

```json
{
  "typescript.preferences.preferTypeOnlyAutoImports": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "eslint.workingDirectories": [".", "frontend"],
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  }
}
```

#### Launch Configuration
Create `.vscode/launch.json` for debugging:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Backend",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/index.ts",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "runtimeArgs": ["-r", "ts-node/register"],
      "env": {
        "NODE_ENV": "development"
      },
      "envFile": "${workspaceFolder}/.env.development",
      "sourceMaps": true,
      "restart": true,
      "console": "integratedTerminal"
    },
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--no-coverage"],
      "envFile": "${workspaceFolder}/.env.test",
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

## Architecture Deep Dive

### Domain-Driven Design Structure

Our codebase follows DDD principles with clear separation of concerns:

```
src/
├── domain/                 # Core business logic
│   ├── shared/            # Shared domain concepts
│   │   ├── entity.ts      # Base Entity class
│   │   ├── value-object.ts # Base ValueObject class
│   │   └── domain-event.ts # Domain event base
│   ├── user/              # User aggregate
│   │   ├── user.entity.ts
│   │   ├── user.repository.ts
│   │   └── user.service.ts
│   ├── course/            # Course aggregate
│   │   ├── course.entity.ts
│   │   ├── module.entity.ts
│   │   ├── lesson.entity.ts
│   │   └── course.repository.ts
│   └── certification/     # Certification aggregate
│       ├── certificate.entity.ts
│       ├── conocer-standard.entity.ts
│       └── certification.service.ts
├── application/           # Use cases and application services
│   ├── commands/          # Command handlers
│   ├── queries/           # Query handlers
│   └── services/          # Application services
├── infrastructure/        # External concerns
│   ├── api/              # HTTP controllers and routes
│   ├── database/         # Database connections and repositories
│   ├── auth/             # Authentication and authorization
│   ├── conocer/          # CONOCER integration
│   ├── data-pipeline/    # Analytics and event processing
│   └── monitoring/       # Metrics and logging
```

### Key Architectural Patterns

#### 1. **Aggregate Pattern**
```typescript
// Example: Course Aggregate
export class Course extends AggregateRoot {
  private constructor(
    id: CourseId,
    private title: string,
    private modules: Module[],
    private solarpunkAlignment: SolarpunkAlignment
  ) {
    super(id);
  }

  public addModule(module: Module): void {
    this.modules.push(module);
    this.addDomainEvent(new ModuleAddedEvent(this.id, module.id));
  }

  public publishCourse(): void {
    if (!this.canBePublished()) {
      throw new Error('Course cannot be published without Solarpunk compliance');
    }
    this.status = CourseStatus.PUBLISHED;
    this.addDomainEvent(new CoursePublishedEvent(this.id));
  }

  private canBePublished(): boolean {
    return this.solarpunkAlignment.overallScore >= 70;
  }
}
```

#### 2. **Repository Pattern**
```typescript
// Repository interface in domain
export interface CourseRepository {
  findById(id: CourseId): Promise<Course | null>;
  findByTenant(tenantId: TenantId): Promise<Course[]>;
  save(course: Course): Promise<void>;
  delete(id: CourseId): Promise<void>;
}

// Implementation in infrastructure
export class PostgreSQLCourseRepository implements CourseRepository {
  async findById(id: CourseId): Promise<Course | null> {
    const row = await this.db('courses')
      .where({ id: id.value })
      .first();
    
    return row ? this.toDomain(row) : null;
  }
  
  // ... other methods
}
```

#### 3. **Event-Driven Architecture**
```typescript
// Domain events
export class CourseCompletedEvent implements DomainEvent {
  constructor(
    public readonly userId: UserId,
    public readonly courseId: CourseId,
    public readonly completionDate: Date,
    public readonly solarpunkImpact: SolarpunkImpact
  ) {}
}

// Event handler
export class CourseCompletedEventHandler {
  async handle(event: CourseCompletedEvent): Promise<void> {
    // Update user progress
    await this.progressService.updateProgress(event.userId, event.courseId);
    
    // Calculate Solarpunk impact
    await this.solarpunkService.recordImpact(event.userId, event.solarpunkImpact);
    
    // Trigger certificate generation
    await this.certificationService.generateCertificate(
      event.userId, 
      event.courseId
    );
  }
}
```

### Multi-Tenant Data Access

#### Row-Level Security Implementation
```sql
-- Enable RLS on all tenant-isolated tables
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Create policy for tenant isolation
CREATE POLICY tenant_isolation ON courses
  USING (tenant_id = current_setting('app.current_tenant')::UUID);

-- Function to set tenant context
CREATE OR REPLACE FUNCTION set_current_tenant(tenant_uuid UUID)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_tenant', tenant_uuid::text, true);
END;
$$ LANGUAGE plpgsql;
```

#### Tenant Context in Application
```typescript
export class TenantContext {
  private static current: TenantId | null = null;

  static set(tenantId: TenantId): void {
    this.current = tenantId;
  }

  static get(): TenantId {
    if (!this.current) {
      throw new Error('Tenant context not set');
    }
    return this.current;
  }

  static async withTenant<T>(tenantId: TenantId, fn: () => Promise<T>): Promise<T> {
    const previous = this.current;
    this.set(tenantId);
    try {
      // Set database session variable
      await db.raw('SELECT set_current_tenant(?)', [tenantId.value]);
      return await fn();
    } finally {
      this.current = previous;
    }
  }
}
```

## Development Workflow

### Git Workflow

We use **GitHub Flow** with feature branches:

```bash
# 1. Start with updated main
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/solarpunk-impact-tracking

# 3. Make your changes with atomic commits
git add .
git commit -m "feat: add Solarpunk impact scoring algorithm

- Implement sustainability metrics calculation
- Add community contribution tracking
- Include regenerative activity scoring
- Add comprehensive test coverage

Closes #123"

# 4. Push and create PR
git push origin feature/solarpunk-impact-tracking
# Create PR via GitHub UI

# 5. After PR approval and merge, clean up
git checkout main
git pull origin main
git branch -d feature/solarpunk-impact-tracking
```

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(solarpunk): add carbon footprint calculation API

Implement endpoint to calculate and track carbon footprint reduction
from learning activities and community contributions.

Closes #156

fix(auth): resolve JWT token expiration edge case

Handle case where token expires during long-running requests
by implementing automatic token refresh.

Fixes #234

docs(api): update CONOCER integration documentation

Add examples for certification submission and status tracking.
Include error handling scenarios and retry strategies.
```

### Pull Request Process

#### PR Title Format
```
<type>(<scope>): <description>
```

#### PR Template
```markdown
## Description
Brief description of the changes and their purpose.

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that causes existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Solarpunk impact features tested (if applicable)
- [ ] CONOCER integration tested (if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new console errors/warnings
- [ ] Tests added for new functionality
- [ ] Security considerations addressed

## Screenshots (if applicable)
Add screenshots or GIFs to demonstrate changes.

## Related Issues
Closes #123
Related to #456
```

### Code Review Guidelines

#### As a Author
- [ ] Keep PRs small and focused (< 400 lines changed)
- [ ] Write clear PR description
- [ ] Add tests for new functionality
- [ ] Update documentation
- [ ] Run full test suite locally
- [ ] Self-review your changes

#### As a Reviewer
- [ ] Understand the business context
- [ ] Check for security vulnerabilities
- [ ] Verify test coverage
- [ ] Ensure code follows standards
- [ ] Test functionality locally if needed
- [ ] Be constructive and kind in feedback

## Code Standards & Best Practices

### TypeScript Standards

#### Strict Type Safety
```typescript
// ✅ Good: Explicit types and null safety
interface UserProfileData {
  readonly id: UserId;
  readonly email: Email;
  readonly preferences: UserPreferences | null;
}

function updateUserProfile(
  userId: UserId,
  updates: Partial<UserProfileData>
): Promise<UserProfileData> {
  // Implementation
}

// ❌ Bad: Any types and implicit nulls
function updateUser(userId: any, updates: any): Promise<any> {
  // Implementation
}
```

#### Domain Modeling
```typescript
// ✅ Good: Rich domain models with behavior
export class SolarpunkImpactScore extends ValueObject<number> {
  private constructor(value: number) {
    super(value);
  }

  public static create(value: number): SolarpunkImpactScore {
    if (value < 0 || value > 100) {
      throw new Error('Solarpunk impact score must be between 0 and 100');
    }
    return new SolarpunkImpactScore(value);
  }

  public isExcellent(): boolean {
    return this.value >= 80;
  }

  public addContribution(points: number): SolarpunkImpactScore {
    return SolarpunkImpactScore.create(Math.min(100, this.value + points));
  }
}

// ❌ Bad: Primitive obsession
let impactScore: number = 95; // No validation or behavior
```

#### Error Handling
```typescript
// ✅ Good: Explicit error types
export class CourseNotFoundError extends Error {
  constructor(courseId: CourseId) {
    super(`Course not found: ${courseId.value}`);
    this.name = 'CourseNotFoundError';
  }
}

export class SolarpunkComplianceError extends Error {
  constructor(score: number, minimum: number) {
    super(`Solarpunk compliance score ${score} below minimum ${minimum}`);
    this.name = 'SolarpunkComplianceError';
  }
}

// Usage in application service
export class CourseService {
  async publishCourse(courseId: CourseId): Promise<void> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new CourseNotFoundError(courseId);
    }

    try {
      course.publish();
      await this.courseRepository.save(course);
    } catch (error) {
      if (error instanceof SolarpunkComplianceError) {
        throw new ApplicationError('Course does not meet Solarpunk standards', error);
      }
      throw error;
    }
  }
}
```

### React/Frontend Standards

#### Component Structure
```typescript
// ✅ Good: Well-structured component with proper types
interface SolarpunkImpactMeterProps {
  readonly score: number;
  readonly maxScore: number;
  readonly label: string;
  readonly showDetails?: boolean;
  readonly onScoreClick?: (score: number) => void;
}

export const SolarpunkImpactMeter: React.FC<SolarpunkImpactMeterProps> = ({
  score,
  maxScore,
  label,
  showDetails = false,
  onScoreClick
}) => {
  const percentage = Math.round((score / maxScore) * 100);
  const impactLevel = getImpactLevel(percentage);

  return (
    <div className="solarpunk-impact-meter">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-500">{score}/{maxScore}</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            getImpactLevelColor(impactLevel)
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {showDetails && (
        <div className="mt-2 text-xs text-gray-600">
          Impact Level: {impactLevel}
        </div>
      )}
    </div>
  );
};

// Helper functions
function getImpactLevel(percentage: number): string {
  if (percentage >= 90) return 'Exceptional';
  if (percentage >= 70) return 'High';
  if (percentage >= 50) return 'Moderate';
  if (percentage >= 30) return 'Low';
  return 'Minimal';
}

function getImpactLevelColor(level: string): string {
  switch (level) {
    case 'Exceptional': return 'bg-green-600';
    case 'High': return 'bg-green-500';
    case 'Moderate': return 'bg-yellow-500';
    case 'Low': return 'bg-orange-500';
    default: return 'bg-red-500';
  }
}
```

#### State Management with Zustand
```typescript
// ✅ Good: Typed store with clear actions
interface SolarpunkState {
  readonly impactScore: number;
  readonly achievements: Achievement[];
  readonly loading: boolean;
  readonly error: string | null;
}

interface SolarpunkActions {
  updateImpactScore: (score: number) => void;
  addAchievement: (achievement: Achievement) => void;
  loadUserImpact: (userId: string) => Promise<void>;
  clearError: () => void;
}

export const useSolarpunkStore = create<SolarpunkState & SolarpunkActions>()(
  devtools(
    immer((set, get) => ({
      // State
      impactScore: 0,
      achievements: [],
      loading: false,
      error: null,

      // Actions
      updateImpactScore: (score) => {
        set((state) => {
          state.impactScore = score;
        });
      },

      addAchievement: (achievement) => {
        set((state) => {
          state.achievements.push(achievement);
        });
      },

      loadUserImpact: async (userId) => {
        set((state) => {
          state.loading = true;
          state.error = null;
        });

        try {
          const impact = await solarpunkApi.getUserImpact(userId);
          set((state) => {
            state.impactScore = impact.score;
            state.achievements = impact.achievements;
            state.loading = false;
          });
        } catch (error) {
          set((state) => {
            state.error = error.message;
            state.loading = false;
          });
        }
      },

      clearError: () => {
        set((state) => {
          state.error = null;
        });
      }
    })),
    { name: 'solarpunk-store' }
  )
);
```

### Database Standards

#### Migration Patterns
```sql
-- migrations/20240710_add_solarpunk_metrics.sql
-- Add Solarpunk impact tracking to users table

-- Add new columns
ALTER TABLE users 
ADD COLUMN sustainability_score INTEGER DEFAULT 0 CHECK (sustainability_score >= 0 AND sustainability_score <= 100),
ADD COLUMN community_contributions INTEGER DEFAULT 0 CHECK (community_contributions >= 0),
ADD COLUMN carbon_footprint_reduction DECIMAL(10,2) DEFAULT 0.00 CHECK (carbon_footprint_reduction >= 0),
ADD COLUMN solarpunk_profile JSONB DEFAULT '{}';

-- Create index for performance
CREATE INDEX idx_users_sustainability_score ON users(sustainability_score);
CREATE INDEX idx_users_solarpunk_profile ON users USING GIN (solarpunk_profile);

-- Create solarpunk_actions table
CREATE TABLE solarpunk_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  action_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  impact_score INTEGER NOT NULL CHECK (impact_score >= 0 AND impact_score <= 100),
  carbon_impact DECIMAL(10,2) DEFAULT 0.00,
  people_benefited INTEGER DEFAULT 0,
  verification_status VARCHAR(50) DEFAULT 'self_reported' CHECK (verification_status IN ('self_reported', 'peer_verified', 'expert_verified')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE solarpunk_actions ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY tenant_isolation ON solarpunk_actions
  USING (tenant_id = current_setting('app.current_tenant')::UUID);

-- Create indexes
CREATE INDEX idx_solarpunk_actions_user_id ON solarpunk_actions(user_id);
CREATE INDEX idx_solarpunk_actions_tenant_id ON solarpunk_actions(tenant_id);
CREATE INDEX idx_solarpunk_actions_created_at ON solarpunk_actions(created_at);

-- Add trigger for updated_at
CREATE TRIGGER update_solarpunk_actions_updated_at
  BEFORE UPDATE ON solarpunk_actions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Testing Strategy

### Testing Pyramid

```
                 E2E Tests (10%)
                 ↗️ Full user journeys
                 ↗️ Critical business flows
               
              Integration Tests (20%)
              ↗️ API endpoints
              ↗️ Database operations
              ↗️ External service mocks
              
            Unit Tests (70%)
            ↗️ Domain logic
            ↗️ Pure functions
            ↗️ Component behavior
```

### Unit Testing Examples

#### Domain Logic Testing
```typescript
// tests/domain/solarpunk-impact-score.test.ts
describe('SolarpunkImpactScore', () => {
  describe('create', () => {
    it('should create valid impact score', () => {
      const score = SolarpunkImpactScore.create(75);
      expect(score.value).toBe(75);
    });

    it('should throw error for negative values', () => {
      expect(() => SolarpunkImpactScore.create(-1))
        .toThrow('Solarpunk impact score must be between 0 and 100');
    });

    it('should throw error for values over 100', () => {
      expect(() => SolarpunkImpactScore.create(101))
        .toThrow('Solarpunk impact score must be between 0 and 100');
    });
  });

  describe('isExcellent', () => {
    it('should return true for scores 80 and above', () => {
      const score = SolarpunkImpactScore.create(85);
      expect(score.isExcellent()).toBe(true);
    });

    it('should return false for scores below 80', () => {
      const score = SolarpunkImpactScore.create(75);
      expect(score.isExcellent()).toBe(false);
    });
  });

  describe('addContribution', () => {
    it('should add points to existing score', () => {
      const initial = SolarpunkImpactScore.create(60);
      const updated = initial.addContribution(15);
      expect(updated.value).toBe(75);
    });

    it('should cap at 100 when adding would exceed maximum', () => {
      const initial = SolarpunkImpactScore.create(95);
      const updated = initial.addContribution(10);
      expect(updated.value).toBe(100);
    });
  });
});
```

#### React Component Testing
```typescript
// tests/components/SolarpunkImpactMeter.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { SolarpunkImpactMeter } from '@/components/SolarpunkImpactMeter';

describe('SolarpunkImpactMeter', () => {
  const defaultProps = {
    score: 75,
    maxScore: 100,
    label: 'Sustainability Impact'
  };

  it('should render impact meter with correct score', () => {
    render(<SolarpunkImpactMeter {...defaultProps} />);
    
    expect(screen.getByText('Sustainability Impact')).toBeInTheDocument();
    expect(screen.getByText('75/100')).toBeInTheDocument();
  });

  it('should display correct percentage in progress bar', () => {
    render(<SolarpunkImpactMeter {...defaultProps} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle({ width: '75%' });
  });

  it('should show details when showDetails is true', () => {
    render(<SolarpunkImpactMeter {...defaultProps} showDetails />);
    
    expect(screen.getByText('Impact Level: High')).toBeInTheDocument();
  });

  it('should call onScoreClick when score is clicked', () => {
    const onScoreClick = jest.fn();
    render(
      <SolarpunkImpactMeter 
        {...defaultProps} 
        onScoreClick={onScoreClick} 
      />
    );
    
    fireEvent.click(screen.getByText('75/100'));
    expect(onScoreClick).toHaveBeenCalledWith(75);
  });

  it('should apply correct color class for impact level', () => {
    render(<SolarpunkImpactMeter {...defaultProps} score={85} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveClass('bg-green-500'); // High impact
  });
});
```

### Integration Testing

#### API Endpoint Testing
```typescript
// tests/integration/courses.test.ts
describe('Courses API', () => {
  let app: Application;
  let tenantId: string;
  let authToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    ({ tenantId, authToken } = await setupTestTenant());
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  describe('POST /courses', () => {
    it('should create course with Solarpunk alignment', async () => {
      const courseData = {
        title: 'Sustainable Permaculture Design',
        description: 'Learn regenerative farming practices',
        solarpunkAlignment: {
          ecologicalSustainability: true,
          socialEquity: true,
          economicViability: true
        }
      };

      const response = await request(app)
        .post('/v1/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Tenant-ID', tenantId)
        .send(courseData)
        .expect(201);

      expect(response.body).toMatchObject({
        title: courseData.title,
        description: courseData.description,
        solarpunkAlignment: expect.objectContaining({
          overallScore: expect.any(Number)
        })
      });
    });

    it('should reject course with low Solarpunk alignment', async () => {
      const courseData = {
        title: 'Traditional Farming',
        description: 'Conventional farming methods',
        solarpunkAlignment: {
          ecologicalSustainability: false,
          socialEquity: false,
          economicViability: true
        }
      };

      await request(app)
        .post('/v1/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Tenant-ID', tenantId)
        .send(courseData)
        .expect(400);
    });
  });
});
```

### End-to-End Testing

#### Playwright E2E Tests
```typescript
// tests/e2e/course-completion-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Course Completion Flow', () => {
  test('should complete course and generate certificate', async ({ page }) => {
    // Login as learner
    await page.goto('/login');
    await page.fill('[data-testid=email-input]', 'learner@example.com');
    await page.fill('[data-testid=password-input]', 'password123');
    await page.click('[data-testid=login-button]');

    // Navigate to course
    await page.goto('/courses/sustainable-permaculture-design');
    await expect(page.locator('h1')).toContainText('Sustainable Permaculture Design');

    // Complete all modules
    const modules = page.locator('[data-testid=module-item]');
    const moduleCount = await modules.count();

    for (let i = 0; i < moduleCount; i++) {
      await modules.nth(i).click();
      await page.click('[data-testid=complete-module-button]');
      await expect(page.locator('[data-testid=module-completed]')).toBeVisible();
    }

    // Submit final assessment
    await page.click('[data-testid=final-assessment-button]');
    await page.fill('[data-testid=assessment-answer]', 'Sustainable farming practices...');
    await page.click('[data-testid=submit-assessment-button]');

    // Record Solarpunk action
    await page.click('[data-testid=record-solarpunk-action]');
    await page.selectOption('[data-testid=action-type]', 'sustainability_practice');
    await page.fill('[data-testid=action-title]', 'Implemented permaculture garden');
    await page.fill('[data-testid=action-description]', 'Created food forest in community space');
    await page.click('[data-testid=save-action-button]');

    // Verify course completion
    await expect(page.locator('[data-testid=course-completed]')).toBeVisible();
    await expect(page.locator('[data-testid=certificate-available]')).toBeVisible();

    // Request CONOCER certification
    await page.click('[data-testid=request-conocer-certification]');
    await expect(page.locator('[data-testid=conocer-submission-pending]')).toBeVisible();

    // Verify Solarpunk impact updated
    await page.goto('/profile/impact');
    await expect(page.locator('[data-testid=sustainability-score]')).toContainText(/[8-9][0-9]/); // 80+
  });
});
```

## Deployment Process

### Local Development
```bash
# Start all services
npm run dev:all

# Run specific services
npm run dev:backend
npm run dev:frontend
npm run dev:docs

# Database operations
npm run migrate:latest
npm run migrate:rollback
npm run seed:dev
npm run seed:test

# Testing
npm run test
npm run test:watch
npm run test:coverage
npm run test:e2e
```

### Staging Deployment
```bash
# Deploy to staging (automatic on main branch)
git push origin main

# Manual staging deployment
npm run deploy:staging

# Check staging status
npm run status:staging
```

### Production Deployment
```bash
# Create release tag
git tag -a v1.2.3 -m "Release version 1.2.3"
git push origin v1.2.3

# Manual production deployment (requires approval)
npm run deploy:production

# Check production status
npm run status:production
```

## Monitoring & Debugging

### Application Logs
```bash
# View application logs
kubectl logs -f deployment/madfam-api -n madfam-production

# View logs for specific pod
kubectl logs -f madfam-api-abc123-def456 -n madfam-production

# View aggregated logs
# Access Grafana: https://grafana.madfam.academy
# Username: admin, Password: [from 1Password]
```

### Metrics & Dashboards

#### Key Metrics to Monitor
- **API Response Time**: 95th percentile < 200ms
- **Error Rate**: < 0.1% for critical endpoints
- **Database Performance**: Query time < 100ms
- **Solarpunk Impact Calculations**: Processing time < 500ms
- **CONOCER Integration**: Success rate > 99%

#### Grafana Dashboards
- **Application Overview**: http://grafana.madfam.academy/d/app-overview
- **Solarpunk Impact Metrics**: http://grafana.madfam.academy/d/solarpunk-impact
- **CONOCER Integration**: http://grafana.madfam.academy/d/conocer-integration
- **Infrastructure Health**: http://grafana.madfam.academy/d/infrastructure

### Debugging Common Issues

#### Database Connection Issues
```bash
# Check database connectivity
kubectl exec -it deployment/madfam-api -n madfam-production -- \
  npm run db:health-check

# Check RLS policies
kubectl exec -it postgres-primary-0 -n madfam-production -- \
  psql -U madfam -d madfam_academy -c "SELECT * FROM pg_policies WHERE tablename = 'courses';"
```

#### CONOCER Integration Issues
```bash
# Check CONOCER service health
kubectl logs -f deployment/conocer-integration -n madfam-production

# Test CONOCER API connectivity
kubectl exec -it deployment/madfam-api -n madfam-production -- \
  curl -v https://api.conocer.gob.mx/health
```

#### Performance Issues
```bash
# Check resource usage
kubectl top pods -n madfam-production

# Get detailed pod metrics
kubectl describe pod madfam-api-abc123-def456 -n madfam-production

# Check slow queries
kubectl exec -it postgres-primary-0 -n madfam-production -- \
  psql -U madfam -d madfam_academy -c "SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

## Team Resources

### Documentation
- **Architecture Documentation**: `/docs/technical-architecture-specification.md`
- **API Documentation**: `/docs/api-specification.md`
- **Deployment Guide**: `/docs/deployment-infrastructure-guide.md`
- **Solarpunk Standards**: `/docs/solarpunk-educational-principles.md`
- **CONOCER Integration**: `/docs/conocer-integration-guide.md`

### Tools & Access
- **GitHub Repository**: https://github.com/madfam/madfam-academy
- **Staging Environment**: https://staging.madfam.academy
- **Production Environment**: https://madfam.academy
- **Grafana Monitoring**: https://grafana.madfam.academy
- **Sentry Error Tracking**: https://sentry.io/madfam/academy
- **1Password Vault**: Team credentials and secrets

### Communication Channels
- **Slack Workspace**: madfam-academy.slack.com
- **Engineering Channel**: #engineering
- **Deployment Notifications**: #deployments
- **Incident Response**: #incidents
- **Solarpunk Impact**: #solarpunk-impact
- **CONOCER Integration**: #conocer-integration

### Meeting Schedule
- **Daily Standup**: 9:00 AM PST (Mon-Fri)
- **Sprint Planning**: Mondays 10:00 AM PST
- **Sprint Review**: Fridays 3:00 PM PST
- **Architecture Review**: Bi-weekly Wednesdays 2:00 PM PST
- **Solarpunk Impact Review**: Monthly first Friday 11:00 AM PST

## First Contributions

### Recommended First Issues
Look for issues labeled `good-first-issue` in our GitHub repository:

1. **Add new Solarpunk impact metric** 🌱
   - Implement a new sustainability metric type
   - Add corresponding UI component
   - Write comprehensive tests
   - Update documentation

2. **Improve CONOCER error handling** 🎓
   - Add better error messages for certification failures
   - Implement retry logic for network errors
   - Add user-friendly error UI

3. **Enhance multi-tenant configuration** 🏢
   - Add new tenant customization option
   - Update admin UI
   - Add validation and tests

4. **Create new dashboard widget** 📊
   - Design and implement learning analytics widget
   - Add to instructor dashboard
   - Include responsive design

### Your First Week Checklist

#### Day 1-2: Environment Setup
- [ ] Complete development environment setup
- [ ] Run full test suite successfully
- [ ] Deploy to local environment
- [ ] Join team Slack channels
- [ ] Set up IDE with recommended extensions

#### Day 3-4: Codebase Exploration
- [ ] Read through main architecture documents
- [ ] Explore domain entities and their relationships
- [ ] Understand Solarpunk scoring algorithms
- [ ] Review CONOCER integration flows
- [ ] Run through user journeys in staging

#### Day 5: First Contribution
- [ ] Pick a "good-first-issue" from GitHub
- [ ] Create feature branch and implement solution
- [ ] Write tests for your changes
- [ ] Submit pull request
- [ ] Address code review feedback

### Mentorship & Support

#### Buddy System
You'll be assigned a buddy for your first month who will:
- Help with environment setup
- Answer questions about codebase
- Review your first few pull requests
- Introduce you to team processes

#### Office Hours
- **Technical Questions**: Tuesdays & Thursdays 2-3 PM PST
- **Architecture Discussions**: Wednesdays 11 AM-12 PM PST
- **Solarpunk Education**: Fridays 10-11 AM PST

#### Getting Help
1. **Immediate Issues**: #engineering Slack channel
2. **Technical Deep Dives**: Schedule 1:1 with team lead
3. **Architecture Questions**: Post in #architecture-discussion
4. **Business Context**: Talk to product team in #product

### Learning Resources

#### Domain Knowledge
- **Solarpunk Principles**: [solarpunk.net](https://www.solarpunk.net/)
- **CONOCER Standards**: [conocer.gob.mx](https://www.conocer.gob.mx/)
- **Multi-tenancy Patterns**: [Multi-Tenant SaaS Architecture](https://docs.aws.amazon.com/wellarchitected/latest/saas-lens/multi-tenancy.html)
- **Domain-Driven Design**: [Domain-Driven Design by Eric Evans](https://www.domainlanguage.com/ddd/)

#### Technical Skills
- **TypeScript Best Practices**: [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- **React Testing**: [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- **PostgreSQL**: [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- **Kubernetes**: [Kubernetes Documentation](https://kubernetes.io/docs/)

---

## Welcome Aboard! 🌱

We're excited to have you join our mission to create regenerative, equitable educational experiences. Your contributions will help learners around the world develop skills that benefit both their communities and the planet.

Remember: every line of code you write has the potential to create positive environmental and social impact. Let's build a more sustainable future together!

**Questions?** Reach out anytime in #engineering or schedule a chat with your buddy.

---

**Document Version**: 1.0  
**Last Updated**: 2024-07-10  
**Maintained By**: MADFAM Academy Engineering Team