import { DomainEvent } from '@/shared/domain/event-bus';

// Value Objects
export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string = 'USD'
  ) {
    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add different currencies');
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot subtract different currencies');
    }
    return new Money(this.amount - other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  toString(): string {
    return `${this.amount} ${this.currency}`;
  }
}

export class ProductDimensions {
  constructor(
    public readonly length: number,
    public readonly width: number,
    public readonly height: number,
    public readonly unit: string = 'cm'
  ) {}
}

export class ProductSEO {
  constructor(
    public readonly title: string,
    public readonly description: string,
    public readonly keywords: string[] = []
  ) {}
}

// Domain Events
export class ProductCreatedEvent implements DomainEvent {
  public readonly eventName = 'ProductCreated';
  public readonly occurredOn = new Date();
  
  constructor(
    public readonly productId: string,
    public readonly tenantId: string,
    public readonly name: string
  ) {}

  get aggregateId(): string {
    return this.productId;
  }

  get eventData(): any {
    return {
      productId: this.productId,
      tenantId: this.tenantId,
      name: this.name
    };
  }
}

export class ProductPublishedEvent implements DomainEvent {
  public readonly eventName = 'ProductPublished';
  public readonly occurredOn = new Date();
  
  constructor(
    public readonly productId: string,
    public readonly tenantId: string,
    public readonly publishedAt: Date
  ) {}

  get aggregateId(): string {
    return this.productId;
  }

  get eventData(): any {
    return {
      productId: this.productId,
      tenantId: this.tenantId,
      publishedAt: this.publishedAt
    };
  }
}

export class ProductPriceChangedEvent implements DomainEvent {
  public readonly eventName = 'ProductPriceChanged';
  public readonly occurredOn = new Date();
  
  constructor(
    public readonly productId: string,
    public readonly tenantId: string,
    public readonly oldPrice: Money,
    public readonly newPrice: Money
  ) {}

  get aggregateId(): string {
    return this.productId;
  }

  get eventData(): any {
    return {
      productId: this.productId,
      tenantId: this.tenantId,
      oldPrice: this.oldPrice,
      newPrice: this.newPrice
    };
  }
}

export class ProductInventoryChangedEvent implements DomainEvent {
  public readonly eventName = 'ProductInventoryChanged';
  public readonly occurredOn = new Date();
  
  constructor(
    public readonly productId: string,
    public readonly variantId: string,
    public readonly oldQuantity: number,
    public readonly newQuantity: number
  ) {}

  get aggregateId(): string {
    return this.productId;
  }

  get eventData(): any {
    return {
      productId: this.productId,
      variantId: this.variantId,
      oldQuantity: this.oldQuantity,
      newQuantity: this.newQuantity
    };
  }
}

// Entities
export class ProductVariant {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public name: string,
    public sku: string,
    public price: Money,
    public compareAtPrice: Money | null = null,
    public costPrice: Money | null = null,
    public inventoryQuantity: number = 0,
    public inventoryPolicy: 'continue' | 'deny' = 'deny',
    public weight: number = 0,
    public dimensions: ProductDimensions | null = null,
    public variantOptions: Record<string, any> = {},
    public isDefault: boolean = false,
    public isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  updatePrice(newPrice: Money): void {
    if (!newPrice.equals(this.price)) {
      this.price = newPrice;
      this.updatedAt = new Date();
    }
  }

  updateInventory(quantity: number): void {
    if (quantity < 0) {
      throw new Error('Inventory quantity cannot be negative');
    }
    this.inventoryQuantity = quantity;
    this.updatedAt = new Date();
  }

  adjustInventory(adjustment: number): void {
    const newQuantity = this.inventoryQuantity + adjustment;
    this.updateInventory(newQuantity);
  }

  isInStock(): boolean {
    return this.inventoryQuantity > 0 || this.inventoryPolicy === 'continue';
  }

  canPurchase(quantity: number): boolean {
    if (this.inventoryPolicy === 'continue') {
      return true;
    }
    return this.inventoryQuantity >= quantity;
  }
}

export class Product {
  private _domainEvents: DomainEvent[] = [];
  private _variants: ProductVariant[] = [];

  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly courseId: string | null,
    public title: string,
    public slug: string,
    public description: string,
    public shortDescription: string = '',
    public thumbnailUrl: string = '',
    public images: string[] = [],
    public categoryIds: string[] = [],
    public tags: string[] = [],
    public status: 'draft' | 'published' | 'archived' = 'draft',
    public seo: ProductSEO | null = null,
    public metadata: Record<string, any> = {},
    public publishedAt: Date | null = null,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  get domainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  get variants(): ProductVariant[] {
    return [...this._variants];
  }

  get defaultVariant(): ProductVariant | null {
    return this._variants.find(v => v.isDefault) || this._variants[0] || null;
  }

