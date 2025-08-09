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
