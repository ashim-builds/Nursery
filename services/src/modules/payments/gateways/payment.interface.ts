import { PaymentMethod, PaymentStatus } from '@prisma/client';

export interface PaymentInitiateRequest {
  orderId: string;
  orderNumber: string;
  amount: number;
  billNumber: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  returnUrl?: string;
}

export interface PaymentInitiateResponse {
  paymentId?: string;
  paymentMethod: PaymentMethod;
  paymentUrl?: string;
  qrData?: string;
  pidx?: string;
  transactionReference?: string;
  instructions: string;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export interface PaymentVerifyRequest {
  paymentId?: string;
  orderId?: string;
  transactionReference?: string;
  pidx?: string;
  token?: string;
  amount?: number;
  rawPayload?: any;
}

export interface PaymentVerifyResult {
  success: boolean;
  paymentStatus: PaymentStatus;
  transactionReference: string;
  amountVerified: number;
  gatewayResponse: any;
  message: string;
}

export interface PaymentWebhookRequest {
  headers: Record<string, any>;
  body: any;
  rawBody?: string;
}

export interface PaymentWebhookResult {
  success: boolean;
  orderId?: string;
  paymentId?: string;
  transactionReference: string;
  status: PaymentStatus;
  amount: number;
  message: string;
  rawResponse: any;
}

export interface IPaymentGateway {
  readonly name: PaymentMethod;
  initiate(req: PaymentInitiateRequest): Promise<PaymentInitiateResponse>;
  verify(req: PaymentVerifyRequest): Promise<PaymentVerifyResult>;
  processWebhook(req: PaymentWebhookRequest): Promise<PaymentWebhookResult>;
}
