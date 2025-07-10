import { Product, ProductVariant } from './product.entity';
import { Money } from './product.entity';

export interface ProductFilters {
  tenantId?: string;
  categoryIds?: string[];
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
  priceRange?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  search?: string;
  isActive?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  limit?: number;
  offset?: number;
  sortBy?: 'created_at' | 'updated_at' | 'title' | 'price';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductSearchResult {
  products: Product[];
  total: number;
  hasMore: boolean;
}

export interface ProductRepository {
  // Basic CRUD operations
  findById(id: string): Promise<Product | null>;
  findBySlug(tenantId: string, slug: string): Promise<Product | null>;
  findByCourseId(courseId: string): Promise<Product | null>;
  save(product: Product): Promise<void>;
  delete(id: string): Promise<void>;

  // Bulk operations
  findByIds(ids: string[]): Promise<Product[]>;
  saveMany(products: Product[]): Promise<void>;
  deleteMany(ids: string[]): Promise<void>;

  // Query operations
  findAll(filters: ProductFilters): Promise<ProductSearchResult>;
  findByTenant(tenantId: string, filters?: Omit<ProductFilters, 'tenantId'>): Promise<ProductSearchResult>;
  findPublished(tenantId: string, filters?: Omit<ProductFilters, 'tenantId' | 'status'>): Promise<ProductSearchResult>;
  findDrafts(tenantId: string, filters?: Omit<ProductFilters, 'tenantId' | 'status'>): Promise<ProductSearchResult>;
  
  // Search operations
  search(query: string, filters?: ProductFilters): Promise<ProductSearchResult>;
  searchByCategory(categoryId: string, filters?: ProductFilters): Promise<ProductSearchResult>;
  searchByTags(tags: string[], filters?: ProductFilters): Promise<ProductSearchResult>;
  
  // Variant operations
  findVariantById(variantId: string): Promise<ProductVariant | null>;
  findVariantsBySku(sku: string): Promise<ProductVariant[]>;
  findVariantsByProduct(productId: string): Promise<ProductVariant[]>;
  saveVariant(productId: string, variant: ProductVariant): Promise<void>;
  deleteVariant(variantId: string): Promise<void>;
  
  // Analytics operations
  getPopularProducts(tenantId: string, limit?: number): Promise<Product[]>;
  getRecentProducts(tenantId: string, limit?: number): Promise<Product[]>;
  getFeaturedProducts(tenantId: string, limit?: number): Promise<Product[]>;
  getProductsByPriceRange(tenantId: string, minPrice: Money, maxPrice: Money): Promise<Product[]>;
  
  // Inventory operations
  updateInventory(variantId: string, quantity: number): Promise<void>;
  adjustInventory(variantId: string, adjustment: number): Promise<void>;
  getInventoryStatus(tenantId: string): Promise<{ variantId: string; quantity: number; isInStock: boolean }[]>;
  
  // Statistics
  getProductCount(tenantId: string, status?: 'draft' | 'published' | 'archived'): Promise<number>;
  getVariantCount(productId: string): Promise<number>;
  getProductStatistics(tenantId: string): Promise<{
    totalProducts: number;
    publishedProducts: number;
    draftProducts: number;
    archivedProducts: number;
    totalVariants: number;
    averagePrice: number;
    currency: string;
  }>;

  // Validation
  isSlugUnique(tenantId: string, slug: string, excludeId?: string): Promise<boolean>;
  isSkuUnique(tenantId: string, sku: string, excludeId?: string): Promise<boolean>;
  
  // Batch operations
  publishProducts(productIds: string[]): Promise<void>;
  unpublishProducts(productIds: string[]): Promise<void>;
  archiveProducts(productIds: string[]): Promise<void>;
  updateProductsCategory(productIds: string[], categoryIds: string[]): Promise<void>;
  updateProductsTags(productIds: string[], tags: string[]): Promise<void>;
}