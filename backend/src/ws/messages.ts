import { WSContext, WSMessageReceive } from "hono/ws";
import { sendJson } from "./send";
import { subscribeClientToMatch, unsubscribeClientFromMatch } from "./state";
import { ServerWebSocket } from "bun";

type MatchSubscriptionAction = "subscribe" | "unsubscribe";

type MatchSubscriptionMessage = {
  type: MatchSubscriptionAction;
  matchId: number;
};

export function handleIncomingMessage(
  socket: WSContext<ServerWebSocket>,
  data: WSMessageReceive,
) {
  const message = parseMessage(data);

  if (!message) {
    sendJson(socket, { type: "error", message: "Invalid JSON format" });
    return;
  }

  if (isMatchSubscriptionMessage(message, "subscribe")) {
    subscribeClientToMatch(socket, message.matchId);
    sendJson(socket, { type: "subscribed", matchId: message.matchId });
    return;
  }

  if (isMatchSubscriptionMessage(message, "unsubscribe")) {
    unsubscribeClientFromMatch(socket, message.matchId);
    sendJson(socket, { type: "unsubscribed", matchId: message.matchId });
  }
}

function parseMessage(data: WSMessageReceive): unknown | null {
  const raw = typeof data === "string" ? data : data.toString();

  try {
    return JSON.parse(raw);
  } catch {
    console.error("Invalid JSON message:", data);
    return null;
  }
}

function isMatchSubscriptionMessage(
  value: unknown,
  action: MatchSubscriptionAction,
): value is MatchSubscriptionMessage {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    candidate.type === action &&
    typeof candidate.matchId === "number" &&
    Number.isInteger(candidate.matchId)
  );
}
