import { ObjectId, Types } from "mongoose";
import { Address } from "./Address";
import { AuthMethod } from "./AuthMethod";
import { RoleType } from "./RoleTypes";
import { Status, TypeOfNotification } from "./status";

export type UserProps = {
  _id?: string;
  name: string;
  email: string;
  phone?: string | null;
  password?: string;
  role: RoleType;
  googleId?: string | null
  authMethod: AuthMethod
  isActive: boolean;
  isVerified: boolean
  isAdminVerified: Status
  verifiedAt?: Date | null
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
  subscriptionPlan?: 'none' | 'basic' | 'professional' | 'enterprise'
  isSponsored?: boolean
  avgRating?: number;
  totalReviews?: number;
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

export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'postponed' | 'expired';

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
  caseId?: Types.ObjectId | string;
}

export interface SlotProps {
  _id?: string;
  advocateId: Types.ObjectId | string;
  date: Date;
  time: Date;
  isAvailable: boolean;
  status: BookingStatus
  postponeReason?: string
}

export type Frequency = 'weekly' | 'monthly';

export interface RecurringRuleProps {
  _id?: string;
  advocateId: Types.ObjectId | string;
  description: string;
  startDate: string;
  endDate: string;
  frequency: Frequency;
  daysOfWeek: number[];
  timeSlot: string;
  exceptions?: Date[];
}

export interface PaymentProps {
  _id?: string
  sessionId: string
  userId: Types.ObjectId
  advocateId: Types.ObjectId
  slotId: Types.ObjectId
  bookId: string
  amount: number | null
  status: string
}

export interface Participant {
  userId: Types.ObjectId;
  role: string;
}

export interface ConversationProps {
  _id?: string | Types.ObjectId;
  participants: Participant[];
  startedAt: Date;
  lastMessage?: Types.ObjectId;
  unreadCounts?: number
}

export interface MessageProps {
  _id?: string;
  conversationId: Types.ObjectId | string;
  senderId: Types.ObjectId | string;
  receiverId: Types.ObjectId | string;
  content: string;
  senderName: string;
  timeStamp: Date;
  status: "sent" | "delivered" | "read";
  attachments?: {
    fileUrl: string;
    fileName?: string;
    fileType?: "image" | "file";
  }[];
}

export interface ReviewProps {
  _id?: string
  userId: Types.ObjectId | string
  advocateId: Types.ObjectId | string
  review: string
  rating: number
  createdAt: Date
  isDeleted?: boolean
}

export interface CaseProps {
  _id?: string
  caseId?: string
  advocateId: Types.ObjectId
  title: string
  clientName: string
  caseType: string
  priority: string
  nextHearingDate: Date
  description: string
  hearingHistory: Date[]
}

export interface SubscriptionProps {
  advocateId: Types.ObjectId;
  plan: 'basic' | 'professional' | 'enterprise';
  price: number;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FilterProps {
  _id: string
  name: string
  type: string
  options?: string[]
}

export interface TransactionProps {
  _id?: Types.ObjectId;
  walletId: Types.ObjectId;
  amount: number;
  type: "credit" | "debit";
  date?: Date;
  description?: string;
  advocateId?: Types.ObjectId;
  bookingId?: Types.ObjectId;
}

export interface WalletProps {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  balance: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface HearingDetailsProps {
  _id?: string;
  caseId: Types.ObjectId | string;
  advocateId: Types.ObjectId | string;
  clientId?: Types.ObjectId | string;


  date: Date | string;
  time?: string;
  courtName?: string;
  courtRoom?: string;
  judgeName?: string;

  status: "Scheduled" | "Adjourned" | "Completed" | "Pending";
  nextHearingDate?: Date | string;
  hearingOutcome?: string;
  isClosed: boolean;

  advocateNotes?: string;
  clientInstructions?: string;
  documentsSubmitted: string[];
  isDeleted?: boolean;

  createdAt?: Date | string;
  updatedAt?: Date | string;
}
