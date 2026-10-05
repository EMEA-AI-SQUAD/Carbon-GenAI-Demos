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
    heading: 'Servicii AI pentru MAI Digital — automatizare documente, fără cloud extern',
    contextPara: <>Ministerul Afacerilor Interne investește <strong>657 milioane RON</strong> în digitalizarea
      a 15 servicii publice esențiale (înmatriculări, permise, pașapoarte, imigrări) până în 2030,
      și a lansat o licitație de <strong>2,6 milioane EUR (PNRR)</strong> pentru un sistem AI
      conversațional pentru hub.mai.gov.ro. Această platformă demonstrează că acele capabilități
      pot rula <strong>on-premises pe IBM Power</strong> — date care nu părăsesc niciodată
      infrastructura MAI, fără costuri cloud per tranzacție.</>,
    tab1: 'Despre platformă',
    tab2: 'Securitate și GDPR',
    tab3: 'Flexibilitate',
    tab1Heading: 'IBM AI Services pe IBM Power',
    tab1P1: <>Platforma combină trei servicii AI din <strong>IBM AI Services (AI Launchpad)</strong> cu modelul <strong>IBM Granite 4.2:8b</strong> — suport nativ pentru română și chineză, context de 128.000 tokeni. Totul rulează într-un singur LPAR RHEL pe IBM Power10, fără GPU, fără conexiune cloud.</>,
    tab1P2: <>Capabilitățile demonstrate acoperă direct prioritățile <strong>MAI Digital</strong>: extragere structurată din documente (înmatriculări, permise), traducere automată (documente chineze pentru DGPCI), și asistent conversațional RAG pentru reglementări (echivalentul on-premises al chatbot-ului PNRR de 2,6M EUR).</>,
    tab1Btn: 'Extragere entități →',
    tab2P1: <>România este strict legată de <strong>Regulamentul UE privind AI (EU AI Act)</strong> și <strong>GDPR</strong>. Datele procesate rămân exclusiv în infrastructura MAI — niciun document de identitate, nicio declarație vamală, nicio sesizare a cetățenilor nu ajunge la furnizori cloud externi. IBM Power oferă cu ordine de mărime mai puține vulnerabilități de securitate în stratul de virtualizare față de arhitecturile x86.</>,
    tab2P2: <>Arhitectura <strong>„human-in-the-loop"</strong> este nativă: serviciile AI returnează date structurate și traduceri pentru validare de operator, nu iau decizii autonome. Aceasta respectă cerințele EU AI Act pentru sisteme de risc înalt în sectorul public.</>,
    tab3P1: <>Platforma folosește <strong>IBM Granite 4.2:8b</strong> — 8 miliarde de parametri, context 128.000 de tokeni, suport nativ pentru română, chineză și 12 alte limbi. Modelul rulează prin <strong>Ollama</strong> și poate fi înlocuit oricând cu alt model compatibil (Llama, Mistral, modele specializate pe drept românesc) fără a modifica serviciile. Nu există dependență față de un singur furnizor AI sau cloud.</>,
    tab3P2: <>Aceleași microservicii IBM AI Services pot procesa <strong>înmatriculări, permise de conducere, dosare de imigrare</strong> sau orice alt tip de document MAI — nu doar importuri de vehicule chineze. Schema de extracție se configurează per tip de document.</>,
    capLabel: 'Capabilități demonstrate',
    cap1Title: '🔍 Extragere entități',
    cap1Desc: 'VIN, valoare declarată, importator — extrase automat din declarații vamale și documente MAI',
    cap2Title: '🌐 Traducere',
    cap2Desc: 'Documente în chineză (sau orice limbă) traduse în română — local, fără cloud',
    cap3Title: '💬 Asistent RAG',
    cap3Desc: 'Echivalentul on-premises al chatbot-ului PNRR — reglementări, proceduri MAI, răspuns instant',
    open: 'Deschide →',
  },
  en: {
    breadcrumb: 'Home',
    heading: 'AI Services for MAI Digital — document automation, no external cloud',
    contextPara: <>The Romanian Ministry of Internal Affairs is investing <strong>657 million RON</strong> in digitising
      15 essential public services (vehicle registration, permits, passports, immigration) by 2030,
      and has launched a <strong>€2.6 million PNRR tender</strong> for a conversational AI system for
      hub.mai.gov.ro. This platform demonstrates that those capabilities can run
      <strong> on-premises on IBM Power</strong> — data never leaves MAI infrastructure,
      with no per-transaction cloud costs.</>,
    tab1: 'About the platform',
    tab2: 'Security & GDPR',
    tab3: 'Flexibility',
    tab1Heading: 'IBM AI Services on IBM Power',
    tab1P1: <>The platform combines three AI services from <strong>IBM AI Services (AI Launchpad)</strong> with the <strong>IBM Granite 4.2:8b</strong> model — native support for Romanian and Chinese, 128,000-token context. Everything runs on a single RHEL LPAR on IBM Power10, no GPU, no cloud connection.</>,
    tab1P2: <>The demonstrated capabilities directly address <strong>MAI Digital</strong> priorities: structured extraction from documents (vehicle registrations, permits), automatic translation (Chinese documents for DGPCI), and a conversational RAG assistant for regulations (the on-premises equivalent of the €2.6M PNRR chatbot).</>,
    tab1Btn: 'Entity Extraction →',
    tab2P1: <>Romania is strictly bound by the <strong>EU AI Act</strong> and <strong>GDPR</strong>. Processed data stays exclusively within MAI infrastructure — no identity document, customs declaration, or citizen complaint reaches any external cloud provider. IBM Power offers orders of magnitude fewer virtualisation-layer security vulnerabilities compared to x86 architectures.</>,
    tab2P2: <><strong>"Human-in-the-loop"</strong> architecture is native: AI services return structured data and translations for operator validation — they do not make autonomous decisions. This satisfies EU AI Act requirements for high-risk systems in the public sector.</>,
    tab3P1: <>The platform uses <strong>IBM Granite 4.2:8b</strong> — 8 billion parameters, 128,000-token context, native support for Romanian, Chinese, and 12 other languages. The model runs via <strong>Ollama</strong> and can be swapped at any time for another compatible model (Llama, Mistral, models specialised in Romanian law) without changing services. There is no dependency on a single AI vendor or cloud.</>,
    tab3P2: <>The same IBM AI Services microservices can process <strong>vehicle registrations, driving licences, immigration files</strong> or any other MAI document type — not just Chinese vehicle imports. The extraction schema is configured per document type.</>,
    capLabel: 'Demonstrated capabilities',
    cap1Title: '🔍 Entity Extraction',
    cap1Desc: 'VIN, declared value, importer — automatically extracted from customs declarations and MAI documents',
    cap2Title: '🌐 Translation',
    cap2Desc: 'Chinese (or any language) documents translated to Romanian — locally, no cloud',
    cap3Title: '💬 RAG Assistant',
    cap3Desc: 'On-premises equivalent of the PNRR chatbot — regulations, MAI procedures, instant answers',
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
