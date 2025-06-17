
import userModel from "../models/userModel";
import { User } from "../../../domain/entities/User";
import { UserRepository } from "../../../domain/interfaces/userRepository";
import { UserProps } from "../../../domain/types/EntityProps";
import { AuthMethod } from "../../../domain/types/AuthMethod";
import { AdvocateFilterOptions } from "../../../application/types/UpdateAdvocateProfileDTO ";
import { FilterQuery } from 'mongoose';

interface ExperienceRange {
    $gte?: number;
    $lte?: number;
}

export class UserRepositoryImplement implements UserRepository {

    async findByBCINumber(BCINumber: string): Promise<User | null> {
        const BarCouncilNumber = await userModel.findOne({ barCouncilRegisterNumber: BCINumber })
        return BarCouncilNumber ? this.toDomainEntity(BarCouncilNumber) : null
    }

    async findUsers(): Promise<User[]> {
        const users = await userModel.find({ role: 'user' })
        return users
            .filter((user: UserProps) => user.name && user.email && user.role)
            .map((user: UserProps) => this.toDomainEntity(user));
    }

    async findAdvocates(): Promise<User[]> {
        const users = await userModel.find({ role: 'advocate' })
        return users
            .filter((user: UserProps) => user.name && user.email && user.role)
            .map((user: UserProps) => this.toDomainEntity(user));
    }

    async findAdvocatesWithFilters(filters: AdvocateFilterOptions = {}): Promise<{
        advocates: User[];
        totalCount: number;
        totalPages: number;
        currentPage: number;
    }> {
        const {
            page = 1,
            limit = 10,
            searchTerm,
            categories,
            location,
            minExperience,
            maxExperience,
            languages,
            minRating,
            availability,
            specializations,
            certifications,
            sortBy = 'rating',
            sortOrder = 'desc',
        } = filters;

        const query: FilterQuery<User> = {
            role: 'advocate',
            isAdminVerified: { $in: ['Accepted'] },
            isBlocked: false
        };

        // Search term filter
        if (filters.searchTerm) {
            query.$or = [
                { name: { $regex: filters.searchTerm, $options: 'i' } },
                { category: { $regex: filters.searchTerm, $options: 'i' } },
                { typeOfAdvocate: { $regex: filters.searchTerm, $options: 'i' } }
            ];
        }

        // Category filter
        if (categories?.length) {
            (query as any).category = { $in: categories };
        }

        // Location filter
        if (location) {
            query.$or = [
                { 'address.city': { $regex: location, $options: 'i' } },
                { 'address.state': { $regex: location, $options: 'i' } }
            ];
        }

        // Experience range filter
        if (filters.minExperience || filters.maxExperience) {
            const experienceFilter: ExperienceRange = {};
            if (filters.minExperience) experienceFilter.$gte = filters.minExperience;
            if (filters.maxExperience) experienceFilter.$lte = filters.maxExperience;

            // Type assertion to handle read-only property
            (query as { experience?: ExperienceRange }).experience = experienceFilter;
        }

        // Languages filter
        if (filters.languages?.length) {
            const languageFilter = { $in: filters.languages };
            (query as { languages?: typeof languageFilter }).languages = languageFilter;
        }

        // Rating filter
        if (minRating) {
            query.rating = { $gte: minRating };
        }

        // Availability filter
        if (availability?.length) {
            query.availability = { $in: availability };
        }

        // Specializations filter
        if (specializations?.length) {
            query.specializations = { $in: specializations };
        }

        // Certifications filter
        if (certifications?.length) {
            query.certifications = { $in: certifications };
        }

        // Sorting
        const sortOptions: any = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Pagination
        const skip = (page - 1) * limit;

        const [advocates, totalCount] = await Promise.all([
            userModel.find(query)
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .lean(),

            userModel.countDocuments(query)
        ]);

        return {
            advocates: advocates
                .filter((user: UserProps) => user.name && user.email && user.role)
                .map((user: UserProps) => this.toDomainEntity(user)),
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page
        };
    }

    async findByNumber(number: string): Promise<User | null> {
        const userData = await userModel.findOne({ phone: number })
        return userData ? this.toDomainEntity(userData) : null
    }

    async findById(id: string): Promise<User | null> {
        const userData = await userModel.findOne({ _id: id })
        return userData ? this.toDomainEntity(userData) : null
    }

    async findByEmail(email: string): Promise<User | null> {
        const userData = await userModel.findOne({ email })
        return userData ? this.toDomainEntity(userData) : null
    }

    async save(user: User): Promise<User> {
        const userData = this.toMongooseModel(user)
        const savedUser = await userModel.create(userData)
        return this.toDomainEntity(savedUser)
    }

    async update(id: string, updates: Partial<User>): Promise<User> {
        const updatedUser = await userModel.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            throw new Error("User not found");
        }
        return this.toDomainEntity(updatedUser);
    }

    async getSavedAdvocates(userId: string): Promise<User[]> {
        const user = await userModel
            .findById(userId)
            .populate({
                path: "savedAdvocates",
                select: "name email role profilePhoto category", // remove match temporarily
            });

        if (!user) {
            throw new Error("User not found");
        }

        console.log("Populated savedAdvocates:", user.savedAdvocates);

        const validAdvocates = (user.savedAdvocates || []).filter(
            (adv: any) => adv?.name && adv?.email && adv?.role
        );

        return validAdvocates.map((adv: any) => this.toDomainEntity(adv));
    }

    private toDomainEntity(mongooseUser: UserProps): User {
        return new User({
            _id: mongooseUser?._id?.toString(),
            name: mongooseUser.name,
            email: mongooseUser.email,
            phone: mongooseUser.phone,
            password: mongooseUser.password,
            role: mongooseUser.role,
            googleId: mongooseUser.googleId,
            authMethod: mongooseUser.authMethod,
            isActive: mongooseUser.isActive,
            isBlocked: mongooseUser.isBlocked,
            isVerified: mongooseUser.isVerified,
            isAdminVerified: mongooseUser.isAdminVerified,
            verifiedAt: mongooseUser.verifiedAt,
            address: mongooseUser.address,
            certification: mongooseUser.certification,
            bio: mongooseUser.bio,
            languages: mongooseUser.languages,
            barCouncilRegisterNumber: mongooseUser.barCouncilRegisterNumber,
            barCouncilIndia: mongooseUser.barCouncilIndia,
            typeOfAdvocate: mongooseUser.typeOfAdvocate,
            experience: mongooseUser.experience,
            category: mongooseUser.category,
            practicingField: mongooseUser.practicingField,
            profilePhoto: mongooseUser.profilePhoto,
            bciCertificate: mongooseUser.bciCertificate,
            age: mongooseUser.age,
            DOB: mongooseUser.DOB,
            onlineConsultation: mongooseUser.onlineConsultation,
            savedAdvocates: mongooseUser.savedAdvocates ?? []
        });
    }


    private toMongooseModel(user: User): UserProps {
        return {
            name: user.name,
            email: user.email,
            phone: user.phone as string,
            password: user.password,
            role: user.role,
            authMethod: user.authMethod as AuthMethod,
            isActive: user.isActive,
            isBlocked: user.isBlocked,
            isVerified: user.isVerified,
            verifiedAt: user.verifiedAt as Date,
            isAdminVerified: user.isAdminVerified
        }
    }
}