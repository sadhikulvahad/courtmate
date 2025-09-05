import { MessageProps } from "../../../domain/types/EntityProps";


export interface ICreateMessage {
    execute(message: Omit<MessageProps, "_id">): Promise<MessageProps>
}