  get price(): Money | null {
    const defaultVariant = this.defaultVariant;
    return defaultVariant ? defaultVariant.price : null;
  }

  get isPublished(): boolean {
    return this.status === 'published';
  }

  get isAvailable(): boolean {
    return this.isPublished && this._variants.some(v => v.isInStock());
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
    courseId: string | null,
    title: string,
    slug: string,
    description: string
  ): Product {
    const product = new Product(
      id,
      tenantId,
      courseId,
      title,
      slug,
      description
    );

    product.addDomainEvent(
      new ProductCreatedEvent(id, tenantId, title)
    );

    return product;
  }

  updateDetails(
    title?: string,
    description?: string,
    shortDescription?: string,
    thumbnailUrl?: string
  ): void {
    if (title !== undefined) this.title = title;
    if (description !== undefined) this.description = description;
    if (shortDescription !== undefined) this.shortDescription = shortDescription;
    if (thumbnailUrl !== undefined) this.thumbnailUrl = thumbnailUrl;
    
    this.updatedAt = new Date();
  }

  updateCategories(categoryIds: string[]): void {
    this.categoryIds = [...categoryIds];
    this.updatedAt = new Date();
  }

  updateTags(tags: string[]): void {
    this.tags = [...tags];
    this.updatedAt = new Date();
  }

  updateSEO(seo: ProductSEO): void {
    this.seo = seo;
    this.updatedAt = new Date();
  }

  publish(): void {
    if (this.status === 'published') {
      return;
    }

    if (this._variants.length === 0) {
      throw new Error('Cannot publish product without variants');
    }

    this.status = 'published';
    this.publishedAt = new Date();
    this.updatedAt = new Date();

    this.addDomainEvent(
      new ProductPublishedEvent(this.id, this.tenantId, this.publishedAt)
    );
  }

  unpublish(): void {
    if (this.status !== 'published') {
      return;
    }

    this.status = 'draft';
    this.updatedAt = new Date();
  }

  archive(): void {
    this.status = 'archived';
    this.updatedAt = new Date();
  }

  addVariant(variant: ProductVariant): void {
    // Ensure only one default variant
    if (variant.isDefault) {
      this._variants.forEach(v => v.isDefault = false);
    }

    // If this is the first variant, make it default
    if (this._variants.length === 0) {
      variant.isDefault = true;
    }

    this._variants.push(variant);
    this.updatedAt = new Date();
  }

  removeVariant(variantId: string): void {
    const index = this._variants.findIndex(v => v.id === variantId);
    if (index === -1) {
      throw new Error('Variant not found');
    }

    const removedVariant = this._variants[index];
    this._variants.splice(index, 1);

    // If we removed the default variant, make the first remaining variant default
    if (removedVariant.isDefault && this._variants.length > 0) {
      this._variants[0].isDefault = true;
    }

    this.updatedAt = new Date();
  }

  updateVariant(variantId: string, updates: Partial<ProductVariant>): void {
    const variant = this._variants.find(v => v.id === variantId);
    if (!variant) {
      throw new Error('Variant not found');
    }

    const oldPrice = variant.price;

    Object.assign(variant, updates);
    variant.updatedAt = new Date();

    // Handle default variant logic
    if (updates.isDefault) {
      this._variants.forEach(v => {
        if (v.id !== variantId) {
          v.isDefault = false;
        }
      });
    }

    // Emit price change event if price changed
    if (updates.price && !oldPrice.equals(updates.price)) {
      this.addDomainEvent(
        new ProductPriceChangedEvent(this.id, this.tenantId, oldPrice, updates.price)
      );
    }

    this.updatedAt = new Date();
  }

  getVariant(variantId: string): ProductVariant | null {
    return this._variants.find(v => v.id === variantId) || null;
  }

  getVariantBySku(sku: string): ProductVariant | null {
    return this._variants.find(v => v.sku === sku) || null;
  }

  canPurchase(variantId: string | null, quantity: number): boolean {
    const variant = variantId ? this.getVariant(variantId) : this.defaultVariant;
    
    if (!variant) {
      return false;
    }

    return this.isAvailable && variant.canPurchase(quantity);
  }

  calculatePrice(variantId: string | null, quantity: number): Money | null {
    const variant = variantId ? this.getVariant(variantId) : this.defaultVariant;
    
    if (!variant) {
      return null;
    }

    return variant.price.multiply(quantity);
  }

  toJSON() {
    return {
      id: this.id,
      tenantId: this.tenantId,
      courseId: this.courseId,
      title: this.title,
      slug: this.slug,
      description: this.description,
      shortDescription: this.shortDescription,
      thumbnailUrl: this.thumbnailUrl,
      images: this.images,
      categoryIds: this.categoryIds,
      tags: this.tags,
      status: this.status,
      seo: this.seo,
      metadata: this.metadata,
      variants: this._variants,
      publishedAt: this.publishedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}