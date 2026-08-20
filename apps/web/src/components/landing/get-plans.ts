import { db } from '@repo/db';
import type { LandingPlan } from './plan-types';

export async function getLandingPlans(): Promise<LandingPlan[]> {
  try {
    const plans = await db.subscriptionPlan.findMany({
      where: { active: true },
      include: {
        services: {
          include: { service: true },
        },
      },
      orderBy: { monthlyPrice: 'asc' },
    });

    return plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      monthlyPriceCents: Math.round(Number(plan.monthlyPrice) * 100),
      quarterlyPriceCents: plan.quarterlyPrice
        ? Math.round(Number(plan.quarterlyPrice) * 100)
        : 0,
      annualPriceCents: plan.annualPrice
        ? Math.round(Number(plan.annualPrice) * 100)
        : 0,
      services: plan.services.map((ps) => ({
        id: ps.id,
        frequency: ps.frequency,
        name: ps.service.name,
      })),
    }));
  } catch (error) {
    console.error('Failed to load subscription plans for landing page', error);
    return [];
  }
}
