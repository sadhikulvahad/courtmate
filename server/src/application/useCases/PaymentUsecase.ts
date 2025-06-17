import { PaymentRepository } from "../../domain/interfaces/PaymentRepository";
import { PaymentProps } from "../../domain/types/EntityProps";
import { Payment } from "../../domain/entities/Payment";

export class PaymentUsecase {
  constructor(private paymentRepository: PaymentRepository) {}

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
