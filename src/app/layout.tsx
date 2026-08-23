import React from 'react';
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { draftMode } from 'next/headers';
import Script from 'next/script';
import { VisualEditing } from 'next-sanity/visual-editing';

import { SyncHtmlLang } from '@/components/layout/sync-html-lang';
import { getCountryMeta } from '@/config/countries';
import { siteConfig } from '@/config/site';
import { getRequestCountry } from '@/lib/request-country';
import { getSiteSettings } from '@/lib/site-settings';

import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  display: 'swap',
});

const OG_LOCALES = { au: 'en_AU', co: 'es_CO' } as const;

export async function generateMetadata(): Promise<Metadata> {
  const [globalSeo, country] = await Promise.all([getSiteSettings(), getRequestCountry()]);
  const siteName = globalSeo?.websiteName || siteConfig.name;
  const defaultTitle =
    globalSeo?.defaultTitle || `${siteConfig.name} — Asset, Inspection & Compliance Management`;
  const description = globalSeo?.defaultDescription || siteConfig.description;
  const url = country === 'co' ? `${siteConfig.url}/co` : siteConfig.url;

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: defaultTitle,
      template: `%s · ${siteName}`,
    },
    description,
    applicationName: siteName,
    alternates: {
      canonical: url,
      languages: {
        'en-AU': siteConfig.url,
        'es-CO': `${siteConfig.url}/co`,
        'x-default': siteConfig.url,
      },
    },
    openGraph: {
      type: 'website',
      siteName,
      title: defaultTitle,
      description,
      url,
      locale: OG_LOCALES[country],
    },
    twitter: {
      card: 'summary_large_image',
      title: defaultTitle,
      description,
    },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const country = await getRequestCountry();
  const { locale } = getCountryMeta(country);
  const { isEnabled: isDraftMode } = await draftMode();

  return (
    <html lang={locale} className={`${jakarta.variable} h-full antialiased`}>
      <body
        suppressHydrationWarning
        className="flex min-h-full flex-col overflow-x-clip bg-background text-foreground"
      >
        {children}
        <SyncHtmlLang />
        {isDraftMode && <VisualEditing />}
      </body>
      {process.env.NEXT_PUBLIC_GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
            `}
          </Script>
        </>
      )}
      {process.env.NEXT_PUBLIC_CLARITY_ID && (
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_ID}");
          `}
        </Script>
      )}
    </html>
  );
}
