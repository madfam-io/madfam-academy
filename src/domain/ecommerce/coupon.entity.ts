import { DomainEvent } from '@/shared/domain/event-bus';
import { Money } from './product.entity';

// Value Objects
export class DiscountValue {
  constructor(
    public readonly type: 'percentage' | 'fixed_amount' | 'free_shipping',
    public readonly value: number,
    public readonly currency: string = 'USD'
  ) {
    if (type === 'percentage' && (value < 0 || value > 100)) {
      throw new Error('Percentage discount must be between 0 and 100');
    }
    if (type === 'fixed_amount' && value < 0) {
      throw new Error('Fixed amount discount cannot be negative');
    }
  }

  calculateDiscount(amount: Money): Money {
    switch (this.type) {
      case 'percentage':
        return amount.multiply(this.value / 100);
      case 'fixed_amount':
        return new Money(Math.min(this.value, amount.amount), amount.currency);
      case 'free_shipping':
        return new Money(0, amount.currency); // Shipping discount handled separately
      default:
        return new Money(0, amount.currency);
    }
  }

  get isPercentage(): boolean {
    return this.type === 'percentage';
  }

  get isFixedAmount(): boolean {
    return this.type === 'fixed_amount';
  }

  get isFreeShipping(): boolean {
    return this.type === 'free_shipping';
  }

  toString(): string {
    if (this.isPercentage) {
      return `${this.value}%`;
    }
    if (this.isFixedAmount) {
      return `${this.value} ${this.currency}`;
    }
    return 'Free Shipping';
  }
}

export class UsageLimit {
  constructor(
    public readonly totalUsageLimit: number | null = null,
    public readonly perCustomerLimit: number | null = null
  ) {}

  get hasLimit(): boolean {
    return this.totalUsageLimit !== null || this.perCustomerLimit !== null;
  }

  get isUnlimited(): boolean {
    return !this.hasLimit;
  }

  canUse(totalUsed: number, customerUsed: number): boolean {
    if (this.totalUsageLimit !== null && totalUsed >= this.totalUsageLimit) {
      return false;
    }
    if (this.perCustomerLimit !== null && customerUsed >= this.perCustomerLimit) {
      return false;
    }
    return true;
  }
}

export class CouponConditions {
  constructor(
    public readonly minimumAmount: Money | null = null,
    public readonly appliesTo: 'all' | 'specific_courses' | 'specific_collections' = 'all',
    public readonly appliesToIds: string[] = [],
    public readonly customerEligibility: 'all' | 'specific_customers' | 'specific_groups' = 'all',
    public readonly customerIds: string[] = [],
    public readonly customerGroupIds: string[] = []
  ) {}

  get requiresMinimumAmount(): boolean {
    return this.minimumAmount !== null;
  }

  get isRestrictedToSpecificItems(): boolean {
    return this.appliesTo !== 'all';
  }

  get isRestrictedToSpecificCustomers(): boolean {
    return this.customerEligibility !== 'all';
  }

  canApplyToAmount(amount: Money): boolean {
    if (!this.requiresMinimumAmount) {
      return true;
    }
    return amount.amount >= this.minimumAmount!.amount;
  }

  canApplyToCustomer(customerId: string | null, customerGroupIds: string[] = []): boolean {
    if (this.customerEligibility === 'all') {
      return true;
    }

    if (this.customerEligibility === 'specific_customers') {
      return customerId ? this.customerIds.includes(customerId) : false;
    }

    if (this.customerEligibility === 'specific_groups') {
      return customerGroupIds.some(groupId => this.customerGroupIds.includes(groupId));
    }

    return false;
  }

  canApplyToItems(courseIds: string[], collectionIds: string[] = []): boolean {
    if (this.appliesTo === 'all') {
      return true;
    }

    if (this.appliesTo === 'specific_courses') {
      return courseIds.some(courseId => this.appliesToIds.includes(courseId));
    }

    if (this.appliesTo === 'specific_collections') {
      return collectionIds.some(collectionId => this.appliesToIds.includes(collectionId));
    }

    return false;
  }
}

// Domain Events
export class CouponCreatedEvent implements DomainEvent {
  public readonly eventName = 'CouponCreated';
  public readonly occurredOn = new Date();
  
  constructor(
    public readonly couponId: string,
    public readonly tenantId: string,
    public readonly code: string,
    public readonly discountType: string,
    public readonly value: number
  ) {}

  get aggregateId(): string {
    return this.couponId;
  }

  get eventData(): any {
    return {
      couponId: this.couponId,
      tenantId: this.tenantId,
      code: this.code,
      discountType: this.discountType,
      value: this.value
    };
  }
}

export class CouponUsedEvent implements DomainEvent {
  public readonly eventName = 'CouponUsed';
  public readonly occurredOn = new Date();
  
  constructor(
    public readonly couponId: string,
    public readonly tenantId: string,
    public readonly code: string,
    public readonly orderId: string,
    public readonly customerId: string | null,
    public readonly discountAmount: Money,
    public readonly usedAt: Date
  ) {}

