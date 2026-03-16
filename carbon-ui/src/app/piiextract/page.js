'use client';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
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
} from '@carbon/react';
import Image from 'next/image';
import React, { useMemo, useState } from 'react';
import { DEFAULTS } from "./defaults";
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
        <Grid className="tabs-group-content">
          <Column md={4} lg={7} sm={4} className="entity__tab-content">
            <h3 className="landing-page__subheading">Privacy Compliance: Extract PII from Customer Support Tickets</h3>
            <p className="landing-page__p">
              This demo showcases how Granite 4.0 running on IBM Power solves a critical compliance
              challenge in customer support operations.
            </p>
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
          
          <Column md={4} lg={7} sm={4} className="entity__tab-content">
          </Column>
          <Column md={4} lg={{ span: 8, offset: 7 }} sm={4}>
            <Image
              className="landing-page__illo"
              src="https://assets.ibm.com/is/image/ibm/security-privacy?$original$"
              alt="Data Privacy and Security"
              width={500}
              height={208}
            />
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

          {/* Results */}
          <Column sm={4} md={8} lg={16} className="landing-page__tab-content">
            {/* Loading state */}
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
              </>
            ) : extractedRows.length === 0 ? (
              // Empty state
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
            ) : (
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
                        <span>Extracted PII - Compliance Report</span>
                        <AILabel size="sm">
                          <AILabelContent>
                            <div>
                              <p className="secondary">AI Generated</p>
                              <p className="secondary">PII identified by Granite 4.0 LLM</p>
                            </div>
                          </AILabelContent>
                        </AILabel>
                      </div>
                    }
                    description="Sensitive personal information extracted for redaction and compliance storage"
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
      </Column>
    </Grid>
  );
}

// Made with Bob