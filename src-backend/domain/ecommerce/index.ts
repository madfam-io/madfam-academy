// Domain Entities
export * from './product.entity';
export * from './customer.entity';
export * from './order.entity';
export * from './coupon.entity';

// Repository Interfaces
export * from './product.repository';
export * from './customer.repository';
export * from './order.repository';
export * from './coupon.repository';

// Re-export commonly used types
export type {
  Money,
  ProductDimensions,
  ProductSEO,
  ProductVariant
} from './product.entity';

export type {
  Address,
  CustomerStatistics
} from './customer.entity';

export type {
  OrderAddress,
  OrderTotals,
  OrderLineItem,
  OrderFulfillment
} from './order.entity';

export type {
  DiscountValue,
  UsageLimit,
  CouponConditions,
  CouponUsage
} from './coupon.entity';

// Re-export filter types
export type {
  ProductFilters,
  ProductSearchResult
} from './product.repository';

export type {
  CustomerFilters,
  CustomerSearchResult
} from './customer.repository';

export type {
  OrderFilters,
  OrderSearchResult
} from './order.repository';

export type {
  CouponFilters,
  CouponSearchResult,
  CouponUsageFilters,
  CouponUsageSearchResult
} from './coupon.repository';