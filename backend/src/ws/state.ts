import { ServerWebSocket } from "bun";
import { WSContext } from "hono/ws";

const allClients = new Set<WSContext<ServerWebSocket>>();
const matchClients = new Map<number, Set<WSContext<ServerWebSocket>>>();

export function addClient(socket: WSContext<ServerWebSocket>) {
  allClients.add(socket);
}

export function removeClient(socket: WSContext<ServerWebSocket>) {
  removeSocketFromSet(allClients, socket);
  removeFromAllMatches(socket);
}

export function subscribeClientToMatch(
  socket: WSContext<ServerWebSocket>,
  matchId: number,
) {
  socket.raw?.subscribe(matchId.toString());

  if (!matchClients.has(matchId)) {
    matchClients.set(matchId, new Set());
  }

  matchClients.get(matchId)!.add(socket);
}

export function unsubscribeClientFromMatch(
  socket: WSContext<ServerWebSocket>,
  matchId: number,
) {
  const clients = matchClients.get(matchId);

  if (clients) {
    removeSocketFromSet(clients, socket);
  }

  if (matchClients.get(matchId)?.size === 0) {
    matchClients.delete(matchId);
  }
}

export function getAllClients() {
  return allClients;
}

export function getMatchClients(matchId: number) {
  return matchClients.get(matchId);
}

function removeFromAllMatches(socket: WSContext<ServerWebSocket>) {
  for (const [matchId, clients] of Array.from(matchClients.entries())) {
    removeSocketFromSet(clients, socket);

    if (clients.size === 0) {
      matchClients.delete(matchId);
    }
  }
}

function removeSocketFromSet(
  sockets: Set<WSContext<ServerWebSocket>>,
  targetSocket: WSContext<ServerWebSocket>,
) {
  sockets.forEach((socket) => {
    if (socket === targetSocket || socket.raw === targetSocket.raw) {
      sockets.delete(socket);
    }
  });
}
