'use client';

import Header from '../components/Header/Header';
import { Content, Theme } from '@carbon/react';
import { SpyreProvider } from './spyre-context';

export function Providers({ children }) {
  return (
    <SpyreProvider>
      <div>
        <Theme theme="g100">
          <Header />
        </Theme>
        <Content>{children}</Content>
      </div>
    </SpyreProvider>
  );
}
