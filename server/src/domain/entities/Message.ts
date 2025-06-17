import { MessageProps } from "../types/EntityProps";


export class Message {
    private props: MessageProps

    private constructor(props: MessageProps) {
        this.props = props
    }

    static create(props: MessageProps): Message {
        if (!props.conversationId || !props.senderId || !props.content) {
            throw new Error("Required fields are empty");
        }

        return new Message({
            ...props,
            timeStamp: props.timeStamp ?? new Date(), 
            status: props.status ?? "sent",           
        });
    }

    static fromDB(props: MessageProps): Message {
        return new Message(props)
    }

    get id(): string | undefined {
        return this.props._id?.toString();
    }

    get ConversationId(): string {
        return this.props.conversationId.toString()
    }

    get senderId(): string {
        return this.props.senderId.toString()
    }

    get content(): string {
        return this.props.content
    }

    get timeStamp(): Date {
        return this.props.timeStamp
    }

    get status(): string {
        return this.props.status
    }

    toJSON() {
        return {
            id: this.id,
            conversationId: this.ConversationId,
            senderId: this.senderId,
            content: this.content,
            timeStamp: this.timeStamp,
            status: this.status
        }
    }
}