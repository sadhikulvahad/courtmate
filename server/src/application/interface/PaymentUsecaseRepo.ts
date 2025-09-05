
import { Payment } from "../../domain/entities/Payment";
import { PaymentProps } from "../../domain/types/EntityProps";


export interface IPaymentUsecase {
    execute(bookingData: PaymentProps): Promise<Payment>
}