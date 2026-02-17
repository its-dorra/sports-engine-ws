import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (socket, request) => {
  const ip = request.socket.remoteAddress;
  console.log(`New client connected: ${ip}`);

  socket.on("message", (rawData) => {
    const message = rawData.toString();
    console.log(`Received message from ${ip}: ${message}`);

    console.log("clients", wss.clients.size);

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(`Message from ${ip}: ${message}`);
      }
    });
  });

  socket.on("error", (error) => {
    console.error(`Error with client ${ip}:`, error);
  });

  socket.on("close", () => {
    console.log(`Client disconnected: ${ip}`);
  });
});
