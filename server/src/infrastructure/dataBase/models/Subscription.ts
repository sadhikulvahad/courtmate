


import mongoose, { Schema } from "mongoose";
import { SubscriptionProps } from "../../../domain/types/EntityProps";

const SubscriptionSchema = new Schema<SubscriptionProps>({
    advocateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    plan: {
        type: String,
        enum: ['basic', 'professional', 'enterprise'],
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    billingCycle: {
        type: String,
        enum: ['monthly', 'yearly'],
        default: 'monthly',
        required: true,
    },
    nextBillingDate: {
        type: Date,
        required: true
    },
}, { timestamps: true });

export const SubscriptionModel = mongoose.model<SubscriptionProps>("Subscription", SubscriptionSchema);