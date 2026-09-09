import { PaymentMethod } from '@prisma/client';
import { IPaymentGateway } from './payment.interface.js';
import { CashPaymentGateway } from './cash.gateway.js';
import { KhaltiPaymentGateway } from './khalti.gateway.js';
import { FonepayPaymentGateway, CardPaymentGateway } from './fonepay.gateway.js';
import { ApiError } from '../../../utils/ApiError.js';

export class PaymentGatewayFactory {
  private static gateways: Map<PaymentMethod, IPaymentGateway> = new Map<PaymentMethod, IPaymentGateway>([
    [PaymentMethod.CASH, new CashPaymentGateway() as IPaymentGateway],
    [PaymentMethod.KHALTI, new KhaltiPaymentGateway() as IPaymentGateway],
    [PaymentMethod.FONEPAY_QR, new FonepayPaymentGateway() as IPaymentGateway],
    [PaymentMethod.CARD, new CardPaymentGateway() as IPaymentGateway],
  ]);

  static getGateway(method: PaymentMethod): IPaymentGateway {
    const gateway = this.gateways.get(method);
    if (!gateway) {
      throw ApiError.badRequest(`Unsupported payment method: ${method}`);
    }
    return gateway;
  }
}
