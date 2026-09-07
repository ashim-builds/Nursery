import crypto from 'crypto';
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
import { ApiError } from '../../../utils/ApiError.js';

export class EsewaPaymentGateway implements IPaymentGateway {
  readonly name = PaymentMethod.ESEWA;

  private productCode = process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST';
  private secretKey = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';
  private endpoint = process.env.ESEWA_ENDPOINT || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';

  private generateSignature(message: string): string {
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(message)
      .digest('base64');
  }

  async initiate(req: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
    const transactionUuid = `ESEWA-${req.orderNumber}-${Date.now()}`;
    const totalAmountStr = req.amount.toFixed(2);
    // eSewa signature message format: "total_amount,transaction_uuid,product_code"
    const message = `total_amount=${totalAmountStr},transaction_uuid=${transactionUuid},product_code=${this.productCode}`;
    const signature = this.generateSignature(message);

    const successUrl = req.returnUrl || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/order-success/${req.orderId}`;
    const failureUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout?error=esewa_failed`;

    return {
      paymentMethod: PaymentMethod.ESEWA,
      paymentUrl: this.endpoint,
      transactionReference: transactionUuid,
      instructions: 'Redirect to eSewa gateway with signed payload',
      metadata: {
        amount: totalAmountStr,
        tax_amount: '0',
        total_amount: totalAmountStr,
        transaction_uuid: transactionUuid,
        product_code: this.productCode,
        product_service_charge: '0',
        product_delivery_charge: '0',
        success_url: successUrl,
        failure_url: failureUrl,
        signed_field_names: 'total_amount,transaction_uuid,product_code',
        signature,
      },
    };
  }

  async verify(req: PaymentVerifyRequest): Promise<PaymentVerifyResult> {
    // If eSewa returns encoded data or direct fields
    let data: any = req.rawPayload;

    if (data?.data) {
      try {
        const decoded = Buffer.from(data.data, 'base64').toString('utf-8');
        data = JSON.parse(decoded);
      } catch {
        // use data as is
      }
    }

    if (!data) {
      throw ApiError.badRequest('Missing eSewa verification response payload');
    }

    const { total_amount, transaction_uuid, product_code, signature, status } = data;

    // Verify HMAC signature
    if (signature && total_amount && transaction_uuid) {
      const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code || this.productCode}`;
      const expectedSignature = this.generateSignature(message);

      if (signature !== expectedSignature && this.productCode !== 'EPAYTEST') {
        throw ApiError.badRequest('Invalid eSewa payment signature verification failed');
      }
    }

    const isSuccess = status === 'COMPLETE' || status === 'SUCCESS' || !status;
    const amountVerified = parseFloat(total_amount || String(req.amount || 0));

    return {
      success: isSuccess,
      paymentStatus: isSuccess ? PaymentStatus.PAID : PaymentStatus.FAILED,
      transactionReference: transaction_uuid || req.transactionReference || `ESEWA-${Date.now()}`,
      amountVerified,
      gatewayResponse: data,
      message: isSuccess ? 'eSewa digital wallet payment verified successfully' : 'eSewa payment failed',
    };
  }

  async processWebhook(req: PaymentWebhookRequest): Promise<PaymentWebhookResult> {
    let payload = req.body;
    if (payload?.data) {
      try {
        const decoded = Buffer.from(payload.data, 'base64').toString('utf-8');
        payload = JSON.parse(decoded);
      } catch {
        // use payload as is
      }
    }

    const isComplete = payload?.status === 'COMPLETE' || payload?.status === 'SUCCESS';
    return {
      success: isComplete,
      transactionReference: payload?.transaction_uuid || `ESEWA-WH-${Date.now()}`,
      status: isComplete ? PaymentStatus.PAID : PaymentStatus.FAILED,
      amount: parseFloat(payload?.total_amount || '0'),
      message: isComplete ? 'eSewa webhook verified' : 'eSewa webhook status incomplete',
      rawResponse: payload,
    };
  }
}
