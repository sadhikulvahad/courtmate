import { Request, Response } from "express";
import { GetConversationsUseCase } from "../../application/useCases/messages/GetConversation";
import { CreateConversationUseCase } from "../../application/useCases/messages/CreateConversation";
import { GetMessagesUseCase } from "../../application/useCases/messages/GetMessage";
import { CreateMessageUseCase } from "../../application/useCases/messages/CreateMessage";
import { UpdateMessageStatusUseCase } from "../../application/useCases/messages/UpdateMessageStatus";

export class ConversationController {
    constructor(
        private getConversationsUseCase: GetConversationsUseCase,
        private createConversationUseCase: CreateConversationUseCase,
        private getMessage: GetMessagesUseCase,
        private createMessage: CreateMessageUseCase,
        private UpdateMessageStatus: UpdateMessageStatusUseCase
    ) { }

    async getConversation(req: Request, res: Response) {
        try {
            const user = req.user as { id: string; role: string; name: string } | undefined;

            if (!user?.id) {
                return res.status(401).json({ error: "Unauthorized: User not logged in" });
            }

            const conversations = await this.getConversationsUseCase.execute(user.id);
            res.status(200).json(conversations);
        } catch (error) {
            console.error("Error fetching conversations:", error);
            res.status(500).json({ error: (error as Error).message || "Server error" });
        }
    }

    async createConversation(req: Request, res: Response) {
        try {
            const { participantId, role } = req.body;
            const user = req.user as { id: string; role: string; name: string } | undefined;

            if (!user?.id || !participantId) {
                return res.status(400).json({ error: "Missing user or participant ID" });
            }

            const conversation = await this.createConversationUseCase.execute({
                userId: user.id,
                participantId,
                participantRole: role,
                userRole: user?.role,
            });
            res.status(201).json({
                _id: conversation._id,  // Make sure to include ID
                participants: conversation.participants,
                startedAt: conversation.startedAt
            });
        } catch (error) {
            console.error("Error creating conversation:", error);
            res.status(500).json({ error: (error as Error).message || "Server error" });
        }
    }

    async getMessages(req: Request, res: Response) {
        try {
            const user = req.user as { id: string; role: string; name: string } | undefined;
            if (!user?.id) {
                return res.status(401).json({ error: "Unauthorized: User not logged in" });
            }

            const { id: conversationId } = req.params;

            if (!conversationId) {
                return res.status(400).json({ error: "Conversation ID is required" });
            }

            const messages = await this.getMessage.execute(conversationId);
            res.status(200).json(messages);
        } catch (error) {
            console.error("Error fetching messages:", error);
            res.status(500).json({ error: (error as Error).message || "Server error" });
        }
    }

    async updateMessageStatus(req: Request, res: Response) {
        try {
            const user = req.user as { id: string; role: string; name: string } | undefined;
            if (!user?.id) {
                return res.status(401).json({ error: "Unauthorized: User not logged in" });
            }

            const { messageId, status } = req.body;
            if (!messageId || !status) {
                return res.status(400).json({ error: "Message ID and status are required" });
            }

            const updatedMessage = await this.UpdateMessageStatus.execute(messageId, status);
            res.status(200).json(updatedMessage);
        } catch (error) {
            console.error("Error updating message status:", error);
            res.status(500).json({ error: (error as Error).message || "Server error" });
        }
    }
}
