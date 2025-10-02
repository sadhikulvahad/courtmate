import { Container } from 'inversify';
import { TYPES } from '../../types';
import { IUserRepository } from '../../domain/interfaces/UserRepository';
import { INotificationRepository } from '../../domain/interfaces/NotificationRepository';
import { IMessageRepository } from '../../domain/interfaces/MessageRepository';
import { IConversationRepository } from '../../domain/interfaces/ConversationRepository';
import { IEmailService } from '../../domain/interfaces/EmailService';
import { ITokenService } from '../../domain/interfaces/TokenRepository';
import { UserRepositoryImplement } from '../../infrastructure/dataBase/repositories/UserRepository';
import { NotificationRepositoryImplements } from '../dataBase/repositories/NotificationRepository';
import { MessageRepositoryImplements } from '../dataBase/repositories/MessageRepository';
import { ConversationRepositoryImplements } from '../dataBase/repositories/ConversationRepository';
import { NodemailerEmailService } from '../../infrastructure/services/sendMail';
import { NotificationService } from '../../infrastructure/services/notificationService';
import { SocketIOService } from '../services/SocketIOService';
import { createEmailConfig } from '../config/emailConfig';
import { createLogger, transports, format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { Logger } from 'winston';
import { GetAllAdvocates } from '../../application/useCases/admin/GetAllAdvocates';
import { UpdateAdvocateStatus } from '../../application/useCases/admin/UpdateAdvocateStatus';
import { GetAllUserAdvocates } from '../../application/useCases/user/GetAllUserAdvocates';
import { TopRatedAdvocatesUseCase } from '../../application/useCases/user/TopRatedAdvocatesUseCase';
import { CreateMessageUseCase } from '../../application/useCases/messages/CreateMessage';
import { AdvocateController } from '../../presentation/controllers/admin/advocateController';
import { AuthController } from '../../presentation/controllers/authController';
import { advProfileController } from '../../presentation/controllers/advocate/advProfileController';
import { SignupUser } from '../../application/useCases/auth/SignupUser';
import { verifyEmail } from '../../application/useCases/auth/VerifyEmail';
import { LoginUser } from '../../application/useCases/auth/LoginUser';
import { GoogleAuth } from '../../application/useCases/auth/GoogleAuth';
import { forgotPasswordSendMail } from '../../application/useCases/auth/ForgotPasswordSendMail';
import { VerifyForgotPasswordMail } from '../../application/useCases/auth/VerifyForgotPasswordMail';
import { ResetForgotPassword } from '../../application/useCases/auth/ResetForgotPassword';
import { RefreshTokenUseCase } from '../../application/useCases/auth/RefreshTokenUseCase';
import { GetAdvocateDetails } from '../../application/useCases/advocate/GetDatails';
import { UpdateAdvocateProfile } from '../../application/useCases/advocate/UpdateAdvocateProfile';
import { UpdateAdvocate } from '../../application/useCases/advocate/UpdateAdvocate';
import { FindUser } from '../../application/useCases/advocate/FindUser';
import { HashPassword } from '../services/passwordHash';
import { JwtTokenService } from '../services/jwt';
import { BookingExpirationJobService } from '../services/bookingExpirationJob';
import { AuthMiddleware, AuthMiddlewareImpl } from '../../infrastructure/web/authMiddlware';
import { PassportService } from '../services/passport';
import { MulterService } from '../../infrastructure/web/multer';
import { S3Service } from '../../infrastructure/web/s3Credential';
import { UserController } from '../../presentation/controllers/user/userController';
import { UserController as AdminUserController } from '../../presentation/controllers/admin/usersController';
import { getAllUsers } from '../../application/useCases/admin/GetAllUsers';
import { GetAdminDashboard } from '../../application/useCases/admin/GetAdminDashboard';
import { GetAdvocateDashboard } from '../../application/useCases/advocate/GetAdvocateDashboard';
import { BookSlot } from '../../application/useCases/Booking/BookSlot';
import { GetBookingThisHourUseCase } from '../../application/useCases/Booking/GetBook';
import { GetBookSlot } from '../../application/useCases/Booking/GetBookSlot';
import { GetCallHistoryUseCase } from '../../application/useCases/Booking/GetCallHistoryUseCase';
import { Postpone } from '../../application/useCases/Booking/Postpone';
import { VerifyRoom } from '../../application/useCases/Booking/VerifyRoom';
import { CreateCaseUseCase } from '../../application/useCases/case/CreateCaseUsecase';
import { DeleteCaseUseCase } from '../../application/useCases/case/DeleteCaseUsecase';
import { GetAllCasesUseCase } from '../../application/useCases/case/GetAllCasesUsecase';
import { UpdateCaseUseCase } from '../../application/useCases/case/UpdateCaseUsecase';
import { UpdateHearingHistoryUseCase } from '../../application/useCases/case/UpdateHearingUsecase';
import { CreateConversationUseCase } from '../../application/useCases/messages/CreateConversation';
import { GetConversationsUseCase } from '../../application/useCases/messages/GetConversation';
import { GetMessagesUseCase } from '../../application/useCases/messages/GetMessage';
import { UpdateMessageStatusUseCase } from '../../application/useCases/messages/UpdateMessageStatus';
import { AddRecurringRule } from '../../application/useCases/recurringRule/AddRecurringRule';
import { GetRecurringRulesByAdvocate } from '../../application/useCases/recurringRule/GetRecurringRule';
import { CreateReviewUseCase } from '../../application/useCases/review/CreateReview';
import { DeleteReviewUseCase } from '../../application/useCases/review/DeleteReviewUseCase';
import { GetReviewsUseCase } from '../../application/useCases/review/GetReviews';
import { UpdateReviewUseCase } from '../../application/useCases/review/UpdateReviewUseCase';
import { AddSlot } from '../../application/useCases/slots/AddSlot';
import { GetSlots } from '../../application/useCases/slots/GetSlot';
import { PostponeSlot } from '../../application/useCases/slots/PostponeSlot';
import { CreateSubscriptionUseCase } from '../../application/useCases/subscription/CreateSubscriptionUsecase';
import { GetAllSubscriptionsUseCase } from '../../application/useCases/subscription/GetAllSubscriptionsUsecase';
import { GetSubscriptionUseCase } from '../../application/useCases/subscription/GetSubscriptionUsecase';
import { GetSavedAdvocates } from '../../application/useCases/user/GetSavedAdvocates';
import { ResetPassword } from '../../application/useCases/user/ResetPasswordUseCase';
import { ToggleSavedAdvocate } from '../../application/useCases/user/ToggleSavedAdvovate';
import { ToggleUser } from '../../application/useCases/user/ToggleUserUsecase';
import { CreateCheckoutSessionUseCase } from '../../application/useCases/CreateCheckoutSessionUseCase';
import { getAllNotification } from '../../application/useCases/GetAllNotification';
import { MarkAllAsRead } from '../../application/useCases/MarkAllAsRead';
import { MarkAsRead } from '../../application/useCases/MarkasRead';
import { PaymentUsecase } from '../../application/useCases/PaymentUsecase';
import { IBookingRepository } from '../../domain/interfaces/BookingRepository';
import { BookingRepositoryImplements } from '../../infrastructure/dataBase/repositories/BookingRepository';
import { ICaseRepository } from '../../domain/interfaces/CaseRepository';
import { CaseRepositoryImplements } from '../../infrastructure/dataBase/repositories/CaseRepository';
import { IRecurringRuleRepository } from '../../domain/interfaces/RecurringRuleRepository';
import { RecurringRuleRepositoryImplement } from '../../infrastructure/dataBase/repositories/RecurringRuleRepository';
import { IReviewRepository } from '../../domain/interfaces/ReviewRepository';
import { ReviewRepositoryImplements } from '../../infrastructure/dataBase/repositories/ReviewRepository';
import { ISlotRepository } from '../../domain/interfaces/SlotRepository';
import { MongooseSlotRepository } from '../../infrastructure/dataBase/repositories/SlotRepository';
import { ISubscriptionRepository } from '../../domain/interfaces/SubscriptionRepository';
import { SubscriptionRepositoryImpl } from '../../infrastructure/dataBase/repositories/SubscriptionRepository';
import { ChatFileController } from '../../presentation/controllers/chatFileController';
import { paymentController } from '../../presentation/controllers/paymentController';
import { NotificationController } from '../../presentation/controllers/admin/notificationController';
import { BookingController } from '../../presentation/controllers/bookingController';
import { SlotController } from '../../presentation/controllers/slotController';
import { RecurringRuleController } from '../../presentation/controllers/recurringRuleController';
import { PaymentService } from '../../infrastructure/services/stripePaymentService';
import { IPaymentRepository } from '../../domain/interfaces/PaymentRepository';
import { PaymentRepositoryImplement } from '../../infrastructure/dataBase/repositories/PaymentRepository';
import { ConversationController } from '../../presentation/controllers/conversationController';
import { ReviewController } from '../../presentation/controllers/reviewController';
import { CaseController } from '../../presentation/controllers/caseController';
import { SubscriptionController } from '../../presentation/controllers/subscriptioncontroller';
import { AdminDashboardController } from '../../presentation/controllers/adminDashboardController';
import { AdvocateDashboardController } from '../../presentation/controllers/advocateDashboardController';
import { SocketServer } from '../../infrastructure/services/socketServer';
import { GetAllAdminAdvocates } from '../../application/useCases/admin/GetAllAdminAdvocates';
import { ReminderSchedulerService } from '../../infrastructure/services/reminderScheduler';
import { IRedisService } from '../../domain/interfaces/RedisService';
import { RedisServiceImplement } from '../../infrastructure/services/redisService';
import { LogoutUseCase } from '../../application/useCases/auth/LogoutUseCase';
import { IGetAdminDashboardRepo } from '../../application/interface/admin/GetAdminDashboardRepo';
import { IGetAdvocateDashboard } from '../../application/interface/advocate/GetAdvocateDashboardRepo';
import { IFilterRepository } from '../../domain/interfaces/FilterRepository';
import { FilterRespository } from '../../infrastructure/dataBase/repositories/FilterRepository';
import { FilterController } from '../../presentation/controllers/filterController';
import { IGetAllFilter } from '../../application/interface/GetAllFiltersRepo';
import { GetAllFilter } from '../../application/useCases/GetAllFilters';
import { IAddFilter } from '../../application/interface/AddFiltersRepo';
import { AddFilter } from '../../application/useCases/AddFilter';
import { IAddCategory } from '../../application/interface/AddCategoryRepo';
import { AddCategory } from '../../application/useCases/AddCategory';
import { IBookSlot } from '../../application/interface/booking/BookSlotRepo';
import { IGetBookingThisHour } from '../../application/interface/booking/GetBookRepo';
import { IGetBookSlot } from '../../application/interface/booking/GetBookSlotRepo';
import { IGetCallHistoryUsecase } from '../../application/interface/booking/GetCallHistoryUsecaseRepo';
import { IPostpone } from '../../application/interface/booking/PostponeRepo';
import { IVerifyRoom } from '../../application/interface/booking/VerifyRoomRepo';
import { ICreateCaseUsecase } from '../../application/interface/case/CreateCaseUsecaseRepo';
import { IDeleteCaseUsecase } from '../../application/interface/case/DeleteCaseUsecaseRepo';
import { IGetAllCasesUsecase } from '../../application/interface/case/GetAllCasesUsecaseRepo';
import { IUpdateCaseUsecase } from '../../application/interface/case/UpdateCaseUsecaseRepo';
import { IUpdateHearingUsecase } from '../../application/interface/case/UpdateHearingUsecaseRepo';
import { ICreateConversation } from '../../application/interface/messages/CreateConversationRepo';
import { IGetConversation } from '../../application/interface/messages/GetConversationRepo';
import { IGetMessages } from '../../application/interface/messages/GetMessageRepo';
import { IUpdateMessageStatus } from '../../application/interface/messages/UpdateMessageStatusRepo';
import { IAddRecurringRule } from '../../application/interface/recurringRule/AddRecurringRuleRepo';
import { IGetRecurringRules } from '../../application/interface/recurringRule/GetRecurringRuleRepo';
import { ICreateReview } from '../../application/interface/review/CreateReviewRepo';
import { IDeleteReviewUsecase } from '../../application/interface/review/DeleteReviewUsecaseRepo';
import { IGetReviews } from '../../application/interface/review/GetReviewRepo';
import { IUpdateReviewUsecase } from '../../application/interface/review/UpdateReviewUsecaseRepo';
import { IAddSlot } from '../../application/interface/slots/AddSlotRepo';
import { IGetSlots } from '../../application/interface/slots/GetSlotRepo';
import { IPostponeSlot } from '../../application/interface/slots/PostponeSlotRepo';
import { ICreateSubscriptionUsecase } from '../../application/interface/subscription/CreateSubscriptionUsecaseRepo';
import { IGetAllSubscriptionsUsecase } from '../../application/interface/subscription/GetAllSubscriptionUsecaseRepo';
import { IGetSubscriptionUsecase } from '../../application/interface/subscription/GetSubscriptionUsecase';
import { IGetSavedAdvocates } from '../../application/interface/user/GetSavedAdvocatesRepo';
import { IResetPassword } from '../../application/interface/user/ResetPasswordUsecaseRepo';
import { IToggleSavedAdvocate } from '../../application/interface/user/ToggleSavedAdvocatesRepo';
import { IToggleUser } from '../../application/interface/user/ToggleUserUsecaseRepo';
import { ICreateCheckoutSessionUsecase } from '../../application/interface/CreateCheckoutSessionUsecaseRepo';
import { IGetAllNotification } from '../../application/interface/GetAllNotificationRepo';
import { IMarkAllAsRead } from '../../application/interface/MarkAllAsReadRepo';
import { IMarkAsRead } from '../../application/interface/MarkAsReadRepo';
import { IPaymentUsecase } from '../../application/interface/PaymentUsecaseRepo';
import { IGetAllAdvocates } from '../../application/interface/admin/GetAllAdvocatesRepo';
import { IGetAllUserAdvocates } from '../../application/interface/user/GetAllUserAdvocatesRepo';
import { IUpdateAdvocateStatus } from '../../application/interface/admin/UpdateAdvocateStatusRepo';
import { ITopRatedAdvocatesUsecase } from '../../application/interface/user/TopRatedAdvocateUsecaseRepo';
import { ICreateMessage } from '../../application/interface/messages/CreateMessageRepo';
import { ISignupUser } from '../../application/interface/auth/SignupUserRepo';
import { IVerifyEmail } from '../../application/interface/auth/VerifyEmailRepo';
import { ILoginUser } from '../../application/interface/auth/LoginUsersRepo';
import { IGoogleAuth } from '../../application/interface/auth/GoogleAuthRepo';
import { IForgotPasswordSendMail } from '../../application/interface/auth/ForgotPasswordSendMailRepo';
import { IVerifyForgotPasswordMail } from '../../application/interface/auth/VerifyForgotPasswordMailRepo';
import { IResetForgotPassword } from '../../application/interface/auth/ResetForgotPasswordRepo';
import { IRefreshTokenUsecase } from '../../application/interface/auth/RefreshtokenUsecaseRepo';
import { IGetAdvocateDetails } from '../../application/interface/advocate/GetDetailsRepo';
import { IUpdateAdvocateProfile } from '../../application/interface/advocate/UpdateAdvocateProfileRepo';
import { IUpdateAdvocate } from '../../application/interface/advocate/UpdateAdvocateRepo';
import { IFindUser } from '../../application/interface/advocate/FindUserRepo';
import { IGetAllUsers } from '../../application/interface/admin/GetAllUsersRepo';
import { IGetAllAdminAdvocates } from '../../application/interface/admin/GetAllAdminAdvocatesRepo';
import { ILogoutUsecase } from '../../application/interface/auth/LogoutUsecaseRepo';
import { IDeleteCategory } from '../../application/interface/DeleteCategory';
import { DeleteCategory } from '../../application/useCases/DeleteCategory';
import { IDeletFilter } from '../../application/interface/DeleteFilter';
import { DeleteFilter } from '../../application/useCases/DeleteFilter';
import { IAddCaseHearing } from '../../application/interface/case/AddCaseHearingUsecaseRepo';
import { AddHearingDataUsecase } from '../../application/useCases/case/AddCaseHearingUsecase';
import { IGetCaseHearingRepo } from '../../application/interface/case/GetCaseHearingDataRepo';
import { GetCaseHearingDataUsecase } from '../../application/useCases/case/GetCaseHearingDataUsecase';
import { IUpdateCaseHearingDataRepo } from '../../application/interface/case/UpdateCaseHearingDataRepo';
import { UpdateCaseHearingDataUsecase } from '../../application/useCases/case/UpdateCaseHearingDataUsecase';
import { IDeleteCaseHearingRepo } from '../../application/interface/case/DeleteCaseHearingDataRepo';
import { DeleteCaseHearingUsecase } from '../../application/useCases/case/DeleteCaseHearingDataUsecase';
import { ICancelBookingRepo } from '../../application/interface/booking/CancelBookingRepo';
import { CancelBooking } from '../../application/useCases/Booking/CancelBooking';
import { IWalletRepository } from '../../domain/interfaces/WalletRepository';
import { WalletRepository } from '../../infrastructure/dataBase/repositories/WalletRepository';
import { WalletController } from '../../presentation/controllers/walletController';
import { IGetWallet } from '../../application/interface/Wallet/GetWalletRepo';
import { GetWallet } from '../../application/useCases/Wallet/GetWalletUsecase';
import { IUpdateUnreadCountRepo } from '../../application/interface/messages/UpdateUnreadCountRepo';
import { UpdateUnreadCount } from '../../application/useCases/messages/UpdateUnreadCount';

type EmailConfig = {
    service: string;
    auth: { user: string; pass: string };
    sender: string;
    baseUrl: string;
};

const logger = createLogger({
    level: 'info',
    format: format.combine(format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), format.json()),
    transports: [
        new transports.Console(),
        new DailyRotateFile({
            filename: 'logs/app-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxFiles: '7d',
            maxSize: '30m',
            zippedArchive: true,
        }),
        new DailyRotateFile({
            filename: 'logs/error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxFiles: '7d',
            maxSize: '20m',
            level: 'error',
            zippedArchive: true,
        }),
    ]
});

