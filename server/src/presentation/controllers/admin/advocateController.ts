import { Request, Response } from "express";
import { UpdateAdvocateStatus } from "../../../application/useCases/admin/UpdateAdvocateStatus";
import { NotificationService } from "../../../infrastructure/services/notificationService";
import { AdvocateFilterOptions } from "../../../application/types/UpdateAdvocateProfileDTO ";
import { HttpStatus } from '../../../domain/share/enums'
import { TopRatedAdvocatesUseCase } from "../../../application/useCases/user/TopRatedAdvocatesUseCase";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";
import { Logger } from "winston";
import { GetAllAdminAdvocates } from "../../../application/useCases/admin/GetAllAdminAdvocates";
import { GetAllAdvocates } from "../../../application/useCases/admin/GetAllAdvocates";

@injectable()
export class AdvocateController {

    constructor(
        @inject(TYPES.GetAllAdminAdvocates) private getAllAdminAdvocates: GetAllAdminAdvocates,
        @inject(TYPES.GetAllAdvocates) private getAllAdvocates: GetAllAdvocates,
        @inject(TYPES.UpdateAdvocateStatus) private updateAdvocateStatus: UpdateAdvocateStatus,
        @inject(TYPES.TopRatedAdvocatesUseCase) private topRatedAdvocatesUsecase: TopRatedAdvocatesUseCase,
        @inject(TYPES.Logger) private logger: Logger
    ) { }

    async getAdminAdvocates(req: Request, res: Response) {
        try {
            const filters: AdvocateFilterOptions = {
                page: Number(req.query.page) || 1,
                limit: Number(req.query.limit) || 10,
                searchTerm: req.query.searchTerm ? decodeURIComponent(req.query.searchTerm as string) : undefined,
                activeTab: req.query.activeTab ? decodeURIComponent(req.query.activeTab as string) : "all",
            };

            this.logger.info("Received filters for getAdminAdvocates", { filters });

            const result = await this.getAllAdminAdvocates.execute(filters);

            if (!result.success) {
                return res.status(HttpStatus.NOT_FOUND).json({ success: false, error: result.error });
            }

            res.status(HttpStatus.OK).json({
                success: true,
                message: result.message,
                advocates: result.data?.advocates,
                pagination: {
                    totalItems: result.data?.totalCount,
                    totalPages: result.data?.totalPages,
                    currentPage: result.data?.currentPage,
                    itemsPerPage: filters.limit,
                },
            });
        } catch (error) {
            this.logger.error("Error from getAdminAdvocates controller", { error });
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: "Server error" });
        }
    }

    async getUserAdvocates(req: Request, res: Response) {
        try {
            const filters: AdvocateFilterOptions = {
                page: Number(req.query.page) || 1,
                limit: Number(req.query.limit) || 5,
                searchTerm: req.query.searchTerm?.toString(),
                activeTab: req.query.activeTab?.toString() || 'all',
                categories: req.query.categories?.toString().split(','),
                location: req.query.location?.toString(),
                minExperience: Number(req.query.minExperience) || undefined,
                maxExperience: Number(req.query.maxExperience) || undefined,
                languages: req.query.languages?.toString().split(','),
                minRating: Number(req.query.minRating) || undefined,
                availability: req.query.availability?.toString().split(','),
                specializations: req.query.specializations?.toString().split(','),
                certifications: req.query.certifications?.toString().split(','),
                sortBy: req.query.sortBy?.toString() as 'rating' | 'experience' | 'createdAt' || 'rating',
                sortOrder: req.query.sortOrder?.toString() as 'asc' | 'desc' || 'desc'
            };

            const result = await this.getAllAdvocates.execute(filters);

            if (!result.success) {
                return res.status(HttpStatus.NOT_FOUND).json(result);
            }

            res.status(HttpStatus.OK).json({
                success: true,
                message: result.message,
                advocates: result.data?.advocates,
                pagination: {
                    totalItems: result.data?.totalCount,
                    totalPages: result.data?.totalPages,
                    currentPage: result.data?.currentPage,
                    itemsPerPage: filters.limit
                }
            });
        } catch (error) {
            this.logger.error("Error in getUserAdvocates:", { error })
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: "Internal server error"
            });
        }
    }

    async advocateStatusUpdate(req: Request, res: Response) {
        try {
            const { status, id } = req.body
            const admin = req.user

            if (!admin) {
                return res.status(HttpStatus.UNAUTHORIZED).json({ success: false, error: "Unauthorized" })
            }

            if (!id) {
                return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: "Id not found" })
            }

            if (!status) {
                return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: "Status not found" })
            }

            const result = await this.updateAdvocateStatus.execute(status, id, admin)
            if (result?.success) {
                return res.status(HttpStatus.OK).json({ success: true, message: result.message })
            } else {
                return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: result?.error })
            }
        } catch (error) {

            this.logger.error('from AdvocateStatusUpdate Controller', { error })
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: "Server Error" })
        }
    }


    async getTopRatedAdvocates(req: Request, res: Response) {
        try {
            const result = await this.topRatedAdvocatesUsecase.execute();

            return res.status(HttpStatus.OK).json({
                success: true,
                message: 'Advocates fetched successfully',
                advocates : result,
            });
        } catch (error) {
            this.logger.error('Error from topRatedAdvocate Controller', { error });
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: "Server Error"
            });
        }
    }
}