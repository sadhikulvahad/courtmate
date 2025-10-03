import { Types } from "mongoose";
import { MessageProps } from "../types/EntityProps";

export interface IMessageRepository {
  createMessage(message: Omit<MessageProps, "_id">): Promise<MessageProps>;
  getMessagesByConversationId(conversationId: Types.ObjectId): Promise<MessageProps[]>;
  updateMessageStatus(messageId: Types.ObjectId, status: "sent" | "delivered" | "read"): Promise<MessageProps>;
  deleteMessage(messageId : string) : Promise<void>
}