import { Match } from "../db/schema";
import { broadcastJson } from "./server";

export function broadCastMatchCreated(match: Match) {
  broadcastJson({ type: "match_created", data: match });
}
