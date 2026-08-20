import { z } from "zod";
import { requiredServiceAreaZipsSchema } from "./zips";

export const phoneSchema = z
  .string()
  .regex(/^\+1\d{10}$/, "Phone must be in format +1XXXXXXXXXX");

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address")
  .max(191);

export const sendCodeInput = z.object({
  email: emailSchema,
});

export const verifyCodeInput = z.object({
  email: emailSchema,
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

export const updateCustomerProfileInput = z.object({
  firstName: z.string().min(1, "First name is required").max(100).optional(),
  lastName: z.string().min(1, "Last name is required").max(100).optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
});

export const providerOnboardingInput = z
  .object({
    businessName: z.string().min(1, "Business name is required").max(200),
    description: z.string().max(2000).optional(),
    serviceAreaZips: requiredServiceAreaZipsSchema,
    logoUrl: z.string().url().max(2048).optional(),
    logoPathname: z.string().max(1024).optional(),
    serviceIds: z
      .array(z.string().cuid())
      .min(1, "Select at least one service")
      .max(50),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
  })
  .refine((value) => Boolean(value.logoUrl) === Boolean(value.logoPathname), {
    message: "Logo upload is incomplete",
    path: ["logoUrl"],
  });

export type SendCodeInput = z.infer<typeof sendCodeInput>;
export type VerifyCodeInput = z.infer<typeof verifyCodeInput>;
export type SelectRoleInput = z.infer<typeof selectRoleInput>;
export type CustomerOnboardingInput = z.infer<typeof customerOnboardingInput>;
export type UpdateCustomerProfileInput = z.infer<typeof updateCustomerProfileInput>;
export type ProviderOnboardingInput = z.infer<typeof providerOnboardingInput>;
