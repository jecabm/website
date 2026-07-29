import type { Metadata } from "next";
import { MercuryHero } from "@/components/marketing/hero/mercury-hero";
import { TrustBar } from "@/components/marketing/sections/trust-bar";
import { WhySection } from "@/components/marketing/sections/why-section";
import { LiftingEquipmentSection } from "@/components/marketing/sections/lifting-equipment-section";
import { HowItWorks } from "@/components/marketing/sections/how-it-works";
import { IndustriesSection } from "@/components/marketing/sections/industries-section";
import { TestimonialsSection } from "@/components/marketing/sections/testimonials-section";
import { CtaBand } from "@/components/marketing/sections/cta-band";
import { SanityHomeProvider } from "@/content/sanity-home-context";
import { sanityFetch } from "@/sanity/lib/preview";
import { homePageQuery } from "@/sanity/queries";
import { resolveMetadata } from "@/lib/seo";
import { getSiteSettings } from "@/lib/site-settings";
import { getRequestCountry } from "@/lib/request-country";
import { siteConfig } from "@/config/site";

export async function generateMetadata(): Promise<Metadata> {
  const country = await getRequestCountry();
  const [home, globalSeo] = await Promise.all([
    sanityFetch(homePageQuery, { country }),
    getSiteSettings(),
  ]);
  return resolveMetadata({
    seo: home?.seo,
    globalSeo,
    path: "/",
    country,
    fallbackTitle: `${siteConfig.name} — Asset, Inspection & Compliance Management`,
    fallbackDescription: siteConfig.description,
  });
}

export default async function HomePage() {
  const [au, co] = await Promise.all([
    sanityFetch(homePageQuery, { country: "au" }),
    sanityFetch(homePageQuery, { country: "co" }),
  ]);

  return (
    <SanityHomeProvider value={{ au, co }}>
      <MercuryHero />
      <TrustBar />
      <WhySection />
      <LiftingEquipmentSection />
      <HowItWorks />
      <IndustriesSection />
      <TestimonialsSection />
      <CtaBand />
    </SanityHomeProvider>
  );
}
