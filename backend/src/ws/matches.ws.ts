import { Match } from "../db/schema";
import { broadcastToAll } from "./broadcast";

export function broadCastMatchCreated(match: Match) {
  broadcastToAll({ type: "match_created", data: match });
}
