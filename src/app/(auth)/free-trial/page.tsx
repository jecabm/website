import { redirect } from "next/navigation";
import { getRequestCountry } from "@/lib/request-country";

export default async function FreeTrialPage() {
  const country = await getRequestCountry();
  redirect(
    country === "co"
      ? "https://www.regattaregisters.com/co/contact"
      : "https://www.regattaregisters.com/contact"
  );
}
