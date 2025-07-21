import { Container } from 'inversify';
import { TYPES } from '../../types';
import { UserRepository } from '../../domain/interfaces/UserRepository';
import { NotificationRepository } from '../../domain/interfaces/NotificationRepository';
import { MessageRepository } from '../../domain/interfaces/MessageRepository';
import { ConversationRepository } from '../../domain/interfaces/ConversationRepository';
import { EmailService } from '../../domain/interfaces/EmailService';
import { TokenService } from '../../domain/interfaces/TokenRepository';
import { UserRepositoryImplement } from '../dataBase/repositories/UserRepository';
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
import { UpdateAdvocateProfile } from '../../application/useCases/advocate/updateAdvocateProfile';
import { UpdateAdvocate } from '../../application/useCases/advocate/UpdateAdvocate';
import { FindUser } from '../../application/useCases/advocate/FindUser';
import { HashPassword } from '../services/passwordHash';
import { JwtTokenService } from '../services/jwt';
import { BookingExpirationJobService } from '../services/bookingExpirationJob';
import { AuthMiddleware, AuthMiddlewareImpl } from '../../infrastructure/web/authMiddlware';
import { PassportService } from '../services/passport';
import { MulterService } from '../../infrastructure/web/multer';
import { S3Service } from '../../infrastructure/web/s3Credential';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
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
import { getAllNotification } from '../../application/useCases/getAllNotification';
import { MarkAllAsRead } from '../../application/useCases/MarkAllAsRead';
import { MarkAsRead } from '../../application/useCases/MarkasRead';
import { PaymentUsecase } from '../../application/useCases/PaymentUsecase';
import { BookingRepository } from '../../domain/interfaces/BookingRepository';
import { BookingRepositoryImplements } from '../../infrastructure/dataBase/repositories/BookingRepository';
import { CaseRepository } from '../../domain/interfaces/CaseRepository';
import { CaseRepositoryImplements } from '../../infrastructure/dataBase/repositories/CaseRepository';
import { RecurringRuleRepository } from '../../domain/interfaces/RecurringRuleRepository';
import { RecurringRuleRepositoryImplement } from '../../infrastructure/dataBase/repositories/RecurringRuleRepository';
import { ReviewRepository } from '../../domain/interfaces/ReviewRepository';
import { ReviewRepositoryImplements } from '../../infrastructure/dataBase/repositories/ReviewRepository';
import { SlotRepository } from '../../domain/interfaces/SlotRepository';
import { MongooseSlotRepository } from '../../infrastructure/dataBase/repositories/SlotRepository';
import { SubscriptionRepository } from '../../domain/interfaces/SubscriptionRepository';
import { SubscriptionRepositoryImpl } from '../../infrastructure/dataBase/repositories/SubscriptionRepository';
import { ChatFileController } from '../../presentation/controllers/chatFileController';
import { paymentController } from '../../presentation/controllers/paymentController';
import { NotificationController } from '../../presentation/controllers/admin/notificationController';
import { BookingController } from '../../presentation/controllers/bookingController';
import { SlotController } from '../../presentation/controllers/slotController';
import { RecurringRuleController } from '../../presentation/controllers/recurringRuleController';
import { PaymentService } from '../../infrastructure/services/stripePaymentService';
import { PaymentRepository } from '../../domain/interfaces/PaymentRepository';
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
import { RedisService } from '../../domain/interfaces/RedisService';
import { RedisServiceImplement } from '../../infrastructure/services/redisService';
import { LogoutUseCase } from '../../application/useCases/auth/LogoutUseCase';

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
container.bind<UserRepository>(TYPES.UserRepository).to(UserRepositoryImplement).inSingletonScope();
container.bind<NotificationRepository>(TYPES.NotificationRepository).to(NotificationRepositoryImplements).inSingletonScope();
container.bind<MessageRepository>(TYPES.MessageRepository).to(MessageRepositoryImplements).inSingletonScope();
container.bind<ConversationRepository>(TYPES.ConversationRepository).to(ConversationRepositoryImplements).inSingletonScope();
container.bind<TokenService>(TYPES.TokenRepository).to(JwtTokenService).inSingletonScope();
container.bind<BookingRepository>(TYPES.BookingRepository).to(BookingRepositoryImplements).inSingletonScope()
container.bind<CaseRepository>(TYPES.CaseRepository).to(CaseRepositoryImplements).inSingletonScope()
container.bind<RecurringRuleRepository>(TYPES.ReccurringRepository).to(RecurringRuleRepositoryImplement).inSingletonScope()
container.bind<ReviewRepository>(TYPES.ReviewRepository).to(ReviewRepositoryImplements).inSingletonScope()
container.bind<SlotRepository>(TYPES.SlotRepository).to(MongooseSlotRepository).inSingletonScope()
container.bind<SubscriptionRepository>(TYPES.SubscriptionRepository).to(SubscriptionRepositoryImpl).inSingletonScope()
container.bind<PaymentRepository>(TYPES.PaymentRepository).to(PaymentRepositoryImplement).inSingletonScope()

