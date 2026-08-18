import type { Metadata } from 'next';

import { PricingTiers } from '@/components/marketing/pricing-tiers';
import { SanityPricingProvider } from '@/content/sanity-pricing-context';
import { getRequestCountry } from '@/lib/request-country';
import { resolveMetadata } from '@/lib/seo';
import { getSiteSettings } from '@/lib/site-settings';
import { sanityFetch } from '@/sanity/lib/preview';
import { pricingPageQuery } from '@/sanity/queries';

const fallbackDescription =
  "Simple, transparent pricing — Standard, Pro, and Enterprise plans, shown in your country's currency.";

export async function generateMetadata(): Promise<Metadata> {
  const country = await getRequestCountry();
  const [pricing, globalSeo] = await Promise.all([
    sanityFetch(pricingPageQuery, { country }),
    getSiteSettings(),
  ]);
  return resolveMetadata({
    seo: pricing?.seo,
    globalSeo,
    path: '/pricing',
    country,
    fallbackTitle: 'Pricing',
    fallbackDescription,
  });
}

export default async function PricingPage() {
  const [au, co] = await Promise.all([
    sanityFetch(pricingPageQuery, { country: 'au' }),
    sanityFetch(pricingPageQuery, { country: 'co' }),
  ]);

  return (
    <SanityPricingProvider value={{ au, co }}>
      <PricingTiers />
    </SanityPricingProvider>
  );
}
