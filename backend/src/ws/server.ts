import { Hono } from "hono";
import { upgradeWebSocket } from "hono/bun";
import { WSContext } from "hono/ws";
import { Match } from "../db/schema";

const clients = new Map<WSContext, { isAlive: boolean }>();

type WebSocketPayload =
  | { type: "welcome" }
  | { type: "match_created"; data: Match };

function sendJson(socket: WSContext, payload: WebSocketPayload) {
  if (socket.readyState !== WebSocket.OPEN) return;

  try {
    socket.send(JSON.stringify(payload));
  } catch (error) {
    console.error("Failed to send message:", error);
    clients.delete(socket);
  }
}

export function broadcastJson(data: WebSocketPayload) {
  Array.from(clients.keys()).forEach((socket) => {
    if (socket.readyState === WebSocket.OPEN) sendJson(socket, data);
  });
}

export function attachWebSocketHandler(app: Hono) {
  app.get(
    "/ws",
    upgradeWebSocket((c) => ({
      onOpen: (evt, ws) => {
        clients.set(ws, { isAlive: true });
        sendJson(ws, { type: "welcome" });
      },
      onMessage: (evt, ws) => {},
      onError: (evt, ws) => {
        console.error("WebSocket error:", evt);
        clients.delete(ws);
      },
      onClose: (evt, ws) => {
        clients.delete(ws);
      },
    })),
  );
}
