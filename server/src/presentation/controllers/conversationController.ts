import { Request, Response } from "express";
import { GetConversationsUseCase } from "../../application/useCases/messages/GetConversation";
import { CreateConversationUseCase } from "../../application/useCases/messages/CreateConversation";
import { GetMessagesUseCase } from "../../application/useCases/messages/GetMessage";
import { CreateMessageUseCase } from "../../application/useCases/messages/CreateMessage";
import { UpdateMessageStatusUseCase } from "../../application/useCases/messages/UpdateMessageStatus";
import { HttpStatus } from "../../domain/share/enums";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { Logger } from "winston";


@injectable()
export class ConversationController {
    constructor(
        @inject(TYPES.GetConversationsUseCase) private getConversationsUseCase: GetConversationsUseCase,
        @inject(TYPES.CreateConversationUseCase) private createConversationUseCase: CreateConversationUseCase,
        @inject(TYPES.GetMessagesUseCase) private getMessage: GetMessagesUseCase,
        @inject(TYPES.CreateMessageUseCase) private createMessage: CreateMessageUseCase,
        @inject(TYPES.UpdateMessageStatusUseCase) private UpdateMessageStatus: UpdateMessageStatusUseCase,
        @inject(TYPES.Logger) private logger: Logger
    ) { }

    async getConversation(req: Request, res: Response) {
        try {
            const user = req.user as { id: string; role: string; name: string } | undefined;

            if (!user?.id) {
                return res.status(HttpStatus.UNAUTHORIZED).json({ error: "Unauthorized: User not logged in" });
            }

            const conversations = await this.getConversationsUseCase.execute(user.id);
            res.status(HttpStatus.OK).json(conversations);
        } catch (error) {
            this.logger.error("Error fetching conversations:", { error })
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: (error as Error).message || "Server error" });
        }
    }

    async createConversation(req: Request, res: Response) {
        try {
            const { participantId, role } = req.body;

            if (!participantId) {
                return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Participant Id required' });
            }

            if(!role) {
                return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Role is missing' });
            }

            const user = req.user as { id: string; role: string; name: string } | undefined;

            if (!user?.id || !participantId) {
                return res.status(HttpStatus.BAD_REQUEST).json({ error: "Missing user or participant ID" });
            }

            const conversation = await this.createConversationUseCase.execute({
                userId: user.id,
                participantId,
                participantRole: role,
                userRole: user?.role,
            });
            res.status(HttpStatus.CREATED).json({
                _id: conversation._id,  // Make sure to include ID
                participants: conversation.participants,
                startedAt: conversation.startedAt
            });
        } catch (error) {
            this.logger.error("Error creating conversations:", { error })
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: (error as Error).message || "Server error" });
        }
    }

    async getMessages(req: Request, res: Response) {
        try {
            const user = req.user as { id: string; role: string; name: string } | undefined;
            if (!user?.id) {
                return res.status(HttpStatus.UNAUTHORIZED).json({ error: "Unauthorized: User not logged in" });
            }

            const { id: conversationId } = req.params;

            if (!conversationId) {
                return res.status(HttpStatus.BAD_REQUEST).json({ error: "Conversation ID is required" });
            }

            const messages = await this.getMessage.execute(conversationId);
            res.status(HttpStatus.OK).json(messages);
        } catch (error) {
            this.logger.error("Error fetching messages:", { error })
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: (error as Error).message || "Server error" });
        }
    }

    async updateMessageStatus(req: Request, res: Response) {
        try {
            const user = req.user as { id: string; role: string; name: string } | undefined;
            if (!user?.id) {
                return res.status(HttpStatus.UNAUTHORIZED).json({ error: "Unauthorized: User not logged in" });
            }

            const { messageId, status } = req.body;
            if (!messageId || !status) {
                return res.status(HttpStatus.BAD_REQUEST).json({ error: "Message ID and status are required" });
            }

            const updatedMessage = await this.UpdateMessageStatus.execute(messageId, status);
            res.status(HttpStatus.OK).json(updatedMessage);
        } catch (error) {
            this.logger.error("Error updating message status:", { error })
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: (error as Error).message || "Server error" });
        }
    }
}
