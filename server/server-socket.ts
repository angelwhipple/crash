import type http from "http";
import { Server, Socket } from "socket.io";
import User from "../shared/User";
import Community from "../shared/Community";
let io: Server;

const userToSocketMap: Map<string, Socket> = new Map<string, Socket>(); // maps user ID to socket object
const socketToUserMap: Map<string, User> = new Map<string, User>(); // maps socket ID to user object

const socketToCommunityMap: Map<string, Community> = new Map<string, Community>(); // maps socket ID to a community object

export const getSocketFromUserID = (userid: string) => userToSocketMap.get(userid);
export const getUserFromSocketID = (socketid: string) => socketToUserMap.get(socketid);
export const getSocketFromSocketID = (socketid: string) => io.sockets.sockets.get(socketid);
export const getCommunityFromSocketID = (socketid: string) => socketToCommunityMap.get(socketid);

export const addUser = (user: User, socket: Socket): void => {
  const oldSocket = userToSocketMap.get(user._id);
  if (oldSocket && oldSocket.id !== socket.id) {
    // there was an old tab open for this user, force it to disconnect
    // TODO(weblab student): is this the behavior you want?
    oldSocket.disconnect();
    socketToUserMap.delete(oldSocket.id);
  }
  userToSocketMap.set(user._id, socket);
  socketToUserMap.set(socket.id, user);
};

export const removeUser = (user: User, socket: Socket): void => {
  if (user) userToSocketMap.delete(user._id);
  socketToUserMap.delete(socket.id);
};

export const init = (server: http.Server): void => {
  io = new Server(server);
  io.on("connection", (socket) => {
    console.log(`socket has connected ${socket.id}`);
    socket.on("disconnect", () => {
      console.log(`socket has disconnected ${socket.id}`);
      const user = getUserFromSocketID(socket.id);
      if (user !== undefined) removeUser(user, socket);
    });

    // ADD socket.on EVENTS AS NEEDED

    socket.on("login success", () => {
      console.log(`socket has logged in successfully ${socket.id}`);
      io.emit("login success", {});
    });
    socket.on("nav toggle all", () => {
      console.log(`socket has toggled nav bar ${socket.id}`);
      io.emit("nav toggle all", {});
    });
    socket.on("privacy policy", () => {
      console.log(`socket has acknowledged privacy policy ${socket.id}`);
      io.emit("privacy policy", {});
    });
    socket.on("terms of service", () => {
      console.log(`socket has acknowledged terms of service ${socket.id}`);
      io.emit("terms of service", {});
    });
    socket.on("switched communities", (event) => {
      console.log(`socket has switched communities ${socket.id}`);
      io.emit("switched communities", { community: event.community });
    });
    socket.on("create new community", (event) => {
      console.log(`socket has elected to start a new community ${socket.id}`);
      io.emit("create new community");
    });
  });
};

export const getIo = () => io;

export default {
  getIo,
  init,
  removeUser,
  addUser,
  getSocketFromSocketID,
  getUserFromSocketID,
  getSocketFromUserID,
};
