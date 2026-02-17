import { z } from "zod";

export const updateProviderProfileInput = z.object({
  businessName: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  serviceArea: z.string().max(500).optional(),
  serviceAreaZips: z.string().max(1000).optional(),
});

export const setProviderServicesInput = z.object({
  services: z.array(
    z.object({
      serviceId: z.string().cuid(),
      customPrice: z.number().positive().optional(),
    })
  ),
});

export type UpdateProviderProfileInput = z.infer<typeof updateProviderProfileInput>;
export type SetProviderServicesInput = z.infer<typeof setProviderServicesInput>;
