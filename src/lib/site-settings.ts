import { cache } from "react";
import { client } from "@/sanity/lib/client";
import { siteSettingsQuery } from "@/sanity/queries";

export interface SiteSettings {
  websiteName?: string;
  defaultTitle?: string;
  defaultDescription?: string;
  defaultSocialImage?: { asset?: { _ref?: string; _id?: string } | null; alt?: string };
  organization?: {
    legalName?: string;
    logo?: { asset?: { _ref?: string; _id?: string } | null; alt?: string };
    email?: string;
    phone?: string;
  };
  socialLinks?: { platform: string; url: string }[];
}

/**
 * Fetches the Site SEO Settings singleton. Wrapped in React's `cache()` so
 * multiple calls within the same request (e.g. root layout + a page's
 * generateMetadata) dedupe to a single Sanity request.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings | null> => {
  return client.fetch(siteSettingsQuery);
});
