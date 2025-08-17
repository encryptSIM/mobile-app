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

        {/* ✅ Favicon */}
        <link rel="icon" href="/assets/app-logo-light.png" />

        {/* ✅ Theme colors */}
        <meta name="theme-color" content="#0A0F1C" />
        <meta name="background-color" content="#0A0F1C" />

        {/* ✅ iOS PWA settings */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="encryptSIM" />

        {/* ✅ Android PWA */}
        <meta name="mobile-web-app-capable" content="yes" />

        {/* ✅ Windows */}
        <meta name="msapplication-TileColor" content="#0A0F1C" />

        {/* ✅ Description */}
        <meta
          name="description"
          content="Your Web3 gateway. No KYC, crypto-ready, instant eSIM for secure global use."
        />

        <ScrollViewStyleReset />

        {/* Global Styles */}
        <style dangerouslySetInnerHTML={{ __html: globalStyles }} />

        {/* App Frame Styles */}
        <style dangerouslySetInnerHTML={{ __html: appFrameStyles }} />
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
