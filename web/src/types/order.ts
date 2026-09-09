export type OrderStatus =
  | 'PENDING'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod =
  | 'CASH'
  | 'CASH_ON_DELIVERY'
  | 'FONEPAY_QR'
  | 'KHALTI'
  | 'CARD'
  | 'BANK_TRANSFER';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';

export interface OrderItem {
  id: string;
  orderId?: string;
  productId: string;
  variantId: string;
  productName?: string;
  productTitle?: string;
  variantName: string;
  sku?: string;
  unitPrice: number | string;
  quantity: number;
  totalPrice?: number | string;
  lineTotal?: number | string;
  imageUrl?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryArea?: string;
  deliveryPostalCode?: string;
  scheduledDeliveryDate?: string;
  giftMessage?: string;
  deliveryNotes?: string;
  orderStatus: OrderStatus;
  status?: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  subtotal: number | string;
  deliveryFee: number | string;
  discount?: number | string;
  discountAmount?: number | string;
  totalAmount: number | string;
  items: OrderItem[];
  createdAt: string;
  updatedAt?: string;
}
