'use client';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  Grid,
  Column,
  Tile,
  Tag,
} from '@carbon/react';
import Image from 'next/image';
import { useLang } from '../lang-context';

const T = {
  ro: {
    breadcrumb: 'Pagina principală',
    heading: 'Servicii AI pentru RAR (Registrul Auto Român) — automatizare omologare, fără cloud extern',
    contextPara: <>Registrul Auto Român (RAR) gestionează un volum tot mai mare de omologări și certificări tehnice pentru vehicule importate (inclusiv din piețe non-UE precum China). Această platformă demonstrează că fluxul de extragere tehnică, traducere și asistență pe reglementări poate rula <strong>on-premises pe IBM Power</strong> — accelerând procesarea dosarelor de omologare cu până la <strong>5X</strong> și reducând timpii manuali cu <strong>80%</strong> (validat în producție la clienți enterprise precum Hans Geis), fără costuri cloud per tranzacție.</>,
    tab1: 'Despre platformă',
    tab2: 'Securitate și Suveranitate Date',
    tab3: 'Flexibilitate & Integrare',
    tab1Heading: 'IBM AI Services pe IBM Power',
    tab1P1: <>Platforma combină servicii AI inteligente cu modelul <strong>IBM Granite 4.2:8b</strong> — suport nativ pentru română și chineză, context de 128.000 tokeni. Totul rulează într-un singur LPAR RHEL pe IBM Power, fără GPU specializat și fără conexiune la servicii cloud externe.</>,
    tab1P2: <>Capabilitățile demonstrate accelerează direct fluxurile <strong>RAR</strong>: extragere automată a specificațiilor tehnice (VIN, masă, motorizare, emisii) pentru emiterea Cărții de Identitate a Vehiculului (CIV), traducere automată a documentațiilor în limba chineză și asistent conversațional RAG pe reglementări tehnice și proceduri de omologare.</>,
    tab1Btn: 'Extragere entități →',
    tab2P1: <>România și RAR sunt strict legate de <strong>Regulamentul UE privind AI (EU AI Act)</strong>, <strong>GDPR</strong> și cerințele naționale de suveranitate a datelor. Datele tehnice, seriile de șasiu și dosarele de omologare rămân exclusiv în infrastructura RAR on-premises — niciun document nu părăsește rețeaua internă. IBM Power oferă cea mai înaltă securitate și fiabilitate din industrie.</>,
    tab2P2: <>Arhitectura <strong>„human-in-the-loop"</strong> este nativă: serviciile AI extrag și pre-completează datele structurate pentru validarea tehnicienilor RAR, eliminând erorile umane de transcriere și accelerând eliberarea CIV.</>,
    tab3P1: <>Platforma folosește <strong>IBM Granite 4.2:8b</strong> — 8 miliarde de parametri, context extins de 128.000 de tokeni, cu suport nativ pentru română, chineză și peste 12 alte limbi. Modelul rulează local prin <strong>Ollama</strong> și poate fi adaptat sau extins oricând fără modificări în codul aplicației.</>,
    tab3P2: <>Aceleași microservicii AI pot procesa <strong>omologări individuale, certificate de conformitate (CoC), rapoarte de inspecție tehnică</strong> sau dosare de import — integrându-se direct cu bazele de date și aplicațiile interne RAR.</>,
    capLabel: 'Capabilități demonstrate',
    cap1Title: '🔍 Extragere date tehnice',
    cap1Desc: 'VIN, serie șasiu, masă, emisii, importator — extrase automat pentru generarea CIV',
    cap2Title: '🌐 Traducere tehnică',
    cap2Desc: 'Documente tehnice și fișe de conformitate din chineză traduse în română — local, fără cloud',
    cap3Title: '💬 Asistent RAG reglementări',
    cap3Desc: 'Interogare instantanee a legislației tehnice, normelor RNTR și procedurilor de omologare',
    open: 'Deschide →',
  },
  en: {
    breadcrumb: 'Home',
    heading: 'AI Services for RAR (Romanian Automotive Register) — homologation automation, no external cloud',
    contextPara: <>The Romanian Automotive Register (RAR) manages a growing volume of technical homologations and certifications for imported vehicles (including non-EU imports from China). This platform demonstrates how technical extraction, translation, and regulatory assistance can run <strong>on-premises on IBM Power</strong> — accelerating dossier processing by up to <strong>5X</strong> and cutting manual time by <strong>80%</strong> (proven in production with enterprise clients like Hans Geis), with zero per-transaction cloud fees.</>,
    tab1: 'About the platform',
    tab2: 'Security & Data Sovereignty',
    tab3: 'Flexibility & Integration',
    tab1Heading: 'IBM AI Services on IBM Power',
    tab1P1: <>The platform combines intelligent AI services with the <strong>IBM Granite 4.2:8b</strong> model — native support for Romanian and Chinese, 128,000-token context. Everything runs in a single RHEL LPAR on IBM Power, without specialised GPUs or external cloud connections.</>,
    tab1P2: <>The demonstrated capabilities directly accelerate <strong>RAR</strong> workflows: structured extraction of technical specifications (VIN, weight, powertrain, emissions) for Vehicle Identity Card (CIV) issuance, automatic translation of Chinese technical files, and a conversational RAG assistant for homologation regulations.</>,
    tab1Btn: 'Entity Extraction →',
    tab2P1: <>Romania and RAR are strictly bound by the <strong>EU AI Act</strong>, <strong>GDPR</strong>, and national data sovereignty rules. Technical data, chassis numbers, and homologation files stay exclusively within RAR infrastructure on-premises — no document reaches external cloud providers. IBM Power offers industry-leading security and reliability.</>,
    tab2P2: <><strong>"Human-in-the-loop"</strong> architecture is native: AI services extract and pre-populate structured fields for RAR technician validation, eliminating manual transcription errors and accelerating CIV approval.</>,
    tab3P1: <>The platform uses <strong>IBM Granite 4.2:8b</strong> — 8 billion parameters, 128,000-token context, native support for Romanian, Chinese, and 12 other languages. The model runs locally via <strong>Ollama</strong> and can be swapped or tuned at any time without changing application services.</>,
    tab3P2: <>The same AI microservices can process <strong>individual homologations, Certificates of Conformity (CoC), technical inspection reports</strong>, or customs dossiers — integrating directly with RAR internal databases.</>,
    capLabel: 'Demonstrated capabilities',
    cap1Title: '🔍 Technical Data Extraction',
    cap1Desc: 'VIN, chassis specs, mass, emissions, importer — automatically extracted to populate CIV records',
    cap2Title: '🌐 Technical Translation',
    cap2Desc: 'Chinese technical data sheets and type-approval documents translated to Romanian — locally, no cloud',
    cap3Title: '💬 RAG Regulatory Assistant',
    cap3Desc: 'Instant queries over technical legislation, RNTR standards, and homologation procedures',
    open: 'Open →',
  },
};

