import mongoose, { Schema } from "mongoose";
import { NotificationProps } from "../../../domain/types/EntityProps";

const NotificaitonSchema = new Schema<NotificationProps>(
    {
        recieverId :{
            type : mongoose.Schema.Types.ObjectId,
            required :true
        },
        senderId :{
            type : mongoose.Schema.Types.ObjectId,
            required : true
        },
        message : {
            type : String,
            required : true
        },
        type : {
            type : String,
            enum : ['Reminder', 'Notification', 'Alert'],
            required : true
        },
        read: {
            type : Boolean,
            required : true,
            default : false
        },
        createdAt :{
            type : Date,
            required : true,
            default : Date.now()
        }
    }
)


export default mongoose.model<NotificationProps>('Notification', NotificaitonSchema)