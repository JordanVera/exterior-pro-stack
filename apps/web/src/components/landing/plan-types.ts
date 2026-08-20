export type LandingPlan = {
  id: string;
  name: string;
  description: string | null;
  monthlyPriceCents: number;
  quarterlyPriceCents: number;
  annualPriceCents: number;
  services: Array<{
    id: string;
    frequency: string;
    name: string;
  }>;
};
