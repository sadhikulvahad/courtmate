import { IPaymentRepository } from "../../domain/interfaces/PaymentRepository";
import { PaymentProps } from "../../domain/types/EntityProps";
import { Payment } from "../../domain/entities/Payment";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { IPaymentUsecase } from "../../application/interface/PaymentUsecaseRepo";


@injectable()
export class PaymentUsecase implements IPaymentUsecase {
  constructor(
    @inject(TYPES.IPaymentRepository) private _paymentRepository: IPaymentRepository
  ) { }

  async execute(bookingData: PaymentProps): Promise<Payment> {
    try {
      const payment = Payment.create(bookingData);
      const savedPayment = await this._paymentRepository.create(payment);
      return savedPayment;
    } catch (error) {
      throw new Error("Failed to create payment: " + (error as Error).message);
    }
  }
}
