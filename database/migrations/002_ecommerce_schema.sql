-- E-commerce Extension Schema
-- Products, Orders, Customers, Coupons Management
-- PostgreSQL 14+ with existing educational platform integration

-- =====================================================
-- PRODUCT MANAGEMENT TABLES
-- =====================================================

-- Product categories (extends existing categories)
CREATE TABLE IF NOT EXISTS product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES product_categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    icon VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    seo_title VARCHAR(255),
    seo_description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, slug)
);

-- Product variants (for courses with different pricing tiers)
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    sku VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    compare_at_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    inventory_quantity INTEGER DEFAULT 0,
    inventory_policy VARCHAR(20) DEFAULT 'deny' CHECK (inventory_policy IN ('continue', 'deny')),
    weight DECIMAL(8,2),
    dimensions JSONB, -- {length, width, height, unit}
    variant_options JSONB DEFAULT '{}', -- {duration: "lifetime", support: "premium"}
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, sku)
);

-- Product collections (bundles, featured collections)
CREATE TABLE IF NOT EXISTS product_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    collection_type VARCHAR(50) DEFAULT 'manual' CHECK (collection_type IN ('manual', 'smart')),
    sort_order VARCHAR(50) DEFAULT 'manual' CHECK (sort_order IN ('manual', 'best_selling', 'created_desc', 'price_asc', 'price_desc')),
    conditions JSONB DEFAULT '{}', -- For smart collections
    is_published BOOLEAN DEFAULT TRUE,
    published_at TIMESTAMP WITH TIME ZONE,
    seo_title VARCHAR(255),
    seo_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, slug)
);

-- Product collection items (many-to-many)
CREATE TABLE IF NOT EXISTS collection_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id UUID NOT NULL REFERENCES product_collections(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(collection_id, course_id)
);

-- =====================================================
-- CUSTOMER MANAGEMENT TABLES
-- =====================================================

-- Customer profiles (extends users table)
CREATE TABLE IF NOT EXISTS customer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    customer_number VARCHAR(50) UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company VARCHAR(100),
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20),
    preferred_language VARCHAR(10) DEFAULT 'en',
    marketing_consent BOOLEAN DEFAULT FALSE,
    marketing_consent_date TIMESTAMP WITH TIME ZONE,
    tags TEXT[],
    notes TEXT,
    total_spent DECIMAL(10,2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    last_order_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, user_id)
);

-- Customer addresses
CREATE TABLE IF NOT EXISTS customer_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    address_type VARCHAR(20) DEFAULT 'shipping' CHECK (address_type IN ('billing', 'shipping')),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company VARCHAR(100),
    address1 VARCHAR(255) NOT NULL,
    address2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    province VARCHAR(100),
    postal_code VARCHAR(20),
    country_code VARCHAR(2) NOT NULL,
    phone VARCHAR(20),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Customer groups/segments
CREATE TABLE IF NOT EXISTS customer_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    conditions JSONB DEFAULT '{}',
    is_automatic BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, name)
);

-- Customer group memberships
CREATE TABLE IF NOT EXISTS customer_group_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES customer_groups(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(customer_id, group_id)
);

-- =====================================================
-- ORDER MANAGEMENT TABLES
-- =====================================================

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customer_profiles(id),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    currency VARCHAR(3) DEFAULT 'USD',
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_tax DECIMAL(10,2) DEFAULT 0,
    total_discounts DECIMAL(10,2) DEFAULT 0,
    total_shipping DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'authorized', 'paid', 'partially_paid', 'refunded', 'partially_refunded', 'voided')),
    fulfillment_status VARCHAR(20) DEFAULT 'unfulfilled' CHECK (fulfillment_status IN ('unfulfilled', 'partial', 'fulfilled', 'cancelled')),
    order_status VARCHAR(20) DEFAULT 'open' CHECK (order_status IN ('open', 'closed', 'cancelled')),
    financial_status VARCHAR(20) DEFAULT 'pending' CHECK (financial_status IN ('pending', 'authorized', 'paid', 'partially_paid', 'refunded', 'voided')),
    billing_address JSONB,
    shipping_address JSONB,
    notes TEXT,
    tags TEXT[],
    source_name VARCHAR(50),
    referring_site VARCHAR(255),
    landing_site VARCHAR(255),
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancel_reason VARCHAR(100),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order line items
CREATE TABLE IF NOT EXISTS order_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id),
    variant_id UUID REFERENCES product_variants(id),
    title VARCHAR(255) NOT NULL,
    variant_title VARCHAR(255),
    sku VARCHAR(50),
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    compare_at_price DECIMAL(10,2),
    total_discount DECIMAL(10,2) DEFAULT 0,
    fulfillment_status VARCHAR(20) DEFAULT 'unfulfilled',
    fulfillment_service VARCHAR(50) DEFAULT 'manual',
    grams INTEGER DEFAULT 0,
    tax_lines JSONB DEFAULT '[]',
    discount_allocations JSONB DEFAULT '[]',
    properties JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order fulfillments
