import { asyncHandler } from "../../utils/asyncHandler.js";
import { success } from "../../utils/apiResponse.js";
import { loginSchema } from "./auth.schema.js";
import { login } from "./auth.service.js";

export const loginHandler = asyncHandler(async (req, res) => {
  const payload = loginSchema.parse(req.body);

  const meta = {
    device: req.headers["x-device"] || "web",
    browser: req.headers["user-agent"],
    ip: req.ip
  };

  const tokens = await login(payload, meta);
  success(res, tokens, "Login successful");
});
