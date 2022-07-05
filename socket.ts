import { Server } from "socket.io";
import { Server as HttpServer } from "http";

let io: Server;

//share the socket instance to all other modules
export const init = (server: HttpServer) => {
  io = new Server(server, {
    cors: { origin: "*" },
  });
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