  get aggregateId(): string {
    return this.couponId;
  }

  get eventData(): any {
    return {
      couponId: this.couponId,
      tenantId: this.tenantId,
      code: this.code,
      orderId: this.orderId,
      customerId: this.customerId,
      discountAmount: this.discountAmount,
      usedAt: this.usedAt
    };
  }
}

export class CouponExpiredEvent implements DomainEvent {
  public readonly eventName = 'CouponExpired';
  public readonly occurredOn = new Date();
  
  constructor(
    public readonly couponId: string,
    public readonly tenantId: string,
    public readonly code: string,
    public readonly expiredAt: Date
  ) {}

  get aggregateId(): string {
    return this.couponId;
  }

  get eventData(): any {
    return {
      couponId: this.couponId,
      tenantId: this.tenantId,
      code: this.code,
      expiredAt: this.expiredAt
    };
  }
}

export class CouponDeactivatedEvent implements DomainEvent {
  public readonly eventName = 'CouponDeactivated';
  public readonly occurredOn = new Date();
  
  constructor(
    public readonly couponId: string,
    public readonly tenantId: string,
    public readonly code: string,
    public readonly reason: string,
    public readonly deactivatedAt: Date
  ) {}

  get aggregateId(): string {
    return this.couponId;
  }

  get eventData(): any {
    return {
      couponId: this.couponId,
      tenantId: this.tenantId,
      code: this.code,
      reason: this.reason,
      deactivatedAt: this.deactivatedAt
    };
  }
}

// Usage Tracking Entity
export class CouponUsage {
  constructor(
    public readonly id: string,
    public readonly couponId: string,
    public readonly orderId: string,
    public readonly customerId: string | null,
    public readonly discountAmount: Money,
    public readonly usedAt: Date = new Date()
  ) {}

  toJSON() {
    return {
      id: this.id,
      couponId: this.couponId,
      orderId: this.orderId,
      customerId: this.customerId,
      discountAmount: this.discountAmount,
      usedAt: this.usedAt
    };
  }
}

// Main Coupon Entity
export class Coupon {
  private _domainEvents: DomainEvent[] = [];
  private _usages: CouponUsage[] = [];

  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly code: string,
    public readonly discountValue: DiscountValue,
    public readonly usageLimit: UsageLimit,
    public readonly conditions: CouponConditions,
    public readonly startsAt: Date | null = null,
    public readonly endsAt: Date | null = null,
    public isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  get domainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  get usages(): CouponUsage[] {
    return [...this._usages];
  }

  get totalUsageCount(): number {
    return this._usages.length;
  }

  get isExpired(): boolean {
    return this.endsAt !== null && this.endsAt < new Date();
  }

  get isNotStarted(): boolean {
    return this.startsAt !== null && this.startsAt > new Date();
  }

  get isValid(): boolean {
    return this.isActive && !this.isExpired && !this.isNotStarted;
  }

  get hasUsageLimit(): boolean {
    return this.usageLimit.hasLimit;
  }

  get isUsageLimitReached(): boolean {
    if (!this.hasUsageLimit) {
      return false;
    }
    return !this.usageLimit.canUse(this.totalUsageCount, 0);
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }

  private addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  static create(
    id: string,
    tenantId: string,
    code: string,
    discountValue: DiscountValue,
    usageLimit: UsageLimit = new UsageLimit(),
    conditions: CouponConditions = new CouponConditions(),
    startsAt: Date | null = null,
    endsAt: Date | null = null
  ): Coupon {
    const coupon = new Coupon(
      id,
      tenantId,
      code.toUpperCase(),
      discountValue,
      usageLimit,
      conditions,
      startsAt,
      endsAt
    );

    coupon.addDomainEvent(
      new CouponCreatedEvent(
        id,
        tenantId,
        code.toUpperCase(),
        discountValue.type,
        discountValue.value
      )
    );

    return coupon;
  }

  canBeUsedBy(
    customerId: string | null,
    customerGroupIds: string[] = [],
    orderAmount: Money | null = null,
    courseIds: string[] = [],
    collectionIds: string[] = []
  ): { canUse: boolean; reason?: string } {
    // Check if coupon is valid
    if (!this.isValid) {
      if (!this.isActive) {
        return { canUse: false, reason: 'Coupon is inactive' };
      }
      if (this.isExpired) {
        return { canUse: false, reason: 'Coupon has expired' };
      }
      if (this.isNotStarted) {
        return { canUse: false, reason: 'Coupon is not yet active' };
      }
    }

    // Check usage limits
    if (this.isUsageLimitReached) {
      return { canUse: false, reason: 'Coupon usage limit reached' };
    }

    // Check customer-specific usage limit
    if (customerId && this.usageLimit.perCustomerLimit !== null) {
      const customerUsageCount = this.getCustomerUsageCount(customerId);
      if (customerUsageCount >= this.usageLimit.perCustomerLimit) {
        return { canUse: false, reason: 'Customer usage limit reached' };
      }
    }

    // Check customer eligibility
    if (!this.conditions.canApplyToCustomer(customerId, customerGroupIds)) {
      return { canUse: false, reason: 'Customer not eligible for this coupon' };
    }

    // Check minimum amount
    if (orderAmount && !this.conditions.canApplyToAmount(orderAmount)) {
      return { canUse: false, reason: `Minimum order amount of ${this.conditions.minimumAmount} required` };
    }

    // Check item eligibility
    if (!this.conditions.canApplyToItems(courseIds, collectionIds)) {
      return { canUse: false, reason: 'Coupon not applicable to selected items' };
    }

    return { canUse: true };
  }

