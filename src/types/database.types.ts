export type UserRole = "customer" | "admin";

export type AccountStatus = "active" | "suspended";

export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipping"
  | "Delivered"
  | "Cancelled"
  | "Refund";

export type ProductStatus = "active" | "draft" | "archived";

export type ReviewModerationStatus = "pending" | "approved" | "rejected";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  phone_number: string | null;
  country: string | null;
  billing_address: Record<string, unknown> | null;
  role: UserRole;
  is_active: boolean;
  account_status: AccountStatus;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  created_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  category_id: string | null;
  created_at: string;
}

export interface BrandCategory {
  brand_id: string;
  category_id: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  old_price: number | null;
  stock_quantity: number;
  category_id: string | null;
  image_urls: string[];
  is_featured: boolean;
  status: ProductStatus;
  warranty_info: string | null;
  shipping_info: string | null;
  specifications: Array<Record<string, unknown>>;
  is_best_deal: boolean;
  deal_end_time: string | null;
  is_flash_sale: boolean;
  is_best_seller: boolean;
  is_top_rated: boolean;
  discount_percentage: number;
  brand_id: string | null;
  rating: number;
  sales_count: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  status: OrderStatus;
  total_amount: number;
  billing_address: Record<string, unknown> | null;
  shipping_address: Record<string, unknown> | null;
  payment_method: string | null;
  notes: string | null;
  stripe_payment_intent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  price_at_time: number;
  created_at: string;
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

export interface TrackableOrderItem {
  id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  price_at_time: number;
  products: { id: string; name: string; image_urls: string[] } | null;
}

export interface TrackableOrder {
  id: string;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
  order_items: TrackableOrderItem[];
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment: string | null;
  is_approved: boolean;
  moderation_status: ReviewModerationStatus;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface ProductTag {
  product_id: string;
  tag_id: string;
}

export interface SupportQuery {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: "open" | "resolved";
  reply: string | null;
  replied_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Promotion {
  id: string;
  name: string;
  code: string;
  discount_percent: number;
  discount_amount: number;
  is_active: boolean;
  starts_at: string | null;
  expires_at: string | null;
  min_order_amount: number;
  usage_limit: number;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface SiteSetting {
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
}

export interface PromotionalBanner {
  id: string;
  section: string;
  title: string | null;
  subtitle: string | null;
  discount_text: string | null;
  offer_ends_at: string | null;
  button_text: string;
  target_url: string;
  image_url: string | null;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface CompareItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface BrowsingHistoryItem {
  id: string;
  user_id: string;
  product_id: string;
  viewed_at: string;
}

export interface SavedCard {
  id: string;
  user_id: string;
  card_name: string;
  card_number: string;
  expiry: string;
  cvc: string;
  created_at: string;
}

export interface UpdateOrderStatusByPaymentIntentParams {
  p_payment_intent_id: string;
  p_status: OrderStatus;
}