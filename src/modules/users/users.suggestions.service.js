import { getFollowSuggestions } from "./users.suggestions.repository.js";

export async function getSuggestions(user) {
  return getFollowSuggestions(user.id);
}
