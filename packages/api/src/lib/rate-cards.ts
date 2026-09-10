import type { PrismaClient } from '@repo/db';
import { isLaunchZip, normalizeZip } from '@repo/validators';

export function providerServesZip(
  serviceAreaZips: string | null | undefined,
  zip: string,
) {
  if (!serviceAreaZips) return false;
  const needle = normalizeZip(zip);
  return serviceAreaZips
    .split(',')
    .map((item) => normalizeZip(item))
    .includes(needle);
}

export function hasContractedRates(
  services: { serviceId: string; customPrice: unknown }[],
  requiredServiceIds: string[],
) {
  return requiredServiceIds.every((serviceId) => {
    const row = services.find((item) => item.serviceId === serviceId);
    return row != null && row.customPrice != null;
  });
}

export async function findPlanProviders(
  db: PrismaClient,
  opts: { zip: string; serviceIds: string[] },
) {
  if (!isLaunchZip(opts.zip) || opts.serviceIds.length === 0) return [];

  const providers = await db.providerProfile.findMany({
    where: {
      verified: true,
      stripeTransfersEnabled: true,
      services: { some: { serviceId: { in: opts.serviceIds } } },
    },
    include: {
      services: true,
      user: { select: { id: true, email: true } },
    },
  });

  return providers.filter(
    (provider) =>
      providerServesZip(provider.serviceAreaZips, opts.zip) &&
      hasContractedRates(provider.services, opts.serviceIds),
  );
}

export async function planIsSellableInZip(
  db: PrismaClient,
  opts: { planId: string; zip: string },
) {
  const plan = await db.subscriptionPlan.findUnique({
    where: { id: opts.planId },
    include: { services: true },
  });
  if (!plan || !plan.active) return false;
  const matches = await findPlanProviders(db, {
    zip: opts.zip,
    serviceIds: plan.services.map((item) => item.serviceId),
  });
  return matches.length > 0;
}
