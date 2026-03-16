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
  Loading,
  Tile,
  Tag,
} from '@carbon/react';
import Image from 'next/image';
import React, { useMemo, useState } from 'react';
import { DEFAULTS, DOCUMENT_SCAN } from "./defaults";
import { buildMessages } from "./messages";
import { getExpectedKeys, parseModelJson, reconcileOutput, buildKeyLabelMap } from "./postprocess";
import OpenAI from 'openai';

const API_URL = 'http://localhost:3001/v1';

const openai_client = new OpenAI({
  baseURL: API_URL,
  apiKey: 'sk-no-key-required',
  dangerouslyAllowBrowser: true,
});

export default function PIIExtractionPage() {
  const [values, setValues] = useState(() => DEFAULTS);
  const messages = useMemo(() => buildMessages(values), [values]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [extractedRows, setExtractedRows] = useState([]); // [{ id, label, value }]
  const [redactedText, setRedactedText] = useState('');
  const [activeTab, setActiveTab] = useState(0);

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
    setExtractedRows([]);
    setRedactedText('');

    console.log("Calling LLM for PII extraction...");
    try {
      const messages = buildMessages(values);

      const result = await openai_client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages,
        stream: false,
        temperature: 0,
      });

      const text = result?.choices?.[0]?.message?.content ?? "";
      console.log("Raw model response:", text);

      const modelObj = parseModelJson(text);
      const expected = getExpectedKeys(values);
      const finalObj = reconcileOutput(modelObj, expected, {
        discardExtras: true,
        fillValue: "Data not available",
      });

      const labelMap = buildKeyLabelMap(values);
      const rows = expected.map((k, i) => ({
        id: String(i),
        label: labelMap.get(k) || k,
        value: finalObj[k],
      }));

      setExtractedRows(rows);

      // Create redacted version of the text
      let redacted = values.free_form_text;
      rows.forEach(row => {
        if (row.value && row.value !== "Data not available") {
          // Replace each PII value with [REDACTED]
          const regex = new RegExp(row.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
          redacted = redacted.replace(regex, '[REDACTED]');
        }
      });
      setRedactedText(redacted);

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
        <h1 className="landing-page__heading">PII Extraction for Privacy Compliance with IBM Power</h1>
      </Column>
      <Column lg={16} md={8} sm={4} className="landing-page__r2">
        <Tabs defaultSelectedIndex={0} onChange={({ selectedIndex }) => {
          setActiveTab(selectedIndex);
          // Reset state when switching tabs
          setExtractedRows([]);
          setRedactedText('');
          setErrorMsg('');
          // Load appropriate defaults
          if (selectedIndex === 0) {
            setValues(DEFAULTS);
          } else if (selectedIndex === 2) {
            setValues(DOCUMENT_SCAN);
          }
        }}>
          <TabList className="tabs-group" aria-label="Tab navigation">
            <Tab>Fraud Complaint</Tab>
            <Tab>Demo 2 (Coming Soon)</Tab>
            <Tab>Document Discovery</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Grid className="tabs-group-content">
                <Column md={4} lg={7} sm={4} className="entity__tab-content">
                  <h3 className="landing-page__subheading">Privacy Compliance: Extract PII from Customer Support Tickets</h3>
                  <p className="landing-page__p">
                    This demo showcases how Granite 4.0 running on IBM Power solves a critical compliance
                    challenge in customer support operations.
                  </p>
                </Column>
                <Column md={4} lg={{ span: 8, offset: 7 }} sm={4}>
                  <Image
                    className="landing-page__illo"
                    src="/images/pii-protection.jpg"
                    alt="PII Protection and Data Security"
                    width={500}
                    height={350}
                  />
                  <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <Link href="https://www.ibm.com/think/topics/pii" target="_blank" rel="noopener noreferrer">
                      Learn more about Personally Identifiable Information (PII) →
                    </Link>
                  </div>
                </Column>

                {/* Use Case Scenario Box */}
                <Column lg={16} md={8} sm={4} className="landing-page__tab-content">
            <div style={{
              background: 'var(--cds-layer-02)',
              padding: '1.5rem',
              borderLeft: '4px solid var(--cds-border-interactive)',
              marginTop: '1rem',
              marginBottom: '1rem'
            }}>
              <h4 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem' }}>
                📋 Use Case Scenario
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 600, minWidth: '40px' }}>1.</span>
                  <span>A customer sends a complaint ticket via an email channel containing sensitive personal information.</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 600, minWidth: '40px' }}>2.</span>
                  <span>The ticket needs to be routed to an L1 support agent, who <strong>doesn't need to view PII information</strong> to address the technical problem.</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 600, minWidth: '40px' }}>3.</span>
                  <span>The ticket must be stored long-term for historical analysis, but <strong>cannot contain any PII information</strong> in accordance with GDPR, CCPA, and other compliance standards.</span>
                </div>
                <div style={{
                  marginTop: '0.5rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--cds-border-subtle)',
                  fontStyle: 'italic',
                  color: 'var(--cds-text-secondary)'
                }}>
                  <strong>Solution:</strong> Granite 4.0 automatically identifies and extracts all PII, enabling redaction for L1 agents and compliant long-term storage.
                </div>
              </div>
            </div>
          </Column>

          <Column lg={16} md={8} sm={4} className="landing-page__tab-content">
            <p className="landing-page__p">
              Below is a customer complaint ticket containing sensitive PII. The AI will extract all
              personal information so it can be redacted or stored separately for compliance purposes.
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
              Below are the PII fields to extract from the complaint ticket. These will be identified
              and can be redacted or stored separately to ensure compliance with data privacy regulations.
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
              {isLoading ? 'Extracting PII…' : 'Extract PII for Compliance'}
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

          {/* Results - Table on left, Redacted text on right */}
          {isLoading ? (
            <Column sm={4} md={8} lg={16} className="landing-page__tab-content">
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
                  subtitle="Granite 4.0 is identifying and extracting PII for compliance..."
                  hideCloseButton
                  lowContrast
                />
              </div>
              <DataTableSkeleton
                headers={[
                  { key: 'label', header: 'Field' },
                  { key: 'value', header: 'Extracted Value' },
                ]}
                showHeader
                showToolbar
                rowCount={Math.max(3, values.entities.filter(e => (e.label || '').trim()).length)}
                columnCount={2}
              />
            </Column>
          ) : extractedRows.length === 0 ? (
            <Column sm={4} md={8} lg={16} className="landing-page__tab-content">
              <div style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <h4 style={{ margin: 0 }}>No PII extracted yet</h4>
                <p style={{
                  color: 'var(--cds-text-secondary)',
                  maxWidth: '400px',
                  margin: 0
                }}>
                  Review the complaint ticket above, then click
                  <strong> Extract PII for Compliance</strong> to identify sensitive information.
                </p>
              </div>
            </Column>
          ) : (
            <>
              {/* PII Table - Left side (3/8 of page) */}
              <Column sm={4} md={3} lg={6} className="landing-page__tab-content">
                <DataTable
                  rows={extractedRows}
                  headers={[
                    { key: 'label', header: 'Field' },
                    { key: 'value', header: 'Extracted Value' },
                  ]}
                  isSortable
                  size="sm"
                  useStaticWidth
                >
                  {({ rows, headers, getHeaderProps, getTableProps, getRowProps }) => (
                    <TableContainer
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>Extracted PII</span>
                          <AILabel size="sm">
                            <AILabelContent>
                              <div>
                                <p className="secondary">AI Generated</p>
                                <p className="secondary">PII identified by Granite 4.0</p>
                              </div>
                            </AILabelContent>
                          </AILabel>
                        </div>
                      }
                      description="Sensitive information extracted for redaction"
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
              </Column>

              {/* Redacted Text - Right side (5/8 of page) */}
              {redactedText && (
                <Column sm={4} md={5} lg={10} className="landing-page__tab-content">
                  <Tile style={{ padding: '1.5rem', height: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                      <h4 style={{ margin: 0, fontSize: '1rem' }}>Redacted Text</h4>
                      <AILabel size="sm">
                        <AILabelContent>
                          <div>
                            <p className="secondary">AI Generated</p>
                            <p className="secondary">PII redacted by Granite 4.0</p>
                          </div>
                        </AILabelContent>
                      </AILabel>
                    </div>
                    <p style={{
                      fontSize: '0.75rem',
                      color: 'var(--cds-text-secondary)',
                      marginBottom: '1rem'
                    }}>
                      Safe for L1 agents & long-term storage
                    </p>
                    <div style={{
                      background: 'var(--cds-layer-01)',
                      padding: '1rem',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      whiteSpace: 'pre-wrap',
                      lineHeight: '1.6',
                      maxHeight: '500px',
                      overflow: 'auto'
                    }}>
                      {redactedText}
                    </div>
                  </Tile>
                </Column>
              )}
            </>
          )}
              </Grid>
            </TabPanel>
            <TabPanel>
              <Grid className="tabs-group-content">
                <Column lg={16} md={8} sm={4} className="landing-page__tab-content">
                  <h3 className="landing-page__subheading">Demo 2 - Coming Soon</h3>
                  <p className="landing-page__p">
                    Additional PII extraction demo will be added here.
                  </p>
                </Column>
              </Grid>
            </TabPanel>
            <TabPanel>
              <Grid className="tabs-group-content">
                <Column md={4} lg={7} sm={4} className="entity__tab-content">
                  <h3 className="landing-page__subheading">Unstructured Data Discovery for GDPR Compliance</h3>
                  <p className="landing-page__p">
                    Inspired by Elinar's AI-powered solution on IBM Power, this demo shows how AI can automatically
                    identify personal data in unstructured documents for GDPR compliance audits.
                  </p>
                </Column>
                <Column md={4} lg={{ span: 8, offset: 7 }} sm={4}>
                  <Image
                    className="landing-page__illo"
                    src="/images/elinar-gdpr.png"
                    alt="Elinar GDPR Solution on IBM Power"
                    width={500}
                    height={350}
                  />
                  <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <Link href="https://www.elinar.com/ai/privacy-gdpr/" target="_blank" rel="noopener noreferrer">
                      Based on Elinar's real-world GDPR solution →
                    </Link>
                  </div>
                </Column>

                {/* Use Case Scenario Box */}
                <Column lg={16} md={8} sm={4} className="landing-page__tab-content">
                  <div style={{
                    background: 'var(--cds-layer-02)',
                    padding: '1.5rem',
                    borderLeft: '4px solid var(--cds-border-interactive)',
                    marginTop: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <h4 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem' }}>
                      📋 Use Case Scenario: Legacy Document Audit
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600, minWidth: '40px' }}>1.</span>
                        <span>A company needs to audit thousands of legacy documents before a system migration or data retention review.</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600, minWidth: '40px' }}>2.</span>
                        <span>Documents contain <strong>mixed content</strong>: business information, project details, and embedded personal data.</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600, minWidth: '40px' }}>3.</span>
                        <span>Manual review is impossible at scale. AI must <strong>identify which documents contain GDPR-regulated personal data</strong>.</span>
                      </div>
                      <div style={{
                        marginTop: '0.5rem',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid var(--cds-border-subtle)',
                        fontStyle: 'italic',
                        color: 'var(--cds-text-secondary)'
                      }}>
                        <strong>Solution:</strong> Granite 4.0 scans unstructured text, identifies personal data from context, and classifies GDPR risk level.
                      </div>
                    </div>
                  </div>
                </Column>

                <Column lg={16} md={8} sm={4} className="landing-page__tab-content">
                  <p className="landing-page__p">
                    Below is an internal project memo containing mixed business and personal information.
                    The AI will identify what constitutes personal data and assess GDPR compliance risk.
                  </p>
                  <TextArea
                    className="text-area-class"
                    id="free-form-text"
                    value={values.free_form_text ?? ""}
                    onChange={onFreeFormChange}
                    size="lg"
                    rows={12}
                  />
                </Column>
                <Column lg={16} md={8} sm={4} className="landing-page__tab-content">
                  <p className="landing-page__p">
                    Define the types of personal data to identify in the document. The AI will extract these
                    and determine if the document contains GDPR-regulated content.
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
                    {isLoading ? 'Scanning Document…' : 'Scan for Personal Data'}
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

                {/* Results with GDPR Risk Classification */}
                {isLoading ? (
                  <Column sm={4} md={8} lg={16} className="landing-page__tab-content">
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
                        title="Scanning Document"
                        subtitle="Granite 4.0 is analyzing unstructured content for personal data..."
                        hideCloseButton
                        lowContrast
                      />
                    </div>
                    <DataTableSkeleton
                      headers={[
                        { key: 'label', header: 'Field' },
                        { key: 'value', header: 'Extracted Value' },
                      ]}
                      showHeader
                      showToolbar
                      rowCount={Math.max(3, values.entities.filter(e => (e.label || '').trim()).length)}
                      columnCount={2}
                    />
                  </Column>
                ) : extractedRows.length === 0 ? (
                  <Column sm={4} md={8} lg={16} className="landing-page__tab-content">
                    <div style={{
                      textAlign: 'center',
                      padding: '3rem 1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '1rem'
                    }}>
                      <h4 style={{ margin: 0 }}>No scan performed yet</h4>
                      <p style={{
                        color: 'var(--cds-text-secondary)',
                        maxWidth: '400px',
                        margin: 0
                      }}>
                        Review the document above, then click
                        <strong> Scan for Personal Data</strong> to identify GDPR-regulated content.
                      </p>
                    </div>
                  </Column>
                ) : (
                  <>
                    {/* GDPR Risk Classification Banner */}
                    <Column sm={4} md={8} lg={16} className="landing-page__tab-content">
                      {(() => {
                        const piiCount = extractedRows.filter(row =>
                          row.value && row.value !== "Data not available"
                        ).length;
                        const riskLevel = piiCount >= 5 ? 'high' : piiCount >= 3 ? 'medium' : piiCount > 0 ? 'low' : 'none';
                        const riskColors = {
                          high: { bg: '#da1e28', text: '#ffffff' },
                          medium: { bg: '#f1c21b', text: '#000000' },
                          low: { bg: '#24a148', text: '#ffffff' },
                          none: { bg: '#e0e0e0', text: '#161616' }
                        };
                        const riskLabels = {
                          high: 'HIGH RISK',
                          medium: 'MEDIUM RISK',
                          low: 'LOW RISK',
                          none: 'NO RISK'
                        };
                        
                        return (
                          <div style={{
                            background: 'var(--cds-layer-02)',
                            padding: '1.5rem',
                            borderRadius: '4px',
                            border: `2px solid ${riskColors[riskLevel].bg}`
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                              <Tag
                                type={riskLevel === 'high' ? 'red' : riskLevel === 'medium' ? 'yellow' : riskLevel === 'low' ? 'green' : 'gray'}
                                size="md"
                              >
                                {riskLabels[riskLevel]}
                              </Tag>
                              <h4 style={{ margin: 0, fontSize: '1.125rem' }}>
                                {piiCount > 0 ? '⚠️ GDPR-Regulated Content Detected' : '✓ No Personal Data Found'}
                              </h4>
                            </div>
                            <p style={{ margin: 0, color: 'var(--cds-text-secondary)' }}>
                              {piiCount > 0
                                ? `This document contains ${piiCount} personal data field${piiCount > 1 ? 's' : ''} and requires GDPR compliance handling.`
                                : 'This document does not contain identifiable personal data and can be processed normally.'}
                            </p>
                          </div>
                        );
                      })()}
                    </Column>

                    {/* PII Table - Left side */}
                    <Column sm={4} md={3} lg={6} className="landing-page__tab-content">
                      <DataTable
                        rows={extractedRows}
                        headers={[
                          { key: 'label', header: 'Field' },
                          { key: 'value', header: 'Extracted Value' },
                        ]}
                        isSortable
                        size="sm"
                        useStaticWidth
                      >
                        {({ rows, headers, getHeaderProps, getTableProps, getRowProps }) => (
                          <TableContainer
                            title={
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>Personal Data Found</span>
                                <AILabel size="sm">
                                  <AILabelContent>
                                    <div>
                                      <p className="secondary">AI Generated</p>
                                      <p className="secondary">Identified by Granite 4.0</p>
                                    </div>
                                  </AILabelContent>
                                </AILabel>
                              </div>
                            }
                            description="Personal data extracted from unstructured content"
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
                    </Column>

                    {/* Redacted Text - Right side */}
                    {redactedText && (
                      <Column sm={4} md={5} lg={10} className="landing-page__tab-content">
                        <Tile style={{ padding: '1.5rem', height: '100%' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <h4 style={{ margin: 0, fontSize: '1rem' }}>Redacted Document</h4>
                            <AILabel size="sm">
                              <AILabelContent>
                                <div>
                                  <p className="secondary">AI Generated</p>
                                  <p className="secondary">Personal data redacted by Granite 4.0</p>
                                </div>
                              </AILabelContent>
                            </AILabel>
                          </div>
                          <p style={{
                            fontSize: '0.75rem',
                            color: 'var(--cds-text-secondary)',
                            marginBottom: '1rem'
                          }}>
                            GDPR-compliant version for archival and analysis
                          </p>
                          <div style={{
                            background: 'var(--cds-layer-01)',
                            padding: '1rem',
                            borderRadius: '4px',
                            fontFamily: 'monospace',
                            fontSize: '0.75rem',
                            whiteSpace: 'pre-wrap',
                            lineHeight: '1.6',
                            maxHeight: '500px',
                            overflow: 'auto'
                          }}>
                            {redactedText}
                          </div>
                        </Tile>
                      </Column>
                    )}
                  </>
                )}
              </Grid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Column>
    </Grid>
  );
}

// Made with Bob