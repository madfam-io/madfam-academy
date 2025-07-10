import { Coupon, CouponUsage, DiscountValue, UsageLimit, CouponConditions } from './coupon.entity';
import { Money } from './product.entity';

export interface CouponFilters {
  tenantId?: string;
  code?: string;
  discountType?: 'percentage' | 'fixed_amount' | 'free_shipping';
  isActive?: boolean;
  isExpired?: boolean;
  isValid?: boolean;
  appliesTo?: 'all' | 'specific_courses' | 'specific_collections';
  customerEligibility?: 'all' | 'specific_customers' | 'specific_groups';
  hasUsageLimit?: boolean;
  isUsageLimitReached?: boolean;
  startsAfter?: Date;
  startsBefore?: Date;
  endsAfter?: Date;
  endsBefore?: Date;
  createdAfter?: Date;
  createdBefore?: Date;
  minValue?: number;
  maxValue?: number;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'created_at' | 'updated_at' | 'code' | 'starts_at' | 'ends_at' | 'usage_count';
  sortOrder?: 'asc' | 'desc';
}

export interface CouponSearchResult {
  coupons: Coupon[];
  total: number;
  hasMore: boolean;
}

export interface CouponUsageFilters {
  couponId?: string;
  customerId?: string;
  orderId?: string;
  usedAfter?: Date;
  usedBefore?: Date;
  minDiscountAmount?: number;
  maxDiscountAmount?: number;
  limit?: number;
  offset?: number;
  sortBy?: 'used_at' | 'discount_amount';
  sortOrder?: 'asc' | 'desc';
}

export interface CouponUsageSearchResult {
  usages: CouponUsage[];
  total: number;
  hasMore: boolean;
}

export interface CouponRepository {
  // Basic CRUD operations
  findById(id: string): Promise<Coupon | null>;
  findByCode(tenantId: string, code: string): Promise<Coupon | null>;
  save(coupon: Coupon): Promise<void>;
  delete(id: string): Promise<void>;

  // Bulk operations
  findByIds(ids: string[]): Promise<Coupon[]>;
  findByCodes(tenantId: string, codes: string[]): Promise<Coupon[]>;
  saveMany(coupons: Coupon[]): Promise<void>;
  deleteMany(ids: string[]): Promise<void>;

  // Query operations
  findAll(filters: CouponFilters): Promise<CouponSearchResult>;
  findByTenant(tenantId: string, filters?: Omit<CouponFilters, 'tenantId'>): Promise<CouponSearchResult>;
  findActive(tenantId: string, filters?: CouponFilters): Promise<CouponSearchResult>;
  findInactive(tenantId: string, filters?: CouponFilters): Promise<CouponSearchResult>;
  findExpired(tenantId: string, filters?: CouponFilters): Promise<CouponSearchResult>;
  findValid(tenantId: string, filters?: CouponFilters): Promise<CouponSearchResult>;
  findExpiringSoon(tenantId: string, hours: number, filters?: CouponFilters): Promise<CouponSearchResult>;
  
  // Search operations
  search(query: string, filters?: CouponFilters): Promise<CouponSearchResult>;
  searchByCode(code: string, filters?: CouponFilters): Promise<CouponSearchResult>;
  
  // Usage operations
  findUsages(couponId: string, filters?: CouponUsageFilters): Promise<CouponUsageSearchResult>;
  findUsagesByCustomer(customerId: string, filters?: CouponUsageFilters): Promise<CouponUsageSearchResult>;
  findUsagesByOrder(orderId: string): Promise<CouponUsage[]>;
  saveUsage(couponId: string, usage: CouponUsage): Promise<void>;
  deleteUsage(usageId: string): Promise<void>;
  
  // Validation operations
  isCodeUnique(tenantId: string, code: string, excludeId?: string): Promise<boolean>;
  canBeUsedBy(couponId: string, customerId: string | null, orderAmount?: Money, courseIds?: string[], collectionIds?: string[]): Promise<{ canUse: boolean; reason?: string }>;
  validateCoupon(tenantId: string, code: string, customerId: string | null, orderAmount?: Money, courseIds?: string[], collectionIds?: string[]): Promise<{ isValid: boolean; coupon?: Coupon; reason?: string }>;
  
