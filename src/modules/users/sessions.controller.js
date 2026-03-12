import { asyncHandler } from "../../utils/asyncHandler.js";
import { success } from "../../utils/apiResponse.js";

import {
  getMySessions,
  revokeMySession,
  revokeAllOtherSessions
} from "./sessions.service.js";

import { revokeSessionSchema } from "./users.extra.schema.js";

/* ---------------------------------------------
   LIST MY SESSIONS
--------------------------------------------- */
export const listMySessionsHandler = asyncHandler(async (req, res) => {
  const sessions = await getMySessions(req.user);
  success(res, sessions);
});

/* ---------------------------------------------
   REVOKE ONE SESSION
--------------------------------------------- */
export const revokeSessionHandler = asyncHandler(async (req, res) => {
  const { session_id } = revokeSessionSchema.parse(req.body);

  await revokeMySession(req.user, session_id, {
    ip: req.ip,
    browser: req.headers["user-agent"]
  });

  success(res, null, "Session revoked");
});

/* ---------------------------------------------
   REVOKE ALL OTHER SESSIONS
--------------------------------------------- */
export const revokeOtherSessionsHandler = asyncHandler(async (req, res) => {
  if (!req.sessionId) {
    throw {
      status: 400,
      message: "Current session not identified"
    };
  }

  await revokeAllOtherSessions(
    req.user,
    req.sessionId,
    {
      ip: req.ip,
      browser: req.headers["user-agent"]
    }
  );

  success(res, null, "Other sessions revoked");
});