const container = new Container();
// container.bind<HttpServer>('Server').toConstantValue(server);
// Repositories
container.bind<IUserRepository>(TYPES.IUserRepository).to(UserRepositoryImplement).inSingletonScope();
container.bind<INotificationRepository>(TYPES.INotificationRepository).to(NotificationRepositoryImplements).inSingletonScope();
container.bind<IMessageRepository>(TYPES.IMessageRepository).to(MessageRepositoryImplements).inSingletonScope();
container.bind<IConversationRepository>(TYPES.IConversationRepository).to(ConversationRepositoryImplements).inSingletonScope();
container.bind<ITokenService>(TYPES.ITokenRepository).to(JwtTokenService).inSingletonScope();
container.bind<IBookingRepository>(TYPES.IBookingRepository).to(BookingRepositoryImplements).inSingletonScope()
container.bind<ICaseRepository>(TYPES.ICaseRepository).to(CaseRepositoryImplements).inSingletonScope()
container.bind<IRecurringRuleRepository>(TYPES.IReccurringRepository).to(RecurringRuleRepositoryImplement).inSingletonScope()
container.bind<IReviewRepository>(TYPES.IReviewRepository).to(ReviewRepositoryImplements).inSingletonScope()
container.bind<ISlotRepository>(TYPES.ISlotRepository).to(MongooseSlotRepository).inSingletonScope()
container.bind<ISubscriptionRepository>(TYPES.ISubscriptionRepository).to(SubscriptionRepositoryImpl).inSingletonScope()
container.bind<IPaymentRepository>(TYPES.IPaymentRepository).to(PaymentRepositoryImplement).inSingletonScope()
container.bind<IFilterRepository>(TYPES.IFilterRepository).to(FilterRespository).inSingletonScope()
container.bind<IWalletRepository>(TYPES.IWalletRepository).to(WalletRepository).inSingletonScope()

