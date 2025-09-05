import { Payment } from "../../../domain/entities/Payment";
import { IPaymentRepository } from "../../../domain/interfaces/PaymentRepository";
import { PaymentModel } from "../models/PaymentModel";

export class PaymentRepositoryImplement implements IPaymentRepository {
    async create(payment: Payment): Promise<Payment> {
        try {
            const newPayment = new PaymentModel(payment.toJSON());
            const savedDoc = await newPayment.save();

            // Convert mongoose doc to domain entity
            const paymentEntity = Payment.create({
                _id: savedDoc._id,
                sessionId: savedDoc.sessionId,
                userId: savedDoc.userId,
                advocateId: savedDoc.advocateId,
                slotId: savedDoc.slotId,
                bookId: savedDoc.bookId,
                amount: savedDoc.amount,
                status: savedDoc.status
            });

            return paymentEntity;
        } catch (err: any) {
            if (err.code === 11000 && err.keyPattern?._id) {
                throw new Error('Duplicate slot: a slot with this ID already exists');
            }
            throw new Error('Error saving slot: ' + err.message);
        }
    }
}
