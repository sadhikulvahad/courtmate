
import { injectable } from 'inversify';
import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

// SocketServer.ts
@injectable()
export class SocketServer {
  private io!: SocketIOServer;

  initialize(server: HttpServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: (origin, callback) => {
          const allowedOrigins = [process.env.REDIRECT_URL, 'http://localhost:5173'];
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            console.error(`CORS error: Origin ${origin} not allowed`);
            callback(new Error('Not allowed by CORS'));
          }
        },
        methods: ['GET', 'POST'],
        credentials: true,
      },
      path: '/socket.io/',
      transports: ['polling', 'websocket'],
    });
    console.log('Socket.IO initialized with CORS origin:', process.env.REDIRECT_URL);
  }

  getIOServer(): SocketIOServer {
    return this.io;
  }
}
