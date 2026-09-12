import { PaymentMethod, PaymentStatus } from '@prisma/client';
import {
  IPaymentGateway,
  PaymentInitiateRequest,
  PaymentInitiateResponse,
  PaymentVerifyRequest,
  PaymentVerifyResult,
  PaymentWebhookRequest,
  PaymentWebhookResult,
} from './payment.interface.js';

export class CashPaymentGateway implements IPaymentGateway {
  readonly name = PaymentMethod.CASH;

  async initiate(req: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
    return {
      paymentMethod: PaymentMethod.CASH,
      instructions: `Cash on Delivery selected. Please keep exact cash of Rs. ${req.amount.toLocaleString()} ready upon botanical delivery to your Pokhara address.`,
      metadata: {
        amount: req.amount,
        orderNumber: req.orderNumber,
      },
    };
  }

  async verify(req: PaymentVerifyRequest): Promise<PaymentVerifyResult> {
    // For Cash on delivery, verification happens when staff or delivery rider collects cash
    const isCollected = req.rawPayload?.collected === true;
    return {
      success: isCollected,
      paymentStatus: isCollected ? PaymentStatus.PAID : PaymentStatus.PENDING,
      transactionReference: req.transactionReference || `COD-${Date.now()}`,
      amountVerified: req.amount || 0,
      gatewayResponse: {
        method: 'CASH',
        collected: isCollected,
        verifiedAt: new Date().toISOString(),
      },
      message: isCollected ? 'Cash payment collected on delivery' : 'Cash on delivery pending rider collection',
    };
  }

  async processWebhook(req: PaymentWebhookRequest): Promise<PaymentWebhookResult> {
    return {
      success: true,
      transactionReference: `COD-${Date.now()}`,
      status: PaymentStatus.PENDING,
      amount: req.body?.amount || 0,
      message: 'Cash payment processed',
      rawResponse: req.body,
    };
  }
}
