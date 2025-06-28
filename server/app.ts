import express, { NextFunction, Response, Request } from "express";
import logger from "morgan";
import 'dotenv/config';
import connectDB from "./src/infrastructure/config/db";
import session from "express-session";
import cookieParser from "cookie-parser";
import cors from "cors"
import passport from "passport";
import { configureGoogleStrategy } from "./src/infrastructure/services/passport";
import authRoutes from './src/presentation/routes/authRoutes'
import advProfileRoutes from './src/presentation/routes/advocate/profileRoutes'
import adminUserRoutes from './src/presentation/routes/admin/userRoutes'
import adminAdvocateRoutes from './src/presentation/routes/admin/advocateRoutes'
import notificationRoutes from './src/presentation/routes/notificationRoutes'
import userRoutes from './src/presentation/routes/user/userRoutes'
import userAdvocates from './src/presentation/routes/user/advocateRoutes'
import bookingRoutes from './src/presentation/routes/bookingRoutes'
import slotRoutes from './src/presentation/routes/slotRoutes'
import recurringRuleRoutes from './src/presentation/routes/recurringRuleRoutes'
import paymentRouoter from './src/presentation/routes/paymentRouter'
import conversationRoutes from './src/presentation/routes/conversationRoutes'
import reviewRoutes from './src/presentation/routes/reviewRouter'
import chatFileRoutes from './src/presentation/routes/chatFileRoutes';
import caseRouter from './src/presentation/routes/caseRouter'
import subscription from './src/presentation/routes/subscriptionRoutes'
import adminDashboard from './src/presentation/routes/adminDashboardRoutes'
import advocateDashboard from './src/presentation/routes/advocateDashboardRoutes'
import path from "path";
import { Server } from 'socket.io'
import http from 'http'
import { MessageRepositoryImplements } from './src/infrastructure/dataBase/repositories/MessageRepository'
import { ConversationRepositoryImplements } from './src/infrastructure/dataBase/repositories/ConversationRepository'
import { CreateMessageUseCase } from "./src/application/useCases/messages/CreateMessage";
import { MessageProps } from "./src/domain/types/EntityProps";
import userModel from "./src/infrastructure/dataBase/models/userModel";

const messageRepository = new MessageRepositoryImplements();
const conversationRepository = new ConversationRepositoryImplements()
const createMessage = new CreateMessageUseCase(messageRepository, conversationRepository)
const corsOptions = {
  origin: process.env.REDIRECT_URL,
  // origin: 'http://172.16.0.17:5173', 
  credentials: true,
  exposedHeaders: ['x-access-token'],
};

const app = express();
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.REDIRECT_URL,
    methods: ['GET', 'POST'],
  }
})

app.use('/payment', paymentRouoter)

app.set('io', io)

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-video-room", (roomId: string) => {
    const room = io.sockets.adapter.rooms.get(roomId);
    const numParticipants = room ? room.size : 0;

    if (numParticipants >= 2) {
      socket.emit("room-full", { message: "Room is full. Only two participants allowed." });
      return;
    }

    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);

    if (numParticipants === 1) {
      socket.to(roomId).emit("user-joined");
    }
  });

  socket.on("offer", ({ roomId, offer }) => {
    socket.to(roomId).emit("offer", { offer });
  });

  socket.on("answer", ({ roomId, answer }) => {
    socket.to(roomId).emit("answer", { answer });
  });

  socket.on("ice-candidate", ({ roomId, candidate }) => {
    socket.to(roomId).emit("ice-candidate", { candidate });
  });

  socket.on("leave-video-room", (roomId) => {
    socket.leave(roomId);
    socket.to(roomId).emit("user-left");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });

  socket.on("join-chat", (conversationId: string) => {
    socket.join(`chat_${conversationId}`);
    console.log(`User ${socket.id} joined chat ${conversationId}`);
  });

  socket.on("send-message", async (data: MessageProps) => {
    console.log('Received send-message:', data); // Debug
    try {
      const sender = await userModel.findById(data.senderId).lean();
      if (!sender) throw new Error("Sender not found");

      const validatedAttachments = Array.isArray(data.attachments)
        ? data.attachments.map((meta) => ({
          fileUrl: meta.fileUrl || '',
          fileName: meta.fileName || '',
          fileType: (meta.fileType || 'file') as "image" | "file",
        }))
        : [];

      const savedMessage = await createMessage.execute({
        conversationId: data.conversationId,
        senderId: data.senderId,
        receiverId: data.receiverId,
        content: data.content,
        senderName: sender.name,
        timeStamp: new Date(),
        status: "sent",
        attachments: validatedAttachments,
      });

      console.log('Emitting new-message to chat_', `chat_${data.conversationId}`, savedMessage); // Debug
      io.to(`chat_${data.conversationId}`).emit("new-message", savedMessage);

      io.emit("notification", {
        userId: data.receiverId,
        message: `New message from ${sender.name}`,
      });
    } catch (error) {
      console.error("Message send error:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  socket.on("leave-chat", (conversationId: string) => {
    socket.leave(`chat_${conversationId}`);
  });
});



app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(logger("dev"))
app.use(cookieParser());
app.use(cors(corsOptions))
configureGoogleStrategy()
app.use(passport.initialize())
connectDB();
import './src/infrastructure/services/bookingExpirationJob'
import multer from "multer";

declare module "express-session" {
  interface SessionData {
    user?: { id: string; email: string; role: string };
  }
}

app.use(session({
  secret: "Source of truth",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
}));


app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ error: 'File too large. Maximum size is 20MB.' });
      return;
    }
    res.status(400).json({ error: `File upload failed: ${err.message}` });
    return;
  }
  next(err);
});

app.use('/api/uploads', express.static(path.join(__dirname, './uploads')));
app.use('/api/auth', authRoutes)
app.use('/api/advProfile', advProfileRoutes)
app.use('/api/admin/user', adminUserRoutes)
app.use('/api/admin/advocate', adminAdvocateRoutes)
app.use('/api/notification', notificationRoutes)
app.use('/api/user', userRoutes)
app.use('/api/user/advocates', userAdvocates)
app.use('/api/booking', bookingRoutes)
app.use('/api/slot', slotRoutes)
app.use('/api/recurring', recurringRuleRoutes)
app.use('/api/payment', paymentRouoter)
app.use('/api/conversation', conversationRoutes)
app.use('/api/review', reviewRoutes)
app.use('/api/chat', chatFileRoutes);
app.use('/api/case', caseRouter)
app.use('/api/subscribe', subscription)
app.use('/api/advocateDashboard', advocateDashboard)
app.use('/api/adminDashoard', adminDashboard)

// app.post('/api/upload', chatMediaUpload, (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No file uploaded' });
//     }

//     // Construct the file URL (adjust based on your server setup)
//     const fileUrl = `/api/uploads/chat-media/${req.file.filename}`;

//     res.status(200).json({
//       url: fileUrl,
//       fileName: req.file.originalname,
//       fileType: req.file.mimetype.startsWith('image/') ? 'image' : 'file',
//     });
//   } catch (error) {
//     console.error('File upload error:', error);
//     res.status(500).json({ error: 'File upload failed' });
//   }
// });



server.listen(process.env.PORT || 8080, () => {
  console.log(`server is running http://localhost:${process.env.PORT || 8080}`);
});
