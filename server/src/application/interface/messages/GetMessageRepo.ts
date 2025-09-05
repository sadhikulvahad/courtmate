import { MessageProps } from "../../../domain/types/EntityProps";


export interface IGetMessages {
    execute(conversationId: string): Promise<MessageProps[]>
}