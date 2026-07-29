import type { Metadata } from "next";
import { FeaturesPageContent } from "@/components/marketing/features-page-content";
import { sanityFetch } from "@/sanity/lib/preview";
import { featuresPageQuery } from "@/sanity/queries";
import { resolveMetadata } from "@/lib/seo";
import { getSiteSettings } from "@/lib/site-settings";
import { getRequestCountry } from "@/lib/request-country";

const fallbackDescription =
  "Centralise your asset register, digitise inspections, and stay audit-ready across every site — one platform for construction, mining, transport and plant hire teams.";

export async function generateMetadata(): Promise<Metadata> {
  const country = await getRequestCountry();
  const [features, globalSeo] = await Promise.all([
    sanityFetch(featuresPageQuery, { country }),
    getSiteSettings(),
  ]);
  return resolveMetadata({
    seo: features?.seo,
    globalSeo,
    path: "/features",
    country,
    fallbackTitle: "Features",
    fallbackDescription,
  });
}

export default async function FeaturesPage() {
  const [au, co] = await Promise.all([
    sanityFetch(featuresPageQuery, { country: "au" }),
    sanityFetch(featuresPageQuery, { country: "co" }),
  ]);

  return <FeaturesPageContent sanityFeatures={{ au, co }} />;
}
