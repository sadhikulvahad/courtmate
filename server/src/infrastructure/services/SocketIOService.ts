import { injectable, inject } from 'inversify';
import { Server as SocketIOServer } from 'socket.io';
import { TYPES } from '../../types';
import { Logger } from 'winston';
import { CreateMessageUseCase } from '../../application/useCases/messages/CreateMessage';
import { MessageProps } from '../../domain/types/EntityProps';
import userModel from '../../infrastructure/dataBase/models/UserModel';
import { SocketServer } from './socketServer';
import { IConversationRepository } from '../../domain/interfaces/ConversationRepository';
import { IMessageRepository } from '../../domain/interfaces/MessageRepository';

@injectable()
export class SocketIOService {
  private io!: SocketIOServer;

  constructor(
    @inject(TYPES.SocketIOServer) private socketServer: SocketServer,
    @inject(TYPES.Logger) private logger: Logger,
    @inject(TYPES.ICreateMessage) private createMessage: CreateMessageUseCase,
    @inject(TYPES.IConversationRepository) private _conversationRepo : IConversationRepository,
    @inject(TYPES.IMessageRepository) private _messageRepo : IMessageRepository
  ) { }

  initialize() {
    this.io = this.socketServer.getIOServer();
    this.logger.info('Socket.IO service initialized without JWT authentication');
    this.setupSocketEvents();
  }

  getIO(): SocketIOServer {
    return this.socketServer.getIOServer();
  }

  sendGeneralNotification(receiverId: string, message: string, metadata: Record<string, any> = {}) {
    this.logger.info('Sending general notification', { receiverId, message, metadata });
    try {
      this.io.to(`user_${receiverId}`).emit('notification', {
        receiverId,
        message,
        type: metadata.type || 'general',
        read: metadata.read ?? false,
        createdAt: metadata.createdAt || new Date(),
        senderId: metadata.senderId || null,
      });
    } catch (error: unknown) {
      this.logger.error('General notification send error', { error });
    }
  }

  private setupSocketEvents() {
    const io = this.socketServer.getIOServer();
    io.on('connection', (socket) => {
      this.logger.info('User connected', { socketId: socket.id });

      // Allow clients to join a user-specific room
      socket.on('join-user', (userId: string) => {
        socket.join(`user_${userId}`);
        this.logger.info('User joined their own room', { socketId: socket.id, userId });
      });

      socket.on('join-video-room', (roomId: string) => {
        const room = io.sockets.adapter.rooms.get(roomId);
        const numParticipants = room ? room.size : 0;
        this.logger.info('Join video room attempt', { socketId: socket.id, roomId, numParticipants });

        if (numParticipants >= 2) {
          this.logger.warn('Room full', { roomId, socketId: socket.id });
          socket.emit('room-full', { message: 'Room is full. Only two participants allowed.' });
          return;
        }

        socket.join(roomId);
        this.logger.info('Socket joined room', { socketId: socket.id, roomId });

        if (numParticipants === 1) {
          this.logger.info('Notifying existing user of new participant', { roomId });
          socket.to(roomId).emit('user-joined');
        }
      });

      socket.on('offer', ({ roomId, offer }) => {
        this.logger.info('Offer received', { roomId, socketId: socket.id });
        socket.to(roomId).emit('offer', { offer });
      });

      socket.on('answer', ({ roomId, answer }) => {
        this.logger.info('Answer received', { roomId, socketId: socket.id });
        socket.to(roomId).emit('answer', { answer });
      });

      socket.on('ice-candidate', ({ roomId, candidate }) => {
        this.logger.info('ICE candidate received', { roomId, socketId: socket.id });
        socket.to(roomId).emit('ice-candidate', { candidate });
      });

      socket.on('leave-video-room', (roomId) => {
        this.logger.info('User leaving room', { socketId: socket.id, roomId });
        socket.leave(roomId);
        socket.to(roomId).emit('user-left');
      });

      socket.on('join-chat', (conversationId: string) => {
        socket.join(`chat_${conversationId}`);
        this.logger.info('User joined chat', { socketId: socket.id, conversationId });
      });

      socket.on('send-message', async (data: MessageProps) => {
        this.logger.info('Received send-message', { data });
        try {
          const sender = await userModel.findById(data.senderId).lean();
          if (!sender) throw new Error('Sender not found');

          const validatedAttachments = Array.isArray(data.attachments)
            ? data.attachments.map((meta) => ({
              fileUrl: meta.fileUrl || '',
              fileName: meta.fileName || '',
              fileType: (meta.fileType || 'file') as 'image' | 'file',
            }))
            : [];

          const savedMessage = await this.createMessage.execute({
            conversationId: data.conversationId,
            senderId: data.senderId,
            receiverId: data.receiverId,
            content: data.content,
            senderName: sender.name,
            timeStamp: new Date(),
            status: 'sent',
            attachments: validatedAttachments,
            isDeleted: false
          });

          io.to(`chat_${data.conversationId}`).emit('new-message', savedMessage);

          // Send chat notification using sendGeneralNotification
          this.sendGeneralNotification(data.receiverId.toString(), `New message from ${sender.name}`, {
            type: 'chat',
            conversationId: data.conversationId,
            senderId: data.senderId,
            createdAt: new Date(),
            read: false,
          });
        } catch (error: unknown) {
          this.logger.error('Message send error', { error });
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      socket.on("delete-message", async ({ messageId, conversationId, userId }) => {
        try {
          // Find message
          // const message = await MessageModel.findById(messageId);
          // if (!message) {
          //   return socket.emit("error", { message: "Message not found" });
          // }

          // Authorize: only sender can delete
          // if (message.senderId.toString() !== userId) {
          //   return socket.emit("error", { message: "Not authorized to delete this message" });
          // }

          // Mark as deleted (soft delete)
          // message.isDeleted = true;
          // message.content = ""; // Optional: clear text
          // await message.save();

          this._messageRepo.deleteMessage(messageId)

          // Notify all participants in the conversation
          io.to(`chat_${conversationId}`).emit("message-deleted", {
            messageId,
            conversationId,
          });

          this.logger.info("Message deleted", { messageId, conversationId, userId });
        } catch (err) {
          this.logger.error("Delete message error", { err });
          socket.emit("error", { message: "Failed to delete message" });
        }
      });


      socket.on('message-read', async (data) => {
        const { conversationId, userId } = data;

        this._conversationRepo.updateUnreaadCount(conversationId)

        io.to(`chat_${conversationId}`).emit('message-read', data);
      });

      socket.on('leave-chat', (conversationId: string) => {
        socket.leave(`chat_${conversationId}`);
        this.logger.info('User left chat', { socketId: socket.id, conversationId });
      });

      socket.on('disconnect', () => {
        this.logger.info('User disconnected', { socketId: socket.id });
      });
    });
  }
}