// Services
container.bind<EmailConfig>(TYPES.EmailConfig).toConstantValue(createEmailConfig());
container.bind<IEmailService>(TYPES.IEmailService).to(NodemailerEmailService).inSingletonScope();

container.bind<NotificationService>(TYPES.NotificationService).toDynamicValue(() => {
    const notificationRepo = new NotificationRepositoryImplements();
    const socketIOService = container.get<SocketIOService>(TYPES.SocketIOService);
    return new NotificationService(notificationRepo, socketIOService);
}).inSingletonScope();
container.bind<IRedisService>(TYPES.IRedisService).to(RedisServiceImplement)
container.bind<SocketIOService>(TYPES.SocketIOService).to(SocketIOService).inSingletonScope();
container.bind<SocketServer>(TYPES.SocketIOServer).to(SocketServer).inSingletonScope();
container.bind<Logger>(TYPES.Logger).toConstantValue(logger);
container.bind<BookingExpirationJobService>(TYPES.BookingExpirationJob).to(BookingExpirationJobService).inSingletonScope();
container.bind<HashPassword>(TYPES.HashPasswordService).to(HashPassword).inSingletonScope();
container.bind<JwtTokenService>(TYPES.JwtTokenService).to(JwtTokenService).inSingletonScope();
container.bind<PassportService>(TYPES.PassportService).to(PassportService).inSingletonScope();
container.bind<MulterService>(TYPES.MulterService).to(MulterService).inSingletonScope();
container.bind<S3Service>(TYPES.S3Service).to(S3Service).inSingletonScope();
container.bind<PaymentService>(TYPES.PaymentService).to(PaymentService).inSingletonScope();
container.bind<ReminderSchedulerService>(TYPES.ReminderSchedulerService).to(ReminderSchedulerService).inSingletonScope()


