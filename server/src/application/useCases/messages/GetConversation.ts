import { Types } from "mongoose";
import { IConversationRepository } from "../../../domain/interfaces/ConversationRepository";
import { ConversationProps } from "../../../domain/types/EntityProps";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";
import { IGetConversation } from "../../../application/interface/messages/GetConversationRepo";


@injectable()
export class GetConversationsUseCase implements IGetConversation {
  constructor(
    @inject(TYPES.IConversationRepository) private _conversationRepository: IConversationRepository
  ) { }

  async execute(userId: string): Promise<ConversationProps[]> {
    try {
      // Fetch conversations where the user is a participant
      const conversations = await this._conversationRepository.getConversationsByUserId(
        new Types.ObjectId(userId)
      );
      return conversations;
    } catch (error) {
      throw new Error(`Failed to fetch conversations: ${(error as Error).message}`);
    }
  }
}