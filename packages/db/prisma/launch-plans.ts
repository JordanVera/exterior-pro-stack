import type { PrismaClient, ServiceFrequency } from '@prisma/client';

export type LaunchPlanService = {
  serviceName: string;
  frequency: ServiceFrequency;
};

export type LaunchPlanDefinition = {
  name: string;
  description: string;
  monthlyPrice: number;
  quarterlyPrice: number;
  annualPrice: number;
  services: LaunchPlanService[];
};

/** Houston launch mix: lawn + gutters + wash. Prices stay $99 / $179 / $299. */
export const LAUNCH_PLANS: LaunchPlanDefinition[] = [
  {
    name: 'Basic Lawn Care',
    description:
      'Bi-weekly mowing, monthly weed control, and quarterly fertilization. A kept Houston lawn — right for smaller lots and rentals, not a midsummer HOA showpiece.',
    monthlyPrice: 99,
    quarterlyPrice: 269,
    annualPrice: 990,
    services: [
      { serviceName: 'Bi-Weekly Lawn Mowing', frequency: 'BIWEEKLY' },
      { serviceName: 'Weed Control Treatment', frequency: 'MONTHLY' },
      { serviceName: 'Lawn Fertilization', frequency: 'QUARTERLY' },
    ],
  },
  {
    name: 'Standard Exterior',
    description:
      'The Houston standard: weekly mowing, monthly weed control, quarterly fertilization, and quarterly gutter cleaning. Lawn company plus gutter company on one bill.',
    monthlyPrice: 179,
    quarterlyPrice: 479,
    annualPrice: 1790,
    services: [
      { serviceName: 'Weekly Lawn Mowing', frequency: 'WEEKLY' },
      { serviceName: 'Weed Control Treatment', frequency: 'MONTHLY' },
      { serviceName: 'Lawn Fertilization', frequency: 'QUARTERLY' },
      { serviceName: 'Gutter Clean & Flush', frequency: 'QUARTERLY' },
    ],
  },
  {
    name: 'Premium Exterior',
    description:
      'Full exterior care: weekly mowing, monthly weed control, quarterly fertilization and gutters, quarterly driveway wash, and twice-yearly house siding wash. Windows, roof, and paint stay on-demand.',
    monthlyPrice: 299,
    quarterlyPrice: 799,
    annualPrice: 2990,
    services: [
      { serviceName: 'Weekly Lawn Mowing', frequency: 'WEEKLY' },
      { serviceName: 'Weed Control Treatment', frequency: 'MONTHLY' },
      { serviceName: 'Lawn Fertilization', frequency: 'QUARTERLY' },
      { serviceName: 'Gutter Clean & Flush', frequency: 'QUARTERLY' },
      { serviceName: 'Driveway Pressure Wash', frequency: 'QUARTERLY' },
      { serviceName: 'House Siding Wash', frequency: 'BIANNUALLY' },
    ],
  },
];

/**
 * Idempotent: upserts the three launch plans by name and replaces PlanService
 * rows. Does not touch Stripe price IDs or existing subscriptions.
 */
export async function syncLaunchPlans(prisma: PrismaClient) {
  const needed = [
    ...new Set(
      LAUNCH_PLANS.flatMap((plan) =>
        plan.services.map((service) => service.serviceName),
      ),
    ),
  ];
  const services = await prisma.service.findMany({
    where: { name: { in: needed } },
  });
  const byName = new Map(services.map((service) => [service.name, service]));
  const missing = needed.filter((name) => !byName.has(name));
  if (missing.length > 0) {
    throw new Error(
      `Launch plans are missing catalog services: ${missing.join(', ')}`,
    );
  }

  const results = [];
  for (const def of LAUNCH_PLANS) {
    const plan = await prisma.subscriptionPlan.upsert({
      where: { name: def.name },
      create: {
        name: def.name,
        description: def.description,
        monthlyPrice: def.monthlyPrice,
        quarterlyPrice: def.quarterlyPrice,
        annualPrice: def.annualPrice,
        active: true,
      },
      update: {
        description: def.description,
        monthlyPrice: def.monthlyPrice,
        quarterlyPrice: def.quarterlyPrice,
        annualPrice: def.annualPrice,
        active: true,
      },
    });

    await prisma.planService.deleteMany({ where: { planId: plan.id } });
    await prisma.planService.createMany({
      data: def.services.map((service) => ({
        planId: plan.id,
        serviceId: byName.get(service.serviceName)!.id,
        frequency: service.frequency,
      })),
    });

    results.push(
      await prisma.subscriptionPlan.findUniqueOrThrow({
        where: { id: plan.id },
        include: { services: { include: { service: true } } },
      }),
    );
  }

  return results;
}
