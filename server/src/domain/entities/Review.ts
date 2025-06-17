import { Types } from "mongoose";
import { ReviewProps } from "../types/EntityProps";



export class Review {
    private props : ReviewProps

    private constructor(props: ReviewProps) {
        this.props = props
    }

    static create(props : ReviewProps) : Review {
        if(
            !props.advocateId ||
            !props.userId ||
            !props.createdAt
        ){
            throw new Error('Required fields are empty')
        }

        return new Review(props)
    }

    static fromDB(props: ReviewProps) : Review {
        return new Review(props)
    }

    get id() : string | undefined{
        return this.props._id
    }

    get advocateId(): string | Types.ObjectId {
        return this.props.advocateId
    }

    get userId() : string | Types.ObjectId {
        return this.props.userId
    }

    get review() : string {
        return this.props.review
    }

    get rating() : number {
        return this.props.rating
    }

    get createdAt() : Date {
        return this.props.createdAt
    }

    get isDeleted() : boolean | undefined {
        return this.props.isDeleted
    }

    toJSON() {
        return {
            _id: this.id,
            advocateId : this.advocateId,
            userId : this.userId,
            review : this.review,
            rating: this.rating,
            createdAt: this.createdAt
        }
    }
}