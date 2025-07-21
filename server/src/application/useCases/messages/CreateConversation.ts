import { Types } from "mongoose";
import { ConversationRepository } from "../../../domain/interfaces/ConversationRepository";
import userModel from "../../../infrastructure/dataBase/models/UserModel";
import { ConversationProps } from "../../../domain/types/EntityProps";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";


@injectable()
export class CreateConversationUseCase {
  constructor(@inject(TYPES.ConversationRepository) private conversationRepository: ConversationRepository) { }

  async execute(data: { userId: string; participantId: string; participantRole: string; userRole: string }) {
    const { userId, participantId, participantRole, userRole } = data;

    if (!userId || !participantId || !participantRole || !userRole) {
      throw new Error("Missing required fields");
    }

    const participant = await userModel.findById(participantId);
    if (!participant || participant.role !== participantRole) {
      throw new Error("Invalid participant");
    }

    const userObjectId = new Types.ObjectId(userId);
    const participantObjectId = new Types.ObjectId(participantId);

    const existingConversation = await this.conversationRepository.findConversationBetweenParticipants(
      userObjectId,
      participantObjectId
    );

    if (existingConversation) {
      return existingConversation;
    }

    const conversationData: Omit<ConversationProps, "_id"> = {
      participants: [
        { userId: userObjectId, role: userRole },
        { userId: participantObjectId, role: participantRole },
      ],
      startedAt: new Date(),
    };

    return this.conversationRepository.createConversation(conversationData);
  }
}
