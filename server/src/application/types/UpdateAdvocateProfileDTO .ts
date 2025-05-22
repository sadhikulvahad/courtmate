

export interface UpdateAdvocateProfileDTO {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  age?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  bio?: string;
  languages?: string;
  barCouncilNumber?: string;
  yearsOfPractice?: string;
  typeOfAdvocate?: string;
  category?: string;
  practicingField?: string;
  onlineConsultation?: string;
  profilePhotoPath?: string;
  bciCertificatePath?: string;
}


export interface AdvocateFilterOptions {
  page?: number;
  limit?: number;
  searchTerm?: string;
  // Admin specific
  activeTab?: string;
  // User filters
  categories?: string[];
  location?: string;
  minExperience?: number;
  maxExperience?: number;
  languages?: string[];
  minRating?: number;
  availability?: string[];
  specializations?: string[];
  certifications?: string[];
  sortBy?: 'rating' | 'experience' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}