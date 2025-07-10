# MADFAM Academy E-commerce System

## Overview

The MADFAM Academy e-commerce system is a comprehensive marketplace platform designed for educational content sales. It features a complete product catalog, order management, customer relationship management, and coupon system.

## Architecture

### Domain-Driven Design (DDD)

The e-commerce system follows DDD principles with:
- **Domain Entities**: Product, Customer, Order, Coupon
- **Value Objects**: Money, Address, DiscountValue, UsageLimit
- **Repository Interfaces**: Abstracting data access patterns
- **Domain Events**: Event-driven architecture for business logic

### Core Components

#### 1. Product Management (`/src/domain/ecommerce/product.entity.ts`)
- **Product Entity**: Course marketplace representation
- **ProductVariant**: Multiple pricing tiers and options
- **Money Value Object**: Multi-currency support
- **Domain Events**: ProductCreated, ProductPublished, ProductPriceChanged

**Key Features:**
- Multi-variant products (different access levels, durations)
- Inventory management
- SEO optimization
- Category and tag management
- Price management with currency support

#### 2. Customer Management (`/src/domain/ecommerce/customer.entity.ts`)
- **Customer Entity**: Extended user profiles for e-commerce
- **Address Value Object**: Billing and shipping addresses
- **CustomerStatistics**: Lifetime value, order history
- **Domain Events**: CustomerCreated, CustomerProfileUpdated, CustomerAddressAdded

**Key Features:**
- Customer segmentation (new, regular, VIP, inactive)
- Address management
- Marketing consent tracking
- Customer groups and tags
- Purchase history analytics

#### 3. Order Management (`/src/domain/ecommerce/order.entity.ts`)
- **Order Entity**: Complete order lifecycle
- **OrderLineItem**: Individual course purchases
- **OrderFulfillment**: Delivery tracking
- **OrderTotals**: Pricing calculations
- **Domain Events**: OrderCreated, OrderPaid, OrderCancelled, OrderFulfilled

**Key Features:**
- Multi-item orders
- Payment status tracking
- Fulfillment management
- Refund processing
- Order analytics

#### 4. Coupon System (`/src/domain/ecommerce/coupon.entity.ts`)
- **Coupon Entity**: Discount code management
- **DiscountValue**: Percentage, fixed amount, free shipping
- **UsageLimit**: Total and per-customer limits
- **CouponConditions**: Eligibility rules
- **Domain Events**: CouponCreated, CouponUsed, CouponExpired

**Key Features:**
- Multiple discount types
- Usage restrictions
- Customer eligibility rules
- Automatic expiration
- Performance analytics

## Database Schema

### E-commerce Tables (`/database/migrations/002_ecommerce_schema.sql`)

```sql
-- Core product management
product_categories     -- Hierarchical categories
product_variants      -- Course pricing variants
product_collections   -- Featured collections and bundles
collection_products   -- Many-to-many relationships

-- Customer management
customer_profiles     -- Extended customer information
customer_addresses    -- Billing and shipping addresses
customer_groups       -- Customer segmentation
customer_group_memberships -- Group assignments

-- Order management
orders               -- Order headers
order_line_items     -- Individual course purchases
order_fulfillments   -- Delivery tracking
fulfillment_line_items -- Fulfillment details

-- Discount system
discount_codes       -- Coupon codes
discount_code_usage  -- Usage tracking
price_rules         -- Automatic discounts

-- Payment processing
payment_transactions -- Payment records
payment_methods     -- Stored payment methods

-- Shopping cart
shopping_carts      -- Cart persistence
cart_line_items     -- Cart contents

-- Analytics
sales_analytics     -- Daily sales summaries
course_sales_analytics -- Product performance
```

### Key Features:
- **Multi-tenancy**: All tables include tenant_id for isolation
- **Row Level Security**: PostgreSQL RLS for data protection
- **Audit Trails**: Created/updated timestamps
- **Performance**: Optimized indexes for common queries
- **Triggers**: Automated calculations and validations

## Repository Patterns

