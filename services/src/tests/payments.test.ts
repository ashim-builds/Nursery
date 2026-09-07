import { describe, it, expect } from './test-framework.js';
import { PaymentService } from '../modules/payments/payment.service.js';
import { OrderService } from '../modules/orders/order.service.js';
import { prisma } from '../config/database.js';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import crypto from 'crypto';

export function registerPaymentTests() {
  describe('Payment Gateways & Verification Tests', () => {
    let testUserId: string;
    let testOrderId: string;
    let orderTotal: number;

    it('1. Setup customer and order for payment testing', async () => {
      const user = await prisma.user.create({
        data: {
          name: 'Payment Tester',
          email: `payment_tester_${Date.now()}@ktmtest.com`,
          passwordHash: 'hash123',
          role: 'CUSTOMER',
        },
      });
      testUserId = user.id;

      let category = await prisma.category.findFirst();
      if (!category) {
        category = await prisma.category.create({
          data: { name: 'Succulents', slug: `succulents-${Date.now()}` },
        });
      }

      const product = await prisma.product.create({
        data: {
          name: `Haworthia Zebra ${Date.now()}`,
          slug: `zebra-succulent-${Date.now()}`,
          sku: `ZEB-${Date.now()}`,
          shortDescription: 'Striped succulent',
          description: 'Hardy drought-tolerant succulent',
          categoryId: category.id,
          basePrice: 400,
          published: true,
          available: true,
          variants: {
            create: {
              name: '4" Terracotta',
              sku: `VAR-ZEB-${Date.now()}`,
              price: 400,
              stock: 20,
              isAvailable: true,
              inventory: {
                create: {
                  stockQuantity: 20,
                  reservedQuantity: 0,
                  availableQuantity: 20,
                },
              },
            },
          },
        },
        include: { variants: true },
      });

      const order = await OrderService.createOrder(
        {
          customerName: 'Payment Tester',
          customerEmail: 'payment_tester@ktmtest.com',
          customerPhone: '9801122334',
          deliveryAddress: 'Lazimpat, Kathmandu',
          deliveryCity: 'Kathmandu',
          paymentMethod: PaymentMethod.ESEWA,
          items: [{ productId: product.id, variantId: product.variants[0].id, quantity: 2 }],
        },
        testUserId
      );

      testOrderId = order.id;
      orderTotal = order.totalAmount;
      expect(order.id).toBeTruthy();
    });

    it('2. Should initiate eSewa payment and generate signed payload with HMAC-SHA256 signature', async () => {
      const initResult = await PaymentService.initiatePayment({
        orderId: testOrderId,
        paymentMethod: PaymentMethod.ESEWA,
        returnUrl: 'http://localhost:5173/order-success/' + testOrderId,
        userId: testUserId,
      });

      expect(initResult.paymentId).toBeTruthy();
      expect(initResult.paymentMethod).toBe(PaymentMethod.ESEWA);
      expect(initResult.paymentUrl).toBeTruthy();
      expect(initResult.metadata).toBeTruthy();
      expect(initResult.metadata?.signature).toBeTruthy();
      expect(initResult.metadata?.signed_field_names).toBe('total_amount,transaction_uuid,product_code');
    });

    it('3. Should verify valid eSewa payment payload and transition Payment to PAID status', async () => {
      const secretKey = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';
      const productCode = process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST';
      const transactionUuid = `ESEWA-TEST-TX-${Date.now()}`;
      const totalAmountStr = orderTotal.toFixed(2);

      const message = `total_amount=${totalAmountStr},transaction_uuid=${transactionUuid},product_code=${productCode}`;
      const signature = crypto.createHmac('sha256', secretKey).update(message).digest('base64');

      const rawPayload = {
        total_amount: totalAmountStr,
        transaction_uuid: transactionUuid,
        product_code: productCode,
        signature: signature,
        status: 'COMPLETE',
      };

      const verifyResult = await PaymentService.verifyPayment({
        orderId: testOrderId,
        method: PaymentMethod.ESEWA,
        transactionReference: transactionUuid,
        rawPayload,
      });

      expect(verifyResult.paymentStatus).toBe(PaymentStatus.PAID);

      // Check DB record
      const dbPayment = await prisma.payment.findFirst({
        where: { orderId: testOrderId },
        orderBy: { createdAt: 'desc' },
      });
      expect(dbPayment?.paymentStatus).toBe(PaymentStatus.PAID);
    });
  });
}