// Use Cases
container.bind<IGetAdminDashboardRepo>(TYPES.IGetAdminDashboard).to(GetAdminDashboard).inSingletonScope()
container.bind<IGetAdvocateDashboard>(TYPES.IGetAdvocateDashboard).to(GetAdvocateDashboard).inSingletonScope()
container.bind<IBookSlot>(TYPES.IBookSlot).to(BookSlot).inSingletonScope()
container.bind<IGetBookingThisHour>(TYPES.IGetBookingThisHourUseCase).to(GetBookingThisHourUseCase).inSingletonScope()
container.bind<IGetBookSlot>(TYPES.IGetBookSlot).to(GetBookSlot).inSingletonScope()
container.bind<IGetCallHistoryUsecase>(TYPES.IGetCallHistoryUseCase).to(GetCallHistoryUseCase).inSingletonScope()
container.bind<IPostpone>(TYPES.IPostpone).to(Postpone).inSingletonScope()
container.bind<IVerifyRoom>(TYPES.IVerifyRoom).to(VerifyRoom).inSingletonScope()
container.bind<ICreateCaseUsecase>(TYPES.ICreateCaseUseCase).to(CreateCaseUseCase).inSingletonScope()
container.bind<IDeleteCaseUsecase>(TYPES.IDeleteCaseUseCase).to(DeleteCaseUseCase).inSingletonScope()
container.bind<IGetAllCasesUsecase>(TYPES.IGetAllCasesUseCase).to(GetAllCasesUseCase).inSingletonScope()
container.bind<IUpdateCaseUsecase>(TYPES.IUpdateCaseUseCase).to(UpdateCaseUseCase).inSingletonScope()
container.bind<IUpdateHearingUsecase>(TYPES.IUpdateHearingUsecase).to(UpdateHearingHistoryUseCase).inSingletonScope()
container.bind<ICreateConversation>(TYPES.ICreateConversation).to(CreateConversationUseCase).inSingletonScope()
container.bind<IGetConversation>(TYPES.IGetConversation).to(GetConversationsUseCase).inSingletonScope()
container.bind<IGetMessages>(TYPES.IGetMessages).to(GetMessagesUseCase).inSingletonScope()
container.bind<IUpdateMessageStatus>(TYPES.IUpdateMessageStatus).to(UpdateMessageStatusUseCase).inSingletonScope()
container.bind<IAddRecurringRule>(TYPES.IAddRecurringRule).to(AddRecurringRule).inSingletonScope()
container.bind<IGetRecurringRules>(TYPES.IGetRecurringRules).to(GetRecurringRulesByAdvocate).inSingletonScope()
container.bind<ICreateReview>(TYPES.ICreateReview).to(CreateReviewUseCase).inSingletonScope()
container.bind<IDeleteReviewUsecase>(TYPES.IDeleteReviewUseCase).to(DeleteReviewUseCase).inSingletonScope()
container.bind<IGetReviews>(TYPES.IGetReviews).to(GetReviewsUseCase).inSingletonScope()
container.bind<IUpdateReviewUsecase>(TYPES.IUpdateReviewUseCase).to(UpdateReviewUseCase).inSingletonScope()
container.bind<IAddSlot>(TYPES.IAddSlot).to(AddSlot).inSingletonScope()
container.bind<IGetSlots>(TYPES.IGetSlots).to(GetSlots).inSingletonScope()
container.bind<IPostponeSlot>(TYPES.IPostponeSlot).to(PostponeSlot).inSingletonScope()
container.bind<ICreateSubscriptionUsecase>(TYPES.ICreateSubscriptionUseCase).to(CreateSubscriptionUseCase).inSingletonScope()
container.bind<IGetAllSubscriptionsUsecase>(TYPES.IGetAllSubscriptionsUseCase).to(GetAllSubscriptionsUseCase).inSingletonScope()
container.bind<IGetSubscriptionUsecase>(TYPES.IGetSubscriptionUseCase).to(GetSubscriptionUseCase).inSingletonScope()
container.bind<IGetSavedAdvocates>(TYPES.IGetSavedAdvocates).to(GetSavedAdvocates).inSingletonScope()
container.bind<IResetPassword>(TYPES.IResetPassword).to(ResetPassword).inSingletonScope()
container.bind<IToggleSavedAdvocate>(TYPES.IToggleSavedAdvocate).to(ToggleSavedAdvocate).inSingletonScope()
container.bind<IToggleUser>(TYPES.IToggleUser).to(ToggleUser).inSingletonScope()
container.bind<ICreateCheckoutSessionUsecase>(TYPES.ICreateCheckoutSessionUseCase).to(CreateCheckoutSessionUseCase).inSingletonScope()
container.bind<IGetAllNotification>(TYPES.IGetAllNotification).to(getAllNotification).inSingletonScope()
container.bind<IMarkAllAsRead>(TYPES.IMarkAllAsRead).to(MarkAllAsRead).inSingletonScope()
container.bind<IMarkAsRead>(TYPES.IMarkAsRead).to(MarkAsRead).inSingletonScope()
container.bind<IPaymentUsecase>(TYPES.IPaymentUseCase).to(PaymentUsecase).inSingletonScope()
container.bind<IGetAllAdvocates>(TYPES.IGetAllAdvocates).to(GetAllAdvocates).inSingletonScope()
container.bind<IGetAllUserAdvocates>(TYPES.IGetAllUserAdvocates).to(GetAllUserAdvocates).inSingletonScope()
container.bind<IUpdateAdvocateStatus>(TYPES.IUpdateAdvocateStatus).to(UpdateAdvocateStatus).inSingletonScope()
container.bind<ITopRatedAdvocatesUsecase>(TYPES.ITopRatedAdvocatesUseCase).to(TopRatedAdvocatesUseCase).inSingletonScope()
container.bind<ICreateMessage>(TYPES.ICreateMessage).to(CreateMessageUseCase).inSingletonScope()
container.bind<ISignupUser>(TYPES.ISignupUser).to(SignupUser).inSingletonScope()
container.bind<IVerifyEmail>(TYPES.IVerifyEmail).to(verifyEmail).inSingletonScope()
container.bind<ILoginUser>(TYPES.ILoginUser).to(LoginUser).inSingletonScope()
container.bind<IGoogleAuth>(TYPES.IGoogleAuth).to(GoogleAuth).inSingletonScope()
container.bind<IForgotPasswordSendMail>(TYPES.IForgotPasswordSendMail).to(forgotPasswordSendMail).inSingletonScope()
container.bind<IVerifyForgotPasswordMail>(TYPES.IVerifyForgotPasswordMail).to(VerifyForgotPasswordMail).inSingletonScope()
container.bind<IResetForgotPassword>(TYPES.IResetForgotPassword).to(ResetForgotPassword).inSingletonScope()
container.bind<IRefreshTokenUsecase>(TYPES.IRefreshTokenUseCase).to(RefreshTokenUseCase).inSingletonScope()
container.bind<IGetAdvocateDetails>(TYPES.IGetAdvocateDetails).to(GetAdvocateDetails).inSingletonScope()
container.bind<IUpdateAdvocateProfile>(TYPES.IUpdateAdvocateProfile).to(UpdateAdvocateProfile).inSingletonScope()
container.bind<IUpdateAdvocate>(TYPES.IUpdateAdvocate).to(UpdateAdvocate).inSingletonScope()
container.bind<IFindUser>(TYPES.IFindUser).to(FindUser).inSingletonScope()
container.bind<IGetAllUsers>(TYPES.IGetAllUsers).to(getAllUsers).inSingletonScope()
container.bind<IGetAllAdminAdvocates>(TYPES.IGetAllAdminAdvocates).to(GetAllAdminAdvocates).inSingletonScope()
container.bind<ILogoutUsecase>(TYPES.ILogoutUseCase).to(LogoutUseCase).inSingletonScope()
container.bind<IGetAllFilter>(TYPES.IGetAllFilter).to(GetAllFilter).inSingletonScope()
container.bind<IAddFilter>(TYPES.IAddFilter).to(AddFilter).inSingletonScope()
container.bind<IAddCategory>(TYPES.IAddCategory).to(AddCategory).inSingletonScope()
container.bind<IDeleteCategory>(TYPES.IDeleteCategory).to(DeleteCategory).inSingletonScope()
container.bind<IDeletFilter>(TYPES.IDeleteFilter).to(DeleteFilter).inSingletonScope()
container.bind<IAddCaseHearing>(TYPES.IAddCaseHearing).to(AddHearingDataUsecase).inSingletonScope()
container.bind<IGetCaseHearingRepo>(TYPES.IGetCaseHearingRepo).to(GetCaseHearingDataUsecase).inSingletonScope()
container.bind<IUpdateCaseHearingDataRepo>(TYPES.IUpdateCaseHearingDataRepo).to(UpdateCaseHearingDataUsecase).inSingletonScope()
container.bind<IDeleteCaseHearingRepo>(TYPES.IDeleteCaseHearingRepo).to(DeleteCaseHearingUsecase).inSingletonScope()
container.bind<ICancelBookingRepo>(TYPES.ICancelBookingRepo).to(CancelBooking).inSingletonScope()
container.bind<IGetWallet>(TYPES.IGetWallet).to(GetWallet).inSingletonScope()
container.bind<IUpdateUnreadCountRepo>(TYPES.IUpdateUnreadCount).to(UpdateUnreadCount).inSingletonScope()

