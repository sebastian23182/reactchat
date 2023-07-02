import express from "express";
import { Server } from "socket.io";
import http from "http";
import crypto from"crypto";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://reactchat-woad.vercel.app"
  }
})

const rooms = new Map(); 

// Generar un ID único para las salas
function generateRoomId() {
  return crypto.randomUUID();
}

io.on("connection", (socket) => {
  let cryptoid;
  socket.on("disconnect", () => {
    if(!!cryptoid){
      if(rooms.get(cryptoid).length === 1){
        rooms.delete(cryptoid);
      } else {
        rooms.get(cryptoid)?.splice(rooms.get(cryptoid).indexOf(socket.id), 1);
        socket.leave(cryptoid);
        io.to(cryptoid).emit("roomCount", rooms.get(cryptoid).length);
        io.to(cryptoid).emit("leaveRoom");
      }
    }
  });

  socket.on("leaveRoom", (roomId) => {
    io.to(Array.from(socket.rooms)[1]).emit("leaveRoom");

    let roomToJoin;
    
    const availableRoom = Array.from(rooms).find(([key, users]) => users.length < 2 && key !== roomId);

    if (availableRoom) {
      roomToJoin = availableRoom[0];
      availableRoom[1].push(socket.id);
      cryptoid = roomToJoin;
    } else {
      roomToJoin = generateRoomId();
      rooms.set(roomToJoin, [socket.id]);
      cryptoid = roomToJoin;
    }
    
    rooms.get(roomId)?.splice(rooms.get(roomId).indexOf(socket.id), 1);
    socket.leave(roomId);
    socket.join(roomToJoin);
    socket.emit("join", roomToJoin);
    io.to(roomId).emit("roomCount", rooms.get(roomId).length);
    io.to(roomToJoin).emit("roomCount", rooms.get(roomToJoin).length);
  });

  socket.on("join", () => {
    let roomToJoin;
    
    const availableRoom = Array.from(rooms).find(([_, users]) => users.length < 2);

    if (availableRoom) {
      roomToJoin = availableRoom[0];
      availableRoom[1].push(socket.id);
      cryptoid = roomToJoin;
    } else {
      roomToJoin = generateRoomId();
      rooms.set(roomToJoin, [socket.id]);
      cryptoid = roomToJoin;
    }

    socket.join(roomToJoin);
    socket.emit("join", roomToJoin);
    io.to(roomToJoin).emit("roomCount", rooms.get(roomToJoin).length);
  });

  socket.on("message", (body) => {
    socket.to(body.room).emit("message", {
      body,
      from: socket.id,
    });
  });
});

server.listen(4000);
