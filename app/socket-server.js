import { Server } from "socket.io";

let io;

export function initSocket(server) {
  if (!io) {
    io = new Server(server, {
      cors: { origin: "*" }
    });
    console.log("✅ Socket.IO initialized");

    io.on("connection", (socket) => {
      console.log("New client connected", socket.id);
      socket.emit("hello", "Welcome to Red Team Challenge");
    });
  }
  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}
