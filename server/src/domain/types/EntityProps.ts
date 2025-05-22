import { ObjectId, Types } from "mongoose";
import { Address } from "./Address";
import { AuthMethod } from "./AuthMethod";
import { RoleType } from "./RoleTypes";
import { Status, TypeOfNotification } from "./status";

export type UserProps = {
    _id?: string;
    name: string;
    email: string;
    phone?: string;
    password?: string;
    role: RoleType;
    googleId?: string
    authMethod: AuthMethod
    isActive: boolean;
    isVerified: boolean
    isAdminVerified: Status
    verifiedAt?: Date
    isBlocked: boolean
    address?: Address;
    certification?: string;
    bio?: string;
    typeOfLawyer?: string
    typeOfAdvocate?: string;
    experience?: number;
    category?: string;
    practicingField?: string;
    profilePhoto?: string;
    bciCertificate?: string
    barCouncilIndia?: string;
    barCouncilRegisterNumber?: string;
    age?: number;
    languages?: string[];
    DOB?: string
    onlineConsultation?: boolean
    savedAdvocates?: Types.ObjectId[];
}

export type NotificationProps = {
    _id?: string;
    recieverId: Types.ObjectId | string;
    senderId: Types.ObjectId | string;
    message: string;
    type: TypeOfNotification;
    read: boolean;
    createdAt: Date;
}

export interface BookingProps {
    _id?: string; // Optional for new bookings
    advocateId: string;
    userId: string;
    slotId: string;
    date: Date;
    time: Date;
    status: 'confirmed' | 'pending' | 'cancelled' | 'postponed';
    notes?: string;
    postponeReason?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface SlotProps {
  _id?: string;
  advocateId: string;
  date: Date;
  time: Date;
  isAvailable: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}