import { Hono } from "hono";
import { upgradeWebSocket } from "hono/bun";
import { webSocketArcjet } from "../arcjet";
import { broadcastToAll, broadcastToMatch } from "./broadcast";
import { handleIncomingMessage } from "./messages";
import { sendJson } from "./send";
import { addClient, removeClient } from "./state";

export { broadcastToAll, broadcastToMatch };

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

        addClient(ws);
        sendJson(ws, { type: "welcome" });
      },
      onMessage: (evt, ws) => {
        handleIncomingMessage(ws, evt.data);
      },
      onError: (evt, ws) => {
        console.error("WebSocket error:", evt);
        removeClient(ws);
        if (ws.readyState === WebSocket.OPEN)
          ws.close(1011, "Internal server error");
      },
      onClose: (_, ws) => {
        removeClient(ws);
      },
    })),
  );
}
