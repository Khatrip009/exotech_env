import { asyncHandler } from "../../utils/asyncHandler.js";
import { success } from "../../utils/apiResponse.js";
import { getSuggestions } from "./users.suggestions.service.js";

export const followSuggestionsHandler = asyncHandler(async (req, res) => {
  const data = await getSuggestions(req.user);
  success(res, data);
});
