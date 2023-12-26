import socketIOClient from "socket.io-client";
const endpoint = `${window.location.hostname}:${window.location.port}`;
export const socket = socketIOClient.io(endpoint);

const onSocketConnectCallbacks: any = [];

socket.on("connect", () => {
  console.log("Socket connected");
  onSocketConnectCallbacks.forEach((callback) => callback());
});

export function onSocketConnect(callback) {
  onSocketConnectCallbacks.push(callback);
}
