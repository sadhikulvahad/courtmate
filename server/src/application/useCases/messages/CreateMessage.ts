import { Types } from "mongoose";
import { IMessageRepository } from "../../../domain/interfaces/MessageRepository";
import { IConversationRepository } from "../../../domain/interfaces/ConversationRepository";
import { MessageProps } from "../../../domain/types/EntityProps";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";
import { S3Service } from "../../../infrastructure/web/s3Credential";
import { ICreateMessage } from "../../../application/interface/messages/CreateMessageRepo";


@injectable()
export class CreateMessageUseCase implements ICreateMessage {
  constructor(
    @inject(TYPES.IMessageRepository) private _messageRepository: IMessageRepository,
    @inject(TYPES.IConversationRepository) private _conversationRepository: IConversationRepository,
    @inject(TYPES.S3Service) private _s3Service: S3Service
  ) { }

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
      const savedMessage = await this._messageRepository.createMessage(message);


      await this._conversationRepository.updateLastMessage(
        new Types.ObjectId(message.conversationId),
        new Types.ObjectId(savedMessage._id)
      );


      if (savedMessage.attachments && savedMessage.attachments.length > 0) {
        const updatedAttachments = await Promise.all(
          savedMessage.attachments.map(async (attachment) => {
            const signedUrl = await this._s3Service.generateSignedUrl(attachment.fileUrl);
            return {
              ...attachment,
              fileUrl: signedUrl,
            };
          })
        );
        savedMessage.attachments = updatedAttachments;
      }


      return savedMessage;
    } catch (error) {
      throw new Error(`Failed to create message: ${(error as Error).message}`);
    }
  }
}