import { z } from "zod";

export const phoneSchema = z
  .string()
  .regex(/^\+1\d{10}$/, "Phone must be in format +1XXXXXXXXXX");

export const sendCodeInput = z.object({
  phone: phoneSchema,
});

export const verifyCodeInput = z.object({
  phone: phoneSchema,
  code: z.string().length(6, "Code must be 6 digits"),
});

export const selectRoleInput = z.object({
  role: z.enum(["CUSTOMER", "PROVIDER"]),
});

export const customerOnboardingInput = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
});

export const providerOnboardingInput = z.object({
  businessName: z.string().min(1, "Business name is required").max(200),
  description: z.string().max(2000).optional(),
  serviceArea: z.string().max(500).optional(),
});

export type SendCodeInput = z.infer<typeof sendCodeInput>;
export type VerifyCodeInput = z.infer<typeof verifyCodeInput>;
export type SelectRoleInput = z.infer<typeof selectRoleInput>;
export type CustomerOnboardingInput = z.infer<typeof customerOnboardingInput>;
export type ProviderOnboardingInput = z.infer<typeof providerOnboardingInput>;
