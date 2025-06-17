import { Types } from "mongoose";
import { ConversationProps, Participant } from "../types/EntityProps";

export class Conversation {
    private readonly props: ConversationProps;

    private constructor(props: ConversationProps) {
        this.props = props;
    }

    // Factory method with validation
    static create(props: ConversationProps): Conversation {
        if (!props.participants?.length || !props.participants[0].userId || !props.lastMessage) {
            throw new Error('Required fields are empty or invalid');
        }

        return new Conversation({
            ...props,
            startedAt: props.startedAt ?? new Date(),
        });
    }

    // Factory method for creating from DB without validation
    static fromDB(props: ConversationProps): Conversation {
        return new Conversation(props);
    }

    // Getters
    get id(): string | undefined {
        return this.props._id?.toString();
    }

    get participants(): Participant[] {
        return this.props.participants;
    }

    get startedAt(): Date {
        return this.props.startedAt;
    }

    get lastMessage(): Types.ObjectId | undefined {
        return this.props.lastMessage;
    }

    toJSON() {
        return {
            id: this.id,
            participants: this.participants,
            startedAt: this.startedAt,
            lastMessage: this.lastMessage
        }
    }
}
