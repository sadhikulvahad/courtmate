import { Types } from "mongoose";
import { MessageModel } from "../models/MessageModel";
import { IMessageRepository } from "../../../domain/interfaces/MessageRepository";
import { MessageProps } from "../../../domain/types/EntityProps";

export class MessageRepositoryImplements implements IMessageRepository {
  async createMessage(message: Omit<MessageProps, "_id">): Promise<MessageProps> {
    try {
      const newMessage = await MessageModel.create({
        conversationId: message.conversationId,
        senderId: message.senderId,
        receiverId: message.receiverId,
        content: message.content,
        senderName: message.senderName,
        timeStamp: message.timeStamp,
        status: message.status,
        attachments: message.attachments,
      });
      return newMessage.toObject() as MessageProps;
    } catch (error) {
      throw new Error(`Failed to create message: ${(error as Error).message}`);
    }
  }

  async getMessagesByConversationId(conversationId: Types.ObjectId): Promise<MessageProps[]> {
    try {
      const messages = await MessageModel.find({
        conversationId,
      })
        .sort({ timeStamp: 1 })
        .lean();
      return messages as MessageProps[];
    } catch (error) {
      throw new Error(`Failed to fetch messages: ${(error as Error).message}`);
    }
  }

  async updateMessageStatus(
    messageId: Types.ObjectId,
    status: "sent" | "delivered" | "read"
  ): Promise<MessageProps> {
    try {
      const updatedMessage = await MessageModel.findByIdAndUpdate(
        messageId,
        { status },
        { new: true }
      ).lean();
      if (!updatedMessage) {
        throw new Error("Message not found");
      }
      return updatedMessage as MessageProps;
    } catch (error) {
      throw new Error(`Failed to update message status: ${(error as Error).message}`);
    }
  }
}