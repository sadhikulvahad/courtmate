import { Types } from "mongoose";
import { MessageRepository } from "../../../domain/interfaces/MessageRepository";
import { ConversationRepository } from "../../../domain/interfaces/ConversationRepository";
import { MessageProps } from "../../../domain/types/EntityProps";

export class CreateMessageUseCase {
  constructor(
    private messageRepository: MessageRepository,
    private conversationRepository: ConversationRepository
  ) {}

  async execute(message: Omit<MessageProps, "_id">): Promise<MessageProps> {
    try {
      // Validate inputs
      if (
        !message.conversationId ||
        !message.senderId ||
        !message.receiverId ||
        !message.senderName ||
        (!message.content && !message.attachments?.length) // Allow empty content if attachments exist
      ) {
        throw new Error("Missing required message fields");
      }

      // Save the message
      const savedMessage = await this.messageRepository.createMessage(message);

      // Update the conversation's lastMessage
      await this.conversationRepository.updateLastMessage(
        new Types.ObjectId(message.conversationId),
        new Types.ObjectId(savedMessage._id)
      );

      return savedMessage;
    } catch (error) {
      throw new Error(`Failed to create message: ${(error as Error).message}`);
    }
  }
}