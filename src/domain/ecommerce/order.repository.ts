import { Order, OrderLineItem, OrderFulfillment, OrderTotals } from './order.entity';
import { Money } from './product.entity';

export interface OrderFilters {
  tenantId?: string;
  customerId?: string;
  customerIds?: string[];
  email?: string;
  orderNumber?: string;
  paymentStatus?: 'pending' | 'authorized' | 'paid' | 'partially_paid' | 'refunded' | 'partially_refunded' | 'voided';
  fulfillmentStatus?: 'unfulfilled' | 'partial' | 'fulfilled' | 'cancelled';
  orderStatus?: 'open' | 'closed' | 'cancelled';
  financialStatus?: 'pending' | 'authorized' | 'paid' | 'partially_paid' | 'refunded' | 'voided';
  tags?: string[];
  sourceNames?: string[];
  createdAfter?: Date;
  createdBefore?: Date;
  processedAfter?: Date;
  processedBefore?: Date;
  totalMin?: number;
  totalMax?: number;
  currency?: string;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'created_at' | 'updated_at' | 'processed_at' | 'order_number' | 'total_price';
  sortOrder?: 'asc' | 'desc';
}

export interface OrderSearchResult {
  orders: Order[];
  total: number;
  hasMore: boolean;
}

export interface OrderRepository {
  // Basic CRUD operations
  findById(id: string): Promise<Order | null>;
  findByOrderNumber(orderNumber: string): Promise<Order | null>;
  save(order: Order): Promise<void>;
  delete(id: string): Promise<void>;

  // Bulk operations
  findByIds(ids: string[]): Promise<Order[]>;
  saveMany(orders: Order[]): Promise<void>;
  deleteMany(ids: string[]): Promise<void>;

  // Query operations
  findAll(filters: OrderFilters): Promise<OrderSearchResult>;
  findByTenant(tenantId: string, filters?: Omit<OrderFilters, 'tenantId'>): Promise<OrderSearchResult>;
  findByCustomer(customerId: string, filters?: Omit<OrderFilters, 'customerId'>): Promise<OrderSearchResult>;
  findByStatus(status: 'open' | 'closed' | 'cancelled', filters?: OrderFilters): Promise<OrderSearchResult>;
  findByPaymentStatus(paymentStatus: string, filters?: OrderFilters): Promise<OrderSearchResult>;
  findByFulfillmentStatus(fulfillmentStatus: string, filters?: OrderFilters): Promise<OrderSearchResult>;
  
  // Search operations
  search(query: string, filters?: OrderFilters): Promise<OrderSearchResult>;
  searchByCustomerEmail(email: string, filters?: OrderFilters): Promise<OrderSearchResult>;
  searchByOrderNumber(orderNumber: string, filters?: OrderFilters): Promise<OrderSearchResult>;
  
  // Line item operations
  findLineItems(orderId: string): Promise<OrderLineItem[]>;
  findLineItemById(lineItemId: string): Promise<OrderLineItem | null>;
  findLineItemsByCourse(courseId: string): Promise<OrderLineItem[]>;
  saveLineItem(orderId: string, lineItem: OrderLineItem): Promise<void>;
  deleteLineItem(lineItemId: string): Promise<void>;
  
  // Fulfillment operations
  findFulfillments(orderId: string): Promise<OrderFulfillment[]>;
  findFulfillmentById(fulfillmentId: string): Promise<OrderFulfillment | null>;
  saveFulfillment(orderId: string, fulfillment: OrderFulfillment): Promise<void>;
  deleteFulfillment(fulfillmentId: string): Promise<void>;
  
  // Analytics operations
  getOrderCount(tenantId: string, filters?: OrderFilters): Promise<number>;
  getOrdersByDateRange(tenantId: string, startDate: Date, endDate: Date): Promise<Order[]>;
  getOrdersByCustomer(customerId: string, limit?: number): Promise<Order[]>;
  getRecentOrders(tenantId: string, limit?: number): Promise<Order[]>;
  getPendingOrders(tenantId: string, limit?: number): Promise<Order[]>;
  getUnfulfilledOrders(tenantId: string, limit?: number): Promise<Order[]>;
  
  // Revenue operations
  getTotalRevenue(tenantId: string, filters?: OrderFilters): Promise<Money>;
  getRevenueByDateRange(tenantId: string, startDate: Date, endDate: Date): Promise<Money>;
  getRevenueByCustomer(customerId: string): Promise<Money>;
  getRevenueByProduct(courseId: string): Promise<Money>;
  getAverageOrderValue(tenantId: string, filters?: OrderFilters): Promise<Money>;
  
