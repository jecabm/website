import type { Metadata } from "next";
import { AboutContent } from "@/components/marketing/about-content";
import { TeamSection } from "@/components/marketing/team-section";
import { SanityAboutProvider } from "@/content/sanity-about-context";
import { sanityFetch } from "@/sanity/lib/preview";
import { aboutPageQuery } from "@/sanity/queries";
import { resolveMetadata } from "@/lib/seo";
import { getSiteSettings } from "@/lib/site-settings";
import { getRequestCountry } from "@/lib/request-country";

const fallbackDescription =
  "Our mission, industry focus, and the compliance standards that guide Regatta Registers.";

export async function generateMetadata(): Promise<Metadata> {
  const country = await getRequestCountry();
  const [about, globalSeo] = await Promise.all([
    sanityFetch(aboutPageQuery, { country }),
    getSiteSettings(),
  ]);
  return resolveMetadata({
    seo: about?.seo,
    globalSeo,
    path: "/about",
    country,
    fallbackTitle: "About Us",
    fallbackDescription,
  });
}

export default async function AboutPage() {
  const [au, co] = await Promise.all([
    sanityFetch(aboutPageQuery, { country: "au" }),
    sanityFetch(aboutPageQuery, { country: "co" }),
  ]);

  return (
    <SanityAboutProvider value={{ au, co }}>
      <AboutContent />
      <TeamSection />
    </SanityAboutProvider>
  );
}
