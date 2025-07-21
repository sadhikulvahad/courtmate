import { Types } from "mongoose";
import { MessageRepository } from "../../../domain/interfaces/MessageRepository";
import { MessageProps } from "../../../domain/types/EntityProps";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";


@injectable()
export class UpdateMessageStatusUseCase {
  constructor(@inject(TYPES.MessageRepository) private messageRepository: MessageRepository) { }

  async execute(
    messageId: string,
    status: "sent" | "delivered" | "read"
  ): Promise<MessageProps> {
    try {
      if (!messageId || !status) {
        throw new Error("Message ID and status are required");
      }

      const updatedMessage = await this.messageRepository.updateMessageStatus(
        new Types.ObjectId(messageId),
        status
      );
      return updatedMessage;
    } catch (error) {
      throw new Error(`Failed to update message status: ${(error as Error).message}`);
    }
  }
}