import { headers } from "next/headers";
import { DEFAULT_COUNTRY, isCountryCode, type CountryCode } from "@/config/countries";

/** Resolves the active country for this request from the `x-country` header set by middleware.ts. */
export async function getRequestCountry(): Promise<CountryCode> {
  const headerList = await headers();
  const value = headerList.get("x-country");
  return value && isCountryCode(value) ? value : DEFAULT_COUNTRY;
}
