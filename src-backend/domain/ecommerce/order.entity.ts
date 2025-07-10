import { DomainEvent } from '@/shared/domain/event-bus';
import { Money } from './product.entity';

// Value Objects
export class OrderAddress {
  constructor(
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly company: string = '',
    public readonly address1: string,
    public readonly address2: string = '',
    public readonly city: string,
    public readonly province: string,
    public readonly postalCode: string,
    public readonly countryCode: string,
    public readonly phone: string = ''
  ) {}

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  get fullAddress(): string {
    const parts = [
      this.address1,
      this.address2,
      this.city,
      this.province,
      this.postalCode,
      this.countryCode
    ].filter(part => part.trim() !== '');

    return parts.join(', ');
  }

  toJSON() {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      company: this.company,
      address1: this.address1,
      address2: this.address2,
      city: this.city,
      province: this.province,
      postalCode: this.postalCode,
      countryCode: this.countryCode,
      phone: this.phone
    };
  }
}

export class OrderTotals {
  constructor(
    public readonly subtotal: Money,
    public readonly totalTax: Money,
    public readonly totalDiscounts: Money,
    public readonly totalShipping: Money,
    public readonly totalPrice: Money
  ) {}

  get currency(): string {
    return this.totalPrice.currency;
  }

  static calculate(
    subtotal: Money,
    taxAmount: Money = new Money(0, subtotal.currency),
    discountAmount: Money = new Money(0, subtotal.currency),
    shippingAmount: Money = new Money(0, subtotal.currency)
  ): OrderTotals {
    const totalPrice = subtotal
      .add(taxAmount)
      .subtract(discountAmount)
      .add(shippingAmount);

    return new OrderTotals(
      subtotal,
      taxAmount,
      discountAmount,
      shippingAmount,
      totalPrice
    );
  }
}

// Domain Events
export class OrderCreatedEvent implements DomainEvent {
  public readonly eventName = 'OrderCreated';
  public readonly occurredOn = new Date();
  
  constructor(
    public readonly orderId: string,
    public readonly tenantId: string,
    public readonly customerId: string | null,
    public readonly email: string,
    public readonly totalPrice: Money
  ) {}

  get aggregateId(): string {
    return this.orderId;
  }

  get eventData(): any {
    return {
      orderId: this.orderId,
      tenantId: this.tenantId,
      customerId: this.customerId,
      email: this.email,
      totalPrice: this.totalPrice
    };
  }
}

export class OrderPaidEvent implements DomainEvent {
  public readonly eventName = 'OrderPaid';
  public readonly occurredOn = new Date();
  
  constructor(
    public readonly orderId: string,
    public readonly tenantId: string,
    public readonly customerId: string | null,
    public readonly totalPrice: Money,
    public readonly paidAt: Date
  ) {}

  get aggregateId(): string {
    return this.orderId;
  }

  get eventData(): any {
    return {
      orderId: this.orderId,
      tenantId: this.tenantId,
      customerId: this.customerId,
      totalPrice: this.totalPrice,
      paidAt: this.paidAt
    };
  }
}

export class OrderCancelledEvent implements DomainEvent {
  public readonly eventName = 'OrderCancelled';
  public readonly occurredOn = new Date();
  
  constructor(
    public readonly orderId: string,
    public readonly tenantId: string,
    public readonly customerId: string | null,
    public readonly reason: string,
    public readonly cancelledAt: Date
  ) {}

  get aggregateId(): string {
    return this.orderId;
  }

  get eventData(): any {
    return {
      orderId: this.orderId,
      tenantId: this.tenantId,
      customerId: this.customerId,
      reason: this.reason,
      cancelledAt: this.cancelledAt
    };
  }
}

export class OrderFulfilledEvent implements DomainEvent {
  public readonly eventName = 'OrderFulfilled';
  public readonly occurredOn = new Date();
  
  constructor(
    public readonly orderId: string,
    public readonly tenantId: string,
    public readonly customerId: string | null,
    public readonly fulfillmentId: string,
    public readonly fulfilledAt: Date
  ) {}

  get aggregateId(): string {
    return this.orderId;
  }

  get eventData(): any {
    return {
      orderId: this.orderId,
      tenantId: this.tenantId,
      customerId: this.customerId,
      fulfillmentId: this.fulfillmentId,
      fulfilledAt: this.fulfilledAt
    };
  }
}

export class OrderRefundedEvent implements DomainEvent {
  public readonly eventName = 'OrderRefunded';
  public readonly occurredOn = new Date();
  
  constructor(
    public readonly orderId: string,
    public readonly tenantId: string,
    public readonly customerId: string | null,
    public readonly refundAmount: Money,
    public readonly refundedAt: Date
  ) {}

  get aggregateId(): string {
    return this.orderId;
  }

