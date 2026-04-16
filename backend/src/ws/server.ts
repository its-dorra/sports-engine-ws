import { Hono } from "hono";
import { upgradeWebSocket } from "hono/bun";
import { WSContext } from "hono/ws";
import { Match } from "../db/schema";

const clients = new Set<WSContext>();

type WebSocketPayload =
  | { type: "welcome" }
  | { type: "match_created"; data: Match };

function sendJson(socket: WSContext, payload: WebSocketPayload) {
  if (socket.readyState !== WebSocket.OPEN) return;

  return socket.send(JSON.stringify(payload));
}

export function broadcastJson(data: WebSocketPayload) {
  clients.forEach((client) => {
    sendJson(client, data);
  });
}

export function attachWebSocketHandler(app: Hono) {
  app.get(
    "/ws",
    upgradeWebSocket((c) => ({
      onOpen: (evt, ws) => {
        clients.add(ws);
        sendJson(ws, { type: "welcome" });
      },
      onMessage: (evt, ws) => {},
      onError: (evt, ws) => {
        console.error("WebSocket error:", evt);
      },
      onClose: (evt, ws) => {},
    })),
  );
}