  // Customer eligibility operations
  findAvailableForCustomer(tenantId: string, customerId: string | null, customerGroupIds?: string[], orderAmount?: Money, courseIds?: string[], collectionIds?: string[]): Promise<Coupon[]>;
  findUsedByCustomer(customerId: string, filters?: CouponFilters): Promise<CouponSearchResult>;
  getCustomerUsageCount(couponId: string, customerId: string): Promise<number>;
  
  // Analytics operations
  getCouponCount(tenantId: string, filters?: CouponFilters): Promise<number>;
  getUsageCount(couponId: string): Promise<number>;
  getTotalDiscountAmount(couponId: string): Promise<Money>;
  getUniqueCustomerCount(couponId: string): Promise<number>;
  getAverageDiscountAmount(couponId: string): Promise<Money>;
  
  // Performance analytics
  getCouponPerformance(couponId: string): Promise<{
    totalUsage: number;
    totalDiscountAmount: Money;
    averageDiscount: Money;
    uniqueCustomers: number;
    conversionRate: number;
    revenueGenerated: Money;
    costOfDiscount: Money;
    roi: number;
  }>;
  
  // Comprehensive analytics
  getCouponAnalytics(tenantId: string, dateRange?: { startDate: Date; endDate: Date }): Promise<{
    totalCoupons: number;
    activeCoupons: number;
    expiredCoupons: number;
    totalUsage: number;
    totalDiscountAmount: Money;
    averageDiscountAmount: Money;
    topCoupons: { couponId: string; code: string; usage: number; discountAmount: Money }[];
    couponsByType: Record<string, number>;
    usageByMonth: { month: Date; usage: number; discountAmount: Money }[];
    customerUsageDistribution: { customerId: string; usageCount: number; totalDiscount: Money }[];
  }>;
  
  // Time-based queries
  getCouponsExpiring(tenantId: string, withinHours: number): Promise<Coupon[]>;
  getCouponsStarting(tenantId: string, withinHours: number): Promise<Coupon[]>;
  getCouponsUsedToday(tenantId: string): Promise<CouponUsage[]>;
  getCouponsUsedThisWeek(tenantId: string): Promise<CouponUsage[]>;
  getCouponsUsedThisMonth(tenantId: string): Promise<CouponUsage[]>;
  
  // Batch operations
  activateCoupons(couponIds: string[]): Promise<void>;
  deactivateCoupons(couponIds: string[], reason?: string): Promise<void>;
  extendExpiryDate(couponIds: string[], newExpiryDate: Date): Promise<void>;
  updateUsageLimit(couponIds: string[], usageLimit: UsageLimit): Promise<void>;
  
  // Reporting operations
  getDailyCouponReport(tenantId: string, date: Date): Promise<{
    date: Date;
    couponsUsed: number;
    totalDiscountAmount: Money;
    newCoupons: number;
    expiredCoupons: number;
    topCoupons: { code: string; usage: number; discountAmount: Money }[];
  }>;
  
  getWeeklyCouponReport(tenantId: string, weekStart: Date): Promise<{
    weekStart: Date;
    weekEnd: Date;
    couponsUsed: number;
    totalDiscountAmount: Money;
    newCoupons: number;
    expiredCoupons: number;
    topCoupons: { code: string; usage: number; discountAmount: Money }[];
    dailyBreakdown: { date: Date; usage: number; discountAmount: Money }[];
  }>;
  
  getMonthlyCouponReport(tenantId: string, month: Date): Promise<{
    month: Date;
    couponsUsed: number;
    totalDiscountAmount: Money;
    newCoupons: number;
    expiredCoupons: number;
    topCoupons: { code: string; usage: number; discountAmount: Money }[];
    weeklyBreakdown: { weekStart: Date; usage: number; discountAmount: Money }[];
  }>;
  
  // Export operations
  exportCoupons(filters: CouponFilters, format: 'csv' | 'json'): Promise<string>;
  exportCouponUsages(filters: CouponUsageFilters, format: 'csv' | 'json'): Promise<string>;
  getCouponExportData(filters: CouponFilters): Promise<any[]>;
  getCouponUsageExportData(filters: CouponUsageFilters): Promise<any[]>;
}