  get eventData(): any {
    return {
      orderId: this.orderId,
      tenantId: this.tenantId,
      customerId: this.customerId,
      refundAmount: this.refundAmount,
      refundedAt: this.refundedAt
    };
  }
}

// Entities
export class OrderLineItem {
  constructor(
    public readonly id: string,
    public readonly courseId: string | null,
    public readonly variantId: string | null,
    public readonly title: string,
    public readonly variantTitle: string = '',
    public readonly sku: string = '',
    public readonly quantity: number,
    public readonly price: Money,
    public readonly compareAtPrice: Money | null = null,
    public readonly totalDiscount: Money = new Money(0, price.currency),
    public fulfillmentStatus: 'unfulfilled' | 'partial' | 'fulfilled' = 'unfulfilled',
    public readonly fulfillmentService: string = 'manual',
    public readonly properties: Record<string, any> = {},
    public readonly createdAt: Date = new Date()
  ) {
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }
  }

  get totalPrice(): Money {
    return this.price.multiply(this.quantity).subtract(this.totalDiscount);
  }

  get unitPriceAfterDiscount(): Money {
    const totalAfterDiscount = this.totalPrice;
    return new Money(totalAfterDiscount.amount / this.quantity, totalAfterDiscount.currency);
  }

  get isFulfilled(): boolean {
    return this.fulfillmentStatus === 'fulfilled';
  }

  fulfill(): void {
    this.fulfillmentStatus = 'fulfilled';
  }

  partialFulfill(): void {
    this.fulfillmentStatus = 'partial';
  }

  toJSON() {
    return {
      id: this.id,
      courseId: this.courseId,
      variantId: this.variantId,
      title: this.title,
      variantTitle: this.variantTitle,
      sku: this.sku,
      quantity: this.quantity,
      price: this.price,
      compareAtPrice: this.compareAtPrice,
      totalDiscount: this.totalDiscount,
      totalPrice: this.totalPrice,
      fulfillmentStatus: this.fulfillmentStatus,
      fulfillmentService: this.fulfillmentService,
      properties: this.properties,
      createdAt: this.createdAt
    };
  }
}

export class OrderFulfillment {
  constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly lineItemIds: string[],
    public readonly trackingNumber: string = '',
    public readonly trackingCompany: string = '',
    public readonly trackingUrl: string = '',
    public readonly notifyCustomer: boolean = true,
    public shipmentStatus: 'pending' | 'shipped' | 'delivered' | 'returned' = 'pending',
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  ship(): void {
    this.shipmentStatus = 'shipped';
    this.updatedAt = new Date();
  }

  deliver(): void {
    this.shipmentStatus = 'delivered';
    this.updatedAt = new Date();
  }

  returnShipment(): void {
    this.shipmentStatus = 'returned';
    this.updatedAt = new Date();
  }

  get isShipped(): boolean {
    return this.shipmentStatus === 'shipped' || this.shipmentStatus === 'delivered';
  }

  get isDelivered(): boolean {
    return this.shipmentStatus === 'delivered';
  }

