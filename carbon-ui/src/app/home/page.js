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
          Servicii AI pentru investigarea fraudelor vamale — vehicule de import chinez
        </h1>
      </Column>

      <Column lg={16} md={8} sm={4} className="landing-page__r2">
        <Tabs defaultSelectedIndex={0}>
          <TabList className="tabs-group" aria-label="Tab navigation">
            <Tab>Despre platformă</Tab>
            <Tab>Securitate și confidențialitate</Tab>
            <Tab>Flexibilitate</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Grid className="tabs-group-content">
                <Column md={4} lg={7} sm={4} className="landing-page__tab-content">
                  <h3 className="landing-page__subheading">IBM AI Services pe IBM Power10</h3>
                  <p className="landing-page__p">
                    Această platformă oferă servicii AI specializate pentru analiza documentelor
                    de import vehicule chineze — fără GPU-uri, fără cloud extern. Totul rulează
                    pe un server IBM Power10 în rețeaua internă, utilizând modelul IBM Granite 4.2
                    prin Ollama și microserviciile IBM AI Services (AI Launchpad).
                  </p>
                  <Button href="/entextract">Extragere entități →</Button>
                </Column>
                <Column md={4} lg={{ span: 8, offset: 7 }} sm={4}>
                  <Image
                    className="landing-page__illo"
                    src="https://newsroom.ibm.com/image/Power11-Launch-SocialKit_Banner.png"
                    alt="IBM Power10"
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
                    Datele procesate rămân exclusiv în rețeaua internă DGPCI. IBM Power10 oferă
                    cu ordine de mărime mai puține vulnerabilități de securitate în stratul de
                    virtualizare față de arhitecturile x86, reducând semnificativ suprafața de
                    atac. Niciun document vamal nu ajunge la furnizori cloud externi.
                  </p>
                </Column>
              </Grid>
            </TabPanel>

            <TabPanel>
              <Grid className="tabs-group-content">
                <Column lg={16} md={8} sm={4} className="landing-page__tab-content">
                  <p className="landing-page__p">
                    Platforma folosește modelul IBM Granite 4.2:8b — 8 miliarde de parametri,
                    context 128.000 de tokeni, suport nativ pentru chineză, română și 12 alte limbi.
                    Modelul poate fi înlocuit oricând cu alte modele compatibile Ollama, fără a modifica
                    serviciile. Nu există dependență față de un singur furnizor AI.
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
            <h3 className="landing-page__label">Capabilități disponibile</h3>
          </Column>

          <Column
            lg={{ start: 5, span: 3 }}
            md={{ start: 3, span: 6 }}
            sm={4}
            className="landing-page__title"
            style={{ textAlign: 'center' }}>
            <h4>🔍 Extragere entități</h4>
            <div>VIN, valoare declarată, importator — extrase automat din declarații vamale</div>
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
            <div>Documente în chineză traduse automat în română, local, fără cloud</div>
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
            <h4>💬 Asistent reglementări</h4>
            <div>Întrebări despre reglementările de import UE/România — răspuns instant via RAG</div>
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
