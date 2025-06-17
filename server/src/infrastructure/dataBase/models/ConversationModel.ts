import mongoose, { Schema } from "mongoose";
import { ConversationProps } from "../../../domain/types/EntityProps";



const ConversationSchema = new Schema<ConversationProps>(
    {
        participants: [{
            userId : {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
            role: {type: String, enum :['user', 'advocate']},
        }],
        startedAt : {type : Date, default : Date.now},
        lastMessage: {type: mongoose.Schema.Types.ObjectId, ref: 'Message'}
    }
)

export const ConversationModel = mongoose.model<ConversationProps>('Conversation', ConversationSchema)