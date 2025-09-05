import { ConversationProps } from "../../../domain/types/EntityProps";


export interface ICreateConversation {
    execute(data: { userId: string; participantId: string; participantRole: string; userRole: string }): Promise<ConversationProps>
}