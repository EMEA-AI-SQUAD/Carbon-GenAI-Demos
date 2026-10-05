'use client';

import Header from '../components/Header/Header';
import { Content, Theme } from '@carbon/react';
import { LangProvider } from './lang-context';

export function Providers({ children }) {
  return (
    <LangProvider>
      <div>
        <Theme theme="g100">
          <Header />
        </Theme>
        <Content>{children}</Content>
      </div>
    </LangProvider>
  );
}
