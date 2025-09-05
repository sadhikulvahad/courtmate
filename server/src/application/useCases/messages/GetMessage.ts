import { Types } from "mongoose";
import { IMessageRepository } from "../../../domain/interfaces/MessageRepository";
import { MessageProps } from "../../../domain/types/EntityProps";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";
import { S3Service } from "../../../infrastructure/web/s3Credential";
import { IGetMessages } from "../../../application/interface/messages/GetMessageRepo";


@injectable()
export class GetMessagesUseCase implements IGetMessages {
  constructor(
    @inject(TYPES.IMessageRepository) private _messageRepository: IMessageRepository,
    @inject(TYPES.S3Service) private _s3Service: S3Service
  ) { }

  async execute(conversationId: string): Promise<MessageProps[]> {
    try {
      if (!conversationId) {
        throw new Error("Conversation ID is required");
      }

      const messages = await this._messageRepository.getMessagesByConversationId(
        new Types.ObjectId(conversationId)
      );

      const mappedMessages = await Promise.all(
        messages.map(async (message) => {
          if (Array.isArray(message.attachments) && message.attachments.length > 0) {
            const signedUrl = await this._s3Service.generateSignedUrl(message.attachments[0].fileUrl!);
            message.attachments[0].fileUrl = signedUrl;
          }
          return message;
        })
      );

      return mappedMessages;
    } catch (error) {
      throw new Error(`Failed to fetch messages: ${(error as Error).message}`);
    }
  }
}