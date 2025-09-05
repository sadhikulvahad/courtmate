import { Types } from "mongoose";
import { IMessageRepository } from "../../../domain/interfaces/MessageRepository";
import { MessageProps } from "../../../domain/types/EntityProps";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";
import { IUpdateMessageStatus } from "../../../application/interface/messages/UpdateMessageStatusRepo";


@injectable()
export class UpdateMessageStatusUseCase implements IUpdateMessageStatus {
  constructor(
    @inject(TYPES.IMessageRepository) private _messageRepository: IMessageRepository
  ) { }

  async execute(
    messageId: string,
    status: "sent" | "delivered" | "read"
  ): Promise<MessageProps> {
    try {
      if (!messageId || !status) {
        throw new Error("Message ID and status are required");
      }

      const updatedMessage = await this._messageRepository.updateMessageStatus(
        new Types.ObjectId(messageId),
        status
      );
      return updatedMessage;
    } catch (error) {
      throw new Error(`Failed to update message status: ${(error as Error).message}`);
    }
  }
}