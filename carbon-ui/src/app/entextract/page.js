'use client';
import EntExtractTable from './EntExtractTable';
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
  TextArea,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  DataTableSkeleton,
  InlineNotification,
  Tile,
  Loading,
  Tag,
} from '@carbon/react';
import {
  Application,
  CloudServices,
  MachineLearningModel,
  Security,
  DataStorage,
  Enterprise,
  Microservices,
  Globe
} from '@carbon/pictograms-react';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { DEFAULTS, DOC_OMODA_SUSPICIOUS } from "./defaults";
import { getExpectedKeys, reconcileOutput, buildKeyLabelMap } from "./postprocess";
import { runExtraction } from "./extraction";
import { useLang } from '../lang-context';

const EETABS = {
  ro: ['De ce IBM Power', 'Import Vehicul', 'Tehnologie'],
  en: ['Why IBM Power', 'Vehicle Import', 'Technology'],
};

export default function EntityExtractionPage() {
  const { lang } = useLang();
  const tabs = EETABS[lang];
  const [values, setValues] = useState(() => DEFAULTS);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [extractedRows, setExtractedRows] = useState([]); // [{ id, label, value }]
  const [activeTab, setActiveTab] = useState(0);
  const [processingTab, setProcessingTab] = useState(null); // Track which demo tab is processing
  const [isComplete, setIsComplete] = useState(false); // Track if LLM processing is complete

  // Reset to defaults when switching to the Vehicle Import tab (index 1)
  useEffect(() => {
    const shouldClearResults = !(isComplete && activeTab === processingTab);
    if (activeTab === 1) {
      setValues(DEFAULTS);
      if (shouldClearResults) setExtractedRows([]);
      setErrorMsg('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const onFreeFormChange = (e) =>
    setValues((prev) => ({ ...prev, free_form_text: e.target.value }));

  const onEntityChange = (index, key) => (e) => {
    const next = e.target.value;
    setValues((prev) => {
      const entities = [...prev.entities];
      entities[index] = { ...entities[index], [key]: next };
      return { ...prev, entities };
    });
  };

  const addEntity = () =>
    setValues((prev) => ({ ...prev, entities: [...prev.entities, { label: "", definition: "" }] }));

  const removeEntity = (index) =>
    setValues((prev) => ({ ...prev, entities: prev.entities.filter((_, i) => i !== index) }));

  async function completion() {
    setIsLoading(true);
    setErrorMsg('');
    setIsComplete(false);
    setProcessingTab(activeTab);
    setExtractedRows([]);

    try {
      const { rows } = await runExtraction(values);
      setExtractedRows(rows);
      setIsComplete(true);
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.message || 'Eroare la contactarea serviciului de extracție.');
    } finally {
      setIsLoading(false);
    }
  }

  // Function to handle clicking the sticky notification to return to results
  const handleReturnToResults = () => {
    if (processingTab !== null) {
      setActiveTab(processingTab);
    }
  };

  // Get demo tab name for display
  const getDemoTabName = (tabIndex) => tabs[tabIndex] || 'Demo';

  const headings = {
    ro: 'Extragere automată de entități din documente de import vehicule',
    en: 'Automatic entity extraction from vehicle import documents',
  };
  const breadcrumbs = { ro: 'Pagina principală', en: 'Home' };

  return (
    <Grid className="landing-page" fullWidth>
      <Column lg={16} md={8} sm={4} className="landing-page__banner">
        <Breadcrumb noTrailingSlash aria-label="Page navigation">
          <BreadcrumbItem>
            <a href="/">{breadcrumbs[lang]}</a>
          </BreadcrumbItem>
        </Breadcrumb>
        <h1 className="landing-page__heading">{headings[lang]}</h1>
      </Column>

      <Column lg={16} md={8} sm={4} className="landing-page__r2">
        <Tabs selectedIndex={activeTab} onChange={({ selectedIndex }) => setActiveTab(selectedIndex)}>
          <TabList className="tabs-group" aria-label="Tab navigation">
            {tabs.map((label, i) => <Tab key={i}>{label}</Tab>)}
          </TabList>
          <TabPanels>
            <TabPanel>
              {/* Sticky notification for this tab */}
              {(isLoading || isComplete) && processingTab !== null && (
                <div className="sticky-notification-container">
                  <InlineNotification
                    kind={isComplete ? "success" : "info"}
                    title={isComplete ? "🎉 Demo Results Ready!" : "🔥 Baking Your Demo..."}
                    subtitle={
                      isComplete
                        ? `Your ${getDemoTabName(processingTab)} results are ready. Click to return to that tab!`
                        : `Processing ${getDemoTabName(processingTab)} in the background. Explore this tab while you wait!`
                    }
                    hideCloseButton={false}
                    onCloseButtonClick={() => {
                      setIsComplete(false);
                      setProcessingTab(null);
                    }}
                    lowContrast={false}
                    style={{
                      cursor: isComplete ? 'pointer' : 'default',
                      marginBottom: '1rem'
                    }}
                    onClick={isComplete ? handleReturnToResults : undefined}
                  />
                </div>
              )}
              <Grid className="tabs-group-content">
                <Column lg={16} md={8} sm={4} className="landing-page__tab-content">
                  <h2 className="landing-page__subheading">
                    {lang === 'ro'
                      ? 'De ce IBM Power pentru RAR (Registrul Auto Român)'
                      : 'Why IBM Power for RAR (Romanian Automotive Register)'}
                  </h2>
                  <p className="landing-page__p" style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
                    {lang === 'ro'
                      ? 'Automatizarea extragerii de date din documente tehnice și dosare de omologare cu AI pe IBM Power transformă operațiunile RAR — oferind randament crescut, securitate on-premises și eliminarea blocajelor manuale.'
                      : 'Automating data extraction from technical documents and homologation dossiers with AI on IBM Power delivers proven business value — increasing throughput, securing vehicle data on-prem, and eliminating manual bottlenecks.'}
                  </p>
                </Column>

                {/* Proven ROI Banner - Hans Geis Benchmark */}
                <Column lg={16} md={8} sm={4} className="landing-page__tab-content">
                  <Tile style={{
                    background: 'var(--cds-layer-02)',
                    padding: '1.5rem 2rem',
                    borderLeft: '4px solid #0f62fe',
                    marginBottom: '2rem'
                  }}>
                    <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem' }}>
                      {lang === 'ro'
                        ? '🏆 Rezultate validate în producție: 80% economie de timp, accelerare de 5X'
                        : '🏆 Proven Production Benchmark: 80% Time Reduction, 5X Acceleration'}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>
                      {lang === 'ro'
                        ? <>Similar studiului de caz <strong>Hans Geis GmbH</strong> (unde procesarea automată a comenzilor pe IBM Power a redus timpii cu <strong>80%</strong> și a accelerat procesarea de <strong>5X</strong>), tehnicienii RAR scapă de citirea manuală a fișelor tehnice și a declarațiilor în limbi străine (ex: chineză). Datele sunt extrase și încărcate direct în baza de date națională a vehiculelor.</>
                        : <>As proven with <strong>Hans Geis GmbH</strong> on IBM Power (where automated AI extraction cut processing times by <strong>80%</strong> and accelerated order handling by <strong>5X</strong>), RAR technicians no longer need to manually decipher foreign-language technical sheets or certificates. Extracted specs are loaded directly into the national vehicle registry.</>}
                    </p>
                  </Tile>
                </Column>

                {/* Benefit 1: Increased Throughput & Revenue */}
                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
                    <Globe style={{ width: '64px', height: '64px', flexShrink: 0 }} />
                    <div>
                      <h3 className="landing-page__label" style={{ marginTop: 0 }}>
                        {lang === 'ro' ? 'Creșterea capacității & veniturilor din omologări' : 'Higher Homologation Throughput & Revenue'}
                      </h3>
                      <p className="landing-page__p">
                        {lang === 'ro'
                          ? 'Deblochează cozile de omologare pentru dealeri și importatori. Fiecare dosar de omologare / CIV finalizat mai rapid crește volumul zilnic tarifabil.'
                          : 'Clears vehicle homologation backlogs for importers and dealers. Faster file turnarounds directly increase daily fee-generating certification capacity.'}
                      </p>
                    </div>
                  </div>
                </Column>
                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <ul style={{ marginLeft: '1rem', marginTop: '1rem' }}>
                    <li>{lang === 'ro' ? 'Accelerare de 5X a prelucrării dosarelor tehnice' : '5X speedup in processing technical dossiers'}</li>
                    <li>{lang === 'ro' ? 'Reducerea timpilor de așteptare pentru importatori' : 'Slashed waiting times at customs and inspection stations'}</li>
                    <li>{lang === 'ro' ? 'Procesarea imediată a vehiculelor chinezești noi (EV)' : 'Immediate processing of incoming Chinese EV brands'}</li>
                    <li>{lang === 'ro' ? 'Capacitate crescută fără suplimentare de personal' : 'Scalable throughput without increasing technician headcount'}</li>
                  </ul>
                </Column>

                {/* Benefit 2: Data Sovereignty & Security */}
                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
                    <Security style={{ width: '64px', height: '64px', flexShrink: 0 }} />
                    <div>
                      <h3 className="landing-page__label" style={{ marginTop: 0 }}>
                        {lang === 'ro' ? 'Securitate & Suveranitate On-Premises' : 'On-Premises Data Sovereignty & Security'}
                      </h3>
                      <p className="landing-page__p">
                        {lang === 'ro'
                          ? 'Datele tehnice, seriile VIN și documentele vamale nu părăsesc niciodată infrastructura RAR. Zero riscuri de expunere a datelor în cloud-uri publice.'
                          : 'Technical specs, VINs, and customs documentation never leave RAR infrastructure. Zero risk of data exposure to public hyperscalers.'}
                      </p>
                    </div>
                  </div>
                </Column>
                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <ul style={{ marginLeft: '1rem', marginTop: '1rem' }}>
                    <li>{lang === 'ro' ? 'Conformitate strictă cu EU AI Act și GDPR' : 'Full compliance with EU AI Act & GDPR regulations'}</li>
                    <li>{lang === 'ro' ? 'Protecția secretelor industriale ale producătorilor' : 'Manufacturer intellectual property remains protected'}</li>
                    <li>{lang === 'ro' ? 'Zero dependență de conexiuni externe sau servicii cloud' : 'Zero dependency on external internet or SaaS APIs'}</li>
                    <li>{lang === 'ro' ? 'Securitate la nivel hardware pe IBM Power' : 'Industry-leading hardware security on IBM Power'}</li>
                  </ul>
                </Column>

                {/* Benefit 3: Direct Integration with Core Registries */}
                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
                    <Enterprise style={{ width: '64px', height: '64px', flexShrink: 0 }} />
                    <div>
                      <h3 className="landing-page__label" style={{ marginTop: 0 }}>
                        {lang === 'ro' ? 'Integrare directă cu bazele de date RAR' : 'Direct Integration with Core RAR Databases'}
                      </h3>
                      <p className="landing-page__p">
                        {lang === 'ro'
                          ? 'Serviciile AI rulează pe aceeași infrastructură IBM Power unde se află bazele de date și aplicațiile de omologare ale registrului.'
                          : 'AI services run alongside core vehicle databases and registries on the same IBM Power footprint with ultra-low latency.'}
                      </p>
                    </div>
                  </div>
                </Column>
                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <ul style={{ marginLeft: '1rem', marginTop: '1rem' }}>
                    <li>{lang === 'ro' ? 'Pre-populare automată a Cărții de Identitate (CIV)' : 'Automated pre-filling of Vehicle Identity Cards (CIV)'}</li>
                    <li>{lang === 'ro' ? 'Eliminarea erorilor umane de transcriere a VIN-ului' : 'Eliminates manual VIN transcription errors'}</li>
                    <li>{lang === 'ro' ? 'Human-in-the-loop: validare rapidă cu un singur click' : 'Human-in-the-loop: one-click technician verification'}</li>
                    <li>{lang === 'ro' ? 'Fără costuri suplimentare de middleware sau transformare' : 'No middleware or complex data pipeline overhead'}</li>
                  </ul>
                </Column>

                {/* Benefit 4: Zero Per-Document Costs */}
                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
                    <DataStorage style={{ width: '64px', height: '64px', flexShrink: 0 }} />
                    <div>
                      <h3 className="landing-page__label" style={{ marginTop: 0 }}>
                        {lang === 'ro' ? 'Costuri predictibile & Fără taxe per document' : 'Predictable Costs & Zero Per-Document Fees'}
                      </h3>
                      <p className="landing-page__p">
                        {lang === 'ro'
                          ? 'Procesați sute de mii de fișe de omologare fără taxe variabile de API sau costuri ascunse de transfer de date.'
                          : 'Process hundreds of thousands of homologation files with no variable API token charges or cloud egress fees.'}
                      </p>
                    </div>
                  </div>
                </Column>
                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <ul style={{ marginLeft: '1rem', marginTop: '1rem' }}>
                    <li>{lang === 'ro' ? 'Cost fix și predictibil pe infrastructura existentă' : 'Fixed, predictable cost on existing infrastructure'}</li>
                    <li>{lang === 'ro' ? 'Procesare fără limită de volum sau apeluri API' : 'Unlimited processing capacity without throttling'}</li>
                    <li>{lang === 'ro' ? 'Eficiență energetică superioară pe arhitectură IBM Power' : 'Superior energy efficiency on IBM Power architecture'}</li>
                    <li>{lang === 'ro' ? 'Rentabilitate maximă a investiției (ROI rapid)' : 'Rapid return on investment with minimal operational overhead'}</li>
                  </ul>
                </Column>

                {/* Summary */}
                <Column lg={16} md={8} sm={4} className="landing-page__tab-content">
                  <Tile style={{ marginTop: '1.5rem', padding: '1.5rem 2rem', background: 'var(--cds-layer-02)' }}>
                    <p style={{ margin: 0, fontSize: '1.05rem', fontStyle: 'italic', textAlign: 'center' }}>
                      {lang === 'ro'
                        ? '„Transformarea procesării documentelor de omologare cu AI on-premises pe IBM Power permite RAR să accelereze timpul de răspuns către importatori și cetățeni, eliminând blocajele manuale și garantând suveranitatea datelor naționale.”'
                        : '"Transforming homologation document processing with on-premises AI on IBM Power allows RAR to accelerate response times for importers and citizens, eliminate manual bottlenecks, and guarantee national data sovereignty."'}
                    </p>
                  </Tile>
                </Column>
              </Grid>
            </TabPanel>
            <TabPanel>
              {/* Sticky notification for this tab */}
              {(isLoading || isComplete) && processingTab !== null && (
                <div className="sticky-notification-container">
                  <InlineNotification
                    kind={isComplete ? "success" : "info"}
                    title={isComplete ? "🎉 Demo Results Ready!" : "🔥 Baking Your Demo..."}
                    subtitle={
                      isComplete
                        ? `Your ${getDemoTabName(processingTab)} results are ready. Scroll down to view them!`
                        : `Processing ${getDemoTabName(processingTab)} in the background. Feel free to explore the What and Why tabs while you wait.`
                    }
                    hideCloseButton={false}
                    onCloseButtonClick={() => {
                      setIsComplete(false);
                      setProcessingTab(null);
                    }}
                    lowContrast={false}
                    style={{
                      cursor: isComplete ? 'pointer' : 'default',
                      marginBottom: '1rem'
                    }}
                    onClick={isComplete ? handleReturnToResults : undefined}
                  />
                </div>
              )}
              <Grid className="tabs-group-content">
                <Column md={4} lg={7} sm={4} className="entity__tab-content">
                  <h3 className="landing-page__subheading">
                    {lang === 'ro'
                      ? 'Extragere structurată din dosare de omologare & import vehicule'
                      : 'Structured extraction from vehicle import & homologation dossiers'}
                  </h3>
                  <p className="landing-page__p">
                    {lang === 'ro'
                      ? <>Serviciul <strong>Entity Extraction</strong> analizează documentele tehnice și declarațiile vamale de import și extrage automat câmpurile esențiale — marca, modelul, VIN-ul, seria de șasiu, valorile financiare și importatorul pentru generarea automată a Cărții de Identitate a Vehiculului (CIV).</>
                      : <>The <strong>Entity Extraction</strong> service analyzes technical sheets and import declarations to automatically extract key fields — make, model, VIN, chassis specs, financial values, and importer details for automated Vehicle Identity Card (CIV) pre-population.</>}
                  </p>
                  <p className="landing-page__p">
                    {lang === 'ro'
                      ? <>Apăsați <strong>Trimite la serviciul de extracție</strong> pentru a obține rezultatele structurate. Serviciul rulează local pe IBM Power, fără date care părăsesc rețeaua RAR.</>
                      : <>Click <strong>Send to Extraction Service</strong> to get structured output. The service runs locally on IBM Power — no data ever leaves RAR network.</>}
                  </p>
                </Column>
                <Column md={4} lg={{ span: 8, offset: 7 }} sm={4}>
                  <Tile style={{ padding: '2rem', background: 'var(--cds-layer-02)', height: '100%' }}>
                    <h4 style={{ marginTop: 0 }}>🚗 Scenarii de demonstrație</h4>
                    <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                      <strong>Doc 1 — BYD Atto 3</strong> (implicit): import legitim, toate documentele prezente.
                    </p>
                    <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                      <strong>Doc 3 — Omoda 5</strong>: valoare declarată suspectă (6.800 EUR vs. valoare de piață ~24.000 EUR),
                      importator înregistrat cu 3 săptămâni înainte de import.
                    </p>
                    <Button
                      kind="ghost"
                      size="sm"
                      onClick={() => setValues(prev => ({ ...prev, free_form_text: DOC_OMODA_SUSPICIOUS }))}
                    >
                      Încarcă documentul Omoda 5 suspect →
                    </Button>
                  </Tile>
                </Column>

                <Column lg={16} md={8} sm={4} className="landing-page__tab-content" style={{ marginTop: '2rem' }}>
                  <Button
                    kind="primary"
                    size="lg"
                    onClick={()=>completion()}
                    disabled={isLoading}
                    style={{ marginBottom: '1rem' }}
                  >
                    {isLoading ? 'Se procesează...' : '🚀 Pre-încarcă rezultatele demonstrației'}
                  </Button>
                  {isLoading && (
                    <InlineNotification
                      kind="info"
                      title="Processing in background"
                      subtitle="Results will appear below when ready. Continue explaining the demo!"
                      hideCloseButton
                      lowContrast
                      style={{ marginTop: '0.5rem' }}
                    />
                  )}
                </Column>

                <Column lg={16} md={8} sm={4} className="landing-page__tab-content">
                  <p className="landing-page__p">
                    Mai jos este textul declarației vamale. Îl puteți modifica liber pentru a testa
                    extragerea cu documente diferite.
                  </p>
                  <TextArea
                    className="text-area-class"
                    id="free-form-text"
                    value={values.free_form_text ?? ""}
                    onChange={onFreeFormChange}
                    size="lg"
                    rows={8}
                  />
                </Column>
                <Column lg={16} md={8} sm={4} className="landing-page__tab-content">
                  <p className="landing-page__p">
                    Mai jos sunt etichetele și definițiile câmpurilor care vor fi extrase. Le puteți
                    modifica pentru a extrage și alte informații din document.
                  </p>
                </Column>
              </Grid>

              {/* Entities - use single Grid with all entity pairs */}
              <Grid className="entity-grid">
                {(values.entities ?? []).map((f, i) => (
                  <React.Fragment key={i}>
                    {/* Label column */}
                    <Column sm={4} md={4} lg={4} className="entity-label-col">
                      <TextArea
                        id={`label-${i}`}
                        labelText={`Label ${i + 1}`}
                        value={f.label ?? ''}
                        onChange={onEntityChange(i, 'label')}
                        size="sm"
                        rows={Math.max(1, Math.ceil((f.label?.length || 0) / 30))}
                      />
                    </Column>

                    {/* Definition column */}
                    <Column sm={4} md={4} lg={12} className="entity-def-col">
                      <TextArea
                        id={`definition-${i}`}
                        labelText={`Definition ${i + 1}`}
                        value={f.definition ?? ''}
                        onChange={onEntityChange(i, 'definition')}
                        size="sm"
                        rows={Math.max(1, Math.ceil((f.definition?.length || 0) / 80))}
                      />
                    </Column>
                  </React.Fragment>
                ))}
              </Grid>

              <Grid className="tabs-group-content">
                <Column sm={4} md={8} lg={16} className="landing-page__tab-content">
                  <Button className="send-to-llm-class" onClick={()=>completion()} disabled={isLoading}>
                    {isLoading ? 'Se procesează…' : 'Trimite la serviciul de extracție'}
                  </Button>
                </Column>

                {/* Error Display */}
                {errorMsg && (
                  <Column sm={4} md={8} lg={16} className="landing-page__tab-content">
                    <InlineNotification
                      kind="error"
                      title="Error"
                      subtitle={errorMsg}
                      onCloseButtonClick={() => setErrorMsg('')}
                      lowContrast
                    />
                  </Column>
                )}

                {/* Results */}
                <Column sm={4} md={8} lg={16} className="landing-page__tab-content">
                  {/* 1) Loading state with pictogram */}
                  {isLoading ? (
                    <>
                      <div style={{
                        textAlign: 'center',
                        padding: '2rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1rem'
                      }}>
                        <Loading description="Processing" withOverlay={false} />
                        <InlineNotification
                          kind="info"
                          title="Procesare în curs"
                          subtitle="IBM AI Services analizează documentul vamal..."
                          hideCloseButton
                          lowContrast
                        />
                      </div>
                      <DataTableSkeleton
                        headers={[
                          { key: 'label', header: 'Entity' },
                          { key: 'value', header: 'Value' },
                        ]}
                        showHeader
                        showToolbar
                        rowCount={Math.max(3, values.entities.filter(e => (e.label || '').trim()).length)}
                        columnCount={2}
                      />
                    </>
                  ) : extractedRows.length === 0 ? (
                    // Empty state with pictogram
                    <div style={{
                      textAlign: 'center',
                      padding: '3rem 1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '1rem'
                    }}>
                      <h4 style={{ margin: 0 }}>Nu există entități extrase încă</h4>
                      <p style={{
                        color: 'var(--cds-text-secondary)',
                        maxWidth: '400px',
                        margin: 0
                      }}>
                        Modificați textul și definițiile câmpurilor de mai sus, apoi apăsați
                        <strong> Trimite la serviciul de extracție</strong> pentru date structurate.
                      </p>
                    </div>
                  ) : (
                    <DataTable
                      rows={extractedRows}
                      headers={[
                        { key: 'label', header: 'Câmp' },
                        { key: 'value', header: 'Valoare extrasă' },
                      ]}
                      isSortable
                      size="sm"
                      useStaticWidth
                    >
                      {({ rows, headers, getHeaderProps, getTableProps, getRowProps }) => (
                        <TableContainer
                          title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span>Câmpuri extrase din declarație</span>
                              <Tag type="blue" size="sm">AI · IBM AI Services</Tag>
                            </div>
                          }
                          description="Câmpuri extrase automat din declarația vamală"
                        >
                          <Table stickyHeader {...getTableProps()}>
                            <TableHead>
                              <TableRow>
                                {headers.map((header) => (
                                  <TableHeader
                                    key={header.key}
                                    {...getHeaderProps({ header })}
                                  >
                                    {header.header}
                                  </TableHeader>
                                ))}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {rows.map((row) => (
                                <TableRow key={row.id} {...getRowProps({ row })}>
                                  {row.cells.map((cell) => (
                                    <TableCell key={cell.id} style={{ whiteSpace: 'pre-wrap' }}>
                                      {cell.value}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </DataTable>
                  )}
                </Column>
              </Grid>
            </TabPanel>

            {/* What We're Using Tab */}
            <TabPanel>
              {/* Sticky notification for this tab */}
              {(isLoading || isComplete) && processingTab !== null && (
                <div className="sticky-notification-container">
                  <InlineNotification
                    kind={isComplete ? "success" : "info"}
                    title={isComplete ? "🎉 Demo Results Ready!" : "🔥 Baking Your Demo..."}
                    subtitle={
                      isComplete
                        ? `Your ${getDemoTabName(processingTab)} results are ready. Click to return to that tab!`
                        : `Processing ${getDemoTabName(processingTab)} in the background. Explore this tab while you wait!`
                    }
                    hideCloseButton={false}
                    onCloseButtonClick={() => {
                      setIsComplete(false);
                      setProcessingTab(null);
                    }}
                    lowContrast={false}
                    style={{
                      cursor: isComplete ? 'pointer' : 'default',
                      marginBottom: '1rem'
                    }}
                    onClick={isComplete ? handleReturnToResults : undefined}
                  />
                </div>
              )}
              <Grid className="tabs-group-content">
                {/* Left Column - Text Content */}
                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <h2 className="landing-page__subheading">What We're Using</h2>
                  <p className="landing-page__p" style={{ marginTop: '2rem' }}>
                    This demonstration showcases a complete AI inference stack running entirely on IBM Power architecture.
                    Here's what makes it work:
                  </p>

                  <h3 className="landing-page__label" style={{ marginTop: '2rem' }}>IBM Granite 4.2 — 8B</h3>
                  <p className="landing-page__p">
                    Modelul de bază este IBM Granite 4.2 (8 miliarde de parametri), proiectat pentru
                    utilizare enterprise. Suportă nativ limba chineză, română și alte 12 limbi, și
                    excelează la extragere de entități, RAG și dialog multilingv — toate cu context
                    de 128.000 de tokeni.
                  </p>

                  <h3 className="landing-page__label" style={{ marginTop: '2rem' }}>IBM AI Services — AI Launchpad</h3>
                  <p className="landing-page__p">
                    Serviciile de extracție, traducere și RAG sunt furnizate de <strong>IBM AI Services</strong>
                    (cunoscut anterior ca AI Launchpad), o suită de microservicii FastAPI care rulează în
                    Podman pe RHEL. <strong>Nu se folosesc GPU-uri și nu se folosesc acceleratoare IBM Spyre</strong>
                    — toată inferența rulează pe CPU-urile IBM Power10.
                  </p>

                  <h3 className="landing-page__label" style={{ marginTop: '2rem' }}>Ollama pe RHEL / IBM Power</h3>
                  <p className="landing-page__p">
                    Ollama servește modelul Granite 4.2:8b și expune un API compatibil OpenAI.
                    Toate serviciile IBM AI Services apelează Ollama pentru inferență LLM.
                    Stiva completă — Ollama, Extract, Translate, RAG, OpenSearch, PostgreSQL și
                    interfața Carbon UI — rulează în același LPAR RHEL pe IBM Power.
                  </p>

                  <h3 className="landing-page__label" style={{ marginTop: '2rem' }}>Interfață Carbon Design System</h3>
                  <p className="landing-page__p">
                    Interfața este construită cu Next.js și IBM Carbon Design System, oferind o
                    experiență consistentă cu produsele IBM. Rutele API Next.js acționează ca proxy
                    server-side, astfel încât adresa LPAR-ului nu este expusă browserului.
                  </p>
                </Column>

                {/* Right Column - Visual Stack Diagram */}
                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '2rem 1rem',
                    marginTop: '3rem'
                  }}>
                    <h3 className="landing-page__label" style={{ marginBottom: '2rem', textAlign: 'center' }}>
                      Technology Stack
                    </h3>

                    {/* Application Layer */}
                    <Tile style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '1.5rem' }}>
                      <Application style={{ width: '64px', height: '64px', margin: '0 auto 1rem' }} />
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: 600 }}>Carbon UI</h4>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                        Next.js + Carbon Design System<br/>
                        <strong>Port 3000</strong>
                      </p>
                    </Tile>

                    {/* AI Services Layer */}
                    <Tile style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '1.5rem' }}>
                      <CloudServices style={{ width: '64px', height: '64px', margin: '0 auto 1rem' }} />
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: 600 }}>IBM AI Services</h4>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                        Extract :6000 · Translate :9000<br/>
                        RAG :8080 · OpenSearch :9200<br/>
                        <strong>Podman on RHEL</strong>
                      </p>
                    </Tile>

                    {/* AI Model Layer */}
                    <Tile style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '1.5rem' }}>
                      <MachineLearningModel style={{ width: '64px', height: '64px', margin: '0 auto 1rem' }} />
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: 600 }}>Granite 4.2:8b via Ollama</h4>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                        IBM Enterprise LLM — 128K context<br/>
                        <strong>Port 11434 · CPU only</strong>
                      </p>
                    </Tile>

                    {/* OS Layer */}
                    <Tile style={{
                      width: '100%',
                      maxWidth: '400px',
                      textAlign: 'center',
                      padding: '1.5rem',
                      background: 'linear-gradient(135deg, #EE0000 0%, #CC0000 100%)',
                      color: 'white'
                    }}>
                      <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>RHEL</div>
                      <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.9 }}>
                        Red Hat Enterprise Linux<br/>
                        <strong>Single LPAR</strong>
                      </p>
                    </Tile>

                    {/* IBM Power Foundation */}
                    <Tile style={{
                      width: '100%',
                      maxWidth: '400px',
                      textAlign: 'center',
                      padding: '1.5rem',
                      background: 'linear-gradient(135deg, #0F62FE 0%, #0043CE 100%)',
                      color: 'white'
                    }}>
                      <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>IBM Power</div>
                      <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.9 }}>
                        PPC64LE Architecture<br/>
                        <strong>CPU-Only AI Inference</strong>
                      </p>
                    </Tile>
                  </div>
                </Column>
              </Grid>
            </TabPanel>

            {/* Why IBM Power Tab */}
          </TabPanels>
        </Tabs>
      </Column>
    </Grid>
  );
}

// Made with Bob
