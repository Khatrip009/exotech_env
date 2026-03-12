import { asyncHandler } from "../../utils/asyncHandler.js";
import { success } from "../../utils/apiResponse.js";
import { refreshAccessToken } from "./auth.refresh.service.js";
import { logoutCurrentSession } from "./auth.logout.service.js";
import { adminRevokeUserSessions } from "./admin.session.service.js";

export const refreshHandler = asyncHandler(async (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) {
    throw { status: 400, message: "Refresh token required" };
  }

  const meta = {
    browser: req.headers["user-agent"],
    ip: req.ip
  };

  const token = await refreshAccessToken(refreshToken, meta);
  success(res, token, "Access token refreshed");
});

export const logoutHandler = asyncHandler(async (req, res) => {
  const meta = {
    browser: req.headers["user-agent"],
    ip: req.ip
  };

  await logoutCurrentSession(req.user, meta);
  success(res, null, "Logged out successfully");
});

export const adminRevokeHandler = asyncHandler(async (req, res) => {
  const meta = {
    browser: req.headers["user-agent"],
    ip: req.ip
  };

  await adminRevokeUserSessions(req.user, req.params.userId, meta);
  success(res, null, "User sessions revoked");
});
