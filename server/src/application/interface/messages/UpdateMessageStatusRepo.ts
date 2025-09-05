import { MessageProps } from "../../../domain/types/EntityProps";


export interface IUpdateMessageStatus {
    execute(messageId: string, status: "sent" | "delivered" | "read"): Promise<MessageProps>
}