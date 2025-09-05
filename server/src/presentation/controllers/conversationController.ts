import { Request, Response } from "express";
import { HttpStatus } from "../../domain/share/enums";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { Logger } from "winston";
import { IGetConversation } from "../../application/interface/messages/GetConversationRepo";
import { ICreateConversation } from "../../application/interface/messages/CreateConversationRepo";
import { IGetMessages } from "../../application/interface/messages/GetMessageRepo";
import { IUpdateMessageStatus } from "../../application/interface/messages/UpdateMessageStatusRepo";


@injectable()
export class ConversationController {
    constructor(
        @inject(TYPES.IGetConversation) private _getConversationsUseCase: IGetConversation,
        @inject(TYPES.ICreateConversation) private _createConversationUseCase: ICreateConversation,
        @inject(TYPES.IGetMessages) private _getMessage: IGetMessages,
        @inject(TYPES.IUpdateMessageStatus) private _updateMessageStatus: IUpdateMessageStatus,
        @inject(TYPES.Logger) private _logger: Logger
    ) { }

    async getConversation(req: Request, res: Response) {
        try {
            const user = req.user as { id: string; role: string; name: string } | undefined;

            if (!user?.id) {
                return res.status(HttpStatus.UNAUTHORIZED).json({ error: "Unauthorized: User not logged in" });
            }

            const conversations = await this._getConversationsUseCase.execute(user.id);
            res.status(HttpStatus.OK).json(conversations);
        } catch (error) {
            this._logger.error("Error fetching conversations:", { error })
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: (error as Error).message || "Server error" });
        }
    }

    async createConversation(req: Request, res: Response) {
        try {
            const { participantId, role } = req.body;

            if (!participantId) {
                return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Participant Id required' });
            }

            if (!role) {
                return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Role is missing' });
            }

            const user = req.user as { id: string; role: string; name: string } | undefined;

            if (!user?.id || !participantId) {
                return res.status(HttpStatus.BAD_REQUEST).json({ error: "Missing user or participant ID" });
            }

            const conversation = await this._createConversationUseCase.execute({
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
            this._logger.error("Error creating conversations:", { error })
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: (error as Error).message || "Server error" });
        }
    }

    async getMessages(req: Request, res: Response) {
        try {
            const user = req.user as { id: string; role: string; name: string } | undefined;
            if (!user?.id) {
                return res.status(HttpStatus.UNAUTHORIZED).json({ error: "Unauthorized: User not logged in" });
            }

            const { id: conversationId } = req.query;

            if (!conversationId) {
                return res.status(HttpStatus.BAD_REQUEST).json({ error: "Conversation ID is required" });
            }

            const messages = await this._getMessage.execute(conversationId.toString());
            res.status(HttpStatus.OK).json(messages);
        } catch (error) {
            this._logger.error("Error fetching messages:", { error })
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

            const updatedMessage = await this._updateMessageStatus.execute(messageId, status);
            res.status(HttpStatus.OK).json(updatedMessage);
        } catch (error) {
            this._logger.error("Error updating message status:", { error })
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: (error as Error).message || "Server error" });
        }
    }
}
