

interface Address {
  street: string
  city: string;
  country: string;
  state: string;
  pincode: number
}

export interface Advocate {
  id: string;
  name: string;
  profilePhoto?: string;
  email?: string;
  role: string
  phone?: string;
  typeOfAdvocate: string;
  category: string;
  experience: number;
  rating?: number;
  languages: string[];
  bio?: string;
  address: Address
  barCouncilRegisterNumber: string;
  cirtification?: string;
  onlineConsultation?: boolean;
  proBonoService?: boolean;
  availability?: string[]; // Added this field for availability filtering
  createdAt?: string; // For sorting by recent
  isAdminVerified: string;
  verifiedAt: Date
  isActive: boolean,
  isSponsored: boolean
}


export interface AdvocateData {
  id: string;
  name: string;
  email: string;
  category: string;
  isVerified: boolean;
  profilePhoto: string;
  experience: number;
  isAdminVerified: "Pending" | "Accepted" | "Request" | 'Rejected';
  verifiedAt: string;
}

export interface formDataProps {
  barCouncilNumber: string;
  yearsOfPractice: number;
  age: string;
  typeOfAdvocate: string;
  category: string;
  practicingField: string;
  languages: string;
  street: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  onlineConsultation: boolean;
  profilePhoto: File | null;
  bciCertificate: File | null;
  bciCertificatePreview: string;
  termsAccepted: boolean;
}

export interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}


export interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  isBlocked: boolean
}

export type NotificationTabs = 'all' | 'pending' | 'seen'

export interface AdvocateProps {
  id: string
  name: string;
  email: string;
  category: string;
  phone: string
  experience: number;
  profilePhoto: string;
  isBlocked: boolean
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  }
  languages: string[];
  practicingField: string[];
  onlineConsultation: boolean;
  bio: string;
  typeOfAdvocate: string;
  typeOfLawyer: string;
  age: number;
  barCouncilIndia: string;
  barCouncilRegisterNumber: string;
  bciCertificate: string;
  DOB: string;
  cirtification: string;
  rating: number;
  isAdminVerified: 'Request' | 'Accepted' | 'Pending' | 'Rejected';
  isVerified: boolean;
  verifiedAt: string;
  savedAdvocates: string[]
  authMethod: string
  certification: string
  avgRating?: number
}


export interface FilterOptions {
  categories: string[];
  location: string;
  experience: {
    min: number | null;
    max: number | null;
  };
  languages: string[];
  availability: string[];
  minRating: number;
  specializations: string[];
  certifications: string[];
}


export interface Availability {
  monday: string | null;
  tuesday: string | null;
  wednesday: string | null;
  thursday: string | null;
  friday: string | null;
  saturday: string | null;
  sunday: string | null;
}


export interface Review {
  id: number | string;
  review: string;
  rating: number;
  date: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  avatar?: string;
}



export interface SimilarAdvocateCardProps {
  advocate: Advocate;
  onViewProfile: (advocateId: string) => void;
}

export interface AvailabilityTableProps {
  availability: Availability;
}

export interface BadgeProps {
  children: React.ReactNode;
  color?: 'gray' | 'red' | 'blue' | 'green' | 'purple' | 'indigo';
}

export interface RatingStarsProps {
  rating: number;
}

export type NotificationType = 'Reminder' | 'Notification' | 'Alert' | 'All'

export interface Notification {
  createdAt: Date;
  id: string;
  recieverId: string;
  senderId: string;
  message: string;
  type: NotificationType
  read: boolean;
}


export interface ModalProps {
  title: string;
  description: string;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}


export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
  onItemsPerPageChange: (count: number) => void;
  className?: string;
}

export interface GetAllUserAdvocatesParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  activeTab?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  categories?: string[];
  location?: string;
  minExperience?: number;
  maxExperience?: number;
  languages?: string[];
  minRating?: number;
  availability?: string[];
  specializations?: string[];
  certifications?: string[];
}


// Add these type definitions at the top of your file

export interface BadgeProps {
  children: React.ReactNode;
  color?: "gray" | "red" | "blue" | "green" | "purple" | "indigo";
}

export interface Slot {
  id: string;
  date: Date;
  time: Date;
  isAvailable: boolean;
}

export interface Booking {
  id: string;
  advocate: { name: string; email: string, id: string, phone: string };
  date: Date;
  time: Date;
  status: "confirmed" | "pending" | "cancelled" | "postponed";
  notes?: string;
  roomId?: string;
  postponeReason?: string;
  isAvailable?: boolean
}


export interface RecurringRule {
  _id: string;
  description: string;
  rule?: string
  interval?: number
  startDate: string;
  endDate: string;
  frequency: "weekly" | "monthly";
  daysOfWeek: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  timeSlot: string; // e.g., "09:00"
  exceptions?: Date[];
}

export interface CalendarDate {
  day: number | null;
  date: Date | null;
  isToday: boolean;
  isSelected: boolean;
  hasSlots: boolean;
}

export interface Message {
  _id: string
  conversationId: string
  senderId: string
  content: string
  timeStamp: Date
  status: 'sent' | 'delivered' | 'read'
  attachments?: {
    fileUrl: string;
    fileName?: string;
    fileType?: "image" | "file";
  }[] | undefined;
}

export interface Review {
  advocateId: string
  rating: number
  review: string
  createdAt: Date
  _id: string
  userId: {
    email: string
    name: string
    _id: string
  }
}


export interface CaseProps {
  _id?: string;
  title: string;
  advocateId?: string
  clientName: string;
  caseType: string;
  priority: string;
  nextHearingDate: string;
  description: string;
  hearingHistory: string[];
  createdAt?: string;
}


export interface DashboardData {
  availableSlots: Slot[];
  cases: CaseProps[];
  notifications: Notification[];
  reviews: Review[];
  totalBooking: Booking[];
}

export interface AdminDashboardData {
  totalUser: number;
  totalBooking: number;
  advocates: Advocate[];
}


export interface Attachment {
  fileUrl: string;
  fileName?: string;
  fileType?: "image" | "file";
}


export interface Conversation {
  _id: string;
  participants: {
    userId: { _id: string; name: string; email: string; role: string };
    role: string;
  }[];
  lastMessage?: {
    _id: string;
    attachments?: Attachment[];
    content: string;
    timeStamp: Date;
    status: string;
  };
  startedAt: Date;
  unreadCount?: number;
}


export interface TypingUser {
  userId: string;
  name: string;
}


export interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | undefined;
  fileName?: string;
}


export type ModalImage = {
  url: string;
  name?: string;
};