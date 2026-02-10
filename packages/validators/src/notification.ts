import { z } from "zod";

export const registerPushTokenInput = z.object({
  token: z.string().min(1, "Token is required"),
  platform: z.enum(["ios", "android", "web"]),
});

export type RegisterPushTokenInput = z.infer<typeof registerPushTokenInput>;
