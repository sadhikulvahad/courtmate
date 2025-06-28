
import mongoose, { Schema } from "mongoose";
import { CaseProps, MessageProps } from "../../../domain/types/EntityProps";

const CaseSchema = new Schema<CaseProps>({
    advocateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
    },
    clientName: {
        type: String,
        required: true,
    },
    caseType: {
        type: String,
        required: true,
    },
    priority: {
        type: String,
        required: true,
    },
    nextHearingDate: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    hearingHistory: [{
        type: Date,
        default: []
    }]
}, { timestamps: true });

export const CaseModel = mongoose.model<CaseProps>("Case", CaseSchema);