import { draftMode } from "next/headers";
import { client } from "./client";

/**
 * Server-only client for draft content — the token never reaches the
 * browser. Presentation's preview iframe runs the site with Next.js draft
 * mode enabled; every other visitor gets the plain published `client`.
 */
const previewClient = client.withConfig({
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  perspective: "previewDrafts",
});

/** Fetch helper that transparently serves draft content when draft mode is on. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- matches client.fetch()'s own untyped default, which every call site here already relied on.
export async function sanityFetch<T = any>(query: string, params: Record<string, unknown> = {}): Promise<T> {
  const { isEnabled } = await draftMode();
  const activeClient = isEnabled ? previewClient : client;
  return activeClient.fetch<T>(query, params);
}
