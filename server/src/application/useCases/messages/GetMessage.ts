import { Types } from "mongoose";
import { MessageRepository } from "../../../domain/interfaces/MessageRepository";
import { MessageProps } from "../../../domain/types/EntityProps";

export class GetMessagesUseCase {
  constructor(private messageRepository: MessageRepository) {}

  async execute(conversationId: string): Promise<MessageProps[]> {
    try {
      if (!conversationId) {
        throw new Error("Conversation ID is required");
      }

      const messages = await this.messageRepository.getMessagesByConversationId(
        new Types.ObjectId(conversationId)
      );
      return messages;
    } catch (error) {
      throw new Error(`Failed to fetch messages: ${(error as Error).message}`);
    }
  }
}