'use client';

import React, { useMemo, useState } from 'react';
import { Check, ChevronDown, Minus } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { usePricing } from '@/config/context/Pricing';
import { planToTier } from '@/config/context/Pricing/to-tier';
import { useCountry } from '@/hooks/use-country';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';

// Comparison table rows — feature names are technical product terms, kept in English across locales.
// Category labels come from content.dictionary.pricing.categories.
const comparisonRows = [
  {
    categoryKey: 'core' as const,
    rows: [
      { feature: 'Asset register', standard: true, pro: true, enterprise: true },
      { feature: 'Users', standard: '1', pro: '6', enterprise: 'Unlimited' },
      { feature: 'Inspections & checklists', standard: true, pro: true, enterprise: true },
      { feature: 'CSV / bulk import', standard: true, pro: true, enterprise: true },
      { feature: 'QR code scanning', standard: true, pro: true, enterprise: true },
      { feature: 'Offline mode', standard: false, pro: true, enterprise: true },
    ],
  },
  {
    categoryKey: 'compliance' as const,
    rows: [
      { feature: 'Compliance calendar', standard: true, pro: true, enterprise: true },
      { feature: 'Automated alerts', standard: false, pro: true, enterprise: true },
      { feature: 'Audit trail & history', standard: true, pro: true, enterprise: true },
      { feature: 'Custom compliance standards', standard: false, pro: true, enterprise: true },
      { feature: 'Regulatory report export', standard: false, pro: true, enterprise: true },
    ],
  },
  {
    categoryKey: 'teamLocations' as const,
    rows: [
      { feature: 'Multiple locations / sites', standard: false, pro: true, enterprise: true },
      { feature: 'Role-based access control', standard: false, pro: true, enterprise: true },
      { feature: 'Equipment booking', standard: false, pro: true, enterprise: true },
      { feature: 'Team management', standard: false, pro: true, enterprise: true },
    ],
  },
  {
    categoryKey: 'enterprise' as const,
    rows: [
      { feature: 'Custom forms & fields', standard: false, pro: 'Limited', enterprise: true },
      { feature: 'SSO / SAML', standard: false, pro: false, enterprise: true },
      { feature: 'API access', standard: false, pro: false, enterprise: true },
      { feature: 'Dedicated success manager', standard: false, pro: false, enterprise: true },
      { feature: 'Custom SLA', standard: false, pro: false, enterprise: true },
    ],
  },
  {
    categoryKey: 'support' as const,
    rows: [
      { feature: 'Email support', standard: true, pro: true, enterprise: true },
      { feature: 'Priority support', standard: false, pro: true, enterprise: true },
      { feature: 'Onboarding assistance', standard: false, pro: true, enterprise: true },
    ],
  },
];

type CellValue = boolean | string;

function Cell({
  value,
  highlight,
  roundedBottom,
}: {
  value: CellValue;
  highlight: boolean;
  roundedBottom?: boolean;
}) {
  const highlightClasses = highlight && cn('bg-brand-50', roundedBottom && 'rounded-b-xl');

  if (value === true)
    return (
      <td className={cn('px-4 py-3.5 text-center', highlightClasses)}>
        <Check className="mx-auto h-4 w-4 text-success" />
      </td>
    );
  if (value === false)
    return (
      <td className={cn('px-4 py-3.5 text-center text-ink-300', highlightClasses)}>
        <Minus className="mx-auto h-4 w-4" />
      </td>
    );
  return (
    <td
      className={cn('px-4 py-3.5 text-center text-sm font-medium text-ink-700', highlightClasses)}
    >
      {value}
    </td>
  );
}

type FaqItemProps = { q: string; a: string };
function FaqItem({ q, a }: FaqItemProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-ink-200">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
        aria-expanded={open}
      >
        <span className="text-base font-medium text-ink-900">{q}</span>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 text-ink-400 transition-transform', open && 'rotate-180')}
        />
      </button>
      {open && <p className="pb-5 text-sm leading-relaxed text-ink-600">{a}</p>}
    </div>
  );
}

