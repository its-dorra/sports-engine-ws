import { Commentary } from "../db/schema";
import { broadcastToMatch } from "./broadcast";

export function broadcastCommentaryCreated(
  matchId: number,
  commentary: Commentary,
) {
  broadcastToMatch(matchId, { type: "commentary", data: commentary });
}
