import mongoose, { Schema } from "mongoose";
import { MessageProps } from "../../../domain/types/EntityProps";

const MessageSchema = new Schema<MessageProps>({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true,
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    content: {
        type: String,
        required: [
            function (this: MessageProps) {
                return !this.attachments?.length; // Require content only if no attachments
            },
            "Content is required when no attachments are provided",
        ],
    },
    senderName: {
        type: String,
        required: true,
    },
    timeStamp: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ["sent", "delivered", "read"],
        default: "sent",
    },
    attachments: {
        type: [
            {
                fileUrl: { type: String, required: true },
                fileName: { type: String },
                fileType: { type: String, enum: ["image", "file"] },
            },
        ],
        default: [],
    },
});

export const MessageModel = mongoose.model<MessageProps>("Message", MessageSchema);