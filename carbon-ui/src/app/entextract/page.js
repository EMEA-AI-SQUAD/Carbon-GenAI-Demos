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
import Image from 'next/image';
import React, { useMemo, useState, useEffect } from 'react';
import { DEFAULTS } from "./defaults";
import { buildMessages } from "./messages";
import { getExpectedKeys, parseModelJson, reconcileOutput, buildKeyLabelMap } from "./postprocess";
import OpenAI from 'openai';
import { runExtractionWithStreaming } from "./extraction";
import { IT_OPS_SCENARIOS } from "./it-ops-emails";
import { LOGISTICS_QUOTE_SCENARIO } from "./logistics-quote";

const API_URL = 'http://localhost:3001/v1';

const openai_client = new OpenAI({
  baseURL: API_URL,
  apiKey: 'sk-no-key-required',
  dangerouslyAllowBrowser: true,
});

export default function EntityExtractionPage() {
  const [values, setValues] = useState(() => DEFAULTS);
  const [streamedText, setStreamedText] = useState("");
  const messages = useMemo(() => buildMessages(values), [values]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [extractedRows, setExtractedRows] = useState([]); // [{ id, label, value }]
  const [activeTab, setActiveTab] = useState(0);
  
  // IT Ops email selection state
  const [selectedScenario, setSelectedScenario] = useState('italian_emotional'); // 'italian_emotional' or 'french_professional'

  // Initialize scenarios when tab changes
  useEffect(() => {
    if (activeTab === 1) {
      // IT Ops tab - load Italian scenario
      const scenario = IT_OPS_SCENARIOS.italian_emotional;
      setValues({
        free_form_text: scenario.email,
        entities: scenario.entities
      });
      setExtractedRows([]);
      setErrorMsg('');
    } else if (activeTab === 2) {
      // Logistics tab - load German scenario
      setValues({
        free_form_text: LOGISTICS_QUOTE_SCENARIO.email,
        entities: LOGISTICS_QUOTE_SCENARIO.entities
      });
      setExtractedRows([]);
      setErrorMsg('');
    } else if (activeTab === 0) {
      // Book Review tab - load defaults
      setValues(DEFAULTS);
      setExtractedRows([]);
      setErrorMsg('');
    }
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
    // Optionally clear previous results while loading:
    setExtractedRows([]);

    console.log("Calling LLM...");
    try {
      const messages = buildMessages(values); // uses your free_form_text + entities

      const result = await openai_client.chat.completions.create({
        model: "gpt-3.5-turbo", // llama.cpp ignores but field required
        messages,
        stream: false,
        temperature: 0,
      });

      const text = result?.choices?.[0]?.message?.content ?? "";
      console.log("Raw model response:", text);

      // Parse + reconcile with your expected keys
      const modelObj = parseModelJson(text);
      const expected = getExpectedKeys(values);
      const finalObj = reconcileOutput(modelObj, expected, {
        discardExtras: true,
        fillValue: "Data not available",
      });

      // Optional: map normalized keys back to original labels for display
      const labelMap = buildKeyLabelMap(values);
      const rows = expected.map((k, i) => ({
        id: String(i),
        label: labelMap.get(k) || k,
        value: finalObj[k],
      }));

      setExtractedRows(rows);
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.message || 'Failed to contact the LLM.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Grid className="landing-page" fullWidth>
      <Column lg={16} md={8} sm={4} className="landing-page__banner">
        <Breadcrumb noTrailingSlash aria-label="Page navigation">
          <BreadcrumbItem>
            <a href="/">Return to main page</a>
          </BreadcrumbItem>
        </Breadcrumb>
        <h1 className="landing-page__heading">Demonstrate using GenAI to extract entities with IBM Power</h1>
      </Column>
      <Column lg={16} md={8} sm={4} className="landing-page__r2">
        <Tabs defaultSelectedIndex={0} onChange={({ selectedIndex }) => setActiveTab(selectedIndex)}>
          <TabList className="tabs-group" aria-label="Tab navigation">
            <Tab>Book Review</Tab>
            <Tab>IT Ops Email</Tab>
            <Tab>Quote Email</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Grid className="tabs-group-content">
                <Column md={4} lg={7} sm={4} className="entity__tab-content">
                  <h3 className="landing-page__subheading">Extract key points from unstructured text</h3>
                  <p className="landing-page__p">
                    In this version of the Entity Extraction demo, we will use the LLM
                    running in this IBM Power Virtual Server to extract details about
                    a book from the unstructured text below. You can alter the text to
                    test getting results from different inputs. This demo comes from an
                    example from the Granite Cafe, which you can see more about by
                    following the link below.
                  </p>
                  <Link href="https://github.com/ibm-granite-community/granite-snack-cookbook/blob/main/recipes/Entity-Extraction/entity_extraction.ipynb">
                    Entity Extraction from text using Granite
                  </Link>
                </Column>
                <Column md={4} lg={{ span: 8, offset: 7 }} sm={4}>
                  <Image
                    className="landing-page__illo"
                    src="https://assets.ibm.com/is/image/ibm/thinkstudio?$original$"
                    alt="People Studying Books"
                    width={500}
                    height={208}
                  />
                </Column>

                <Column lg={16} md={8} sm={4} className="landing-page__tab-content">
                  <p className="landing-page__p">
                    Below is the free form text we will extract the desired information, known as entities, from.
                    Feel free to change this text as you like, and we shall use that for the demo.
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
                    Below are the labels and definitions that define the entities we shall extract from the text.
                    Again, you can feel free to change these as you like, to extract other details if desired.
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
                        rows={1}
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
                        rows={1}
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
                          title="Processing"
                          subtitle="Granite 4.0 is analyzing your text..."
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
                      <h4 style={{ margin: 0 }}>No entities extracted yet</h4>
                      <p style={{
                        color: 'var(--cds-text-secondary)',
                        maxWidth: '400px',
                        margin: 0
                      }}>
                        Edit the text and entity definitions above, then click
                        <strong> Send Prompt to LLM</strong> to extract structured data.
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
                              <span>Extracted Entities</span>
                              <AILabel size="sm">
                                <AILabelContent>
                                  <div>
                                    <p className="secondary">AI Generated</p>
                                    <p className="secondary">Content extracted by Granite 4.0 LLM</p>
                                  </div>
                                </AILabelContent>
                              </AILabel>
                            </div>
                          }
                          description="Entities extracted from your text using AI"
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
                        rows={1}
                      />
                    </Column>
                    <Column sm={4} md={4} lg={12} className="entity-def-col">
                      <TextArea
                        id={`it-ops-definition-${i}`}
                        labelText={`Definition ${i + 1}`}
                        value={f.definition ?? ''}
                        onChange={onEntityChange(i, 'definition')}
                        size="sm"
                        rows={1}
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
                  <Link href="https://www.ibm.com/downloads/documents/us-en/1443d5dc5ecf4367" target="_blank" rel="noopener noreferrer">
                    Read the Hans Geis IBM Case Study →
                  </Link>
                </Column>
                <Column md={4} lg={{span: 8, offset: 7}} sm={4}>
                  <Image
                    className="landing-page__illo"
                    src="/images/Hans Geis Truck.png"
                    alt="Hans Geis Global Logistics Truck"
                    width={500}
                    height={280}
                  />
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
                        rows={1}
                      />
                    </Column>
                    <Column sm={4} md={4} lg={12} className="entity-def-col">
                      <TextArea
                        id={`logistics-definition-${i}`}
                        labelText={`Definition ${i + 1}`}
                        value={f.definition ?? ''}
                        onChange={onEntityChange(i, 'definition')}
                        size="sm"
                        rows={1}
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
          </TabPanels>
        </Tabs>
      </Column>
    </Grid>
  );
}

// Made with Bob
