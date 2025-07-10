export interface Tenant {
  id: string;
  name: string;
  domain: string;
  settings: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantService {
  findById(id: string): Promise<Tenant | null>;
  findByDomain(domain: string): Promise<Tenant | null>;
  create(tenant: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tenant>;
  update(id: string, updates: Partial<Tenant>): Promise<Tenant>;
  delete(id: string): Promise<void>;
}

export class DefaultTenantService implements TenantService {
  private tenants: Map<string, Tenant> = new Map();

  async findById(id: string): Promise<Tenant | null> {
    return this.tenants.get(id) || null;
  }

  async findByDomain(domain: string): Promise<Tenant | null> {
    for (const tenant of this.tenants.values()) {
      if (tenant.domain === domain) {
        return tenant;
      }
    }
    return null;
  }

  async create(tenantData: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tenant> {
    const tenant: Tenant = {
      ...tenantData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.tenants.set(tenant.id, tenant);
    return tenant;
  }

  async update(id: string, updates: Partial<Tenant>): Promise<Tenant> {
    const tenant = await this.findById(id);
    if (!tenant) {
      throw new Error(`Tenant not found: ${id}`);
    }

    const updated = {
      ...tenant,
      ...updates,
      updatedAt: new Date()
    };

    this.tenants.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.tenants.delete(id);
  }

  async findBySubdomain(subdomain: string): Promise<Tenant | null> {
    return this.findByDomain(subdomain);
  }

  async hasFeature(tenantId: string, feature: string): Promise<boolean> {
    const tenant = await this.findById(tenantId);
    return tenant?.settings?.features?.[feature] || false;
  }

  async getLimit(tenantId: string, limitType: string): Promise<number> {
    const tenant = await this.findById(tenantId);
    return tenant?.settings?.limits?.[limitType] || 0;
  }
}