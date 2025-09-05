import { HearingDetailsProps } from "domain/types/EntityProps";
import mongoose, { Schema } from "mongoose";

const HearingDetailsSchema = new Schema<HearingDetailsProps>({
    caseId: { type: Schema.Types.ObjectId, ref: "Case", required: true },
    advocateId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    clientId: { type: Schema.Types.ObjectId, ref: "User", required: false },

    date: { type: Date, required: true },
    time: { type: String },
    courtName: { type: String },
    courtRoom: { type: String },
    judgeName: { type: String },

    status: {   
        type: String,
        enum: ["Scheduled", "Adjourned", "Completed", "Pending"],
        default: "Scheduled",
    },
    nextHearingDate: { type: Date },
    hearingOutcome: { type: String },
    isClosed: { type: Boolean, default: false },

    advocateNotes: { type: String },
    clientInstructions: { type: String },
    documentsSubmitted: [{ type: String, required: false }],
    isDeleted: {
        type: Boolean,          
        default: false
    }

}, { timestamps: true });

export default mongoose.model<HearingDetailsProps>('HearingDetails', HearingDetailsSchema);
