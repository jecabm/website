import type { CountryContent, FaqItem, PricingTier } from '@/content/countries/types';
import { pick } from '@/lib/content-merge';

interface SanityTier {
  _key?: string;
  name?: string;
  description?: string;
  monthlyAmount?: number | null;
  annualAmount?: number | null;
  features?: string[];
  cta?: string;
  popular?: boolean;
  contactSales?: boolean;
  custom?: boolean;
}

/** Shape returned by `pricingPageQuery` — every field optional since Studio editors may leave fields blank. */
export interface SanityPricingDoc {
  country?: 'au' | 'co';
  hero?: {
    eyebrow?: string;
    title?: string;
    subtitle?: string;
    note?: string;
  };
  tiers?: SanityTier[];
  labels?: {
    perMonth?: string;
    perYear?: string;
    custom?: string;
    mostPopular?: string;
    billingMonthly?: string;
    billingAnnual?: string;
    annualSavings?: string;
    comparePlans?: string;
    compareSubtitle?: string;
    featureColumn?: string;
    categories?: {
      core?: string;
      compliance?: string;
      teamLocations?: string;
      enterprise?: string;
      support?: string;
    };
  };
  faq?: {
    title?: string;
    items?: FaqItem[];
  };
  closing?: {
    title?: string;
    subtitle?: string;
  };
}

function mergeTiers(base: PricingTier[], override?: SanityTier[]): PricingTier[] {
  if (!override || override.length === 0) return base;
  return override.map((t, i) => ({
    id: t._key ?? `tier-${i}`,
    name: pick(t.name, ''),
    description: pick(t.description, ''),
    monthlyAmount: t.monthlyAmount ?? null,
    annualAmount: t.annualAmount ?? null,
    features: pick(t.features, []),
    cta: pick(t.cta, ''),
    popular: t.popular ?? false,
    contactSales: t.contactSales ?? false,
    custom: t.custom ?? t.monthlyAmount == null,
  }));
}

/** Layers Studio-edited pricing copy over the static per-country defaults. */
export function mergePricingContent(
  base: CountryContent,
  override?: SanityPricingDoc | null,
): CountryContent {
  if (!override) return base;
  const { pricing } = base.dictionary;
  const labels = override.labels;

  return {
    ...base,
    dictionary: {
      ...base.dictionary,
      pricing: {
        eyebrow: pick(override.hero?.eyebrow, pricing.eyebrow),
        title: pick(override.hero?.title, pricing.title),
        subtitle: pick(override.hero?.subtitle, pricing.subtitle),
        note: pick(override.hero?.note, pricing.note),
        perMonth: pick(labels?.perMonth, pricing.perMonth),
        perYear: pick(labels?.perYear, pricing.perYear),
        custom: pick(labels?.custom, pricing.custom),
        mostPopular: pick(labels?.mostPopular, pricing.mostPopular),
        billingMonthly: pick(labels?.billingMonthly, pricing.billingMonthly),
        billingAnnual: pick(labels?.billingAnnual, pricing.billingAnnual),
        annualSavings: pick(labels?.annualSavings, pricing.annualSavings),
        comparePlans: pick(labels?.comparePlans, pricing.comparePlans),
        compareSubtitle: pick(labels?.compareSubtitle, pricing.compareSubtitle),
        featureColumn: pick(labels?.featureColumn, pricing.featureColumn),
        categories: {
          core: pick(labels?.categories?.core, pricing.categories.core),
          compliance: pick(labels?.categories?.compliance, pricing.categories.compliance),
          teamLocations: pick(labels?.categories?.teamLocations, pricing.categories.teamLocations),
          enterprise: pick(labels?.categories?.enterprise, pricing.categories.enterprise),
          support: pick(labels?.categories?.support, pricing.categories.support),
        },
        faqTitle: pick(override.faq?.title, pricing.faqTitle),
        stillHaveQuestions: pick(override.closing?.title, pricing.stillHaveQuestions),
        stillHaveQuestionsSubtitle: pick(
          override.closing?.subtitle,
          pricing.stillHaveQuestionsSubtitle,
        ),
        faqItems: pick(override.faq?.items, pricing.faqItems),
      },
    },
    pricing: {
      tiers: mergeTiers(base.pricing.tiers, override.tiers),
    },
  };
}
