import Express, { Request, Response } from "express";
import { UserRepositoryImplement } from "../../../infrastructure/dataBase/repositories/userRepository";
import { GetAllAdvocates } from "../../../application/useCases/admin/getAllAdvocates";
import { UpdateAdvocateStatus } from "../../../application/useCases/admin/updateAdvocateStatus";
import { NotificationRepositoryImplements } from "../../../infrastructure/dataBase/repositories/NotificationRepository";
import { NotificationService } from "../../../infrastructure/services/notificationService";
import { Server as SocketIOServer } from "socket.io";
import { NodemailerEmailService } from "../../../infrastructure/services/sendMail";
import { createEmailConfig } from "../../../infrastructure/config/emailConfig";
import { AdvocateFilterOptions } from "../../../application/types/UpdateAdvocateProfileDTO ";
import { GetAllUserAdvocates } from "../../../application/useCases/user/GetAllUserAdvocates";


export class AdvocateController {
    private readonly GetAllAdvocates: GetAllAdvocates
    private readonly UpdateAdvocateStatus: UpdateAdvocateStatus
    private readonly NotificationService?: NotificationService
    private readonly emailService: NodemailerEmailService
    private readonly GetAllUserAdvocates : GetAllUserAdvocates

    constructor() {
        const userRepository = new UserRepositoryImplement()
        const NotificationRepository = new NotificationRepositoryImplements()
        const config = createEmailConfig()
        this.GetAllAdvocates = new GetAllAdvocates(userRepository)
        this.GetAllUserAdvocates = new GetAllUserAdvocates(userRepository)
        this.emailService = new NodemailerEmailService(config)
        this.UpdateAdvocateStatus = new UpdateAdvocateStatus(userRepository, NotificationRepository, this.emailService)
    }

    async getAdminAdvocates(req: Request, res: Response) {
        try {
            const filters: AdvocateFilterOptions = {
                page: Number(req.query.page) || 1,
                limit: Number(req.query.limit) || 10,
                searchTerm: req.query.searchTerm?.toString(),
                categories: undefined,
                location: undefined,
                minExperience: undefined,
            };
            const result = await this.GetAllUserAdvocates.execute()
            if (!result.success) {
                return res.status(404).json({ success: false, error: result.error })
            }
            console.log(result)
            res.status(200).json({
                success: true,
                message: result.message,
                advocates: result.advocates,
                pagination: {
                    itemsPerPage: filters.limit
                }
            });
        } catch (error) {
            console.error("Error from getAdvocates controller", error)
            res.status(500).json({ success: false, error: "Server error" })
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

            // Handle activeTab filters
            // switch (filters.activeTab) {
            //     case 'featured':
            //         filters.minRating = 4;
            //         break;
            //     case 'online':
            //         filters['onlineConsultation'] = true;
            //         break;
            //     case 'probono':
            //         filters['proBonoService'] = true;
            //         break;
            //     case 'new':
            //         // Add logic for new advocates (e.g., created in last 30 days)
            //         filters.sortBy = 'createdAt';
            //         filters.sortOrder = 'desc';
            //         break;
            // }

            const result = await this.GetAllAdvocates.execute(filters);

            if (!result.success) {
                return res.status(404).json(result);
            }

            res.status(200).json({
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
            console.error("Error in getUserAdvocates:", error);
            res.status(500).json({
                success: false,
                error: "Internal server error"
            });
        }
    }

    async advocateStatusUpdate(req: Request, res: Response) {
        const io = req.app.get('io');
        try {
            const { status, id } = req.body
            const admin = req.user

            if (!admin) {
                return res.status(401).json({ success: false, error: "Unauthorized" })
            }

            if (!id) {
                return res.status(400).json({ success: false, error: "Id not found" })
            }

            if (!status) {
                return res.status(400).json({ success: false, error: "Status not found" })
            }

            const notificationRepo = new NotificationRepositoryImplements();
            const notificationService = new NotificationService(notificationRepo, io);

            const result = await this.UpdateAdvocateStatus.execute(status, id, notificationService, admin)
            if (result?.success) {
                return res.status(200).json({ success: true, message: result.message })
            } else {
                return res.status(400).json({ success: false, error: result?.error })
            }
        } catch (error) {
            console.log('Error from AdvocateStatusUpdate Controller', error)
            res.status(500).json({ success: false, error: "Server Error" })
        }
    }
}