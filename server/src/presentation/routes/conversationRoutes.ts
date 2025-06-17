import { Router, Request, Response } from "express";
import { JwtTokenService } from "../../infrastructure/services/jwt";
import { UserRepositoryImplement } from "../../infrastructure/dataBase/repositories/userRepository";
import { RefreshTokenUseCase } from "../../application/useCases/auth/refreshTokenUseCase";
import { createAuthMiddleware } from "../../infrastructure/web/authMiddlware";
import { ConversationController } from "../controllers/conversationController";
import { GetConversationsUseCase } from "../../application/useCases/messages/GetConversation";
import { ConversationRepositoryImplements } from "../../infrastructure/dataBase/repositories/ConversationRepository";
import { CreateConversationUseCase } from "../../application/useCases/messages/CreateConversation";
import { GetMessagesUseCase } from "../../application/useCases/messages/GetMessage";
import { MessageRepositoryImplements } from "../../infrastructure/dataBase/repositories/MessageRepository";
import { CreateMessageUseCase } from "../../application/useCases/messages/CreateMessage";
import { UpdateMessageStatusUseCase } from "../../application/useCases/messages/UpdateMessageStatus";


const router = Router()

const tokenService = new JwtTokenService();
const userRepository = new UserRepositoryImplement();
const refreshTokenUseCase = new RefreshTokenUseCase(tokenService, userRepository);
const authMiddleware = createAuthMiddleware(tokenService, refreshTokenUseCase);
const conversationoRepository = new ConversationRepositoryImplements()
const messageRepositroy = new MessageRepositoryImplements()
const getConverstation = new GetConversationsUseCase(conversationoRepository)
const createConversation = new CreateConversationUseCase(conversationoRepository)
const getMessage = new GetMessagesUseCase(messageRepositroy)
const createMessage = new CreateMessageUseCase(messageRepositroy, conversationoRepository)
const updateMessageStatus = new UpdateMessageStatusUseCase(messageRepositroy)
const conversationController = new ConversationController(getConverstation, createConversation, getMessage, createMessage, updateMessageStatus)

router.post('/', authMiddleware, (req: Request, res: Response) => {
    conversationController.createConversation(req, res)
})

router.get("/", authMiddleware, (req: Request, res: Response) => {
    conversationController.getConversation(req, res);
});

router.get('/messages/:id', authMiddleware, (req: Request, res: Response) => {
    conversationController.getMessages(req,res)
})

export default router;
