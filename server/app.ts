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
import path from "path";
import {Server} from 'socket.io'
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

io.on('connection', (socket) => {
  console.log('a user connected', socket.id)
  socket.on("join", (userId) => {
    socket.join(userId)
  })
  socket.on("disconnect", () => {
    console.log('user disconnected', socket.id)
  })
})

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(logger("dev"))
app.use(cookieParser());
app.use(cors(corsOptions))
configureGoogleStrategy()
app.use(passport.initialize())
connectDB();

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



server.listen(process.env.PORT || 8080, () => {
  console.log(`server is running http://localhost:${process.env.PORT || 8080}`);
});
