import { ScrollViewStyleReset } from 'expo-router/html';
import React from 'react';
import { SplashBackground as WebSplashBackground } from '@/components/WebSplashBackground';
import { globalStyles } from '@/styles/globalStyles';
import { appFrameStyles } from '@/styles/appFrameStyles';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0A0F1C" />
        <meta name="theme-color" content="#0A0F1C" />
        <meta name="background-color" content="#0A0F1C" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="encryptSIM" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#0A0F1C" />
        <meta
          name="description"
          content="Your Web3 gateway. No KYC, crypto-ready, instant eSIM for secure global use."
        />

        <meta property="og:title" content="encryptSIM" />
        <meta
          property="og:description"
          content="Your Web3 gateway. No KYC, crypto-ready, instant eSIM for secure global use."
        />
        <meta
          property="og:image"
          content="https://encryptsim.com/og-image.png"
        />
        <meta property="og:url" content="https://encryptsim.com" />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="encryptSIM" />
        <meta
          name="twitter:description"
          content="Your Web3 gateway. No KYC, crypto-ready, instant eSIM for secure global use."
        />
        <meta
          name="twitter:image"
          content="https://encryptsim.com/og-image.png"
        />

        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
        <style dangerouslySetInnerHTML={{ __html: appFrameStyles }} />
        <style>{`
        body {
          background-color: #0A0F1C;
          color: #F8FAFC;
          margin: 0;
        }
        `}</style>
      </head>
      <body>
        <WebSplashBackground />
        <div id="app-frame-container">
          <div id="app-screen">
            <div id="app-content">{children}</div>
          </div>
        </div>
      </body>
    </html>
  );
}
