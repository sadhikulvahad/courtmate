import { TransactionProps } from "domain/types/EntityProps";
import mongoose, { Schema } from "mongoose";


const TransactionSchema = new Schema<TransactionProps>({
    walletId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet',
        required: true
    },
    amount: {
        type: Number,
    },
    type: {
        type: String,
        enum: ['credit', 'debit']
    },
    date: {
        type: Date,
        default: Date.now()
    },
    description: {
        type: String,
        required: false
    },
    advocateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    }
})

export default mongoose.model<TransactionProps>('Transaction', TransactionSchema)