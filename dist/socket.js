"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.init = void 0;
const socket_io_1 = require("socket.io");
let io;
// export const init = (server: Server, ) => {
//   // Share the socket instance to all other modules
//   io = server;
//   return io;
// };
//share the socket instance to all other modules
const init = (server) => {
    io = new socket_io_1.Server(server, {
        cors: { origin: "*" },
    });
    return io;
};
exports.init = init;
const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }
    return io;
};
exports.getIO = getIO;
//# sourceMappingURL=socket.js.map