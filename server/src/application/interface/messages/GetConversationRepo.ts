import { ConversationProps } from "../../../domain/types/EntityProps";


export interface IGetConversation {
    execute(userId: string): Promise<ConversationProps[]>
}