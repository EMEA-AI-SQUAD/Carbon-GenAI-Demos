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
  Link,
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
  AILabel,
  AILabelContent,
  Toggle,
  Tile,
  Loading,
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
import { IT_OPS_SCENARIOS } from "./it-ops-emails";
import { LOGISTICS_QUOTE_SCENARIO } from "./logistics-quote";

export default function EntityExtractionPage() {
  const [values, setValues] = useState(() => DEFAULTS);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [extractedRows, setExtractedRows] = useState([]); // [{ id, label, value }]
  const [activeTab, setActiveTab] = useState(0);
  const [processingTab, setProcessingTab] = useState(null); // Track which demo tab is processing
  const [isComplete, setIsComplete] = useState(false); // Track if LLM processing is complete
  
  // IT Ops email selection state
  const [selectedScenario, setSelectedScenario] = useState('italian_emotional'); // 'italian_emotional' or 'french_professional'

  // Initialize scenarios when tab changes
  useEffect(() => {
    // Only clear results if we're not returning to a tab with completed results
    const shouldClearResults = !(isComplete && activeTab === processingTab);
    
    // Tab indices: 0=Why, 1=Book Review, 2=IT Ops, 3=Quote, 4=What
    if (activeTab === 1) {
      // Book Review tab (index 1) - load defaults
      setValues(DEFAULTS);
      if (shouldClearResults) {
        setExtractedRows([]);
      }
      setErrorMsg('');
    } else if (activeTab === 2) {
      // IT Ops tab (index 2) - load Italian scenario
      const scenario = IT_OPS_SCENARIOS.italian_emotional;
      setValues({
        free_form_text: scenario.email,
        entities: scenario.entities
      });
      if (shouldClearResults) {
        setExtractedRows([]);
      }
      setErrorMsg('');
    } else if (activeTab === 3) {
      // Quote Email tab (index 3) - load German scenario
      setValues({
        free_form_text: LOGISTICS_QUOTE_SCENARIO.email,
        entities: LOGISTICS_QUOTE_SCENARIO.entities
      });
      if (shouldClearResults) {
        setExtractedRows([]);
      }
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
  const getDemoTabName = (tabIndex) => {
    const names = ['De ce IBM Power', 'Import Vehicul', 'E-mail IT Ops', 'Ofertă Logistică', 'Tehnologie'];
    return names[tabIndex] || 'Demo';
  };

  return (
    <Grid className="landing-page" fullWidth>
      <Column lg={16} md={8} sm={4} className="landing-page__banner">
        <Breadcrumb noTrailingSlash aria-label="Page navigation">
          <BreadcrumbItem>
            <a href="/">Return to main page</a>
          </BreadcrumbItem>
        </Breadcrumb>
        <h1 className="landing-page__heading">Extragere automată de entități din documente de import vehicule</h1>
      </Column>

      <Column lg={16} md={8} sm={4} className="landing-page__r2">
        <Tabs selectedIndex={activeTab} onChange={({ selectedIndex }) => setActiveTab(selectedIndex)}>
          <TabList className="tabs-group" aria-label="Tab navigation">
            <Tab>De ce IBM Power</Tab>
            <Tab>Import Vehicul</Tab>
            <Tab>E-mail IT Ops</Tab>
            <Tab>Ofertă Logistică</Tab>
            <Tab>Tehnologie</Tab>
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
                  <h2 className="landing-page__subheading">Why IBM Power for Entity Extraction</h2>
                  <p className="landing-page__p" style={{ marginTop: '2rem', marginBottom: '3rem' }}>
                    Extracting structured information from unstructured documents with AI on IBM Power provides
                    unique advantages for enterprise document processing, business intelligence, and operational automation.
                  </p>
                </Column>

                {/* Benefit 1: Document Security */}
                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '2rem' }}>
                    <Security style={{ width: '80px', height: '80px', flexShrink: 0 }} />
                    <div>
                      <h3 className="landing-page__label" style={{ marginTop: 0 }}>Secure Document Processing</h3>
                      <p className="landing-page__p">
                        <strong>Business documents never leave your infrastructure.</strong> Process contracts, emails, and reports without cloud exposure.
                      </p>
                    </div>
                  </div>
                </Column>
                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <ul style={{ marginLeft: '1rem', marginTop: '1.5rem' }}>
                    <li>Confidential contracts stay on-premises</li>
                    <li>Proprietary information protected</li>
                    <li>Customer data remains secure</li>
                    <li>Compliance with document retention policies</li>
                  </ul>
                </Column>

                {/* Benefit 2: Real-time Extraction */}
                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '2rem' }}>
                    <DataStorage style={{ width: '80px', height: '80px', flexShrink: 0 }} />
                    <div>
                      <h3 className="landing-page__label" style={{ marginTop: 0 }}>Real-time Document Intelligence</h3>
                      <p className="landing-page__p">
                        Extract entities from documents as they arrive - emails, quotes, invoices - without batch processing delays.
                      </p>
                    </div>
                  </div>
                </Column>
                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <ul style={{ marginLeft: '1rem', marginTop: '1.5rem' }}>
                    <li>Instant processing of incoming emails</li>
                    <li>Immediate quote and invoice analysis</li>
                    <li>Real-time business intelligence updates</li>
                    <li>No waiting for cloud API responses</li>
                  </ul>
                </Column>

                {/* Benefit 3: Integrated with Business Systems */}
                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '2rem' }}>
                    <Enterprise style={{ width: '80px', height: '80px', flexShrink: 0 }} />
                    <div>
                      <h3 className="landing-page__label" style={{ marginTop: 0 }}>Integrated Business Workflows</h3>
                      <p className="landing-page__p">
                        Entity extraction runs alongside ERP, CRM, and document management systems on the same platform.
                      </p>
                    </div>
                  </div>
                </Column>
                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <ul style={{ marginLeft: '1rem', marginTop: '1.5rem' }}>
                    <li>Direct integration with SAP, Oracle, Salesforce</li>
                    <li>Automated data enrichment in databases</li>
                    <li>Seamless workflow automation</li>
                    <li>No middleware or data transformation needed</li>
                  </ul>
                </Column>

                {/* Benefit 4: Cost-Effective at Scale */}
                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '2rem' }}>
                    <Globe style={{ width: '80px', height: '80px', flexShrink: 0 }} />
                    <div>
                      <h3 className="landing-page__label" style={{ marginTop: 0 }}>Unlimited Document Processing</h3>
                      <p className="landing-page__p">
                        Process thousands of documents without per-document API costs or cloud service fees.
                      </p>
                    </div>
                  </div>
                </Column>
                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <ul style={{ marginLeft: '1rem', marginTop: '1.5rem' }}>
                    <li>No per-page or per-document charges</li>
                    <li>Predictable infrastructure costs</li>
                    <li>Process entire document archives</li>
                    <li>No bandwidth costs for large files</li>
                  </ul>
                </Column>

                {/* Benefit 5: Multilingual Support */}
                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '2rem' }}>
                    <Microservices style={{ width: '80px', height: '80px', flexShrink: 0 }} />
                    <div>
                      <h3 className="landing-page__label" style={{ marginTop: 0 }}>Global Document Processing</h3>
                      <p className="landing-page__p">
                        Extract entities from documents in multiple languages without separate translation services.
                      </p>
                    </div>
                  </div>
                </Column>
                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <ul style={{ marginLeft: '1rem', marginTop: '1.5rem' }}>
                    <li>Process documents in any language</li>
                    <li>No translation API costs</li>
                    <li>Consistent extraction across languages</li>
                    <li>Support for global operations</li>
                  </ul>
                </Column>

                {/* Summary */}
                <Column lg={16} md={8} sm={4} className="landing-page__tab-content">
                  <Tile style={{ marginTop: '2rem', padding: '2rem', background: 'var(--cds-layer-02)' }}>
                    <p style={{ margin: 0, fontSize: '1.125rem', fontStyle: 'italic', textAlign: 'center' }}>
                      Transform unstructured business documents into actionable intelligence - securely, efficiently, and at scale -
                      all within your existing IBM Power infrastructure.
                    </p>
                  </Tile>
                </Column>

                {/* Summary */}
                <Column lg={16} md={8} sm={4} className="landing-page__tab-content">
                  <Tile style={{ marginTop: '2rem', padding: '2rem', background: 'var(--cds-layer-02)' }}>
                    <p style={{ margin: 0, fontSize: '1.125rem', fontStyle: 'italic', textAlign: 'center' }}>
                      This approach represents a pragmatic path to AI adoption for enterprises that prioritize data control,
                      operational simplicity, and integration with existing mission-critical systems.
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
                  <h3 className="landing-page__subheading">Extragere structurată din declarații vamale</h3>
                  <p className="landing-page__p">
                    Serviciul IBM AI Services <strong>Entity Extraction</strong> analizează declarațiile
                    vamale de import vehicule și extrage automat câmpurile cheie — marca, modelul, VIN-ul,
                    valoarea declarată și importatorul. Documentul de mai jos poate fi modificat liber
                    pentru a testa alte scenarii de import.
                  </p>
                  <p className="landing-page__p">
                    Apăsați <strong>Trimite la serviciul de extracție</strong> pentru a obține rezultatele
                    structurate. Serviciul rulează local pe IBM Power, fără date care părăsesc rețeaua DGPCI.
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
                              <AILabel size="sm">
                                <AILabelContent>
                                  <div>
                                    <p className="secondary">Generat de AI</p>
                                    <p className="secondary">IBM AI Services — Entity Extraction</p>
                                  </div>
                                </AILabelContent>
                              </AILabel>
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
            <TabPanel>
              <Grid className="tabs-group-content">
                <Column md={4} lg={16} sm={4} className="entity__tab-content">
                  <h3 className="landing-page__subheading">Multilingual Entity Extraction with Priority Assessment</h3>
                  <p className="landing-page__p">
                    {/* eslint-disable-next-line react/no-unescaped-entities */}
                    This demo showcases Granite 4.0's ability to understand different languages and assess true priority.
                    Toggle between an emotional Italian email (low priority) and a professional French email (critical safety issue).
                    The AI extracts entities and translates them to English while correctly assessing business impact.
                  </p>
                </Column>

                <Column lg={16} md={8} sm={4} className="landing-page__tab-content" style={{ marginTop: '1rem' }}>
                  <Button
                    kind="primary"
                    size="lg"
                    onClick={()=>completion()}
                    disabled={isLoading}
                    style={{ marginBottom: '1rem' }}
                  >
                    {isLoading ? 'Processing...' : '🚀 Pre-load Demo Results'}
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

                {/* Toggle to select scenario */}
                <Column lg={16} md={8} sm={4} className="landing-page__tab-content" style={{ marginTop: '2rem' }}>
                  <Toggle
                    id="scenario-toggle"
                    labelText="Select Email Scenario"
                    labelA="🇮🇹 Italian Email"
                    labelB="🇫🇷 French Email"
                    toggled={selectedScenario === 'french_professional'}
                    onToggle={(checked) => {
                      const newScenario = checked ? 'french_professional' : 'italian_emotional';
                      setSelectedScenario(newScenario);
                      const scenario = IT_OPS_SCENARIOS[newScenario];
                      setValues({
                        free_form_text: scenario.email,
                        entities: scenario.entities
                      });
                      // Clear results when switching
                      setExtractedRows([]);
                      setErrorMsg('');
                    }}
                  />
                </Column>

                {/* Side-by-side email display */}
                <Column lg={16} md={8} sm={4} className="landing-page__tab-content" style={{ marginTop: '1rem' }}>
                  <Grid>
                    {/* Italian Email */}
                    <Column lg={8} md={4} sm={4}>
                      <Tile
                        style={{
                          opacity: selectedScenario === 'italian_emotional' ? 1 : 0.4,
                          transition: 'opacity 0.3s ease',
                          border: selectedScenario === 'italian_emotional' ? '2px solid var(--cds-border-interactive)' : '1px solid var(--cds-border-subtle)',
                          minHeight: '400px'
                        }}
                      >
                        <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          🇮🇹 {IT_OPS_SCENARIOS.italian_emotional.title}
                          {selectedScenario === 'italian_emotional' && (
                            <span style={{
                              fontSize: '0.75rem',
                              padding: '0.25rem 0.5rem',
                              background: 'var(--cds-layer-accent)',
                              borderRadius: '4px'
                            }}>
                              SELECTED
                            </span>
                          )}
                        </h4>
                        <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', marginBottom: '1rem' }}>
                          {IT_OPS_SCENARIOS.italian_emotional.description}
                        </p>
                        <div style={{
                          fontSize: '0.75rem',
                          fontFamily: 'monospace',
                          whiteSpace: 'pre-wrap',
                          maxHeight: '300px',
                          overflow: 'auto',
                          padding: '0.5rem',
                          background: 'var(--cds-layer-01)',
                          borderRadius: '4px'
                        }}>
                          {IT_OPS_SCENARIOS.italian_emotional.email.substring(0, 500)}...
                        </div>
                      </Tile>
                    </Column>

                    {/* French Email */}
                    <Column lg={8} md={4} sm={4}>
                      <Tile
                        style={{
                          opacity: selectedScenario === 'french_professional' ? 1 : 0.4,
                          transition: 'opacity 0.3s ease',
                          border: selectedScenario === 'french_professional' ? '2px solid var(--cds-border-interactive)' : '1px solid var(--cds-border-subtle)',
                          minHeight: '400px'
                        }}
                      >
                        <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          🇫🇷 {IT_OPS_SCENARIOS.french_professional.title}
                          {selectedScenario === 'french_professional' && (
                            <span style={{
                              fontSize: '0.75rem',
                              padding: '0.25rem 0.5rem',
                              background: 'var(--cds-layer-accent)',
                              borderRadius: '4px'
                            }}>
                              SELECTED
                            </span>
                          )}
                        </h4>
                        <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', marginBottom: '1rem' }}>
                          {IT_OPS_SCENARIOS.french_professional.description}
                        </p>
                        <div style={{
                          fontSize: '0.75rem',
                          fontFamily: 'monospace',
                          whiteSpace: 'pre-wrap',
                          maxHeight: '300px',
                          overflow: 'auto',
                          padding: '0.5rem',
                          background: 'var(--cds-layer-01)',
                          borderRadius: '4px'
                        }}>
                          {IT_OPS_SCENARIOS.french_professional.email.substring(0, 500)}...
                        </div>
                      </Tile>
                    </Column>
                  </Grid>
                </Column>

                {/* Full email text area (editable) */}
                <Column lg={16} md={8} sm={4} className="landing-page__tab-content" style={{ marginTop: '2rem' }}>
                  <p className="landing-page__p">
                    Full email text (editable - modify to test different scenarios):
                  </p>
                  <TextArea
                    className="text-area-class"
                    id="it-ops-email-text"
                    value={values.free_form_text ?? ""}
                    onChange={onFreeFormChange}
                    size="lg"
                    rows={12}
                  />
                </Column>

                {/* Entity definitions */}
                <Column lg={16} md={8} sm={4} className="landing-page__tab-content">
                  <p className="landing-page__p">
                    Entities to extract (in English):
                  </p>
                </Column>
              </Grid>

              {/* Entities - use single Grid with all entity pairs */}
              <Grid className="entity-grid">
                {(values.entities ?? []).map((f, i) => (
                  <React.Fragment key={i}>
                    <Column sm={4} md={4} lg={4} className="entity-label-col">
                      <TextArea
                        id={`it-ops-label-${i}`}
                        labelText={`Label ${i + 1}`}
                        value={f.label ?? ''}
                        onChange={onEntityChange(i, 'label')}
                        size="sm"
                        rows={Math.max(1, Math.ceil((f.label?.length || 0) / 30))}
                      />
                    </Column>
                    <Column sm={4} md={4} lg={12} className="entity-def-col">
                      <TextArea
                        id={`it-ops-definition-${i}`}
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

              {/* Submit button and results - reuse the same pattern from Book Review tab */}
              <Grid className="tabs-group-content">
                <Column sm={4} md={8} lg={16} className="landing-page__tab-content">
                  <Button className="send-to-llm-class" onClick={()=>completion()} disabled={isLoading}>
                    {isLoading ? 'Sending…' : 'Send Prompt to LLM'}
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
                          title="Processing"
                          subtitle="Granite 4.0 is analyzing and translating..."
                          hideCloseButton
                          lowContrast
                        />
                      </div>
                      <DataTableSkeleton
                        headers={[
                          { key: 'label', header: 'Entity' },
                          { key: 'value', header: 'Value (English)' },
                        ]}
                        showHeader
                        showToolbar
                        rowCount={Math.max(3, values.entities.filter(e => (e.label || '').trim()).length)}
                        columnCount={2}
                      />
                    </>
                  ) : extractedRows.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '3rem 1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '1rem'
                    }}>
                      <h4 style={{ margin: 0 }}>No entities extracted yet</h4>
                      <p style={{
                        color: 'var(--cds-text-secondary)',
                        maxWidth: '400px',
                        margin: 0
                      }}>
                        Select an email scenario above, then click <strong>Send Prompt to LLM</strong> to extract and translate entities.
                      </p>
                    </div>
                  ) : (
                    <DataTable
                      rows={extractedRows}
                      headers={[
                        { key: 'label', header: 'Entity' },
                        { key: 'value', header: 'Value (Translated to English)' },
                      ]}
                      isSortable
                      size="sm"
                      useStaticWidth
                    >
                      {({ rows, headers, getHeaderProps, getTableProps, getRowProps }) => (
                        <TableContainer
                          title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span>Extracted & Translated Entities</span>
                              <AILabel size="sm">
                                <AILabelContent>
                                  <div>
                                    <p className="secondary">AI Generated</p>
                                    <p className="secondary">Multilingual extraction by Granite 4.0</p>
                                  </div>
                                </AILabelContent>
                              </AILabel>
                            </div>
                          }
                          description={`Entities extracted from ${IT_OPS_SCENARIOS[selectedScenario].language} email and translated to English`}
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
            <TabPanel>
              <Grid className="tabs-group-content">
                <Column md={4} lg={7} sm={4} className="entity__tab-content">
                  <h3 className="landing-page__subheading">🇩🇪 German Logistics Quote - AI Reasoning & Calculation</h3>
                  <p className="landing-page__p">
                    This demo showcases a real customer use case from <strong>Hans Geis</strong>, a German logistics company.
                    The AI must not only extract information from German text, but also perform
                    <strong> calculations and reasoning</strong> to determine shipping requirements.
                  </p>
                  <p className="landing-page__p">
                    <strong>Key Challenge:</strong> The customer only provides the number of A4 paper reams.
                    The AI must know A4 dimensions, calculate carton requirements, determine pallet
                    configuration, and compute the total load height - demonstrating reasoning beyond
                    simple extraction.
                  </p>
                </Column>
                <Column md={4} lg={{span: 8, offset: 7}} sm={4}>
                  <Image
                    className="landing-page__illo"
                    src="/images/Hans Geis Truck.png"
                    alt="Hans Geis Global Logistics Truck"
                    width={500}
                    height={280}
                  />
                  <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <Link href="https://www.ibm.com/downloads/documents/us-en/1443d5dc5ecf4367" target="_blank" rel="noopener noreferrer">
                      Read the Hans Geis IBM Case Study →
                    </Link>
                  </div>
                </Column>

                <Column lg={16} md={8} sm={4} className="landing-page__tab-content" style={{ marginTop: '2rem' }}>
                  <Button
                    kind="primary"
                    size="lg"
                    onClick={()=>completion()}
                    disabled={isLoading}
                    style={{ marginBottom: '1rem' }}
                  >
                    {isLoading ? 'Processing...' : '🚀 Pre-load Demo Results'}
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
                    Below is the German logistics quote request. The AI will extract standard information
                    AND perform calculations to determine shipping dimensions.
                  </p>
                  <TextArea
                    className="text-area-class"
                    id="logistics-text"
                    value={LOGISTICS_QUOTE_SCENARIO.email}
                    onChange={(e) => setValues(prev => ({
                      ...prev,
                      free_form_text: e.target.value
                    }))}
                    size="lg"
                    rows={12}
                  />
                </Column>

                <Column lg={16} md={8} sm={4} className="landing-page__tab-content">
                  <p className="landing-page__p">
                    Below are the entities to extract. Notice the <strong>calculation-based entities</strong>
                    that require the AI to reason about dimensions and quantities.
                  </p>
                </Column>
              </Grid>

              {/* Entities - use single Grid with all entity pairs */}
              <Grid className="entity-grid">
                {(LOGISTICS_QUOTE_SCENARIO.entities ?? []).map((f, i) => (
                  <React.Fragment key={i}>
                    <Column sm={4} md={4} lg={4} className="entity-label-col">
                      <TextArea
                        id={`logistics-label-${i}`}
                        labelText={`Label ${i + 1}`}
                        value={f.label ?? ''}
                        onChange={onEntityChange(i, 'label')}
                        size="sm"
                        rows={Math.max(1, Math.ceil((f.label?.length || 0) / 30))}
                      />
                    </Column>
                    <Column sm={4} md={4} lg={12} className="entity-def-col">
                      <TextArea
                        id={`logistics-definition-${i}`}
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
                    {isLoading ? 'Sending…' : 'Send Prompt to LLM'}
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
                          title="Processing"
                          subtitle="Granite 4.0 is calculating dimensions and extracting data..."
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
                        rowCount={15}
                        columnCount={2}
                      />
                    </>
                  ) : extractedRows.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '3rem 1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '1rem'
                    }}>
                      <h4 style={{ margin: 0 }}>No entities extracted yet</h4>
                      <p style={{
                        color: 'var(--cds-text-secondary)',
                        maxWidth: '400px',
                        margin: 0
                      }}>
                        Click <strong>Send Prompt to LLM</strong> to see the AI extract data
                        and perform calculations from the German logistics quote.
                      </p>
                    </div>
                  ) : (
                    <DataTable
                      rows={extractedRows}
                      headers={[
                        { key: 'label', header: 'Entity' },
                        { key: 'value', header: 'Value' },
                      ]}
                      isSortable
                      size="sm"
                      useStaticWidth
                    >
                      {({ rows, headers, getHeaderProps, getTableProps, getRowProps }) => (
                        <TableContainer
                          title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span>Extracted Entities with Calculations</span>
                              <AILabel size="sm">
                                <AILabelContent>
                                  <div>
                                    <p className="secondary">AI Generated</p>
                                    <p className="secondary">Extracted and calculated by Granite 4.0</p>
                                  </div>
                                </AILabelContent>
                              </AILabel>
                            </div>
                          }
                          description="Entities extracted from German text with AI-calculated dimensions"
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