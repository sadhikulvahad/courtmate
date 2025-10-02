import { IUpdateUnreadCountRepo } from "../../../application/interface/messages/UpdateUnreadCountRepo";
import { IConversationRepository } from "../../../domain/interfaces/ConversationRepository";
import { ConversationProps } from "../../../domain/types/EntityProps";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";


@injectable()

export class UpdateUnreadCount implements IUpdateUnreadCountRepo {
    constructor(
        @inject(TYPES.IUpdateUnreadCount) private _conversationRepository: IConversationRepository,
    ) {}

    async execute(conversationId: string): Promise<void> {
        try {
            await this._conversationRepository.updateUnreaadCount(conversationId)
        } catch (error) {
            throw new Error(`Failed to update count message: ${(error as Error).message}`);
        }
    }
}