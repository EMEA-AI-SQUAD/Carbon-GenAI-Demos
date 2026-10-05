import { Switcher, Notification, UserAvatar } from '@carbon/icons-react';
import {
  Header,
  HeaderContainer,
  HeaderName,
  HeaderGlobalBar,
  HeaderGlobalAction,
  SkipToContent,
} from '@carbon/react';
import Link from 'next/link';
import { useLang } from '../../app/lang-context';

const TutorialHeader = () => {
  const { lang, setLang } = useLang();
  return (
    <HeaderContainer
      render={() => (
        <Header aria-label="Carbon Tutorial">
          <SkipToContent />
          <Link href="/" passHref legacyBehavior>
            <HeaderName prefix="IBM">EMEA AI on IBM Power Squad Demos</HeaderName>
          </Link>
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
