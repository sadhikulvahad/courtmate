import express from "express";
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
import path from "path";
import { Server } from 'socket.io'
import http from 'http'

const corsOptions = {
  origin: 'http://localhost:5173',
  // origin: 'http://172.16.0.17:5173', 
  credentials: true,
  exposedHeaders: ['x-access-token'],
};

const app = express();
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  }
})

app.set('io', io)

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-video-room", (roomId: string) => {
    socket.join(roomId);
    const participants = io.sockets.adapter.rooms.get(roomId);

    if (participants && participants.size > 1) {
      // Notify existing user(s) to send offer
      socket.to(roomId).emit("user-joined");
    }

    console.log(`Socket ${socket.id} joined room ${roomId}`);
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
});

app.use('/payment', paymentRouoter)

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(logger("dev"))
app.use(cookieParser());
app.use(cors(corsOptions))
configureGoogleStrategy()
app.use(passport.initialize())
connectDB();

import './src/infrastructure/services/bookingExpirationJob'
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



server.listen(process.env.PORT || 8080, () => {
  console.log(`server is running http://localhost:${process.env.PORT || 8080}`);
});
