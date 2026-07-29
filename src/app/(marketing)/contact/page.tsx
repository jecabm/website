import type { Metadata } from "next";
import { ContactContent } from "@/components/marketing/contact-content";
import { SanityContactProvider } from "@/content/sanity-contact-context";
import { sanityFetch } from "@/sanity/lib/preview";
import { contactPageQuery } from "@/sanity/queries";
import { resolveMetadata } from "@/lib/seo";
import { getSiteSettings } from "@/lib/site-settings";
import { getRequestCountry } from "@/lib/request-country";

const fallbackDescription =
  "Get in touch with the Regatta Registers team — sales, support, and demo requests.";

export async function generateMetadata(): Promise<Metadata> {
  const country = await getRequestCountry();
  const [contact, globalSeo] = await Promise.all([
    sanityFetch(contactPageQuery, { country }),
    getSiteSettings(),
  ]);
  return resolveMetadata({
    seo: contact?.seo,
    globalSeo,
    path: "/contact",
    country,
    fallbackTitle: "Contact",
    fallbackDescription,
  });
}

export default async function ContactPage() {
  const [au, co] = await Promise.all([
    sanityFetch(contactPageQuery, { country: "au" }),
    sanityFetch(contactPageQuery, { country: "co" }),
  ]);

  return (
    <SanityContactProvider value={{ au, co }}>
      <ContactContent />
    </SanityContactProvider>
  );
}
