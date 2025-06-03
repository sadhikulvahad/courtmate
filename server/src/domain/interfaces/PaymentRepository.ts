import { Payment } from "../entities/Payment";

export interface PaymentRepository {
  create(payment: Payment): Promise<Payment>;
}