import { getAllClients, getMatchClients } from "./state";
import { sendJson } from "./send";

export function broadcastToMatch(matchId: number, payload: unknown) {
  const clients = getMatchClients(matchId);

  if (!clients || clients.size === 0) return;

  clients.forEach((socket) => {
    sendJson(socket, payload);
  });
}

export function broadcastToAll(payload: unknown) {
  getAllClients().forEach((socket) => {
    sendJson(socket, payload);
  });
}
