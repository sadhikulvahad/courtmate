
import userModel from "../models/UserModel";
import { ReviewModel } from "../models/ReviewModel";
import { User } from "../../../domain/entities/User";
import { IUserRepository } from "../../../domain/interfaces/UserRepository";
import { UserProps } from "../../../domain/types/EntityProps";
import { AuthMethod } from "../../../domain/types/AuthMethod";
import { AdvocateFilterOptions } from "../../../application/types/UpdateAdvocateProfileDTO ";
import { FilterQuery } from 'mongoose';


export class UserRepositoryImplement implements IUserRepository {

    async findByBCINumber(BCINumber: string): Promise<User | null> {
        const BarCouncilNumber = await userModel.findOne({ barCouncilRegisterNumber: BCINumber })
        return BarCouncilNumber ? this.toDomainEntity(BarCouncilNumber) : null
    }

    async findUsers(): Promise<User[]> {
        const users = await userModel.find({ role: 'user' }).lean()
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

    async findAdminAdvocates(filters: AdvocateFilterOptions = {}): Promise<{
        advocates: UserProps[];
        totalCount: number;
        totalPages: number;
        currentPage: number;
    }> {
        const {
            page = 1,
            limit = 10,
            searchTerm,
            activeTab = "all",
        } = filters;
        const query: FilterQuery<UserProps> = { role: "advocate" };

        if (activeTab !== "all") {
            (query as any).isAdminVerified = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
        }

        if (searchTerm && searchTerm.trim() !== "") {
            const safeSearch = searchTerm.trim();
            query.$or = [
                { name: { $regex: safeSearch, $options: "i" } },
                { email: { $regex: safeSearch, $options: "i" } },
            ];
        }

        const skip = (page - 1) * limit;

        const [advocates, totalCount] = await Promise.all([
            userModel.find(query).skip(skip).limit(limit).lean(),
            userModel.countDocuments(query),
        ]);

        return {
            advocates: advocates.filter((user: UserProps) => user.name && user.email && user.role),
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
        };
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
            sortBy = 'rating',
            sortOrder = 'desc',
            filters: dynamicFilters = {},
        } = filters;

        const query: FilterQuery<User> = {
            role: 'advocate',
            isAdminVerified: { $in: ['Accepted'] },
            isBlocked: false
        };

        if (searchTerm) {
            query.$or = [
                { name: { $regex: filters.searchTerm, $options: 'i' } },
                { category: { $regex: filters.searchTerm, $options: 'i' } },
                { typeOfAdvocate: { $regex: filters.searchTerm, $options: 'i' } }
            ];
        }

        for (const [key, value] of Object.entries(dynamicFilters)) {
            if (key === "location" && typeof value === "string") {
                query["address.city"] = { $regex: value, $options: "i" };
            } else if (Array.isArray(value)) {
                query[key] = { $in: value };
            } else if (typeof value === "number") {
                query[key] = value;
            } else if (typeof value === "string") {
                query[key] = { $regex: value.toLowerCase(), $options: "i" };
            } else if (key === "language" && typeof value === "string") {
                query["language"] = { $elemMatch: { $regex: value, $options: "i" } };
            }
        }

        const sortOptions: any = {
            isSponsored: -1,
            [sortBy]: sortOrder === 'asc' ? 1 : -1
        };

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

    async findAdmin(): Promise<User | null> {
        const Admin = await userModel.findOne({ role: 'admin' })
        return Admin ? this.toDomainEntity(Admin) : null
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
        if (!userData.phone) {
            delete userData.phone;
        }
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
                select: "name email role profilePhoto category",
            });

        if (!user) {
            throw new Error("User not found");
        }

        const validAdvocates = (user.savedAdvocates || []).filter(
            (adv: any) => adv?.name && adv?.email && adv?.role
        );

        return validAdvocates.map((adv: any) => this.toDomainEntity(adv));
    }

    async topRatedAdvocates(limit = 10): Promise<User[]> {
        const results = await ReviewModel.aggregate([
            {
                $match: {
                    isDeleted: false,
                    rating: { $exists: true, $ne: null }
                }
            },
            {
                $group: {
                    _id: "$advocateId",
                    avgRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "advocate"
                }
            },
            { $unwind: "$advocate" },
            {
                $match: {
                    "advocate.role": "advocate",
                    "advocate.isAdminVerified": "Accepted",
                    "advocate.isBlocked": false
                }
            },
            { $sort: { avgRating: -1 } },
            { $limit: limit }
        ]);
        const advocates = results.map((r) =>
            this.toDomainEntity({
                ...r.advocate,
                avgRating: r.avgRating,
                totalReviews: r.totalReviews
            })
        );

        return advocates;
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
            savedAdvocates: mongooseUser.savedAdvocates ?? [],
            subscriptionPlan: mongooseUser.subscriptionPlan,
            isSponsored: mongooseUser.isSponsored,
            avgRating: mongooseUser.avgRating ?? 0,
            totalReviews: mongooseUser.totalReviews ?? 0,
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