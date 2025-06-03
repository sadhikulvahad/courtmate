
import { isBefore, isValid, startOfDay } from 'date-fns';
import { PaymentProps } from '../types/EntityProps';
import { Types } from 'mongoose';


export class Payment {
    private props: PaymentProps;

    private constructor(props: PaymentProps) {
        if (!props.advocateId || !props.bookId || !props.sessionId || !props.slotId || !props.userId) {
            throw new Error('Required fields are missing');
        }

        this.props = props;
    }

    static create(props: PaymentProps): Payment {
        return new Payment(props);
    }

    get id(): string {
        return this.props._id?.toString() ?? '';
    }

    get sessioId(): string {
        return this.props.sessionId
    }

    get userId(): string {
        return this.props.userId.toString()
    }

    get advocateId(): string {
        return this.props.advocateId.toString();
    }

    get slotId(): string {
        return this.props.slotId.toString()
    }

    get bookId(): string {
        return this.props.bookId
    }

    get amount(): number | null {
        return this.props.amount
    }

    get status(): string {
        return this.props.status
    }

    toJSON() {
        return {
            id: this.id,
            sessioId: this.sessioId,
            userId: this.userId,
            advocateId: this.advocateId,
            slotId: this.slotId,
            bookId: this.bookId,
            amount: this.amount,
            status: this.status
        };
    }
}