// Services
container.bind<EmailConfig>(TYPES.EmailConfig).toConstantValue(createEmailConfig());
container.bind<EmailService>(TYPES.EmailService).to(NodemailerEmailService).inSingletonScope();

container.bind<NotificationService>(TYPES.NotificationService).toDynamicValue(() => {
    const notificationRepo = new NotificationRepositoryImplements();
    const socketIOService = container.get<SocketIOService>(TYPES.SocketIOService);
    return new NotificationService(notificationRepo, socketIOService);
}).inSingletonScope();
container.bind<RedisService>(TYPES.RedisService).to(RedisServiceImplement)
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
container.bind<GetAdminDashboard>(TYPES.GetAdminDashboard).to(GetAdminDashboard);
container.bind<GetAdvocateDashboard>(TYPES.GetAdvocateDashboard).to(GetAdvocateDashboard);
container.bind<BookSlot>(TYPES.BookSlot).to(BookSlot);
container.bind<GetBookingThisHourUseCase>(TYPES.GetBookingThisHourUseCase).to(GetBookingThisHourUseCase);
container.bind<GetBookSlot>(TYPES.GetBookSlot).to(GetBookSlot);
container.bind<GetCallHistoryUseCase>(TYPES.GetCallHistoryUseCase).to(GetCallHistoryUseCase);
container.bind<Postpone>(TYPES.Postpone).to(Postpone);
container.bind<VerifyRoom>(TYPES.VerifyRoom).to(VerifyRoom);
container.bind<CreateCaseUseCase>(TYPES.CreateCaseUseCase).to(CreateCaseUseCase);
container.bind<DeleteCaseUseCase>(TYPES.DeleteCaseUseCase).to(DeleteCaseUseCase);
container.bind<GetAllCasesUseCase>(TYPES.GetAllCasesUseCase).to(GetAllCasesUseCase);
container.bind<UpdateCaseUseCase>(TYPES.UpdateCaseUseCase).to(UpdateCaseUseCase);
container.bind<UpdateHearingHistoryUseCase>(TYPES.UpdateHearingHistoryUseCase).to(UpdateHearingHistoryUseCase);
container.bind<CreateConversationUseCase>(TYPES.CreateConversationUseCase).to(CreateConversationUseCase);
container.bind<GetConversationsUseCase>(TYPES.GetConversationsUseCase).to(GetConversationsUseCase);
container.bind<GetMessagesUseCase>(TYPES.GetMessagesUseCase).to(GetMessagesUseCase);
container.bind<UpdateMessageStatusUseCase>(TYPES.UpdateMessageStatusUseCase).to(UpdateMessageStatusUseCase);
container.bind<AddRecurringRule>(TYPES.AddRecurringRule).to(AddRecurringRule);
container.bind<GetRecurringRulesByAdvocate>(TYPES.GetRecurringRulesByAdvocate).to(GetRecurringRulesByAdvocate);
container.bind<CreateReviewUseCase>(TYPES.CreateReviewUseCase).to(CreateReviewUseCase);
container.bind<DeleteReviewUseCase>(TYPES.DeleteReviewUseCase).to(DeleteReviewUseCase);
container.bind<GetReviewsUseCase>(TYPES.GetReviewsUseCase).to(GetReviewsUseCase);
container.bind<UpdateReviewUseCase>(TYPES.UpdateReviewUseCase).to(UpdateReviewUseCase);
container.bind<AddSlot>(TYPES.AddSlot).to(AddSlot);
container.bind<GetSlots>(TYPES.GetSlots).to(GetSlots);
container.bind<PostponeSlot>(TYPES.PostponeSlot).to(PostponeSlot);
container.bind<CreateSubscriptionUseCase>(TYPES.CreateSubscriptionUseCase).to(CreateSubscriptionUseCase);
container.bind<GetAllSubscriptionsUseCase>(TYPES.GetAllSubscriptionsUseCase).to(GetAllSubscriptionsUseCase);
container.bind<GetSubscriptionUseCase>(TYPES.GetSubscriptionUseCase).to(GetSubscriptionUseCase);
container.bind<GetSavedAdvocates>(TYPES.GetSavedAdvocates).to(GetSavedAdvocates);
container.bind<ResetPassword>(TYPES.ResetPassword).to(ResetPassword);
container.bind<ToggleSavedAdvocate>(TYPES.ToggleSavedAdvocate).to(ToggleSavedAdvocate);
container.bind<ToggleUser>(TYPES.ToggleUser).to(ToggleUser);
container.bind<CreateCheckoutSessionUseCase>(TYPES.CreateCheckoutSessionUseCase).to(CreateCheckoutSessionUseCase);
container.bind<getAllNotification>(TYPES.GetAllNotification).to(getAllNotification);
container.bind<MarkAllAsRead>(TYPES.MarkAllAsRead).to(MarkAllAsRead);
container.bind<MarkAsRead>(TYPES.MarkAsRead).to(MarkAsRead);
container.bind<PaymentUsecase>(TYPES.PaymentUseCase).to(PaymentUsecase);
container.bind<GetAllAdvocates>(TYPES.GetAllAdvocates).to(GetAllAdvocates);
container.bind<GetAllUserAdvocates>(TYPES.GetAllUserAdvocates).to(GetAllUserAdvocates);
container.bind<UpdateAdvocateStatus>(TYPES.UpdateAdvocateStatus).to(UpdateAdvocateStatus);
container.bind<TopRatedAdvocatesUseCase>(TYPES.TopRatedAdvocatesUseCase).to(TopRatedAdvocatesUseCase);
container.bind<CreateMessageUseCase>(TYPES.CreateMessageUseCase).to(CreateMessageUseCase);
container.bind<SignupUser>(TYPES.SignupUser).to(SignupUser);
container.bind<verifyEmail>(TYPES.VerifyEmail).to(verifyEmail);
container.bind<LoginUser>(TYPES.LoginUser).to(LoginUser);
container.bind<GoogleAuth>(TYPES.GoogleAuth).to(GoogleAuth);
container.bind<forgotPasswordSendMail>(TYPES.ForgotPasswordSendMail).to(forgotPasswordSendMail);
container.bind<VerifyForgotPasswordMail>(TYPES.VerifyForgotPasswordMail).to(VerifyForgotPasswordMail);
container.bind<ResetForgotPassword>(TYPES.ResetForgotPassword).to(ResetForgotPassword);
container.bind<RefreshTokenUseCase>(TYPES.RefreshTokenUseCase).to(RefreshTokenUseCase);
container.bind<GetAdvocateDetails>(TYPES.GetAdvocateDetails).to(GetAdvocateDetails);
container.bind<UpdateAdvocateProfile>(TYPES.UpdateAdvocateProfile).to(UpdateAdvocateProfile);
container.bind<UpdateAdvocate>(TYPES.UpdateAdvocate).to(UpdateAdvocate);
container.bind<FindUser>(TYPES.FindUser).to(FindUser);
container.bind<getAllUsers>(TYPES.GetAllUsers).to(getAllUsers)
container.bind<GetAllAdminAdvocates>(TYPES.GetAllAdminAdvocates).to(GetAllAdminAdvocates)
container.bind<LogoutUseCase>(TYPES.LogoutUseCase).to(LogoutUseCase)

// Middleware
container.bind<AuthMiddleware>(TYPES.AuthMiddleware).toDynamicValue(() => {
    const jwtService = container.get<JwtTokenService>(TYPES.JwtTokenService);
    const refreshTokenUseCase = container.get<RefreshTokenUseCase>(TYPES.RefreshTokenUseCase);
    const userRepository = container.get<UserRepository>(TYPES.UserRepository);
    const logger = container.get<Logger>(TYPES.Logger);
    const redisService = container.get<RedisService>(TYPES.RedisService)
    return new AuthMiddlewareImpl(jwtService, refreshTokenUseCase, userRepository, redisService, logger);
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


export { container };