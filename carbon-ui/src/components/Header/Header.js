'use client';

import { Switcher, Notification, UserAvatar } from '@carbon/icons-react';
import {
  Header,
  HeaderContainer,
  HeaderName,
  HeaderNavigation,
  HeaderMenuButton,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
  SkipToContent,
  SideNav,
  SideNavItems,
  HeaderSideNavItems,
  Toggle,
} from '@carbon/react';
import Link from 'next/link';
import { useSpyre } from '../../app/spyre-context';

/**
 * Header for TechXChange Lab 1127.
 *
 * Includes the Spyre toggle — students can flip it live to compare:
 *   OFF  →  local llama.cpp  (IBM Power MMA)
 *   ON   →  IBM Spyre card   (9.8.70.146)
 *
 * The toggle writes to SpyreContext (localStorage-persisted), which the
 * entextract page reads and passes to /api/chat as { useSpyre }.
 */
const TutorialHeader = () => {
  const { useSpyre, setUseSpyre } = useSpyre();

  return (
    <HeaderContainer
      render={({ isSideNavExpanded, onClickSideNavExpand }) => (
        <Header aria-label="Carbon Tutorial">
          <SkipToContent />
          <HeaderMenuButton
            aria-label="Open menu"
            onClick={onClickSideNavExpand}
            isActive={isSideNavExpanded}
          />
          <Link href="/" passHref legacyBehavior>
            <HeaderName prefix="IBM">EMEA AI on IBM Power Squad Demos</HeaderName>
          </Link>
          <HeaderNavigation aria-label="Carbon Tutorial">
            <Link href="/entextract" passHref legacyBehavior>
              <HeaderMenuItem>Entity Extract</HeaderMenuItem>
            </Link>
            <Link href="/piiextract" passHref legacyBehavior>
              <HeaderMenuItem>PII Extract</HeaderMenuItem>
            </Link>
            <Link href="/convintel" passHref legacyBehavior>
              <HeaderMenuItem>Conv Intel</HeaderMenuItem>
            </Link>
            <Link href="/briefbuilder" passHref legacyBehavior>
              <HeaderMenuItem>Brief Builder</HeaderMenuItem>
            </Link>
            <Link href="/rfpassistant" passHref legacyBehavior>
              <HeaderMenuItem>RFP Assistant</HeaderMenuItem>
            </Link>
            <Link href="/talentacquisition" passHref legacyBehavior>
              <HeaderMenuItem>Talent Acquisition</HeaderMenuItem>
            </Link>
            <Link href="/carbon" passHref legacyBehavior>
              <HeaderMenuItem>Carbon</HeaderMenuItem>
            </Link>
          </HeaderNavigation>
          <SideNav
            aria-label="Side navigation"
            expanded={isSideNavExpanded}
            isPersistent={false}>
            <SideNavItems>
              <HeaderSideNavItems>
                <Link href="/entextract" passHref legacyBehavior>
                  <HeaderMenuItem>Entity Extract</HeaderMenuItem>
                </Link>
                <Link href="/piiextract" passHref legacyBehavior>
                  <HeaderMenuItem>PII Extract</HeaderMenuItem>
                </Link>
                <Link href="/convintel" passHref legacyBehavior>
                  <HeaderMenuItem>Conv Intel</HeaderMenuItem>
                </Link>
                <Link href="/briefbuilder" passHref legacyBehavior>
                  <HeaderMenuItem>Brief Builder</HeaderMenuItem>
                </Link>
                <Link href="/rfpassistant" passHref legacyBehavior>
                  <HeaderMenuItem>RFP Assistant</HeaderMenuItem>
                </Link>
                <Link href="/talentacquisition" passHref legacyBehavior>
                  <HeaderMenuItem>Talent Acquisition</HeaderMenuItem>
                </Link>
                <Link href="/carbon" passHref legacyBehavior>
                  <HeaderMenuItem>Carbon</HeaderMenuItem>
                </Link>
              </HeaderSideNavItems>
            </SideNavItems>
          </SideNav>
          <HeaderGlobalBar>
            {/* ── Spyre toggle ──────────────────────────────────────────────
                Renders a compact labelled toggle in the header action bar.
                The style override keeps it visually tight inside the bar.   */}
            <div
              style={{
                display:     'flex',
                alignItems:  'center',
                padding:     '0 0.75rem',
                gap:         '0.4rem',
                borderLeft:  '1px solid rgba(255,255,255,0.15)',
                height:      '100%',
              }}>
              <span
                style={{
                  fontSize:      '0.6875rem',
                  fontWeight:    600,
                  letterSpacing: '0.05em',
                  color:         useSpyre ? '#42be65' : 'rgba(255,255,255,0.55)',
                  whiteSpace:    'nowrap',
                  userSelect:    'none',
                }}>
                {useSpyre ? '⚡ Spyre' : 'MMA'}
              </span>
              <Toggle
                id="spyre-toggle"
                size="sm"
                toggled={useSpyre}
                onToggle={(checked) => setUseSpyre(checked)}
                aria-label="Switch LLM backend between IBM Power MMA and IBM Spyre"
                hideLabel
              />
            </div>
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
