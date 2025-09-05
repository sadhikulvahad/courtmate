import { User } from "../../domain/entities/User";
import { AdvocateFilterOptions } from "../../application/types/UpdateAdvocateProfileDTO ";
import { UserProps } from "domain/types/EntityProps";

export interface IUserRepository {
  findByBCINumber(BCINumber: string): Promise<User | null>;
  findUsers(): Promise<User[]>;
  findAdvocates(): Promise<User[]>;
  findAdvocatesWithFilters(filters?: AdvocateFilterOptions): Promise<{
    advocates: User[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  }>;
  findAdminAdvocates(filters?: AdvocateFilterOptions): Promise<{
    advocates: UserProps[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  }>;
  findByNumber(number: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
  update(id: string, updates: Partial<User>): Promise<User>;
  getSavedAdvocates(userId: string): Promise<User[]>;
  topRatedAdvocates(limit?: number): Promise<User[]>;
  findAdmin() : Promise<User | null>
}