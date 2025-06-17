import mongoose, { Schema } from "mongoose";
import { ReviewProps } from "../../../domain/types/EntityProps";


const ReviewSchema = new Schema<ReviewProps>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    advocateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    review: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
    },
    createdAt: {
        type: Date,
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
})

export const ReviewModel = mongoose.model<ReviewProps>('Review', ReviewSchema)