// Middleware
container.bind<AuthMiddleware>(TYPES.AuthMiddleware).toDynamicValue(() => {
    const jwtService = container.get<JwtTokenService>(TYPES.JwtTokenService);
    const refreshTokenUseCase = container.get<RefreshTokenUseCase>(TYPES.IRefreshTokenUseCase);
    const IuserRepository = container.get<IUserRepository>(TYPES.IUserRepository);
    const logger = container.get<Logger>(TYPES.Logger);
    const redisService = container.get<IRedisService>(TYPES.IRedisService)
    return new AuthMiddlewareImpl(jwtService, refreshTokenUseCase, IuserRepository, redisService, logger);
}).inSingletonScope();

// Controllers
container.bind<AdvocateController>(TYPES.AdvocateController).to(AdvocateController);
container.bind<AuthController>(TYPES.AuthController).to(AuthController);
container.bind<advProfileController>(TYPES.AdvProfileController).to(advProfileController).inSingletonScope();
container.bind<UserController>(TYPES.UserController).to(UserController)
container.bind<AdminUserController>(TYPES.AdminUserController).to(AdminUserController)
container.bind<ChatFileController>(TYPES.ChatFileController).to(ChatFileController)
container.bind<paymentController>(TYPES.PaymentController).to(paymentController)
container.bind<NotificationController>(TYPES.NotificationController).to(NotificationController)
container.bind<BookingController>(TYPES.BookingController).to(BookingController)
container.bind<SlotController>(TYPES.SlotController).to(SlotController)
container.bind<RecurringRuleController>(TYPES.RecurringRuleController).to(RecurringRuleController)
container.bind<ConversationController>(TYPES.ConversationController).to(ConversationController)
container.bind<ReviewController>(TYPES.ReviewController).to(ReviewController)
container.bind<CaseController>(TYPES.CaseController).to(CaseController)
container.bind<SubscriptionController>(TYPES.SubscriptionController).to(SubscriptionController)
container.bind<AdminDashboardController>(TYPES.AdminDashboardController).to(AdminDashboardController)
container.bind<AdvocateDashboardController>(TYPES.AdvocateDashboardController).to(AdvocateDashboardController)
container.bind<FilterController>(TYPES.FilterController).to(FilterController)
container.bind<WalletController>(TYPES.WalletController).to(WalletController)

export { container };