  toJSON() {
    return {
      id: this.id,
      orderId: this.orderId,
      lineItemIds: this.lineItemIds,
      trackingNumber: this.trackingNumber,
      trackingCompany: this.trackingCompany,
      trackingUrl: this.trackingUrl,
      notifyCustomer: this.notifyCustomer,
      shipmentStatus: this.shipmentStatus,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export class Order {
  private _domainEvents: DomainEvent[] = [];
  private _lineItems: OrderLineItem[] = [];
  private _fulfillments: OrderFulfillment[] = [];

  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly orderNumber: string,
    public readonly customerId: string | null,
    public readonly email: string,
    public readonly phone: string = '',
    public readonly currency: string = 'USD',
    public readonly billingAddress: OrderAddress | null = null,
    public readonly shippingAddress: OrderAddress | null = null,
    public readonly notes: string = '',
    public readonly tags: string[] = [],
    public readonly sourceName: string = '',
    public readonly referringSite: string = '',
    public readonly landingSite: string = '',
    public paymentStatus: 'pending' | 'authorized' | 'paid' | 'partially_paid' | 'refunded' | 'partially_refunded' | 'voided' = 'pending',
    public fulfillmentStatus: 'unfulfilled' | 'partial' | 'fulfilled' | 'cancelled' = 'unfulfilled',
    public orderStatus: 'open' | 'closed' | 'cancelled' = 'open',
    public financialStatus: 'pending' | 'authorized' | 'paid' | 'partially_paid' | 'refunded' | 'voided' = 'pending',
    public cancelledAt: Date | null = null,
    public cancelReason: string = '',
    public processedAt: Date | null = null,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  get domainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  get lineItems(): OrderLineItem[] {
    return [...this._lineItems];
  }

  get fulfillments(): OrderFulfillment[] {
    return [...this._fulfillments];
  }

  get totals(): OrderTotals {
    const subtotal = this.calculateSubtotal();
    const totalTax = this.calculateTotalTax();
    const totalDiscounts = this.calculateTotalDiscounts();
    const totalShipping = this.calculateTotalShipping();

    return OrderTotals.calculate(subtotal, totalTax, totalDiscounts, totalShipping);
  }

  get isOpen(): boolean {
    return this.orderStatus === 'open';
  }

  get isClosed(): boolean {
    return this.orderStatus === 'closed';
  }

  get isCancelled(): boolean {
    return this.orderStatus === 'cancelled';
  }

  get isPaid(): boolean {
    return this.paymentStatus === 'paid';
  }

  get isPartiallyPaid(): boolean {
    return this.paymentStatus === 'partially_paid';
  }

  get isFulfilled(): boolean {
    return this.fulfillmentStatus === 'fulfilled';
  }

  get isPartiallyFulfilled(): boolean {
    return this.fulfillmentStatus === 'partial';
  }

  get canBeCancelled(): boolean {
    return this.isOpen && this.fulfillmentStatus === 'unfulfilled';
  }

  get canBeRefunded(): boolean {
    return this.isPaid && !this.isCancelled;
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
    orderNumber: string,
    customerId: string | null,
    email: string,
    currency: string = 'USD'
  ): Order {
    const order = new Order(
      id,
      tenantId,
      orderNumber,
      customerId,
      email,
      '',
      currency
    );

    order.addDomainEvent(
      new OrderCreatedEvent(id, tenantId, customerId, email, new Money(0, currency))
    );

    return order;
  }

  addLineItem(lineItem: OrderLineItem): void {
    // Check if line item with same course and variant already exists
    const existingIndex = this._lineItems.findIndex(
      item => item.courseId === lineItem.courseId && item.variantId === lineItem.variantId
    );

    if (existingIndex !== -1) {
      // Update quantity of existing line item
      const existingItem = this._lineItems[existingIndex];
      const newQuantity = existingItem.quantity + lineItem.quantity;
      
      this._lineItems[existingIndex] = new OrderLineItem(
        existingItem.id,
        existingItem.courseId,
        existingItem.variantId,
        existingItem.title,
        existingItem.variantTitle,
        existingItem.sku,
        newQuantity,
        existingItem.price,
        existingItem.compareAtPrice,
        existingItem.totalDiscount,
        existingItem.fulfillmentStatus,
        existingItem.fulfillmentService,
        existingItem.properties,
        existingItem.createdAt
      );
    } else {
      this._lineItems.push(lineItem);
    }

    this.updatedAt = new Date();
  }

  removeLineItem(lineItemId: string): void {
    const index = this._lineItems.findIndex(item => item.id === lineItemId);
    if (index !== -1) {
      this._lineItems.splice(index, 1);
      this.updatedAt = new Date();
    }
  }

  updateLineItemQuantity(lineItemId: string, quantity: number): void {
    const index = this._lineItems.findIndex(item => item.id === lineItemId);
    if (index !== -1) {
      const item = this._lineItems[index];
      this._lineItems[index] = new OrderLineItem(
        item.id,
        item.courseId,
        item.variantId,
        item.title,
        item.variantTitle,
        item.sku,
        quantity,
        item.price,
        item.compareAtPrice,
        item.totalDiscount,
        item.fulfillmentStatus,
        item.fulfillmentService,
        item.properties,
        item.createdAt
      );
      this.updatedAt = new Date();
    }
  }

  markAsPaid(): void {
    if (this.paymentStatus !== 'paid') {
      this.paymentStatus = 'paid';
      this.financialStatus = 'paid';
      this.processedAt = new Date();
      this.updatedAt = new Date();

      this.addDomainEvent(
        new OrderPaidEvent(
          this.id,
          this.tenantId,
          this.customerId,
          this.totals.totalPrice,
          this.processedAt
        )
      );
    }
  }

  markAsPartiallyPaid(): void {
    this.paymentStatus = 'partially_paid';
    this.financialStatus = 'partially_paid';
    this.updatedAt = new Date();
  }

  authorize(): void {
    this.paymentStatus = 'authorized';
    this.financialStatus = 'authorized';
    this.updatedAt = new Date();
  }

  void(): void {
    this.paymentStatus = 'voided';
    this.financialStatus = 'voided';
    this.updatedAt = new Date();
  }

  refund(amount?: Money): void {
    const totalPrice = this.totals.totalPrice;
    const isPartialRefund = amount && amount.amount < totalPrice.amount;

    this.paymentStatus = isPartialRefund ? 'partially_paid' : 'refunded';
    this.financialStatus = isPartialRefund ? 'partially_paid' : 'refunded';
    this.updatedAt = new Date();

    this.addDomainEvent(
      new OrderRefundedEvent(
        this.id,
        this.tenantId,
        this.customerId,
        amount || totalPrice,
        new Date()
      )
    );
  }

  cancel(reason: string): void {
    if (!this.canBeCancelled) {
      throw new Error('Order cannot be cancelled');
    }

    this.orderStatus = 'cancelled';
    this.fulfillmentStatus = 'cancelled';
    this.cancelledAt = new Date();
    this.cancelReason = reason;
    this.updatedAt = new Date();

    this.addDomainEvent(
      new OrderCancelledEvent(
        this.id,
        this.tenantId,
        this.customerId,
        reason,
        this.cancelledAt
      )
    );
  }

  close(): void {
    if (this.orderStatus !== 'closed') {
      this.orderStatus = 'closed';
      this.updatedAt = new Date();
    }
  }

  reopen(): void {
    if (this.orderStatus === 'closed') {
      this.orderStatus = 'open';
      this.updatedAt = new Date();
    }
  }

  addFulfillment(fulfillment: OrderFulfillment): void {
    this._fulfillments.push(fulfillment);
    this.updateFulfillmentStatus();
    this.updatedAt = new Date();

    this.addDomainEvent(
      new OrderFulfilledEvent(
        this.id,
        this.tenantId,
        this.customerId,
        fulfillment.id,
        fulfillment.createdAt
      )
    );
  }

  private updateFulfillmentStatus(): void {
    if (this._fulfillments.length === 0) {
      this.fulfillmentStatus = 'unfulfilled';
      return;
    }

    const allLineItemIds = this._lineItems.map(item => item.id);
    const fulfilledLineItemIds = this._fulfillments.flatMap(f => f.lineItemIds);
    
    const fulfilledCount = allLineItemIds.filter(id => fulfilledLineItemIds.includes(id)).length;
    
    if (fulfilledCount === 0) {
      this.fulfillmentStatus = 'unfulfilled';
    } else if (fulfilledCount === allLineItemIds.length) {
      this.fulfillmentStatus = 'fulfilled';
    } else {
      this.fulfillmentStatus = 'partial';
    }
  }

  private calculateSubtotal(): Money {
    return this._lineItems.reduce(
      (total, item) => total.add(item.price.multiply(item.quantity)),
      new Money(0, this.currency)
    );
  }

  private calculateTotalTax(): Money {
    // Tax calculation logic would go here
    return new Money(0, this.currency);
  }

  private calculateTotalDiscounts(): Money {
    return this._lineItems.reduce(
      (total, item) => total.add(item.totalDiscount),
      new Money(0, this.currency)
    );
  }

  private calculateTotalShipping(): Money {
    // Shipping calculation logic would go here
    return new Money(0, this.currency);
  }

  updateShippingAddress(address: OrderAddress): void {
    (this as any).shippingAddress = address;
    this.updatedAt = new Date();
  }

  updateBillingAddress(address: OrderAddress): void {
    (this as any).billingAddress = address;
    this.updatedAt = new Date();
  }

  addTags(tags: string[]): void {
    const uniqueTags = [...new Set([...this.tags, ...tags])];
    if (uniqueTags.length !== this.tags.length) {
      (this as any).tags = uniqueTags;
      this.updatedAt = new Date();
    }
  }

  removeTags(tags: string[]): void {
    const filteredTags = this.tags.filter(tag => !tags.includes(tag));
    if (filteredTags.length !== this.tags.length) {
      (this as any).tags = filteredTags;
      this.updatedAt = new Date();
    }
  }

  updateNotes(notes: string): void {
    if (notes !== this.notes) {
      (this as any).notes = notes;
      this.updatedAt = new Date();
    }
  }

  toJSON() {
    return {
      id: this.id,
      tenantId: this.tenantId,
      orderNumber: this.orderNumber,
      customerId: this.customerId,
      email: this.email,
      phone: this.phone,
      currency: this.currency,
      billingAddress: this.billingAddress?.toJSON(),
      shippingAddress: this.shippingAddress?.toJSON(),
      notes: this.notes,
      tags: this.tags,
      sourceName: this.sourceName,
      referringSite: this.referringSite,
      landingSite: this.landingSite,
      paymentStatus: this.paymentStatus,
      fulfillmentStatus: this.fulfillmentStatus,
      orderStatus: this.orderStatus,
      financialStatus: this.financialStatus,
      totals: this.totals,
      lineItems: this._lineItems.map(item => item.toJSON()),
      fulfillments: this._fulfillments.map(f => f.toJSON()),
      cancelledAt: this.cancelledAt,
      cancelReason: this.cancelReason,
      processedAt: this.processedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}