  // Statistics operations
  getOrderStatistics(tenantId: string, dateRange?: { startDate: Date; endDate: Date }): Promise<{
    totalOrders: number;
    openOrders: number;
    closedOrders: number;
    cancelledOrders: number;
    paidOrders: number;
    pendingOrders: number;
    fulfilledOrders: number;
    unfulfilledOrders: number;
    totalRevenue: Money;
    averageOrderValue: Money;
    refundedAmount: Money;
    topCustomers: { customerId: string; email: string; totalSpent: Money; orderCount: number }[];
    topProducts: { courseId: string; title: string; unitsSold: number; revenue: Money }[];
    paymentStatusBreakdown: Record<string, number>;
    fulfillmentStatusBreakdown: Record<string, number>;
    dailyRevenue: { date: Date; revenue: Money; orderCount: number }[];
  }>;
  
  // Time-based analytics
  getOrdersToday(tenantId: string): Promise<Order[]>;
  getOrdersThisWeek(tenantId: string): Promise<Order[]>;
  getOrdersThisMonth(tenantId: string): Promise<Order[]>;
  getOrdersThisYear(tenantId: string): Promise<Order[]>;
  
  // Revenue analytics
  getRevenueToday(tenantId: string): Promise<Money>;
  getRevenueThisWeek(tenantId: string): Promise<Money>;
  getRevenueThisMonth(tenantId: string): Promise<Money>;
  getRevenueThisYear(tenantId: string): Promise<Money>;
  
  // Customer analytics
  getCustomerOrderHistory(customerId: string): Promise<Order[]>;
  getCustomerLifetimeValue(customerId: string): Promise<Money>;
  getCustomerAverageOrderValue(customerId: string): Promise<Money>;
  getCustomerOrderFrequency(customerId: string): Promise<number>;
  
  // Product analytics
  getProductOrderHistory(courseId: string): Promise<OrderLineItem[]>;
  getProductRevenue(courseId: string): Promise<Money>;
  getProductUnitsSold(courseId: string): Promise<number>;
  getBestSellingProducts(tenantId: string, limit?: number): Promise<{ courseId: string; title: string; unitsSold: number; revenue: Money }[]>;
  
  // Validation
  isOrderNumberUnique(orderNumber: string, excludeId?: string): Promise<boolean>;
  canBeCancelled(orderId: string): Promise<boolean>;
  canBeRefunded(orderId: string): Promise<boolean>;
  canBeFulfilled(orderId: string): Promise<boolean>;
  
  // Batch operations
  updateOrderStatus(orderIds: string[], status: 'open' | 'closed' | 'cancelled'): Promise<void>;
  updatePaymentStatus(orderIds: string[], paymentStatus: string): Promise<void>;
  updateFulfillmentStatus(orderIds: string[], fulfillmentStatus: string): Promise<void>;
  addTagsToOrders(orderIds: string[], tags: string[]): Promise<void>;
  removeTagsFromOrders(orderIds: string[], tags: string[]): Promise<void>;
  
  // Export operations
  exportOrders(filters: OrderFilters, format: 'csv' | 'json'): Promise<string>;
  getOrderExportData(filters: OrderFilters): Promise<any[]>;
  
  // Reporting operations
  getDailyOrderReport(tenantId: string, date: Date): Promise<{
    date: Date;
    orderCount: number;
    revenue: Money;
    newCustomers: number;
    returningCustomers: number;
    averageOrderValue: Money;
    topProducts: { courseId: string; title: string; unitsSold: number }[];
  }>;
  
  getWeeklyOrderReport(tenantId: string, weekStart: Date): Promise<{
    weekStart: Date;
    weekEnd: Date;
    orderCount: number;
    revenue: Money;
    newCustomers: number;
    returningCustomers: number;
    averageOrderValue: Money;
    topProducts: { courseId: string; title: string; unitsSold: number }[];
    dailyBreakdown: { date: Date; orderCount: number; revenue: Money }[];
  }>;
  
  getMonthlyOrderReport(tenantId: string, month: Date): Promise<{
    month: Date;
    orderCount: number;
    revenue: Money;
    newCustomers: number;
    returningCustomers: number;
    averageOrderValue: Money;
    topProducts: { courseId: string; title: string; unitsSold: number }[];
    weeklyBreakdown: { weekStart: Date; orderCount: number; revenue: Money }[];
  }>;
}