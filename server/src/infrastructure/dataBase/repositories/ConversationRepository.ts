import { Types } from "mongoose";
import { ConversationModel } from "../models/ConversationModel";
import { IConversationRepository } from "../../../domain/interfaces/ConversationRepository";
import { ConversationProps } from "../../../domain/types/EntityProps";

export class ConversationRepositoryImplements implements IConversationRepository {
    async getConversationsByUserId(userId: Types.ObjectId): Promise<ConversationProps[]> {
        try {
            const conversations = await ConversationModel.find({
                "participants.userId": userId,
            })
                .populate({
                    path: "participants.userId",
                    select: "name email role specialty isOnline rating",
                })
                .populate("lastMessage").sort({ createdAt: -1 })
                .lean();
            return conversations as ConversationProps[];
        } catch (error) {
            throw new Error(`Failed to fetch conversations: ${(error as Error).message}`);
        }
    }

    async createConversation(conversation: Omit<ConversationProps, "_id">): Promise<ConversationProps> {
        try {
            const newConversation = await ConversationModel.create({
                participants: conversation.participants,
                startedAt: conversation.startedAt,
                lastMessage: conversation.lastMessage,
                unreadCounts: conversation.unreadCounts
            });
            return newConversation.toObject() as ConversationProps;
        } catch (error) {
            throw new Error(`Failed to create conversation: ${(error as Error).message}`);
        }
    }

    async updateLastMessage(conversationId: Types.ObjectId, messageId: Types.ObjectId): Promise<void> {
        try {
            await ConversationModel.findByIdAndUpdate(
                conversationId,
                { lastMessage: messageId, $inc: { unreadCounts: 1 } },
                { new: true }
            );
        } catch (error) {
            throw new Error(`Failed to update last message: ${(error as Error).message}`);
        }
    }

    // In ConversationRepositoryImpl (or wherever you implement the repository)

    async findConversationBetweenParticipants(userAId: Types.ObjectId, userBId: Types.ObjectId): Promise<ConversationProps | null> {
        const conversation = await ConversationModel.findOne({
            $or: [
                {
                    participants: {
                        $all: [
                            { $elemMatch: { userId: userAId } },
                            { $elemMatch: { userId: userBId } }
                        ],
                        $size: 2
                    }
                },
            ]
        });

        return conversation ? conversation.toObject() as ConversationProps : null;
    }

    async updateUnreaadCount(conversationId: string) {
        try {
            await ConversationModel.findByIdAndUpdate(
                conversationId,
                { $set: { unreadCounts: 0 } },
                { new: true }
            );
        } catch (error) {
            throw new Error(`Failed to update count message: ${(error as Error).message}`);
        }
    }

}