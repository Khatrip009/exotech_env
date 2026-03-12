export function normalizeZodError(zodError) {
  const errors = {};

  for (const issue of zodError.issues) {
    const path = issue.path.join(".") || "root";

    // First error per field only (important)
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }

  return errors;
}
