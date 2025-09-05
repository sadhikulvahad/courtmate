
import { Notification } from "../domain/entities/Notificaiton";
import { Slot } from "../domain/entities/Slot";
import { User } from "../domain/entities/User"
import { BookingProps, CaseProps, NotificationProps, RecurringRuleProps, ReviewProps, UserProps } from "../domain/types/EntityProps"
import { RoleType } from "../domain/types/RoleTypes";


export interface ReturnDTO {
    success?: boolean
    message?: string
    accessToken?: string;
    refreshToken?: string;
    error?: string;
    url ?: string
    id?: string
}

export interface AdminDashboardDTO {
    totalBooking: number
    totalUser: number
    advocates: User[]
}

export interface AllAdminAdvocatesDTO {
    advocates?: User[]
    totalCount?: number
    totalPages?: number
    currentPage?: number
    success?: boolean;
    error?: string;

}

export interface AdvocateDashboardDTO {
    totalBooking: BookingProps[],
    availableSlots: Slot    [],
    reviews: ReviewProps[],
    cases: CaseProps[],
    notifications: Notification[]
}

export interface LoginUserDTO {
    user?: User,
    token?: string,
    refreshToken?: string
    error?: string

}

export interface RecurringRulePropsDTO extends RecurringRuleProps {
    generatedSlotCount: number
}

export interface LogoutResponse {
    success: boolean;
}

export type SignupResponse =
    | { success: true; message: string }
    | { success: false; error: string };


export interface UpdateReviewDTO {
    reviewId: string;
    review?: string;
    rating?: number;
}

export interface ToggleSavedAdvocateDTO {
    success ?: boolean
    error ?: string
    message ?: string
    data ?: UserProps
}

export interface GetSavedAdvocateDTO {
    success ?: boolean
    error ?: string
    message ?: string
    data ?: UserProps[]
}

export interface FindUserDTO {
    success ?: boolean
    error ?: string
    message ?: string
    user ?: User
} 

export interface GetAdvocateDetailsDTO {
    success ?: boolean
    error ?: string
    message ?: string
    user ?: User
} 

export interface GetNotificationsDTO {
    success ?: boolean
    error ?: string 
    message ?: string
    Notifications ?: Notification[]
}

export interface UpdateAdvocateStatussDTO {
    success ?: boolean
    error ?: string
    message ?: string
    advocate ?: User
}

export interface GetAllUserAdvocatesDTO {
    success ?: boolean
    error ?: string 
    message ?: string
    advocates ?: User[]
}

export interface GetAllUsersDTO {
    success ?: boolean;
    error?: string;
    message?: string;
    users?: UserDTO[];
}

export interface UserDTO {
    _id: string;
    name: string;
    email: string;
    phone: string | null | undefined
    role: RoleType;
    isBlocked: boolean;
}

