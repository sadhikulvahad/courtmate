import mongoose, { Schema } from "mongoose";
import { PaymentProps } from "../../../domain/types/EntityProps";




const PaymentSchema = new Schema<PaymentProps>(
    {
        sessionId: { type: String },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        advocateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        slotId: { type: mongoose.Schema.Types.ObjectId,ref:'Slot', required: true },
        bookId: {type: String, ref: 'Booking', required: true},
        amount: { type: Number, required: true },
        status: { type: String, required: true }
    },
    { timestamps: true },
);

export const PaymentModel = mongoose.model<PaymentProps>('Payment', PaymentSchema);
