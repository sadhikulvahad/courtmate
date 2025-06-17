import { Types } from "mongoose";
import { ConversationProps } from "../types/EntityProps";

export interface ConversationRepository {
    getConversationsByUserId(userId: Types.ObjectId): Promise<ConversationProps[]>;
    createConversation(conversation: Omit<ConversationProps, "_id">): Promise<ConversationProps>;
    updateLastMessage(conversationId: Types.ObjectId, messageId: Types.ObjectId): Promise<void>;
    findConversationBetweenParticipants(userAId: Types.ObjectId, userBId: Types.ObjectId): Promise<ConversationProps | null>;

}