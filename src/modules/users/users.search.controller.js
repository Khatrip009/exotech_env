import { asyncHandler } from "../../utils/asyncHandler.js";
import { success } from "../../utils/apiResponse.js";
import { searchUsers } from "./users.search.repository.js";

export const searchUsersHandler = asyncHandler(async (req, res) => {
  const q = req.query.q?.trim();
  if (!q) {
    return success(res, []);
  }

  const data = await searchUsers(q, req.user.id);
  success(res, data);
});
