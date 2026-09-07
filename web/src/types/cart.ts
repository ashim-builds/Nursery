import { Product, ProductVariant } from './product';

export interface CartItem {
  id: string; // Unique cart item key: productId + variantId
  productId: string;
  variantId: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CartState {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  scheduledDeliveryDate?: string;
  giftMessage?: string;
  deliveryNotes?: string;
}
