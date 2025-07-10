import { DomainEvent } from '@/shared/domain/event-bus';

// Value Objects
export class Address {
  constructor(
    public readonly type: 'billing' | 'shipping',
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly company: string = '',
    public readonly address1: string,
    public readonly address2: string = '',
    public readonly city: string,
    public readonly province: string,
    public readonly postalCode: string,
    public readonly countryCode: string,
    public readonly phone: string = '',
    public readonly isDefault: boolean = false
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

  equals(other: Address): boolean {
    return (
      this.type === other.type &&
      this.firstName === other.firstName &&
      this.lastName === other.lastName &&
      this.company === other.company &&
      this.address1 === other.address1 &&
      this.address2 === other.address2 &&
      this.city === other.city &&
      this.province === other.province &&
      this.postalCode === other.postalCode &&
      this.countryCode === other.countryCode &&
      this.phone === other.phone
    );
  }
}

export class CustomerStatistics {
  constructor(
    public readonly totalSpent: number = 0,
    public readonly totalOrders: number = 0,
    public readonly averageOrderValue: number = 0,
    public readonly lastOrderDate: Date | null = null
  ) {}

  get lifetimeValue(): number {
    return this.totalSpent;
  }

  get isVIP(): boolean {
    return this.totalSpent > 1000 || this.totalOrders > 10;
  }

  get customerSegment(): 'new' | 'regular' | 'vip' | 'inactive' {
    if (this.totalOrders === 0) return 'new';
    if (this.isVIP) return 'vip';
    
    const daysSinceLastOrder = this.lastOrderDate 
      ? Math.floor((Date.now() - this.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24))
      : Infinity;
    
    if (daysSinceLastOrder > 90) return 'inactive';
    return 'regular';
  }
}

// Domain Events
export class CustomerCreatedEvent implements DomainEvent {
  public readonly eventName = 'CustomerCreated';
  public readonly occurredOn = new Date();
  
  constructor(
    public readonly customerId: string,
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly email: string
  ) {}

  get aggregateId(): string {
    return this.customerId;
  }

  get eventData(): any {
    return {
      customerId: this.customerId,
      tenantId: this.tenantId,
      userId: this.userId,
      email: this.email
    };
  }
}

export class CustomerProfileUpdatedEvent implements DomainEvent {
  public readonly eventName = 'CustomerProfileUpdated';
  public readonly occurredOn = new Date();
  
  constructor(
    public readonly customerId: string,
    public readonly tenantId: string,
    public readonly changes: Record<string, any>
  ) {}

  get aggregateId(): string {
    return this.customerId;
  }

  get eventData(): any {
    return {
      customerId: this.customerId,
      tenantId: this.tenantId,
      changes: this.changes
    };
  }
}

export class CustomerAddressAddedEvent implements DomainEvent {
  public readonly eventName = 'CustomerAddressAdded';
  public readonly occurredOn = new Date();
  
  constructor(
    public readonly customerId: string,
    public readonly tenantId: string,
    public readonly address: Address
  ) {}

  get aggregateId(): string {
    return this.customerId;
  }

  get eventData(): any {
    return {
      customerId: this.customerId,
      tenantId: this.tenantId,
      address: this.address
    };
  }
}

export class CustomerMarketingConsentChangedEvent implements DomainEvent {
  public readonly eventName = 'CustomerMarketingConsentChanged';
  public readonly occurredOn = new Date();
  
  constructor(
    public readonly customerId: string,
    public readonly tenantId: string,
    public readonly hasConsent: boolean,
    public readonly consentDate: Date
  ) {}

  get aggregateId(): string {
    return this.customerId;
  }

  get eventData(): any {
    return {
      customerId: this.customerId,
      tenantId: this.tenantId,
      hasConsent: this.hasConsent,
      consentDate: this.consentDate
    };
  }
}

export class CustomerGroupAssignedEvent implements DomainEvent {
  public readonly eventName = 'CustomerGroupAssigned';
  public readonly occurredOn = new Date();
  
  constructor(
    public readonly customerId: string,
    public readonly tenantId: string,
    public readonly groupId: string,
    public readonly groupName: string
  ) {}

  get aggregateId(): string {
    return this.customerId;
  }

  get eventData(): any {
    return {
      customerId: this.customerId,
      tenantId: this.tenantId,
      groupId: this.groupId,
      groupName: this.groupName
    };
  }
}

// Entities
export class Customer {
  private _domainEvents: DomainEvent[] = [];
  private _addresses: Address[] = [];
  private _groupIds: string[] = [];

  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly customerNumber: string,
    public email: string,
    public firstName: string = '',
    public lastName: string = '',
    public company: string = '',
    public phone: string = '',
    public dateOfBirth: Date | null = null,
    public gender: string = '',
    public preferredLanguage: string = 'en',
    public marketingConsent: boolean = false,
    public marketingConsentDate: Date | null = null,
    public tags: string[] = [],
    public notes: string = '',
    public statistics: CustomerStatistics = new CustomerStatistics(),
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  get domainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  get addresses(): Address[] {
    return [...this._addresses];
  }

