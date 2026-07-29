import type { Metadata } from "next";
import { urlFor } from "@/sanity/lib/image";
import { siteConfig } from "@/config/site";
import type { CountryCode } from "@/config/countries";

const OG_LOCALES: Record<CountryCode, string> = { au: "en_AU", co: "es_CO" };

/** Site-relative AU path → its /co equivalent (e.g. "/pricing" → "/co/pricing", "/" → "/co"). */
export function coPathFor(auPath: string): string {
  return auPath === "/" ? "/co" : `/co${auPath}`;
}

/** Shape of the reusable `seo` object as fetched from Sanity (see schemaTypes/seo.ts). */
export interface SanitySeoImage {
  asset?: { _ref?: string; _id?: string } | null;
  alt?: string;
}

export interface SanitySeo {
  title?: string;
  description?: string;
  focusKeyword?: string;
  keywords?: string[];
  canonicalUrl?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: SanitySeoImage;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: SanitySeoImage;
}

/** Subset of the Site SEO Settings singleton used as the mid-tier metadata fallback. */
export interface GlobalSeoFallback {
  websiteName?: string;
  defaultTitle?: string;
  defaultDescription?: string;
  defaultSocialImage?: SanitySeoImage;
}

export interface ResolveMetadataOptions {
  /** SEO object from the page's Sanity document, if any. Tier 1. */
  seo?: SanitySeo | null;
  /** Site SEO Settings singleton, if fetched. Tier 2. */
  globalSeo?: GlobalSeoFallback | null;
  /** AU-rooted site-relative path, e.g. "/features" or "/". The /co equivalent is derived from this. */
  path: string;
  /** Which locale this response is being rendered for (resolved via middleware.ts + getRequestCountry()). */
  country: CountryCode;
  /** Hardcoded page default. Tier 3 — the final safety net if neither the page nor global settings have a value. */
  fallbackTitle: string;
  /** Hardcoded page default. Tier 3 — the final safety net if neither the page nor global settings have a value. */
  fallbackDescription: string;
}

function resolveImageUrl(image?: SanitySeoImage | null): string | undefined {
  if (!image?.asset) return undefined;
  try {
    return urlFor(image).width(1200).height(630).fit("crop").url();
  } catch {
    return undefined;
  }
}

/**
 * Builds a Next.js Metadata object with a 3-tier fallback: page SEO →
 * Site SEO Settings singleton → hardcoded page default.
 */
export function resolveMetadata({
  seo,
  globalSeo,
  path,
  country,
  fallbackTitle,
  fallbackDescription,
}: ResolveMetadataOptions): Metadata {
  const siteName = globalSeo?.websiteName || siteConfig.name;
  const title = seo?.title || globalSeo?.defaultTitle || fallbackTitle;
  const description = seo?.description || globalSeo?.defaultDescription || fallbackDescription;
  const ogTitle = seo?.ogTitle || title;
  const ogDescription = seo?.ogDescription || description;
  const twitterTitle = seo?.twitterTitle || ogTitle;
  const twitterDescription = seo?.twitterDescription || ogDescription;
  const globalSocialImage = resolveImageUrl(globalSeo?.defaultSocialImage);
  const ogImage = resolveImageUrl(seo?.ogImage) || globalSocialImage;
  const twitterImage = resolveImageUrl(seo?.twitterImage) || ogImage;
  const ogImageAlt = seo?.ogImage?.alt || globalSeo?.defaultSocialImage?.alt || ogTitle;

  const auUrl = `${siteConfig.url}${path}`;
  const coUrl = `${siteConfig.url}${coPathFor(path)}`;
  const canonicalUrl = seo?.canonicalUrl || (country === "co" ? coUrl : auUrl);

  return {
    title,
    description,
    keywords: seo?.keywords?.length ? seo.keywords : undefined,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        "en-AU": auUrl,
        "es-CO": coUrl,
        "x-default": auUrl,
      },
    },
    robots: {
      index: !seo?.noIndex,
      follow: !seo?.noFollow,
    },
    openGraph: {
      type: "website",
      siteName,
      title: ogTitle,
      description: ogDescription,
      url: canonicalUrl,
      locale: OG_LOCALES[country],
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630, alt: ogImageAlt }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: twitterTitle,
      description: twitterDescription,
      ...(twitterImage ? { images: [twitterImage] } : {}),
    },
  };
}