export default function LandingPage() {
  const { lang } = useLang();
  const t = T[lang];

  return (
    <Grid className="landing-page" fullWidth>
      <Column lg={16} md={8} sm={4} className="landing-page__banner">
        <Breadcrumb noTrailingSlash aria-label="Page navigation">
          <BreadcrumbItem>
            <a href="/">{t.breadcrumb}</a>
          </BreadcrumbItem>
        </Breadcrumb>
        <h1 className="landing-page__heading">{t.heading}</h1>
      </Column>

      {/* Strategic context banner */}
      <Column lg={16} md={8} sm={4} style={{ padding: '0 1rem 1.5rem' }}>
        <Tile style={{
          background: 'var(--cds-layer-02)',
          padding: '1.5rem 2rem',
          borderLeft: '4px solid var(--cds-border-interactive)'
        }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <Tag type="blue">PNRR — D4eID</Tag>
            <Tag type="green">MAI Digital — 657M RON</Tag>
            <Tag type="purple">EU AI Act compliant</Tag>
          </div>
          <p style={{ margin: 0, fontSize: '0.9375rem', lineHeight: 1.6 }}>{t.contextPara}</p>
        </Tile>
      </Column>

      <Column lg={16} md={8} sm={4} className="landing-page__r2">
        <Tabs defaultSelectedIndex={0}>
          <TabList className="tabs-group" aria-label="Tab navigation">
            <Tab>{t.tab1}</Tab>
            <Tab>{t.tab2}</Tab>
            <Tab>{t.tab3}</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Grid className="tabs-group-content">
                <Column md={4} lg={7} sm={4} className="landing-page__tab-content">
                  <h3 className="landing-page__subheading">{t.tab1Heading}</h3>
                  <p className="landing-page__p">{t.tab1P1}</p>
                  <p className="landing-page__p">{t.tab1P2}</p>
                  <Button href="/entextract">{t.tab1Btn}</Button>
                </Column>
                <Column md={4} lg={{ span: 8, offset: 7 }} sm={4}>
                  <Image
                    className="landing-page__illo"
                    src="https://newsroom.ibm.com/image/Power11-Launch-SocialKit_Banner.png"
                    alt="IBM Power"
                    width={604}
                    height={498}
                  />
                </Column>
              </Grid>
            </TabPanel>

            <TabPanel>
              <Grid className="tabs-group-content">
                <Column lg={16} md={8} sm={4} className="landing-page__tab-content">
                  <p className="landing-page__p">{t.tab2P1}</p>
                  <p className="landing-page__p">{t.tab2P2}</p>
                </Column>
              </Grid>
            </TabPanel>

            <TabPanel>
              <Grid className="tabs-group-content">
                <Column lg={16} md={8} sm={4} className="landing-page__tab-content">
                  <p className="landing-page__p">{t.tab3P1}</p>
                  <p className="landing-page__p">{t.tab3P2}</p>
                </Column>
              </Grid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Column>

      {/* Capabilities grid */}
      <Column lg={16} md={8} sm={4} className="landing-page__r3">
        <Grid>
          <Column lg={4} md={2} sm={4}>
            <h3 className="landing-page__label">{t.capLabel}</h3>
          </Column>

          <Column lg={{ start: 5, span: 3 }} md={{ start: 3, span: 6 }} sm={4}
            className="landing-page__title" style={{ textAlign: 'center' }}>
            <h4>{t.cap1Title}</h4>
            <div>{t.cap1Desc}</div>
            <div style={{ marginTop: '0.75rem' }}>
              <Button kind="ghost" size="sm" href="/entextract">{t.open}</Button>
            </div>
          </Column>

          <Column lg={{ start: 9, span: 3 }} md={{ start: 3, span: 6 }} sm={4}
            className="landing-page__title" style={{ textAlign: 'center' }}>
            <h4>{t.cap2Title}</h4>
            <div>{t.cap2Desc}</div>
            <div style={{ marginTop: '0.75rem' }}>
              <Button kind="ghost" size="sm" href="/translate">{t.open}</Button>
            </div>
          </Column>

          <Column lg={{ start: 13, span: 3 }} md={{ start: 3, span: 6 }} sm={4}
            className="landing-page__title" style={{ textAlign: 'center' }}>
            <h4>{t.cap3Title}</h4>
            <div>{t.cap3Desc}</div>
            <div style={{ marginTop: '0.75rem' }}>
              <Button kind="ghost" size="sm" href="/rfpassistant">{t.open}</Button>
            </div>
          </Column>
        </Grid>
      </Column>
    </Grid>
  );
}

// Made with Bob
