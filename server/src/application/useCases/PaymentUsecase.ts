import { PaymentRepository } from "../../domain/interfaces/PaymentRepository";
import { PaymentProps } from "../../domain/types/EntityProps";
import { Payment } from "../../domain/entities/Payment";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";


@injectable()
export class PaymentUsecase {
  constructor(@inject(TYPES.PaymentRepository) private paymentRepository: PaymentRepository) { }

  async execute(bookingData: PaymentProps): Promise<Payment> {
    try {
      const payment = Payment.create(bookingData);
      const savedPayment = await this.paymentRepository.create(payment);
      return savedPayment;
    } catch (error) {
      throw new Error("Failed to create payment: " + (error as Error).message);
    }
  }
}
