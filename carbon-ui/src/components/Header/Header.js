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
} from '@carbon/react';
import Link from 'next/link';

const TutorialHeader = () => (
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
              <Link href="/briefbuilder" passHref legacyBehavior>
                  <HeaderMenuItem>Brief Builder</HeaderMenuItem>
              </Link>
              <Link href="/carbon" passHref legacyBehavior>
                  <HeaderMenuItem>Carbon</HeaderMenuItem>
              </Link>
              <Link href="/convintel" passHref legacyBehavior>
                  <HeaderMenuItem>Conv Intel</HeaderMenuItem>
              </Link>
              <Link href="/entextract" passHref legacyBehavior>
                  <HeaderMenuItem>Entity Extract</HeaderMenuItem>
              </Link>
              <Link href="/piiextract" passHref legacyBehavior>
                  <HeaderMenuItem>PII Extract</HeaderMenuItem>
              </Link>
              <Link href="/rfpassistant" passHref legacyBehavior>
                  <HeaderMenuItem>RFP Assistant</HeaderMenuItem>
              </Link>
              <Link href="/talentacquisition" passHref legacyBehavior>
                  <HeaderMenuItem>Talent Acquisition</HeaderMenuItem>
              </Link>
</HeaderNavigation>
        <SideNav
          aria-label="Side navigation"
          expanded={isSideNavExpanded}
          isPersistent={false}>
          <SideNavItems>
            <HeaderSideNavItems>
              <Link href="/briefbuilder" passHref legacyBehavior>
                  <HeaderMenuItem>Brief Builder</HeaderMenuItem>
              </Link>
              <Link href="/carbon" passHref legacyBehavior>
                  <HeaderMenuItem>Carbon</HeaderMenuItem>
              </Link>
              <Link href="/convintel" passHref legacyBehavior>
                  <HeaderMenuItem>Conv Intel</HeaderMenuItem>
              </Link>
              <Link href="/entextract" passHref legacyBehavior>
                  <HeaderMenuItem>Entity Extract</HeaderMenuItem>
              </Link>
              <Link href="/piiextract" passHref legacyBehavior>
                  <HeaderMenuItem>PII Extract</HeaderMenuItem>
              </Link>
              <Link href="/rfpassistant" passHref legacyBehavior>
                  <HeaderMenuItem>RFP Assistant</HeaderMenuItem>
              </Link>
              <Link href="/talentacquisition" passHref legacyBehavior>
                  <HeaderMenuItem>Talent Acquisition</HeaderMenuItem>
              </Link>
            </HeaderSideNavItems>
          </SideNavItems>
        </SideNav>
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
  <HeaderGlobalAction aria-label="App Switcher" tooltipAlignment="end">
    <Switcher size={20} />
  </HeaderGlobalAction>
</HeaderGlobalBar>
      </Header>
    )}
  />
);

export default TutorialHeader;