import { prisma } from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { PaymentGatewayFactory } from './gateways/payment.factory.js';
import {
  PaymentMethod,
  PaymentStatus,
  BillStatus,
  OrderStatus,
  NotificationType,
} from '@prisma/client';

export class PaymentService {
  /**
   * Initiate a payment for an Order / Bill
   */
  static async initiatePayment(data: {
    orderId: string;
    paymentMethod: PaymentMethod;
    returnUrl?: string;
    userId?: string;
  }) {
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
      include: {
        bill: true,
        delivery: true,
        user: { select: { name: true, email: true, phoneNumber: true } },
      },
    });

    if (!order) throw ApiError.notFound('Order not found');

    const totalAmount = Number(order.totalAmount);
    const billNumber = order.bill?.billNumber || `BILL-${order.orderNumber}`;

    const customerInfo = {
      name: order.delivery?.recipientName || order.user?.name || 'Customer',
      email: order.user?.email || 'customer@ktmbotanica.com',
      phone: order.delivery?.recipientPhone || order.user?.phoneNumber || '9800000000',
    };

    // 1. Get Payment Gateway Strategy
    const gateway = PaymentGatewayFactory.getGateway(data.paymentMethod);

    // 2. Gateway Initiation
    const gatewayResponse = await gateway.initiate({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: totalAmount,
      billNumber,
      customerInfo,
      returnUrl: data.returnUrl,
    });

    // 3. Create or update Payment record (Never delete payment records!)
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        billId: order.bill?.id,
        paymentMethod: data.paymentMethod,
        paymentStatus: PaymentStatus.PENDING,
        amount: totalAmount,
        transactionReference: gatewayResponse.transactionReference || gatewayResponse.pidx,
        gatewayResponse: gatewayResponse.metadata || {},
      },
    });

    return {
      paymentId: payment.id,
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: totalAmount,
      billNumber,
      paymentMethod: data.paymentMethod,
      paymentUrl: gatewayResponse.paymentUrl,
      qrData: gatewayResponse.qrData,
      pidx: gatewayResponse.pidx,
      transactionReference: gatewayResponse.transactionReference,
      instructions: gatewayResponse.instructions,
      expiresAt: gatewayResponse.expiresAt,
      metadata: gatewayResponse.metadata,
    };
  }

  /**
   * Verify Payment Server-Side
   * Never trust client reports; verifies with gateway and atomically updates Bill and Order.
   */
  static async verifyPayment(data: {
    paymentId?: string;
    orderId?: string;
    transactionReference?: string;
    pidx?: string;
    token?: string;
    method?: PaymentMethod;
    rawPayload?: any;
    userId?: string;
  }) {
    // 1. Locate existing Payment record
    let payment = null;

    if (data.paymentId) {
      payment = await prisma.payment.findUnique({
        where: { id: data.paymentId },
        include: { order: { include: { bill: true } } },
      });
    } else if (data.orderId) {
      payment = await prisma.payment.findFirst({
        where: { orderId: data.orderId },
        orderBy: { createdAt: 'desc' },
        include: { order: { include: { bill: true } } },
      });
    } else if (data.transactionReference || data.pidx) {
      payment = await prisma.payment.findFirst({
        where: { transactionReference: data.transactionReference || data.pidx },
        orderBy: { createdAt: 'desc' },
        include: { order: { include: { bill: true } } },
      });
    }

    if (!payment) {
      throw ApiError.notFound('Payment record not found for verification');
    }

    const order = payment.order;
    const paymentMethod = data.method || payment.paymentMethod;

    // 2. Execute Gateway-specific verification
    const gateway = PaymentGatewayFactory.getGateway(paymentMethod);
    const verification = await gateway.verify({
      paymentId: payment.id,
      orderId: order.id,
      transactionReference: data.transactionReference || payment.transactionReference || undefined,
      pidx: data.pidx,
      token: data.token,
      amount: Number(payment.amount),
      rawPayload: data.rawPayload,
    });

    // 3. Atomically update Payment, Bill, and Order status in a single transaction
    return prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          paymentStatus: verification.paymentStatus,
          transactionReference: verification.transactionReference,
          paidAt: verification.paymentStatus === PaymentStatus.PAID ? new Date() : null,
          gatewayResponse: verification.gatewayResponse || {},
        },
      });

      if (verification.paymentStatus === PaymentStatus.PAID) {
        // Update Bill to PAID
        if (order.bill?.id) {
          await tx.bill.update({
            where: { id: order.bill.id },
            data: {
              status: BillStatus.PAID,
              paidAt: new Date(),
            },
          });
        }

        // Add immutable OrderStatusHistory
        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            fromStatus: order.status,
            toStatus: order.status,
            comment: `Online payment of Rs. ${Number(payment.amount).toLocaleString()} verified via ${paymentMethod} (${verification.transactionReference})`,
            changedByUserId: data.userId,
          },
        });

        // Send Customer Notification
        if (order.userId) {
          await tx.notification.create({
            data: {
              userId: order.userId,
              title: `Payment Received: Rs. ${Number(payment.amount).toLocaleString()}`,
              message: `Your payment for order ${order.orderNumber} was successfully verified via ${paymentMethod}.`,
              type: NotificationType.ORDER_STATUS,
              linkUrl: `/order-success/${order.id}`,
            },
          });
        }
      }

      return {
        success: verification.success,
        paymentStatus: updatedPayment.paymentStatus,
        transactionReference: updatedPayment.transactionReference,
        amount: Number(updatedPayment.amount),
        orderNumber: order.orderNumber,
        message: verification.message,
      };
    });
  }

  /**
   * Handle Webhook / Instant Payment Notification (IPN)
   */
  static async processWebhook(method: PaymentMethod, headers: any, body: any) {
    const gateway = PaymentGatewayFactory.getGateway(method);
    const webhookResult = await gateway.processWebhook({ headers, body });

    if (!webhookResult.transactionReference) {
      throw ApiError.badRequest('Webhook missing transaction reference');
    }

    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { transactionReference: webhookResult.transactionReference },
          { id: webhookResult.paymentId },
          { orderId: webhookResult.orderId },
        ],
      },
      include: { order: true },
    });

    if (payment) {
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            paymentStatus: webhookResult.status,
            paidAt: webhookResult.status === PaymentStatus.PAID ? new Date() : undefined,
            gatewayResponse: webhookResult.rawResponse || {},
          },
        });

        if (webhookResult.status === PaymentStatus.PAID) {
          await tx.bill.updateMany({
            where: { orderId: payment.orderId },
            data: { status: BillStatus.PAID, paidAt: new Date() },
          });

          await tx.orderStatusHistory.create({
            data: {
              orderId: payment.orderId,
              fromStatus: payment.order.status,
              toStatus: payment.order.status,
              comment: `Payment confirmed via webhook (${method}: ${webhookResult.transactionReference})`,
            },
          });
        }
      });
    }

    return {
      received: true,
      transactionReference: webhookResult.transactionReference,
      status: webhookResult.status,
    };
  }

  /**
   * Mark Cash on Delivery Payment as Paid (Staff/Rider Workflow)
   */
  static async markCashPaymentPaid(paymentId: string, adminUserId?: string, reference?: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });

    if (!payment) throw ApiError.notFound('Payment record not found');

    if (payment.paymentStatus === PaymentStatus.PAID) {
      return { message: 'Payment is already marked as PAID' };
    }

    return prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          paymentStatus: PaymentStatus.PAID,
          paidAt: new Date(),
          transactionReference: reference || `CASH-COLLECTED-${Date.now()}`,
          gatewayResponse: {
            collectedByUserId: adminUserId,
            collectedAt: new Date().toISOString(),
          },
        },
      });

      await tx.bill.updateMany({
        where: { orderId: payment.orderId },
        data: { status: BillStatus.PAID, paidAt: new Date() },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: payment.orderId,
          fromStatus: payment.order.status,
          toStatus: payment.order.status,
          comment: `Cash of Rs. ${Number(payment.amount).toLocaleString()} collected on delivery`,
          changedByUserId: adminUserId,
        },
      });

      return updatedPayment;
    });
  }

  /**
   * Get Payment details
   */
  static async getPaymentDetails(id: string) {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
            userId: true,
          },
        },
        bill: true,
      },
    });

    if (!payment) throw ApiError.notFound('Payment not found');
    return payment;
  }

  /**
   * Get all Payments for an Order (Historical audit records)
   */
  static async getPaymentsByOrder(orderId: string) {
    return prisma.payment.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
      include: { bill: true },
    });
  }
}
