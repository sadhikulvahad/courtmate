import { ObjectId, Types } from "mongoose";
import { NotificationProps } from "../types/EntityProps";


export class Notification{
    private props : NotificationProps

    constructor (props : NotificationProps){
        if(!props.recieverId || !props.senderId || !props.type || !props.message || !props.createdAt){
            throw new Error ("Required fields are not completed")
        }
        this.props = props
    }

    get id() : string  {
        if(!this.props._id){
            throw new Error ("Id is not available")
        }
        return this.props._id
    }

    get recieverId(): Types.ObjectId | string {
        return this.props.recieverId;
      }
    
      get senderId(): Types.ObjectId | string {
        return this.props.senderId;
      }

    get message(): string{
        return this.props.message
    }

    get type(): string{
        return this.props.type
    }

    get read(): boolean{
        return this.props.read
    }

    get createdAt(): Date{
        return this.props.createdAt
    }

    toJSON() {
        return {
            id: this.props._id,
            recieverId: this.props.recieverId,
            senderId: this.props.senderId,
            message: this.props.message,
            type: this.props.type,
            read: this.props.read,
            createdAt: this.props.createdAt
        };
    }
}