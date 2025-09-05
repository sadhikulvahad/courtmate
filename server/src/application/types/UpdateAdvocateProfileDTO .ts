

export interface UpdateAdvocateProfileDTO {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  age?: number | undefined;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  bio?: string;
  languages?: string;
  barCouncilNumber?: string;
  yearsOfPractice?: number | undefined;
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
  activeTab?: string;
  sortBy?: "rating" | "experience" | "createdAt";
  sortOrder?: "asc" | "desc";

  // 🔥 Dynamic filters
  filters?: {
    [key: string]: string | number | (string | number)[];
  };
}
