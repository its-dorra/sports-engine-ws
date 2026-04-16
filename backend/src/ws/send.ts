import { WSContext } from "hono/ws";

export function sendJson(socket: WSContext, payload: unknown) {
  if (socket.readyState !== WebSocket.OPEN) return;

  try {
    socket.send(JSON.stringify(payload));
  } catch (error) {
    console.error("Failed to send message:", error);
  }
}