  get groupIds(): string[] {
    return [...this._groupIds];
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  get displayName(): string {
    return this.fullName || this.email;
  }

  get defaultBillingAddress(): Address | null {
    return this._addresses.find(addr => addr.type === 'billing' && addr.isDefault) || null;
  }

  get defaultShippingAddress(): Address | null {
    return this._addresses.find(addr => addr.type === 'shipping' && addr.isDefault) || null;
  }

  get isVIP(): boolean {
    return this.statistics.isVIP;
  }

  get segment(): string {
    return this.statistics.customerSegment;
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
    userId: string,
    customerNumber: string,
    email: string,
    firstName?: string,
    lastName?: string
  ): Customer {
    const customer = new Customer(
      id,
      tenantId,
      userId,
      customerNumber,
      email,
      firstName,
      lastName
    );

    customer.addDomainEvent(
      new CustomerCreatedEvent(id, tenantId, userId, email)
    );

    return customer;
  }

  updateProfile(updates: {
    firstName?: string;
    lastName?: string;
    company?: string;
    phone?: string;
    dateOfBirth?: Date | null;
    gender?: string;
    preferredLanguage?: string;
  }): void {
    const changes: Record<string, any> = {};

    if (updates.firstName !== undefined && updates.firstName !== this.firstName) {
      changes.firstName = { old: this.firstName, new: updates.firstName };
      this.firstName = updates.firstName;
    }

    if (updates.lastName !== undefined && updates.lastName !== this.lastName) {
      changes.lastName = { old: this.lastName, new: updates.lastName };
      this.lastName = updates.lastName;
    }

    if (updates.company !== undefined && updates.company !== this.company) {
      changes.company = { old: this.company, new: updates.company };
      this.company = updates.company;
    }

    if (updates.phone !== undefined && updates.phone !== this.phone) {
      changes.phone = { old: this.phone, new: updates.phone };
      this.phone = updates.phone;
    }

    if (updates.dateOfBirth !== undefined && updates.dateOfBirth !== this.dateOfBirth) {
      changes.dateOfBirth = { old: this.dateOfBirth, new: updates.dateOfBirth };
      this.dateOfBirth = updates.dateOfBirth;
    }

    if (updates.gender !== undefined && updates.gender !== this.gender) {
      changes.gender = { old: this.gender, new: updates.gender };
      this.gender = updates.gender;
    }

    if (updates.preferredLanguage !== undefined && updates.preferredLanguage !== this.preferredLanguage) {
      changes.preferredLanguage = { old: this.preferredLanguage, new: updates.preferredLanguage };
      this.preferredLanguage = updates.preferredLanguage;
    }

    if (Object.keys(changes).length > 0) {
      this.updatedAt = new Date();
      this.addDomainEvent(
        new CustomerProfileUpdatedEvent(this.id, this.tenantId, changes)
      );
    }
  }

  updateEmail(newEmail: string): void {
    if (newEmail !== this.email) {
      const oldEmail = this.email;
      this.email = newEmail;
      this.updatedAt = new Date();

      this.addDomainEvent(
        new CustomerProfileUpdatedEvent(this.id, this.tenantId, {
          email: { old: oldEmail, new: newEmail }
        })
      );
    }
  }

  updateMarketingConsent(consent: boolean): void {
    if (consent !== this.marketingConsent) {
      this.marketingConsent = consent;
      this.marketingConsentDate = new Date();
      this.updatedAt = new Date();

      this.addDomainEvent(
        new CustomerMarketingConsentChangedEvent(
          this.id,
          this.tenantId,
          consent,
          this.marketingConsentDate
        )
      );
    }
  }

  addAddress(address: Address): void {
    // If this is the first address of its type, make it default
    const existingAddressesOfType = this._addresses.filter(addr => addr.type === address.type);
    if (existingAddressesOfType.length === 0) {
      address = new Address(
        address.type,
        address.firstName,
        address.lastName,
        address.company,
        address.address1,
        address.address2,
        address.city,
        address.province,
        address.postalCode,
        address.countryCode,
        address.phone,
        true // Make it default
      );
    }

    // If this address is being set as default, unset other defaults of the same type
    if (address.isDefault) {
      this._addresses.forEach(addr => {
        if (addr.type === address.type) {
          addr = new Address(
            addr.type,
            addr.firstName,
            addr.lastName,
            addr.company,
            addr.address1,
            addr.address2,
            addr.city,
            addr.province,
            addr.postalCode,
            addr.countryCode,
            addr.phone,
            false
          );
        }
      });
    }

    this._addresses.push(address);
    this.updatedAt = new Date();

    this.addDomainEvent(
      new CustomerAddressAddedEvent(this.id, this.tenantId, address)
    );
  }

  removeAddress(addressIndex: number): void {
    if (addressIndex < 0 || addressIndex >= this._addresses.length) {
      throw new Error('Address index out of bounds');
    }

    const removedAddress = this._addresses[addressIndex];
    this._addresses.splice(addressIndex, 1);

    // If we removed the default address, make the first remaining address of the same type default
    if (removedAddress.isDefault) {
      const remainingAddressesOfType = this._addresses.filter(addr => addr.type === removedAddress.type);
      if (remainingAddressesOfType.length > 0) {
        const newDefaultIndex = this._addresses.findIndex(addr => addr === remainingAddressesOfType[0]);
        if (newDefaultIndex !== -1) {
          this._addresses[newDefaultIndex] = new Address(
            remainingAddressesOfType[0].type,
            remainingAddressesOfType[0].firstName,
            remainingAddressesOfType[0].lastName,
            remainingAddressesOfType[0].company,
            remainingAddressesOfType[0].address1,
            remainingAddressesOfType[0].address2,
            remainingAddressesOfType[0].city,
            remainingAddressesOfType[0].province,
            remainingAddressesOfType[0].postalCode,
            remainingAddressesOfType[0].countryCode,
            remainingAddressesOfType[0].phone,
            true
          );
        }
      }
    }

    this.updatedAt = new Date();
  }

  setDefaultAddress(addressIndex: number): void {
    if (addressIndex < 0 || addressIndex >= this._addresses.length) {
      throw new Error('Address index out of bounds');
    }

    const targetAddress = this._addresses[addressIndex];

    // Unset other defaults of the same type
    this._addresses.forEach((addr, index) => {
      if (addr.type === targetAddress.type && index !== addressIndex) {
        this._addresses[index] = new Address(
          addr.type,
          addr.firstName,
          addr.lastName,
          addr.company,
          addr.address1,
          addr.address2,
          addr.city,
          addr.province,
          addr.postalCode,
          addr.countryCode,
          addr.phone,
          false
        );
      }
    });

    // Set the target address as default
    this._addresses[addressIndex] = new Address(
      targetAddress.type,
      targetAddress.firstName,
      targetAddress.lastName,
      targetAddress.company,
      targetAddress.address1,
      targetAddress.address2,
      targetAddress.city,
      targetAddress.province,
      targetAddress.postalCode,
      targetAddress.countryCode,
      targetAddress.phone,
      true
    );

    this.updatedAt = new Date();
  }

  addTags(tags: string[]): void {
    const uniqueTags = [...new Set([...this.tags, ...tags])];
    if (uniqueTags.length !== this.tags.length) {
      this.tags = uniqueTags;
      this.updatedAt = new Date();
    }
  }

  removeTags(tags: string[]): void {
    const filteredTags = this.tags.filter(tag => !tags.includes(tag));
    if (filteredTags.length !== this.tags.length) {
      this.tags = filteredTags;
      this.updatedAt = new Date();
    }
  }

  updateNotes(notes: string): void {
    if (notes !== this.notes) {
      this.notes = notes;
      this.updatedAt = new Date();
    }
  }

  assignToGroup(groupId: string, groupName: string): void {
    if (!this._groupIds.includes(groupId)) {
      this._groupIds.push(groupId);
      this.updatedAt = new Date();

      this.addDomainEvent(
        new CustomerGroupAssignedEvent(this.id, this.tenantId, groupId, groupName)
      );
    }
  }

  removeFromGroup(groupId: string): void {
    const index = this._groupIds.indexOf(groupId);
    if (index !== -1) {
      this._groupIds.splice(index, 1);
      this.updatedAt = new Date();
    }
  }

  updateStatistics(statistics: CustomerStatistics): void {
    this.statistics = statistics;
    this.updatedAt = new Date();
  }

  canReceiveMarketing(): boolean {
    return this.marketingConsent && this.marketingConsentDate !== null;
  }

  getBillingAddresses(): Address[] {
    return this._addresses.filter(addr => addr.type === 'billing');
  }

  getShippingAddresses(): Address[] {
    return this._addresses.filter(addr => addr.type === 'shipping');
  }

  toJSON() {
    return {
      id: this.id,
      tenantId: this.tenantId,
      userId: this.userId,
      customerNumber: this.customerNumber,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      company: this.company,
      phone: this.phone,
      dateOfBirth: this.dateOfBirth,
      gender: this.gender,
      preferredLanguage: this.preferredLanguage,
      marketingConsent: this.marketingConsent,
      marketingConsentDate: this.marketingConsentDate,
      tags: this.tags,
      notes: this.notes,
      statistics: this.statistics,
      addresses: this._addresses,
      groupIds: this._groupIds,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}