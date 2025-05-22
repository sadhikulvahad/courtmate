import { AdvocateFilterOptions } from "../../application/types/UpdateAdvocateProfileDTO ";
import { User } from "../entities/User";
// import { UserProps } from "../types/UserProps";


export interface UserRepository {
    findByBCINumber(BCINumber: string): Promise<User | null>;
    findUsers(): Promise<User[]>;
    findAdvocates(): Promise<User[]>;
    findAdvocatesWithFilters(filters: AdvocateFilterOptions): Promise<{
        advocates: User[];
        totalCount: number;
        totalPages: number;
        currentPage: number;
    }>;
    findByNumber(number: string): Promise<User | null>
    findById(id: string): Promise<User | null>
    findByEmail(email: string): Promise<User | null>
    save(user: User): Promise<User>
    update(_id: string, updates: Partial<User>): Promise<User>
}