### Product Repository (`/src/domain/ecommerce/product.repository.ts`)
```typescript
interface ProductRepository {
  // CRUD operations
  findById(id: string): Promise<Product | null>;
  findBySlug(tenantId: string, slug: string): Promise<Product | null>;
  save(product: Product): Promise<void>;
  
  // Query operations
  findAll(filters: ProductFilters): Promise<ProductSearchResult>;
  search(query: string, filters?: ProductFilters): Promise<ProductSearchResult>;
  
  // Analytics
  getPopularProducts(tenantId: string, limit?: number): Promise<Product[]>;
  getProductStatistics(tenantId: string): Promise<ProductStatistics>;
}
```

### Customer Repository (`/src/domain/ecommerce/customer.repository.ts`)
```typescript
interface CustomerRepository {
  // Customer management
  findById(id: string): Promise<Customer | null>;
  findByEmail(tenantId: string, email: string): Promise<Customer | null>;
  
  // Segmentation
  findBySegment(tenantId: string, segment: CustomerSegment): Promise<Customer[]>;
  getVIPCustomers(tenantId: string, limit?: number): Promise<Customer[]>;
  
  // Analytics
  getCustomerAnalytics(tenantId: string): Promise<CustomerAnalytics>;
}
```

### Order Repository (`/src/domain/ecommerce/order.repository.ts`)
```typescript
interface OrderRepository {
  // Order management
  findById(id: string): Promise<Order | null>;
  findByCustomer(customerId: string): Promise<Order[]>;
  
  // Revenue analytics
  getTotalRevenue(tenantId: string): Promise<Money>;
  getOrderStatistics(tenantId: string): Promise<OrderStatistics>;
  
  // Reporting
  getDailyOrderReport(tenantId: string, date: Date): Promise<OrderReport>;
}
```

### Coupon Repository (`/src/domain/ecommerce/coupon.repository.ts`)
```typescript
interface CouponRepository {
  // Coupon management
  findByCode(tenantId: string, code: string): Promise<Coupon | null>;
  validateCoupon(tenantId: string, code: string): Promise<ValidationResult>;
  
  // Analytics
  getCouponPerformance(couponId: string): Promise<CouponPerformance>;
  getCouponAnalytics(tenantId: string): Promise<CouponAnalytics>;
}
```

## Domain Events

### Event-Driven Architecture
The system uses domain events for:
- **Decoupling**: Business logic separation
- **Audit Trails**: Event sourcing capabilities
- **Integration**: External system notifications
- **Analytics**: Real-time data processing

### Event Types:
```typescript
// Product Events
ProductCreatedEvent
ProductPublishedEvent
ProductPriceChangedEvent
ProductInventoryChangedEvent

// Customer Events
CustomerCreatedEvent
CustomerProfileUpdatedEvent
CustomerAddressAddedEvent
CustomerMarketingConsentChangedEvent

// Order Events
OrderCreatedEvent
OrderPaidEvent
OrderCancelledEvent
OrderFulfilledEvent
OrderRefundedEvent

// Coupon Events
CouponCreatedEvent
CouponUsedEvent
CouponExpiredEvent
CouponDeactivatedEvent
```

## Usage Examples

### Creating a Product
```typescript
const product = Product.create(
  uuid(),
  tenantId,
  courseId,
  "Advanced React Course",
  "advanced-react-course",
  "Master React with advanced patterns and techniques"
);

// Add pricing variant
const variant = new ProductVariant(
  uuid(),
  product.id,
  "Lifetime Access",
  "REACT-LIFETIME-001",
  new Money(299, "USD"),
  new Money(399, "USD"), // Compare at price
  null, // Cost price
  1000, // Inventory
  "continue" // Inventory policy
);

product.addVariant(variant);
product.publish();

await productRepository.save(product);
```

