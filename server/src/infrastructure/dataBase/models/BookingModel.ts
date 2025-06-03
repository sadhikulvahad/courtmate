import mongoose, { mongo, Schema } from "mongoose";
import { BookingProps } from "../../../domain/types/EntityProps";


const bookingSchema = new Schema<BookingProps>(
    {
        _id: { type: String, default: () => `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` },
        advocateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        slotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot', required: true },
        date: { type: Date, required: true },
        time: { type: Date, required: true },
        status: {
            type: String,
            enum: ['confirmed', 'pending', 'cancelled', 'postponed', 'expired'],
            required: true,
        },
        roomId: {
            type: String
        },
        notes: { type: String },
        postponeReason: { type: String },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export const BookingModel = mongoose.model<BookingProps>('Booking', bookingSchema);