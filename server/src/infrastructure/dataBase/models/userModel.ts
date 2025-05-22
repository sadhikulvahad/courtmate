
import mongoose, { Schema, Document, Types } from "mongoose";
import { UserProps } from "../../../domain/types/EntityProps";

const userSchema = new Schema<UserProps>(
    {
        name : {
            type: String,
            required: true,
        },
        email :{
            type :String,
            required: true,
            unique : true
        },
        phone: {
            type: String,
            required: false,
            unique : true,
            sparse: true
        },
        password: {
            type: String,
            required: false,
        },
        role: {
            type: String,
            enum : ["user", "admin", "advocate"],
            required: true
        },
        authMethod:{
            type: String,
            required : true,
            default: 'local'
        },
        googleId:{
            type:String,
            sparse : true,
            unique: true,
            required: false
        },
        isActive:{
            type: Boolean,
            default : false
        },
        isVerified:{
            type: Boolean,
            default: false
        },
        isAdminVerified: {
            type:String,
            enum: ['Request' , 'Pending' , 'Accepted', 'Rejected'],
            default: 'Request'
        },
        verifiedAt:{
            type: Date,
        },
        address:{
            street :{
                type : String
            },
            city:{
                type: String
            },
            state:{
                type: String
            },
            country :{
                type: String
            },
            pincode:{
                type: String
            }
        },
        certification: {
            type: String,

        },
        bio:{
            type: String
        },
        typeOfLawyer :{
            type: String
        },
        experience:{
            type: Number,
            default:0
        },
        category: {
            type: String
        },
        practicingField :{
            type :String
        },
        profilePhoto:{
            type: String
        },
        bciCertificate:{
            type : String
        },
        barCouncilIndia:{
            type: String
        },
        barCouncilRegisterNumber :{
            type: String
        },
        isBlocked:{
            type: Boolean,
            default: false
        },
        age:{
            type :Number
        },
        languages:{
            type: [String], 
            default :[]
        },
        DOB:{
            type: String
        },
        onlineConsultation :{
            type: Boolean
        },
        savedAdvocates :{
            type : [Types.ObjectId],
            default :[]
        }
    },
    {timestamps: true}
)

export default mongoose.model<UserProps>("User", userSchema)

