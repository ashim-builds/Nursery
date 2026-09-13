import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer | null = null;

export function initSocketIO(httpServer: HttpServer, allowedOrigin: string | boolean | string[] = true): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => callback(null, true),
      methods: ['GET', 'POST', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['*'],
    },
    path: '/socket.io',
    transports: ['polling', 'websocket'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on('connection', (socket) => {
    // Room joining for authenticated user or staff
    socket.on('join', (room: string) => {
      if (room && typeof room === 'string') {
        socket.join(room);
      }
    });

    socket.on('leave', (room: string) => {
      if (room && typeof room === 'string') {
        socket.leave(room);
      }
    });
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

/**
 * Emit a real-time event to all connected clients or a specific room
 */
export function emitLiveEvent(event: string, payload: any, room?: string): void {
  if (!io) return;

  const data = {
    ...payload,
    _timestamp: Date.now(),
  };

  if (room) {
    io.to(room).emit(event, data);
  } else {
    io.emit(event, data);
  }
}