CREATE TABLE IF NOT EXISTS order_fulfillments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    tracking_number VARCHAR(100),
    tracking_company VARCHAR(100),
    tracking_url VARCHAR(500),
    notify_customer BOOLEAN DEFAULT TRUE,
    shipment_status VARCHAR(20) DEFAULT 'pending' CHECK (shipment_status IN ('pending', 'shipped', 'delivered', 'returned')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order fulfillment line items
CREATE TABLE IF NOT EXISTS fulfillment_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fulfillment_id UUID NOT NULL REFERENCES order_fulfillments(id) ON DELETE CASCADE,
    line_item_id UUID NOT NULL REFERENCES order_line_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    UNIQUE(fulfillment_id, line_item_id)
);

-- =====================================================
-- COUPON & DISCOUNT MANAGEMENT TABLES
-- =====================================================

-- Discount codes/coupons
CREATE TABLE IF NOT EXISTS discount_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_shipping')),
    value DECIMAL(10,2) NOT NULL,
    minimum_amount DECIMAL(10,2),
    usage_limit INTEGER,
    usage_limit_per_customer INTEGER,
    used_count INTEGER DEFAULT 0,
    applies_to VARCHAR(20) DEFAULT 'all' CHECK (applies_to IN ('all', 'specific_courses', 'specific_collections')),
    applies_to_ids UUID[],
    customer_eligibility VARCHAR(20) DEFAULT 'all' CHECK (customer_eligibility IN ('all', 'specific_customers', 'specific_groups')),
    customer_ids UUID[],
    customer_group_ids UUID[],
    starts_at TIMESTAMP WITH TIME ZONE,
    ends_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, code)
);

-- Discount code usage tracking
CREATE TABLE IF NOT EXISTS discount_code_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    discount_code_id UUID NOT NULL REFERENCES discount_codes(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customer_profiles(id),
    used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(discount_code_id, order_id)
);

-- Price rules (automatic discounts)
CREATE TABLE IF NOT EXISTS price_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('line_item', 'shipping_line')),
    target_selection VARCHAR(20) NOT NULL CHECK (target_selection IN ('all', 'entitled')),
    allocation_method VARCHAR(20) NOT NULL CHECK (allocation_method IN ('across', 'each')),
    value_type VARCHAR(20) NOT NULL CHECK (value_type IN ('fixed_amount', 'percentage')),
    value DECIMAL(10,2) NOT NULL,
    entitled_course_ids UUID[],
    entitled_collection_ids UUID[],
    entitled_customer_ids UUID[],
    entitled_customer_group_ids UUID[],
    prerequisite_subtotal_range JSONB, -- {greater_than_or_equal_to: 50}
    prerequisite_quantity_range JSONB, -- {greater_than_or_equal_to: 2}
    prerequisite_shipping_price_range JSONB,
    usage_limit INTEGER,
    once_per_customer BOOLEAN DEFAULT FALSE,
    starts_at TIMESTAMP WITH TIME ZONE,
    ends_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PAYMENT MANAGEMENT TABLES
-- =====================================================

-- Payment transactions
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES payment_transactions(id), -- For refunds
    kind VARCHAR(20) NOT NULL CHECK (kind IN ('authorization', 'capture', 'sale', 'void', 'refund')),
    gateway VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'success', 'failure', 'error', 'cancelled')),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    gateway_transaction_id VARCHAR(100),
    gateway_response JSONB,
    test BOOLEAN DEFAULT FALSE,
    error_code VARCHAR(50),
    error_message TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payment methods
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customer_profiles(id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('credit_card', 'bank_transfer', 'paypal', 'stripe', 'apple_pay', 'google_pay')),
    provider VARCHAR(50) NOT NULL,
    provider_id VARCHAR(100),
    is_default BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- CART MANAGEMENT TABLES
-- =====================================================

-- Shopping carts
CREATE TABLE IF NOT EXISTS shopping_carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customer_profiles(id),
    session_id VARCHAR(100),
    token VARCHAR(100) UNIQUE,
    email VARCHAR(255),
    phone VARCHAR(20),
    currency VARCHAR(3) DEFAULT 'USD',
    total_price DECIMAL(10,2) DEFAULT 0,
    total_discount DECIMAL(10,2) DEFAULT 0,
    applied_discount_codes TEXT[],
    note TEXT,
    abandoned_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cart line items
CREATE TABLE IF NOT EXISTS cart_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID NOT NULL REFERENCES shopping_carts(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id),
    variant_id UUID REFERENCES product_variants(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    compare_at_price DECIMAL(10,2),
    properties JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(cart_id, course_id, variant_id)
);

-- =====================================================
-- ANALYTICS & REPORTING TABLES
-- =====================================================

-- Sales analytics
CREATE TABLE IF NOT EXISTS sales_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_sales DECIMAL(10,2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    total_customers INTEGER DEFAULT 0,
    new_customers INTEGER DEFAULT 0,
    returning_customers INTEGER DEFAULT 0,
    average_order_value DECIMAL(10,2) DEFAULT 0,
    refund_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, date)
);

