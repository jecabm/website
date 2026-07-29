import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { client } from "@/sanity/lib/client";

/**
 * Called by Sanity's Presentation tool when an editor opens the preview
 * iframe. Validates the request came from Studio, then turns on Next.js
 * draft mode so subsequent requests serve unpublished content.
 */
export const { GET } = defineEnableDraftMode({
  client: client.withConfig({ token: process.env.SANITY_API_WRITE_TOKEN }),
});
