'use client';

import { Switcher, Notification, UserAvatar } from '@carbon/icons-react';
import {
  Header,
  HeaderContainer,
  HeaderName,
  HeaderNavigation,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
  SkipToContent,
} from '@carbon/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLang } from '../../app/lang-context';

const NAV = {
  ro: [
    { href: '/entextract',   label: 'Extragere entități' },
    { href: '/translate',    label: 'Traducere' },
    { href: '/rfpassistant', label: 'Asistent RAG' },
  ],
  en: [
    { href: '/entextract',   label: 'Entity Extraction' },
    { href: '/translate',    label: 'Translation' },
    { href: '/rfpassistant', label: 'RAG Assistant' },
  ],
};

const TutorialHeader = () => {
  const { lang, setLang } = useLang();
  const pathname = usePathname();
  const navItems = NAV[lang];

  return (
    <HeaderContainer
      render={() => (
        <Header aria-label="DGPCI Romania AI Demo">
          <SkipToContent />
          <Link href="/" passHref legacyBehavior>
            <HeaderName prefix="IBM">EMEA AI on IBM Power Squad Demos</HeaderName>
          </Link>
          <HeaderNavigation aria-label="Demo pages">
            {navItems.map(({ href, label }) => (
              <Link key={href} href={href} passHref legacyBehavior>
                <HeaderMenuItem isCurrentPage={pathname === href}>
                  {label}
                </HeaderMenuItem>
              </Link>
            ))}
          </HeaderNavigation>
          <HeaderGlobalBar>
            <HeaderGlobalAction
              aria-label="Notifications"
              tooltipAlignment="center"
              className="action-icons">
              <Notification size={20} />
            </HeaderGlobalAction>
            <HeaderGlobalAction
              aria-label="User Avatar"
              tooltipAlignment="center"
              className="action-icons">
              <UserAvatar size={20} />
            </HeaderGlobalAction>
            <HeaderGlobalAction
              aria-label={lang === 'ro' ? 'Switch to English' : 'Comută în Română'}
              tooltipAlignment="end"
              onClick={() => setLang(lang === 'ro' ? 'en' : 'ro')}
              style={{ fontWeight: 700, fontSize: '0.8125rem', letterSpacing: '0.05em', minWidth: '3rem' }}>
              {lang === 'ro' ? 'EN' : 'RO'}
            </HeaderGlobalAction>
            <HeaderGlobalAction aria-label="App Switcher" tooltipAlignment="end">
              <Switcher size={20} />
            </HeaderGlobalAction>
          </HeaderGlobalBar>
        </Header>
      )}
    />
  );
};

export default TutorialHeader;
