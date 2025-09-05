import { Request, Response } from "express";
import { AdvocateFilterOptions } from "../../../application/types/UpdateAdvocateProfileDTO ";
import { HttpStatus } from '../../../domain/share/enums'
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";
import { Logger } from "winston";
import { IGetAllAdminAdvocates } from "../../../application/interface/admin/GetAllAdminAdvocatesRepo";
import { IGetAllAdvocates } from "../../../application/interface/admin/GetAllAdvocatesRepo";
import { IUpdateAdvocateStatus } from "../../../application/interface/admin/UpdateAdvocateStatusRepo";
import { ITopRatedAdvocatesUsecase } from "../../../application/interface/user/TopRatedAdvocateUsecaseRepo";
import { normalizeQueryValue } from "../../../infrastructure/web/normalizeQueryValue";

@injectable()
export class AdvocateController {

    constructor(
        @inject(TYPES.IGetAllAdminAdvocates) private _getAllAdminAdvocates: IGetAllAdminAdvocates,
        @inject(TYPES.IGetAllAdvocates) private _getAllAdvocates: IGetAllAdvocates,
        @inject(TYPES.IUpdateAdvocateStatus) private _updateAdvocateStatus: IUpdateAdvocateStatus,
        @inject(TYPES.ITopRatedAdvocatesUseCase) private _topRatedAdvocatesUsecase: ITopRatedAdvocatesUsecase,
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

            const result = await this._getAllAdminAdvocates.execute(filters);

            res.status(HttpStatus.OK).json({
                success: true,
                message: 'Admin advocates fetched successfully',
                advocates: result.advocates,
                pagination: {
                    totalItems: result.totalCount,
                    totalPages: result.totalPages,
                    currentPage: result.currentPage,
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
            const { page, limit, searchTerm, activeTab, sortBy, sortOrder, ...rest } = req.query;

            const filters: AdvocateFilterOptions = {
                page: page ? Number(page) : 1,
                limit: limit ? Number(limit) : 5,
                searchTerm: searchTerm?.toString(),
                activeTab: activeTab?.toString() || "all",
                sortBy: (sortBy as "rating" | "experience" | "createdAt") || "rating",
                sortOrder: (sortOrder as "asc" | "desc") || "desc",

                filters: Object.fromEntries(
                    Object.entries(rest)
                        .filter(([_, value]) => value !== undefined && value !== "")
                        .map(([key, value]) => [
                            key,
                            normalizeQueryValue(
                                Array.isArray(value)
                                    ? value.map(String)   // if it's an array
                                    : value?.toString()   // if it's single
                            )!
                        ])
                ),
            };

            const result = await this._getAllAdvocates.execute(filters);

            res.status(HttpStatus.OK).json({
                success: true,
                message: "Advocates fetched successfully",
                advocates: result.advocates,
                pagination: {
                    totalItems: result.totalCount,
                    totalPages: result.totalPages,
                    currentPage: result.currentPage,
                    itemsPerPage: filters.limit,
                },
            });
        } catch (error) {
            this.logger.error("Error in getUserAdvocates:", { error });
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: "Internal server error",
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

            const result = await this._updateAdvocateStatus.execute(status, id, admin)
            if (result?.success) {
                return res.status(HttpStatus.OK).json({ success: true, message: 'Status Updated Succesfully' })
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
            const result = await this._topRatedAdvocatesUsecase.execute();

            return res.status(HttpStatus.OK).json({
                success: true,
                message: 'Advocates fetched successfully',
                advocates: result,
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

