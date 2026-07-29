"use client";

import { useEffect } from "react";
import { useCountry } from "@/hooks/use-country";

/**
 * Keeps <html lang> in sync with the active country after client-side
 * navigation (e.g. clicking the country selector). The root layout only
 * sets it correctly on the initial/full page load — layouts don't re-render
 * on navigation between pages that share them.
 */
export function SyncHtmlLang() {
  const { meta } = useCountry();

  useEffect(() => {
    document.documentElement.lang = meta.locale;
  }, [meta.locale]);

  return null;
}
