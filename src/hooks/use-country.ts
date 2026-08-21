"use client";

import { useCallback, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  getCountryMeta,
  localizePath,
  type CountryCode,
} from "@/config/countries";
import { getCountryContent } from "@/content/countries";
import { SanityHomeContext } from "@/content/sanity-home-context";
import { mergeHomeContent } from "@/content/sanity-home";
import { SanityPricingContext } from "@/content/sanity-pricing-context";
import { mergePricingContent } from "@/content/sanity-pricing";
import { SanityAboutContext } from "@/content/sanity-about-context";
import { mergeAboutContent } from "@/content/sanity-about";
import { SanityContactContext } from "@/content/sanity-contact-context";
import { mergeContactContent } from "@/content/sanity-contact";

/** Maps the current pathname (as seen by the browser, e.g. already under /co) to its equivalent under `country`. */
function pathForCountry(pathname: string, country: CountryCode): string {
  const withoutCoPrefix = pathname === "/co" ? "/" : (pathname.replace(/^\/co(?=\/|$)/, "") || "/");
  if (country === "co") {
    return withoutCoPrefix === "/" ? "/co" : `/co${withoutCoPrefix}`;
  }
  return withoutCoPrefix;
}

/**
 * Derives the active country straight from the browser URL. Deliberately not
 * read from a server-seeded context: Next.js keeps the root layout mounted
 * across client-side navigations between pages that share it (e.g. "/" -> "/co"),
 * so a value computed once in the layout would go stale after router.push —
 * usePathname() re-evaluates on every navigation, so this can't.
 */
function codeFromPathname(pathname: string): CountryCode {
  return pathname === "/co" || pathname.startsWith("/co/") ? "co" : DEFAULT_COUNTRY;
}

/** Read the active country (resolved from the URL), its metadata, and its localized content. */
export function useCountry() {
  const router = useRouter();
  const pathname = usePathname();
  const code = codeFromPathname(pathname);

  const select = useCallback(
    (next: CountryCode) => {
      if (next === code) return;
      router.push(pathForCountry(pathname, next));
    },
    [code, pathname, router]
  );

  const homeOverrides = useContext(SanityHomeContext);
  const pricingOverrides = useContext(SanityPricingContext);
  const aboutOverrides = useContext(SanityAboutContext);
  const contactOverrides = useContext(SanityContactContext);

  let merged = mergePricingContent(
    mergeHomeContent(getCountryContent(code), homeOverrides[code]),
    pricingOverrides[code]
  );
  merged.about = mergeAboutContent(merged.about, aboutOverrides[code]);
  merged = mergeContactContent(merged, contactOverrides[code]);

  const localize = useCallback((path: string) => localizePath(path, code), [code]);

  return {
    code,
    meta: getCountryMeta(code),
    content: merged,
    countries: COUNTRIES,
    setCountry: select,
    localize,
  };
}
