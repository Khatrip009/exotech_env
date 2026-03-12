// src/modules/notifications/notifications.schema.js
import { z } from "zod";

export const preferencesSchema = z.object({
  email_enabled: z.boolean(),
  push_enabled: z.boolean()
});