export function PricingTiers() {
  const { content } = useCountry();
  const { pricing, actions } = content.dictionary;
  const { plans, loading, error, currency } = usePricing();
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');

  const tiers = useMemo(() => {
    if (plans.length === 0) return content.pricing.tiers;
    return plans.map((plan) =>
      planToTier(plan, {
        currency,
        startFreeTrial: actions.startFreeTrial,
        talkToSales: actions.talkToSales,
      }),
    );
  }, [plans, content.pricing.tiers, currency, actions.startFreeTrial, actions.talkToSales]);

  return (
    <>
      {/* Tier cards */}
      <section className="py-16 sm:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
              {pricing.eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
              {pricing.title}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-ink-500">{pricing.subtitle}</p>
          </div>

          {/* Billing toggle */}
          <div className="mt-8 flex items-center justify-center gap-1 rounded-full bg-ink-100 p-1 w-fit mx-auto">
            <button
              type="button"
              onClick={() => setBilling('monthly')}
              className={cn(
                'rounded-full px-5 py-2 text-sm font-medium transition-colors',
                billing === 'monthly'
                  ? 'bg-white text-ink-900 shadow-sm'
                  : 'text-ink-500 hover:text-ink-700',
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling('annual')}
              className={cn(
                'flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-colors',
                billing === 'annual'
                  ? 'bg-white text-ink-900 shadow-sm'
                  : 'text-ink-500 hover:text-ink-700',
              )}
            >
              Annual
              <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
                Save 20%
              </span>
            </button>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl items-stretch gap-6 lg:grid-cols-3">
            {loading && plans.length === 0
              ? Array.from({ length: 3 }, (_, index) => (
                  <Card key={index} className="flex min-h-96 flex-col p-6" aria-hidden>
                    <div className="h-5 w-1/3 animate-pulse rounded bg-ink-100" />
                    <div className="mt-6 h-10 w-1/2 animate-pulse rounded bg-ink-100" />
                    <div className="mt-6 space-y-3">
                      {Array.from({ length: 5 }, (_, row) => (
                        <div key={row} className="h-4 animate-pulse rounded bg-ink-100" />
                      ))}
                    </div>
                  </Card>
                ))
              : tiers.map((tier) => {
                  // Each interval stands on its own: a plan with no price for the selected one
                  // falls back to the "Custom" label, never to the other interval's amount.
                  const amount = billing === 'annual' ? tier.annualAmount : tier.monthlyAmount;
                  const showCustom = tier.custom === true || amount === null;
                  return (
                    <Card
                      key={tier.id}
                      className={cn('flex flex-col p-6', tier.popular && 'ring-2 ring-brand-500')}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="text-lg font-semibold text-ink-900">{tier.name}</h2>
                        {tier.popular && <Badge variant="brand">{pricing.mostPopular}</Badge>}
                      </div>
                      {tier.description && (
                        <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
                          {tier.description}
                        </p>
                      )}

                      <div className="mt-5">
                        {showCustom ? (
                          <span className="text-3xl font-bold tracking-tight text-ink-900">
                            {pricing.custom}
                          </span>
                        ) : (
                          <>
                            <span className="text-4xl font-bold tracking-tight text-ink-900">
                              {formatCurrency(amount, content.locale, content.currency)}
                            </span>
                            <span className="text-base font-normal text-ink-500">
                              {billing === 'annual' ? pricing.perYear : pricing.perMonth}
                            </span>
                          </>
                        )}
                        {billing === 'annual' && !showCustom && (
                          <p className="mt-1 text-xs text-ink-400">Billed annually</p>
                        )}
                      </div>

                      <ul className="mt-6 space-y-3 text-sm text-ink-700">
                        {tier.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2.5">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <div className="mt-auto pt-8">
                        <Button
                          href={tier.contactSales === true ? '/contact' : '/free-trial'}
                          variant={tier.popular ? 'primary' : 'outline'}
                          fullWidth
                        >
                          {tier.cta}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
          </div>

          {/* The static tiers are already on screen as the fallback; this only says they may be stale. */}
          {error && (
            <p className="mt-8 text-center text-sm text-ink-400" role="status">
              {error}
            </p>
          )}

          <p className="mt-8 text-center text-sm text-ink-400">{pricing.note}</p>
        </Container>
      </section>

      {/* Comparison table — hidden on mobile, visible from sm (640px) up */}
      <section className="hidden sm:block border-t border-ink-200 bg-ink-50 py-16 sm:py-20">
        <Container size="wide">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
              {pricing.comparePlans}
            </h2>
            <p className="mt-3 text-ink-500">{pricing.compareSubtitle}</p>
          </div>

          <div className="rounded-xl border border-ink-200 bg-white shadow-elevated">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="sticky top-18 z-10 bg-white px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-ink-900 shadow-[inset_0_-1px_0_0] shadow-ink-200">
                    {pricing.featureColumn}
                  </th>
                  {tiers.map((tier) => (
                    <th
                      key={tier.id}
                      className={cn(
                        'sticky top-18 px-4 py-4 text-center font-semibold',
                        tier.popular
                          ? 'z-20 rounded-t-xl border-t-4 border-brand-500 bg-brand-50 text-brand-700'
                          : 'z-10 bg-white text-ink-900 shadow-[inset_0_-1px_0_0] shadow-ink-200',
                      )}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <span>
                          {tier.name}
                          {tier.popular && (
                            <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs uppercase text-brand-700">
                              Popular
                            </span>
                          )}
                        </span>
                        <Button
                          href={tier.contactSales === true ? '/contact' : '/free-trial'}
                          variant={tier.popular ? 'primary' : 'outline'}
                          size="sm"
                        >
                          {tier.cta}
                        </Button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((group, groupIndex) => (
                  <React.Fragment key={group.categoryKey}>
                    <tr className="bg-ink-50">
                      <td className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-ink-400">
                        {pricing.categories[group.categoryKey]}
                      </td>
                      <td />
                      <td className="bg-brand-50" />
                      <td />
                    </tr>
                    {group.rows.map((row, rowIndex) => {
                      const isLastRow =
                        groupIndex === comparisonRows.length - 1 &&
                        rowIndex === group.rows.length - 1;
                      return (
                        <tr key={row.feature} className="border-t border-ink-100">
                          <td className="px-4 py-3.5 text-ink-700">{row.feature}</td>
                          <Cell value={row.standard} highlight={false} />
                          <Cell value={row.pro} highlight={true} roundedBottom={isLastRow} />
                          <Cell value={row.enterprise} highlight={false} />
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20">
        <Container>
          <div className="w-full">
            <h2 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl text-center mb-10">
              {pricing.faqTitle}
            </h2>
            {pricing.faqItems.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
          <div className="mt-12 rounded-xl bg-ink-900 p-8 text-center">
            <h3 className="text-xl font-bold text-white">{pricing.stillHaveQuestions}</h3>
            <p className="mt-2 text-ink-300">{pricing.stillHaveQuestionsSubtitle}</p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href="/free-trial" size="lg">
                {actions.startFreeTrial}
              </Button>
              <Button
                href="/contact"
                size="lg"
                variant="outline"
                className="border-white/25 bg-transparent text-white hover:bg-white/10"
              >
                {actions.talkToSales}
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
