import { draftMode } from "next/headers";
import { client } from "./client";

/**
 * Server-only client for draft content — the token never reaches the
 * browser. Presentation's preview iframe runs the site with Next.js draft
 * mode enabled; every other visitor gets the plain published `client`.
 *
 * `stega` encodes each field's document id/path invisibly into the fetched
 * strings so Presentation's Visual Editing overlay can detect every
 * document instance rendered on a page (e.g. every post card on a listing
 * page) — without it, only a single arbitrarily-picked "main document"
 * shows up and "Documents on this page" stays empty.
 */
const previewClient = client.withConfig({
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  perspective: "previewDrafts",
  stega: {
    enabled: true,
    studioUrl: "/studio",
  },
});

/** Fetch helper that transparently serves draft content when draft mode is on. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- matches client.fetch()'s own untyped default, which every call site here already relied on.
export async function sanityFetch<T = any>(query: string, params: Record<string, unknown> = {}): Promise<T> {
  const { isEnabled } = await draftMode();
  const activeClient = isEnabled ? previewClient : client;
  return activeClient.fetch<T>(query, params);
}
