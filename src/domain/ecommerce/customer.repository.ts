import { Customer, Address, CustomerStatistics } from './customer.entity';

export interface CustomerFilters {
  tenantId?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  tags?: string[];
  groupIds?: string[];
  segment?: 'new' | 'regular' | 'vip' | 'inactive';
  hasMarketingConsent?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  lastOrderAfter?: Date;
  lastOrderBefore?: Date;
  totalSpentMin?: number;
  totalSpentMax?: number;
  totalOrdersMin?: number;
  totalOrdersMax?: number;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'created_at' | 'updated_at' | 'first_name' | 'last_name' | 'email' | 'total_spent' | 'total_orders';
  sortOrder?: 'asc' | 'desc';
}

export interface CustomerSearchResult {
  customers: Customer[];
  total: number;
  hasMore: boolean;
}

export interface CustomerRepository {
  // Basic CRUD operations
  findById(id: string): Promise<Customer | null>;
  findByUserId(userId: string): Promise<Customer | null>;
  findByEmail(tenantId: string, email: string): Promise<Customer | null>;
  findByCustomerNumber(customerNumber: string): Promise<Customer | null>;
  save(customer: Customer): Promise<void>;
  delete(id: string): Promise<void>;

  // Bulk operations
  findByIds(ids: string[]): Promise<Customer[]>;
  saveMany(customers: Customer[]): Promise<void>;
  deleteMany(ids: string[]): Promise<void>;

  // Query operations
  findAll(filters: CustomerFilters): Promise<CustomerSearchResult>;
  findByTenant(tenantId: string, filters?: Omit<CustomerFilters, 'tenantId'>): Promise<CustomerSearchResult>;
  findBySegment(tenantId: string, segment: 'new' | 'regular' | 'vip' | 'inactive', filters?: CustomerFilters): Promise<CustomerSearchResult>;
  findByGroup(groupId: string, filters?: CustomerFilters): Promise<CustomerSearchResult>;
  
  // Search operations
  search(query: string, filters?: CustomerFilters): Promise<CustomerSearchResult>;
  searchByName(name: string, filters?: CustomerFilters): Promise<CustomerSearchResult>;
  searchByEmail(email: string, filters?: CustomerFilters): Promise<CustomerSearchResult>;
  searchByPhone(phone: string, filters?: CustomerFilters): Promise<CustomerSearchResult>;
  
  // Statistics operations
  getCustomerStatistics(customerId: string): Promise<CustomerStatistics>;
  updateCustomerStatistics(customerId: string, statistics: CustomerStatistics): Promise<void>;
  recalculateCustomerStatistics(customerId: string): Promise<CustomerStatistics>;
  
  // Segmentation operations
  getNewCustomers(tenantId: string, limit?: number): Promise<Customer[]>;
  getVIPCustomers(tenantId: string, limit?: number): Promise<Customer[]>;
  getInactiveCustomers(tenantId: string, daysSinceLastOrder?: number, limit?: number): Promise<Customer[]>;
  getTopCustomers(tenantId: string, by: 'total_spent' | 'total_orders', limit?: number): Promise<Customer[]>;
  
  // Address operations
  findCustomerAddresses(customerId: string): Promise<Address[]>;
  findCustomerBillingAddresses(customerId: string): Promise<Address[]>;
  findCustomerShippingAddresses(customerId: string): Promise<Address[]>;
  getDefaultBillingAddress(customerId: string): Promise<Address | null>;
  getDefaultShippingAddress(customerId: string): Promise<Address | null>;
  
  // Group operations
  findCustomerGroups(customerId: string): Promise<{ id: string; name: string; joinedAt: Date }[]>;
  getCustomersByGroup(groupId: string): Promise<Customer[]>;
  assignCustomerToGroup(customerId: string, groupId: string): Promise<void>;
  removeCustomerFromGroup(customerId: string, groupId: string): Promise<void>;
  
  // Marketing operations
  findCustomersWithMarketingConsent(tenantId: string, filters?: CustomerFilters): Promise<Customer[]>;
  findCustomersWithoutMarketingConsent(tenantId: string, filters?: CustomerFilters): Promise<Customer[]>;
  updateMarketingConsent(customerId: string, hasConsent: boolean): Promise<void>;
  
  // Analytics operations
  getCustomerCount(tenantId: string, filters?: CustomerFilters): Promise<number>;
  getNewCustomerCount(tenantId: string, days?: number): Promise<number>;
  getActiveCustomerCount(tenantId: string, days?: number): Promise<number>;
  getCustomerRetentionRate(tenantId: string, days?: number): Promise<number>;
  
  // Comprehensive analytics
  getCustomerAnalytics(tenantId: string): Promise<{
    totalCustomers: number;
    newCustomers: number;
    vipCustomers: number;
    inactiveCustomers: number;
    averageOrderValue: number;
    averageLifetimeValue: number;
    customerRetentionRate: number;
    marketingConsentRate: number;
    topCustomersBySpent: Customer[];
    topCustomersByOrders: Customer[];
    customersBySegment: Record<string, number>;
    customersByGroup: Record<string, number>;
    currency: string;
  }>;
  
  // Validation
  isEmailUnique(tenantId: string, email: string, excludeId?: string): Promise<boolean>;
  isCustomerNumberUnique(customerNumber: string, excludeId?: string): Promise<boolean>;
  
  // Batch operations
  updateCustomerTags(customerIds: string[], tags: string[]): Promise<void>;
  assignCustomersToGroup(customerIds: string[], groupId: string): Promise<void>;
  removeCustomersFromGroup(customerIds: string[], groupId: string): Promise<void>;
  updateMarketingConsentBatch(customerIds: string[], hasConsent: boolean): Promise<void>;
  
  // Export operations
  exportCustomers(filters: CustomerFilters, format: 'csv' | 'json'): Promise<string>;
  getCustomerExportData(filters: CustomerFilters): Promise<any[]>;
}