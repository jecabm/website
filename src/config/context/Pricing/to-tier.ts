import type { PricingTier } from '@/content/countries/types';

import type { Plan, PlanCurrency, PlanInterval } from './index';

const priceFor = (plan: Plan, interval: PlanInterval, currency: string): PlanCurrency | undefined =>
  plan.planCurrencies?.find(
    (entry) =>
      entry.interval === interval &&
      entry.currency === currency &&
      entry.status === 'active' &&
      !entry.archive,
  );

// Shown exactly as stored: the yearly row is the amount charged per year, the monthly row the
// amount charged per month. No conversion between the two.
const amountFor = (plan: Plan, interval: PlanInterval, currency: string): number | null => {
  const price = priceFor(plan, interval, currency);
  if (!price) return null;
  const amount = Number(price.price);
  return Number.isFinite(amount) ? amount : null;
};

const featuresFrom = (plan: Plan): string[] =>
  (plan.description ?? '')
    .split('\n')
    .map((line) => line.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean);

interface TierOptions {
  currency: string;
  startFreeTrial: string;
  talkToSales: string;
}

export function planToTier(plan: Plan, options: TierOptions): PricingTier {
  const { currency, startFreeTrial, talkToSales } = options;

  return {
    id: String(plan.id),
    name: plan.name.trim(),
    description: '',
    monthlyAmount: amountFor(plan, 'month', currency),
    annualAmount: amountFor(plan, 'year', currency),
    features: featuresFrom(plan),
    cta: plan.contactSales ? talkToSales : startFreeTrial,
    popular: plan.position === 2,
    contactSales: plan.contactSales,
    custom: !plan.showPrice,
  };
}