  calculateDiscount(
    orderAmount: Money,
    courseIds: string[] = [],
    collectionIds: string[] = []
  ): Money {
    // Only calculate discount for applicable items
    if (!this.conditions.canApplyToItems(courseIds, collectionIds)) {
      return new Money(0, orderAmount.currency);
    }

    return this.discountValue.calculateDiscount(orderAmount);
  }

  use(orderId: string, customerId: string | null, discountAmount: Money): void {
    const usage = new CouponUsage(
      `usage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      this.id,
      orderId,
      customerId,
      discountAmount
    );

    this._usages.push(usage);
    this.updatedAt = new Date();

    this.addDomainEvent(
      new CouponUsedEvent(
        this.id,
        this.tenantId,
        this.code,
        orderId,
        customerId,
        discountAmount,
        usage.usedAt
      )
    );

    // Check if coupon should be automatically deactivated
    if (this.isUsageLimitReached) {
      this.deactivate('Usage limit reached');
    }
  }

  activate(): void {
    if (!this.isActive) {
      this.isActive = true;
      this.updatedAt = new Date();
    }
  }

  deactivate(reason: string = ''): void {
    if (this.isActive) {
      this.isActive = false;
      this.updatedAt = new Date();

      this.addDomainEvent(
        new CouponDeactivatedEvent(
          this.id,
          this.tenantId,
          this.code,
          reason,
          this.updatedAt
        )
      );
    }
  }

  getCustomerUsageCount(customerId: string): number {
    return this._usages.filter(usage => usage.customerId === customerId).length;
  }

  getUsageHistory(): CouponUsage[] {
    return [...this._usages].sort((a, b) => b.usedAt.getTime() - a.usedAt.getTime());
  }

  getRemainingUsage(): number | null {
    if (this.usageLimit.totalUsageLimit === null) {
      return null;
    }
    return Math.max(0, this.usageLimit.totalUsageLimit - this.totalUsageCount);
  }

  getCustomerRemainingUsage(customerId: string): number | null {
    if (this.usageLimit.perCustomerLimit === null) {
      return null;
    }
    return Math.max(0, this.usageLimit.perCustomerLimit - this.getCustomerUsageCount(customerId));
  }

  // Check if coupon is about to expire (within 24 hours)
  isExpiringsoon(): boolean {
    if (!this.endsAt) {
      return false;
    }
    const hoursUntilExpiry = (this.endsAt.getTime() - Date.now()) / (1000 * 60 * 60);
    return hoursUntilExpiry > 0 && hoursUntilExpiry <= 24;
  }

  // Get performance metrics
  getPerformanceMetrics(): {
    totalUsage: number;
    totalDiscountAmount: number;
    currency: string;
    averageDiscount: number;
    uniqueCustomers: number;
  } {
    const totalDiscountAmount = this._usages.reduce((sum, usage) => sum + usage.discountAmount.amount, 0);
    const uniqueCustomers = new Set(this._usages.map(usage => usage.customerId).filter(id => id !== null)).size;
    const currency = this._usages.length > 0 ? this._usages[0].discountAmount.currency : 'USD';

    return {
      totalUsage: this.totalUsageCount,
      totalDiscountAmount,
      currency,
      averageDiscount: this.totalUsageCount > 0 ? totalDiscountAmount / this.totalUsageCount : 0,
      uniqueCustomers
    };
  }

  toJSON() {
    return {
      id: this.id,
      tenantId: this.tenantId,
      code: this.code,
      discountValue: {
        type: this.discountValue.type,
        value: this.discountValue.value,
        currency: this.discountValue.currency
      },
      usageLimit: {
        totalUsageLimit: this.usageLimit.totalUsageLimit,
        perCustomerLimit: this.usageLimit.perCustomerLimit
      },
      conditions: {
        minimumAmount: this.conditions.minimumAmount,
        appliesTo: this.conditions.appliesTo,
        appliesToIds: this.conditions.appliesToIds,
        customerEligibility: this.conditions.customerEligibility,
        customerIds: this.conditions.customerIds,
        customerGroupIds: this.conditions.customerGroupIds
      },
      startsAt: this.startsAt,
      endsAt: this.endsAt,
      isActive: this.isActive,
      totalUsageCount: this.totalUsageCount,
      isExpired: this.isExpired,
      isValid: this.isValid,
      usages: this._usages.map(usage => usage.toJSON()),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}