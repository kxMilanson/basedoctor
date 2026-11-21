/**
 * Base.com (BaseLinker) API Type Definitions
 * Based on official documentation: https://api.baselinker.com/connector.php
 */

export interface BaseLinkerSuccessResponse<T = Record<string, unknown>> {
  status: "SUCCESS";
  [key: string]: unknown;
}

export interface BaseLinkerErrorResponse {
  status: "ERROR";
  error_code: string;
  error_message: string;
}

export type BaseLinkerResponse<T = Record<string, unknown>> =
  | (BaseLinkerSuccessResponse<T> & T)
  | BaseLinkerErrorResponse;

export interface BaseLinkerInventory {
  inventory_id: number;
  name: string;
  description?: string;
  languages: string[];
  default_language: string;
  price_groups: number[];
  default_price_group: number;
  warehouses: string[];
  default_warehouse: string;
  is_default?: boolean;
}

export interface BaseLinkerProductListItem {
  id: number;
  ean: string;
  sku: string;
  name: string;
  quantity: number;
  price_brutto: number;
  is_bundle?: boolean;
}

export interface BaseLinkerProductPriceGroup {
  [priceGroupId: string]: number;
}

export interface BaseLinkerProductStockWarehouse {
  [warehouseId: string]: number;
}

export interface BaseLinkerProductData {
  is_bundle: boolean;
  ean: string;
  sku: string;
  tax_rate: number;
  weight: number;
  height: number;
  width: number;
  length: number;
  star: number;
  category_id: number;
  producer_id: number;
  prices: BaseLinkerProductPriceGroup;
  stock: BaseLinkerProductStockWarehouse;
  locations?: Record<string, string>;
  text_fields: {
    name: string;
    description?: string;
    description_extra1?: string;
    description_extra2?: string;
    features?: Record<string, string>;
    [key: string]: unknown;
  };
  images: Record<string, string>;
  links?: Record<string, unknown>;
  variants?: Record<string, BaseLinkerProductVariant>;
}

export interface BaseLinkerProductVariant {
  variant_id: number;
  name: string;
  sku: string;
  ean: string;
  price: number;
  prices?: BaseLinkerProductPriceGroup;
  stock?: BaseLinkerProductStockWarehouse;
  quantity?: number;
}

export interface BaseLinkerOrderStatus {
  id: number;
  name: string;
  color: string;
}

export interface BaseLinkerOrderProduct {
  order_product_id?: number;
  storage?: string;
  storage_id?: number;
  product_id: string;
  variant_id: number;
  name: string;
  attributes?: string;
  sku: string;
  ean: string;
  location?: string;
  warehouse_id?: number;
  auction_id?: string;
  price_brutto: number;
  tax_rate: number;
  quantity: number;
  weight: number;
}

export interface BaseLinkerOrder {
  order_id: number;
  shop_order_id?: number;
  external_order_id?: string;
  order_source: string;
  order_source_id: number;
  order_status_id: number;
  date_add: number; // Unix timestamp
  date_confirmed: number; // Unix timestamp
  date_in_status?: number; // Unix timestamp
  confirmed: boolean;
  user_login?: string;
  phone?: string;
  email?: string;
  user_comments?: string;
  admin_comments?: string;
  currency: string;
  payment_method: string;
  payment_method_cod: string | boolean;
  payment_done: number;
  delivery_method: string;
  delivery_price: number;
  delivery_package_module?: string;
  delivery_package_nr?: string;
  delivery_fullname?: string;
  delivery_company?: string;
  delivery_address?: string;
  delivery_city?: string;
  delivery_postcode?: string;
  delivery_country_code?: string;
  delivery_point_id?: string;
  invoice_fullname?: string;
  invoice_company?: string;
  invoice_nip?: string;
  invoice_address?: string;
  invoice_city?: string;
  invoice_postcode?: string;
  invoice_country_code?: string;
  want_invoice?: string | boolean;
  extra_field_1?: string;
  extra_field_2?: string;
  products: BaseLinkerOrderProduct[];
}