-- Course sales analytics
CREATE TABLE IF NOT EXISTS course_sales_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id),
    date DATE NOT NULL,
    units_sold INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    refund_amount DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, course_id, date)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Product indexes
CREATE INDEX idx_product_variants_tenant ON product_variants(tenant_id);
CREATE INDEX idx_product_variants_course ON product_variants(course_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);
CREATE INDEX idx_product_collections_tenant ON product_collections(tenant_id);
CREATE INDEX idx_collection_products_collection ON collection_products(collection_id);

-- Customer indexes
CREATE INDEX idx_customer_profiles_tenant ON customer_profiles(tenant_id);
CREATE INDEX idx_customer_profiles_user ON customer_profiles(user_id);
CREATE INDEX idx_customer_profiles_number ON customer_profiles(customer_number);
CREATE INDEX idx_customer_addresses_customer ON customer_addresses(customer_id);

-- Order indexes
CREATE INDEX idx_orders_tenant ON orders(tenant_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(order_status, payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_line_items_order ON order_line_items(order_id);
CREATE INDEX idx_order_line_items_course ON order_line_items(course_id);

-- Discount indexes
CREATE INDEX idx_discount_codes_tenant ON discount_codes(tenant_id);
CREATE INDEX idx_discount_codes_code ON discount_codes(code);
CREATE INDEX idx_discount_codes_active ON discount_codes(is_active, starts_at, ends_at);
CREATE INDEX idx_discount_usage_code ON discount_code_usage(discount_code_id);

-- Payment indexes
CREATE INDEX idx_payment_transactions_tenant ON payment_transactions(tenant_id);
CREATE INDEX idx_payment_transactions_order ON payment_transactions(order_id);
CREATE INDEX idx_payment_transactions_gateway ON payment_transactions(gateway, status);

-- Cart indexes
CREATE INDEX idx_shopping_carts_tenant ON shopping_carts(tenant_id);
CREATE INDEX idx_shopping_carts_customer ON shopping_carts(customer_id);
CREATE INDEX idx_shopping_carts_session ON shopping_carts(session_id);
CREATE INDEX idx_cart_line_items_cart ON cart_line_items(cart_id);

-- Analytics indexes
CREATE INDEX idx_sales_analytics_tenant_date ON sales_analytics(tenant_id, date);
CREATE INDEX idx_course_sales_analytics_course_date ON course_sales_analytics(course_id, date);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on e-commerce tables
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_carts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY tenant_isolation_product_variants ON product_variants
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

CREATE POLICY tenant_isolation_orders ON orders
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

CREATE POLICY customer_own_profile ON customer_profiles
    FOR ALL
    USING (
        tenant_id = current_setting('app.current_tenant')::uuid
        AND (
            user_id = current_setting('app.current_user')::uuid
            OR EXISTS (
                SELECT 1 FROM users
                WHERE id = current_setting('app.current_user')::uuid
                AND persona IN ('admin', 'super_admin')
            )
        )
    );

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number = 'ORD-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-' || 
                       LPAD(nextval('order_number_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE SEQUENCE order_number_seq;

CREATE TRIGGER generate_order_number_trigger BEFORE INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Auto-generate customer numbers
CREATE OR REPLACE FUNCTION generate_customer_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.customer_number = 'CUST-' || LPAD(nextval('customer_number_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE SEQUENCE customer_number_seq;

CREATE TRIGGER generate_customer_number_trigger BEFORE INSERT ON customer_profiles
    FOR EACH ROW EXECUTE FUNCTION generate_customer_number();

-- Update cart totals
CREATE OR REPLACE FUNCTION update_cart_totals()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE shopping_carts
    SET total_price = (
        SELECT COALESCE(SUM(quantity * price), 0)
        FROM cart_line_items
        WHERE cart_id = COALESCE(NEW.cart_id, OLD.cart_id)
    ),
    updated_at = CURRENT_TIMESTAMP
    WHERE id = COALESCE(NEW.cart_id, OLD.cart_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cart_totals_trigger
    AFTER INSERT OR UPDATE OR DELETE ON cart_line_items
    FOR EACH ROW EXECUTE FUNCTION update_cart_totals();

-- Update customer statistics
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE customer_profiles
    SET total_spent = (
        SELECT COALESCE(SUM(total_price), 0)
        FROM orders
        WHERE customer_id = NEW.customer_id
        AND order_status = 'closed'
        AND financial_status = 'paid'
    ),
    total_orders = (
        SELECT COUNT(*)
        FROM orders
        WHERE customer_id = NEW.customer_id
        AND order_status = 'closed'
    ),
    last_order_date = (
        SELECT MAX(created_at)
        FROM orders
        WHERE customer_id = NEW.customer_id
        AND order_status = 'closed'
    ),
    updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.customer_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customer_stats_trigger
    AFTER INSERT OR UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_customer_stats();

-- Apply updated_at triggers to all e-commerce tables
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_collections_updated_at BEFORE UPDATE ON product_collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_profiles_updated_at BEFORE UPDATE ON customer_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discount_codes_updated_at BEFORE UPDATE ON discount_codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopping_carts_updated_at BEFORE UPDATE ON shopping_carts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();