### Processing an Order
```typescript
const order = Order.create(
  uuid(),
  tenantId,
  orderNumber,
  customerId,
  customerEmail,
  "USD"
);

// Add line items
const lineItem = new OrderLineItem(
  uuid(),
  courseId,
  variantId,
  "Advanced React Course",
  "Lifetime Access",
  "REACT-LIFETIME-001",
  1,
  new Money(299, "USD")
);

order.addLineItem(lineItem);
order.markAsPaid();

await orderRepository.save(order);
```

### Applying Coupons
```typescript
const coupon = Coupon.create(
  uuid(),
  tenantId,
  "WELCOME20",
  new DiscountValue("percentage", 20),
  new UsageLimit(100, 1), // 100 total uses, 1 per customer
  new CouponConditions(
    new Money(50, "USD") // Minimum order amount
  )
);

// Validate and apply
const validation = await couponRepository.validateCoupon(
  tenantId,
  "WELCOME20",
  customerId,
  orderAmount,
  courseIds
);

if (validation.isValid) {
  const discount = coupon.calculateDiscount(orderAmount);
  coupon.use(orderId, customerId, discount);
}
```

## Analytics and Reporting

### Sales Analytics
- Daily/weekly/monthly revenue reports
- Product performance tracking
- Customer lifetime value calculations
- Conversion rate analysis

### Customer Analytics
- Customer segmentation
- Purchase behavior analysis
- Marketing consent tracking
- Retention rate calculations

### Coupon Analytics
- Usage tracking
- ROI calculations
- Performance optimization
- Fraud prevention

## Security Features

### Data Protection
- **Row Level Security**: PostgreSQL RLS for tenant isolation
- **Input Validation**: Domain-level validation rules
- **Audit Logging**: Complete event tracking
- **GDPR Compliance**: Data privacy controls

### Payment Security
- **PCI DSS Compliance**: Payment data tokenization
- **Fraud Detection**: Suspicious activity monitoring
- **Secure Webhooks**: Payment processor integration
- **Rate Limiting**: API protection

## Performance Optimizations

### Database Optimizations
- **Indexing Strategy**: Optimized for common queries
- **Query Optimization**: Efficient joins and filters
- **Connection Pooling**: Scalable database connections
- **Read Replicas**: Separate read/write workloads

### Caching Strategy
- **Product Catalogs**: Redis caching for product data
- **Customer Sessions**: Session management
- **Search Results**: Cached search queries
- **Analytics Data**: Pre-computed aggregations

## Integration Points

### Educational Platform
- **Course Enrollment**: Automatic enrollment on purchase
- **Progress Tracking**: Learning analytics integration
- **Certification**: Certificate issuance on completion
- **Content Access**: LMS integration

### External Services
- **Payment Processors**: Stripe, PayPal, Square
- **Email Marketing**: Customer communication
- **Analytics**: Business intelligence tools
- **Tax Calculation**: Automated tax computation

## Development Roadmap

### Phase 1: Core E-commerce ✅
- [x] Product management
- [x] Customer management
- [x] Order processing
- [x] Coupon system

### Phase 2: Advanced Features
- [ ] Subscription management
- [ ] Affiliate programs
- [ ] Advanced analytics
- [ ] Mobile app support

### Phase 3: Enterprise Features
- [ ] Multi-currency support
- [ ] Tax automation
- [ ] Advanced reporting
- [ ] API marketplace

## Getting Started

1. **Database Setup**: Run migrations to create e-commerce tables
2. **Repository Implementation**: Implement repository interfaces with your data layer
3. **Service Layer**: Create application services using domain entities
4. **API Integration**: Build REST/GraphQL APIs for frontend consumption
5. **Event Handling**: Set up event handlers for domain events

## Best Practices

### Domain Modeling
- Use value objects for primitive obsession
- Implement domain events for business logic
- Maintain aggregate consistency
- Follow single responsibility principle

### Data Management
- Implement proper indexing
- Use database constraints
- Handle concurrent updates
- Implement audit trails

### Error Handling
- Use domain exceptions
- Implement circuit breakers
- Log business events
- Handle payment failures gracefully

---

*This e-commerce system provides a robust foundation for educational marketplace platforms with comprehensive product, customer, order, and coupon management capabilities.*