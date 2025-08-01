import { Types } from "mongoose";
import { ConversationRepository } from "../../../domain/interfaces/ConversationRepository";
import { ConversationProps } from "../../../domain/types/EntityProps";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";


@injectable()
export class GetConversationsUseCase {
  constructor(@inject(TYPES.ConversationRepository) private conversationRepository: ConversationRepository) { }

  async execute(userId: string): Promise<ConversationProps[]> {
    try {
      // Fetch conversations where the user is a participant
      const conversations = await this.conversationRepository.getConversationsByUserId(
        new Types.ObjectId(userId)
      );
      return conversations;
    } catch (error) {
      throw new Error(`Failed to fetch conversations: ${(error as Error).message}`);
    }
  }
}