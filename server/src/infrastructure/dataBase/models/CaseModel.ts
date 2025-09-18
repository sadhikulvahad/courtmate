
import mongoose, { Schema } from "mongoose";
import { CaseProps } from "../../../domain/types/EntityProps";
import { v4 as uuidv4 } from "uuid";

const generateCaseId = () => `case-${uuidv4().split("-")[0]}`;

const CaseSchema = new Schema<CaseProps>({
    caseId: {
        type: String,
        unique: true,
        index: true,
        required: true
    },
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

CaseSchema.pre("validate", function (next) {
    if (!this.caseId) {
        this.caseId = `case-${uuidv4().split("-")[0]}`;
    }
    next();
});

export const CaseModel = mongoose.model<CaseProps>("Case", CaseSchema);