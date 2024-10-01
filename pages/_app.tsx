import * as React from 'react';
import Head from 'next/head';
import { MyAppProps } from 'next/app';
import { Analytics as VercelAnalytics } from '@vercel/analytics/next';
import { SpeedInsights as VercelSpeedInsights } from '@vercel/speed-insights/next';
import { ClerkProvider } from '@clerk/nextjs';
import { useRouter } from 'next/router';
import { Analytics } from "@vercel/analytics/react"

import { Brand } from '~/common/app.config';
import { apiQuery } from '~/common/util/trpc.client';

import 'katex/dist/katex.min.css';
import '~/common/styles/CodePrism.css';
import '~/common/styles/NProgress.css';
import '~/common/styles/app.styles.css';

import { ProviderBackendCapabilities } from '~/common/providers/ProviderBackendCapabilities';
import { ProviderBootstrapLogic } from '~/common/providers/ProviderBootstrapLogic';
import { ProviderSingleTab } from '~/common/providers/ProviderSingleTab';
import { ProviderSnacks } from '~/common/providers/ProviderSnacks';
import { ProviderTRPCQuerySettings } from '~/common/providers/ProviderTRPCQuerySettings';
import { ProviderTheming } from '~/common/providers/ProviderTheming';
import { hasGoogleAnalytics, OptionalGoogleAnalytics } from '~/common/components/GoogleAnalytics';
import { isVercelFromFrontend } from '~/common/util/pwaUtils';
import Script from 'next/script';

const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const MyApp = ({ Component, emotionCache, pageProps }: MyAppProps) => {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>{Brand.Title.Common}</title>
        
        
      </Head>

      <ClerkProvider publishableKey={clerkPublishableKey} {...pageProps}>
        <ProviderTheming emotionCache={emotionCache}>
          <ProviderSingleTab>
            <ProviderTRPCQuerySettings>
              <ProviderBackendCapabilities>
                {/* ^ SSR boundary */}
                <ProviderBootstrapLogic>
                  <ProviderSnacks>
                    <Component {...pageProps} />
                  </ProviderSnacks>
                </ProviderBootstrapLogic>
              </ProviderBackendCapabilities>
            </ProviderTRPCQuerySettings>
          </ProviderSingleTab>
        </ProviderTheming>
      </ClerkProvider>

      {isVercelFromFrontend && <VercelAnalytics debug={false} />}
      {isVercelFromFrontend && <VercelSpeedInsights debug={false} sampleRate={1 / 2} />}
      {hasGoogleAnalytics && <OptionalGoogleAnalytics />}
      {/* Load jQuery */}
      <Script src="https://code.jquery.com/jquery-3.6.0.min.js" />
      <Script 
        strategy="afterInteractive" 
        src="https://www.googletagmanager.com/gtag/js?id=G-2F95CCPLE6"
      />
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
      >
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-2F95CCPLE6');
        `}
      </Script>
      
    </>
  );
};

// enables the React Query API invocation
export default apiQuery.withTRPC(MyApp);