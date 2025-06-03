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

export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'postponed' | 'expired' ;

export interface BookingProps {
  _id?: string;
  advocateId: string | Types.ObjectId | {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  userId: Types.ObjectId | string;
  slotId: Types.ObjectId | string;
  date: Date;
  time: Date;
  status: BookingStatus;
  roomId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  notes?: string;
  postponeReason?: string;
}

export interface SlotProps {
  _id?: string;
  advocateId: Types.ObjectId | string;
  date: Date;
  time: Date;
  isAvailable: boolean;
  status : BookingStatus
}
export type Frequency = 'daily' | 'weekly' | 'monthly';

export interface RecurringRuleProps {
  _id?: string;
  advocateId: Types.ObjectId | string;
  description: string;
  startDate: string; // ISO string, e.g., "2025-01-01"
  endDate: string;
  frequency: Frequency;
  daysOfWeek: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  timeSlot: string; // e.g., "09:00"
  exceptions?: Date[];
}

export interface PaymentProps {
  _id ?: string
  sessionId: string
  userId : Types.ObjectId
  advocateId : Types.ObjectId
  slotId: Types.ObjectId
  bookId : string
  amount : number | null
  status : string
}