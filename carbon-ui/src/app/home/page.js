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

export default function LandingPage() {
  return (
    <Grid className="landing-page" fullWidth>
      <Column lg={16} md={8} sm={4} className="landing-page__banner">
        <Breadcrumb noTrailingSlash aria-label="Page navigation">
          <BreadcrumbItem>
            <a href="/">Pagina principală</a>
          </BreadcrumbItem>
        </Breadcrumb>
        <h1 className="landing-page__heading">
          Servicii AI pentru MAI Digital — automatizare documente, fără cloud extern
        </h1>
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
          <p style={{ margin: 0, fontSize: '0.9375rem', lineHeight: 1.6 }}>
            Ministerul Afacerilor Interne investește <strong>657 milioane RON</strong> în digitalizarea
            a 15 servicii publice esențiale (înmatriculări, permise, pașapoarte, imigrări) până în 2030,
            și a lansat o licitație de <strong>2,6 milioane EUR (PNRR)</strong> pentru un sistem AI
            conversațional pentru hub.mai.gov.ro. Această platformă demonstrează că acele capabilități
            pot rula <strong>on-premises pe IBM Power</strong> — date care nu părăsesc niciodată
            infrastructura MAI, fără costuri cloud per tranzacție.
          </p>
        </Tile>
      </Column>

      <Column lg={16} md={8} sm={4} className="landing-page__r2">
        <Tabs defaultSelectedIndex={0}>
          <TabList className="tabs-group" aria-label="Tab navigation">
            <Tab>Despre platformă</Tab>
            <Tab>Securitate și GDPR</Tab>
            <Tab>Flexibilitate</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Grid className="tabs-group-content">
                <Column md={4} lg={7} sm={4} className="landing-page__tab-content">
                  <h3 className="landing-page__subheading">IBM AI Services pe IBM Power</h3>
                  <p className="landing-page__p">
                    Platforma combină trei servicii AI din <strong>IBM AI Services (AI Launchpad)</strong>
                    cu modelul <strong>IBM Granite 4.2:8b</strong> — suport nativ pentru română și chineză,
                    context de 128.000 tokeni. Totul rulează într-un singur LPAR RHEL pe IBM Power10,
                    fără GPU, fără conexiune cloud.
                  </p>
                  <p className="landing-page__p">
                    Capabilitățile demonstrate acoperă direct prioritățile <strong>MAI Digital</strong>:
                    extragere structurată din documente (înmatriculări, permise), traducere automată
                    (documente chineze pentru DGPCI), și asistent conversațional RAG pentru reglementări
                    (echivalentul on-premises al chatbot-ului PNRR de 2,6M EUR).
                  </p>
                  <Button href="/entextract">Extragere entități →</Button>
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
                  <p className="landing-page__p">
                    România este strict legată de <strong>Regulamentul UE privind AI (EU AI Act)</strong>
                    și <strong>GDPR</strong>. Datele procesate rămân exclusiv în infrastructura MAI —
                    niciun document de identitate, nicio declarație vamală, nicio sesizare a cetățenilor
                    nu ajunge la furnizori cloud externi. IBM Power oferă cu ordine de mărime mai puține
                    vulnerabilități de securitate în stratul de virtualizare față de arhitecturile x86.
                  </p>
                  <p className="landing-page__p">
                    Arhitectura <strong>„human-in-the-loop"</strong> este nativă: serviciile AI returnează
                    date structurate și traduceri pentru validare de operator, nu iau decizii autonome.
                    Aceasta respectă cerințele EU AI Act pentru sisteme de risc înalt în sectorul public.
                  </p>
                </Column>
              </Grid>
            </TabPanel>

            <TabPanel>
              <Grid className="tabs-group-content">
                <Column lg={16} md={8} sm={4} className="landing-page__tab-content">
                  <p className="landing-page__p">
                    Platforma folosește <strong>IBM Granite 4.2:8b</strong> — 8 miliarde de parametri,
                    context 128.000 de tokeni, suport nativ pentru română, chineză și 12 alte limbi.
                    Modelul rulează prin <strong>Ollama</strong> și poate fi înlocuit oricând cu alt
                    model compatibil (Llama, Mistral, modele specializate pe drept românesc) fără a
                    modifica serviciile. Nu există dependență față de un singur furnizor AI sau cloud.
                  </p>
                  <p className="landing-page__p">
                    Aceleași microservicii IBM AI Services pot procesa <strong>înmatriculări,
                    permise de conducere, dosare de imigrare</strong> sau orice alt tip de document
                    MAI — nu doar importuri de vehicule chineze. Schema de extracție se configurează
                    per tip de document.
                  </p>
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
            <h3 className="landing-page__label">Capabilități demonstrate</h3>
          </Column>

          <Column
            lg={{ start: 5, span: 3 }}
            md={{ start: 3, span: 6 }}
            sm={4}
            className="landing-page__title"
            style={{ textAlign: 'center' }}>
            <h4>🔍 Extragere entități</h4>
            <div>VIN, valoare declarată, importator — extrase automat din declarații vamale și documente MAI</div>
            <div style={{ marginTop: '0.75rem' }}>
              <Button kind="ghost" size="sm" href="/entextract">Deschide →</Button>
            </div>
          </Column>

          <Column
            lg={{ start: 9, span: 3 }}
            md={{ start: 3, span: 6 }}
            sm={4}
            className="landing-page__title"
            style={{ textAlign: 'center' }}>
            <h4>🌐 Traducere</h4>
            <div>Documente în chineză (sau orice limbă) traduse în română — local, fără cloud</div>
            <div style={{ marginTop: '0.75rem' }}>
              <Button kind="ghost" size="sm" href="/translate">Deschide →</Button>
            </div>
          </Column>

          <Column
            lg={{ start: 13, span: 3 }}
            md={{ start: 3, span: 6 }}
            sm={4}
            className="landing-page__title"
            style={{ textAlign: 'center' }}>
            <h4>💬 Asistent RAG</h4>
            <div>Echivalentul on-premises al chatbot-ului PNRR — reglementări, proceduri MAI, răspuns instant</div>
            <div style={{ marginTop: '0.75rem' }}>
              <Button kind="ghost" size="sm" href="/rfpassistant">Deschide →</Button>
            </div>
          </Column>
        </Grid>
      </Column>
    </Grid>
  );
}

// Made with Bob
