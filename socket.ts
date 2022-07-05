import { Server } from "socket.io";

let io: any;

// export const init = (server: Server, ) => {
//   // Share the socket instance to all other modules
//   io = server;
//   return io;
// };

//share the socket instance to all other modules
export const init = (server: any) => {
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
