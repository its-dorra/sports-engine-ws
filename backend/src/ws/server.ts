import { Hono } from "hono";
import { upgradeWebSocket } from "hono/bun";
import { WSContext } from "hono/ws";
import { Match } from "../db/schema";
import { webSocketArcjet } from "../arcjet";

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
      onOpen: async (evt, ws) => {
        try {
          const decision = await webSocketArcjet.protect(c.req.raw);

          if (decision.isDenied()) {
            const code = decision.reason.isRateLimit() ? 1013 : 1008; // 1013: Try Again Later, 1008: Policy Violation

            const reason = decision.reason.isRateLimit()
              ? "Rate limit exceeded. Please try again later."
              : "Access denied.";

            ws.close(code, reason);
            return;
          }
        } catch (error) {
          console.error("Error in onOpen:", error);
          ws.close(1011, "Internal server error");
          return;
        }

        clients.set(ws, { isAlive: true });
        sendJson(ws, { type: "welcome" });
      },
      onMessage: (evt, ws) => {},
      onError: (evt, ws) => {
        console.error("WebSocket error:", evt);
        clients.delete(ws);
        ws.close();
      },
      onClose: (evt, ws) => {
        clients.delete(ws);
        ws.close();
      },
    })),
  );
}
