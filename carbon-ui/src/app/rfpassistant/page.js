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
} from '@carbon/react';
import {
  Application,
  CloudServices,
  MachineLearningModel,
  Security,
  DataStorage,
  Enterprise,
} from '@carbon/pictograms-react';
import React, { useMemo, useState } from 'react';
import {
  DEFAULTS,
  PROPOSAL_DRAFTING,
  EXEC_SUMMARY_COMPLIANCE,
} from './defaults';
import { buildMessages } from './messages';
import {
  getExpectedKeys,
  parseModelJson,
  reconcileOutput,
  buildKeyLabelMap,
} from './postprocess';
import OpenAI from 'openai';

const API_URL = 'http://p1362-pvm1.p1362.cecc.ihost.com:3001/v1';

const openai_client = new OpenAI({
  baseURL: API_URL,
  apiKey: 'sk-no-key-required',
  dangerouslyAllowBrowser: true,
});

export default function RFPAssistantPage() {
  const [values, setValues] = useState(() => DEFAULTS);
  const messages = useMemo(() => buildMessages(values), [values]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [extractedRows, setExtractedRows] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [processingTab, setProcessingTab] = useState(null);
  const [isComplete, setIsComplete] = useState(false);

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

  async function completion() {
    setIsLoading(true);
    setErrorMsg('');
    setIsComplete(false);
    setProcessingTab(activeTab);
    setExtractedRows([]);

    console.log('Calling LLM for RFP Assistant generation...');
    try {
      const result = await openai_client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        stream: false,
        temperature: 0.3,
      });

      const text = result?.choices?.[0]?.message?.content ?? '';
      console.log('Raw model response:', text);

      const modelObj = parseModelJson(text);
      const expected = getExpectedKeys(values);
      const finalObj = reconcileOutput(modelObj, expected, {
        discardExtras: true,
        fillValue: 'Not provided',
      });

      const labelMap = buildKeyLabelMap(values);
      const rows = expected.map((k, i) => ({
        id: String(i),
        label: labelMap.get(k) || k,
        value: finalObj[k],
      }));

      setExtractedRows(rows);
      setIsComplete(true);
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.message || 'Failed to contact the LLM.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleReturnToResults = () => {
    if (processingTab !== null) {
      setActiveTab(processingTab);
    }
  };

  const getDemoTabName = (tabIndex) => {
    const names = [
      'Why IBM Power',
      'Opportunity Matching',
      'Proposal Drafting',
      'Executive Summary & Compliance Matrix',
      "What We're Using",
    ];
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
        <h1 className="landing-page__heading">RFP Assistant with IBM Power</h1>
      </Column>

      <Column lg={16} md={8} sm={4} className="landing-page__r2">
        <Tabs
          selectedIndex={activeTab}
          onChange={({ selectedIndex }) => {
            setActiveTab(selectedIndex);
            const shouldClearResults = !(isComplete && selectedIndex === processingTab);

            if (shouldClearResults) {
              setExtractedRows([]);
              setErrorMsg('');
            }

            if (selectedIndex === 1) {
              setValues(DEFAULTS);
            } else if (selectedIndex === 2) {
              setValues(PROPOSAL_DRAFTING);
            } else if (selectedIndex === 3) {
              setValues(EXEC_SUMMARY_COMPLIANCE);
            }
          }}>
          <TabList className="tabs-group" aria-label="Tab navigation">
            <Tab>Why IBM Power</Tab>
            <Tab>Opportunity Matching</Tab>
            <Tab>Proposal Drafting</Tab>
            <Tab>Executive Summary & Compliance Matrix</Tab>
            <Tab>What We're Using</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              {(isLoading || isComplete) && processingTab !== null && (
                <div className="sticky-notification-container">
                  <InlineNotification
                    kind={isComplete ? 'success' : 'info'}
                    title={isComplete ? '🎉 Demo Results Ready!' : '🔥 Baking Your Demo...'}
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
                      marginBottom: '1rem',
                    }}
                    onClick={isComplete ? handleReturnToResults : undefined}
                  />
                </div>
              )}

              <Grid className="tabs-group-content">
                <Column lg={16} md={8} sm={4} className="landing-page__tab-content">
                  <h2 className="landing-page__subheading">Why IBM Power for RFP and Proposal Workflows</h2>
                  <p className="landing-page__p" style={{ marginTop: '2rem', marginBottom: '3rem' }}>
                    Bid teams work with sensitive company positioning, delivery models, pricing context, and client
                    requirements. Running proposal assistance on IBM Power keeps strategic bid content close to internal
                    systems while accelerating pursuit qualification and proposal drafting.
                  </p>
                </Column>

                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '2rem' }}>
                    <MachineLearningModel style={{ width: '80px', height: '80px', flexShrink: 0 }} />
                    <div>
                      <h3 className="landing-page__label" style={{ marginTop: 0 }}>Faster Opportunity Qualification</h3>
                      <p className="landing-page__p">
                        <strong>Assess fit before investing bid effort.</strong> Teams can compare company strengths
                        with RFP requirements and quickly identify whether to pursue, how to position, and what risks
                        to resolve.
                      </p>
                    </div>
                  </div>
                </Column>
                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <ul style={{ marginLeft: '1rem', marginTop: '1.5rem' }}>
                    <li>Faster bid / no-bid decisions</li>
                    <li>Early identification of capability gaps</li>
                    <li>Consistent pursuit evaluation language</li>
                    <li>Less manual synthesis of long RFP documents</li>
                  </ul>
                </Column>

                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '2rem' }}>
                    <Security style={{ width: '80px', height: '80px', flexShrink: 0 }} />
                    <div>
                      <h3 className="landing-page__label" style={{ marginTop: 0 }}>Sensitive Proposal Content Stays Internal</h3>
                      <p className="landing-page__p">
                        Draft proposals often include strategic differentiators, delivery assumptions, and regulated
                        client requirements. IBM Power enables AI-assisted proposal work within controlled enterprise environments.
                      </p>
                    </div>
                  </div>
                </Column>
                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <ul style={{ marginLeft: '1rem', marginTop: '1.5rem' }}>
                    <li>Protects internal pursuit strategy</li>
                    <li>Supports regulated-industry workflows</li>
                    <li>Aligns with data residency requirements</li>
                    <li>Reduces exposure of confidential deal data</li>
                  </ul>
                </Column>

                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '2rem' }}>
                    <DataStorage style={{ width: '80px', height: '80px', flexShrink: 0 }} />
                    <div>
                      <h3 className="landing-page__label" style={{ marginTop: 0 }}>Structured Outputs for Bid Teams</h3>
                      <p className="landing-page__p">
                        Opportunity summaries, executive overviews, and compliance responses can be generated in
                        reusable formats that slot into established proposal processes.
                      </p>
                    </div>
                  </div>
                </Column>
                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <ul style={{ marginLeft: '1rem', marginTop: '1.5rem' }}>
                    <li>Reusable executive summaries</li>
                    <li>Consistent compliance response structure</li>
                    <li>Better collaboration across bid contributors</li>
                    <li>Improved proposal quality and speed</li>
                  </ul>
                </Column>

                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '2rem' }}>
                    <Enterprise style={{ width: '80px', height: '80px', flexShrink: 0 }} />
                    <div>
                      <h3 className="landing-page__label" style={{ marginTop: 0 }}>Repeatable Proposal Productivity</h3>
                      <p className="landing-page__p">
                        The same guided structure can support public sector, enterprise transformation, and regulated
                        industry proposals, creating a reusable AI pattern for bid operations.
                      </p>
                    </div>
                  </div>
                </Column>
                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <ul style={{ marginLeft: '1rem', marginTop: '1.5rem' }}>
                    <li>Shared pattern across multiple bid types</li>
                    <li>Lower drafting overhead for teams</li>
                    <li>More time for review and refinement</li>
                    <li>Demonstrable value for business users</li>
                  </ul>
                </Column>
              </Grid>
            </TabPanel>

            {renderRfpTab({
              title: 'Opportunity Matching',
              intro:
                'This demo helps a bid team review company positioning against an RFP opportunity, assess fit, identify win themes, and produce a polished summary for a pursuit decision.',
              useCaseTitle: '🔎 Use Case: Opportunity Review and Bid Qualification',
              steps: [
                'A team enters its <strong>company profile and core capabilities</strong> together with the key details of an opportunity.',
                'The assistant helps evaluate whether the opportunity is worth pursuing by highlighting <strong>fit, risks, and bid strategy</strong>.',
                'Instead of manually reviewing long documents, the team gets a <strong>structured response pack</strong> that supports fast decision-making.',
              ],
              solution:
                'Granite 4.0 reviews the supplier profile against the RFP details and generates a pursuit-oriented response pack for bid qualification.',
              textareaLabel:
                'Below is the company profile and opportunity information. The AI will review the fit and generate a structured opportunity response.',
              entityLabel:
                'Below are the sections to generate for the opportunity review. These define the response pack the bid team will use.',
              primaryButton: 'Generate Opportunity Review',
              loadingText: 'Generating Opportunity Review…',
              emptyText:
                'Review the opportunity details above, then click Generate Opportunity Review to assess fit and produce a bid response pack.',
              processingSubtitle: 'Granite 4.0 is reviewing the opportunity and generating the response pack...',
              tableTitle: 'Opportunity Matching Output',
              tableDescription: 'Structured opportunity assessment and bid guidance',
            })}

            {renderRfpTab({
              title: 'Proposal Drafting',
              intro:
                'This demo creates a polished proposal draft framework aligned to a buyer challenge, required scope, and supplier strengths. It gives bid teams a usable first draft rather than a blank page.',
              useCaseTitle: '📝 Use Case: Proposal First Draft Generation',
              steps: [
                'A pursuit team has identified a promising opportunity and needs a <strong>high-quality first proposal draft</strong> quickly.',
                'The RFP outlines the client challenges, scope, and delivery expectations, while the supplier provides <strong>core capabilities and differentiators</strong>.',
                'The assistant turns that information into a <strong>structured proposal framework</strong> that can be refined for submission.',
              ],
              solution:
                'Granite 4.0 transforms RFP requirements and supplier positioning into a polished proposal structure with executive language, solution framing, and delivery approach.',
              textareaLabel:
                'Below is the supplier profile and the opportunity details. The AI will use them to generate a proposal draft framework.',
              entityLabel:
                'Below are the sections to generate for the proposal draft. These reflect the type of content a bid team would expect in an early submission draft.',
              primaryButton: 'Generate Proposal Draft',
              loadingText: 'Generating Proposal Draft…',
              emptyText:
                'Review the RFP details above, then click Generate Proposal Draft to create the initial response structure.',
              processingSubtitle: 'Granite 4.0 is drafting the proposal framework...',
              tableTitle: 'Proposal Draft Output',
              tableDescription: 'Structured proposal content generated from the RFP scenario',
            })}

            {renderRfpTab({
              title: 'Executive Summary & Compliance Matrix',
              intro:
                'This demo focuses on two high-value bid tasks: generating a strong executive summary and producing concise compliance-style responses aligned to mandatory requirements.',
              useCaseTitle: '📋 Use Case: Executive Positioning and Compliance Response',
              steps: [
                'A proposal team must respond to mandatory requirements while also creating an <strong>executive-level opening narrative</strong> that clearly positions the supplier.',
                'The opportunity is in a regulated environment, so the response needs <strong>clear, credible, requirement-aligned language</strong>.',
                'The assistant generates a <strong>proposal summary and concise compliance matrix responses</strong> that can be refined by subject matter experts.',
              ],
              solution:
                'Granite 4.0 combines the supplier profile and the RFP requirements to produce polished executive positioning and concise compliance responses.',
              textareaLabel:
                'Below is the supplier profile and regulated-industry RFP information. The AI will generate executive summary and compliance-style response content.',
              entityLabel:
                'Below are the sections to generate for the executive summary and compliance response pack.',
              primaryButton: 'Generate Executive & Compliance Response',
              loadingText: 'Generating Executive & Compliance Response…',
              emptyText:
                'Review the opportunity details above, then click Generate Executive & Compliance Response to create the structured output.',
              processingSubtitle: 'Granite 4.0 is generating executive summary and compliance responses...',
              tableTitle: 'Executive Summary & Compliance Output',
              tableDescription: 'Structured executive and compliance response content',
            })}

            <TabPanel>
              {(isLoading || isComplete) && processingTab !== null && (
                <div className="sticky-notification-container">
                  <InlineNotification
                    kind={isComplete ? 'success' : 'info'}
                    title={isComplete ? '🎉 Demo Results Ready!' : '🔥 Baking Your Demo...'}
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
                      marginBottom: '1rem',
                    }}
                    onClick={isComplete ? handleReturnToResults : undefined}
                  />
                </div>
              )}

              <Grid className="tabs-group-content">
                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <h2 className="landing-page__subheading">What We're Using</h2>
                  <p className="landing-page__p" style={{ marginTop: '2rem' }}>
                    This demonstration uses the same on-premises inference approach as the other Carbon demos,
                    applied to opportunity qualification and proposal content generation for bid teams.
                  </p>

                  <h3 className="landing-page__label" style={{ marginTop: '2rem' }}>IBM Granite 4.0 Micro</h3>
                  <p className="landing-page__p">
                    Granite 4.0 Micro is used to transform supplier and RFP inputs into structured bid outputs such
                    as opportunity assessments, executive summaries, and compliance responses.
                  </p>

                  <h3 className="landing-page__label" style={{ marginTop: '2rem' }}>Reusable Bid Templates</h3>
                  <p className="landing-page__p">
                    The application provides structured output sections so users can focus on pursuit content and
                    positioning instead of prompt design and formatting.
                  </p>

                  <h3 className="landing-page__label" style={{ marginTop: '2rem' }}>CPU-Only Inference on IBM Power</h3>
                  <p className="landing-page__p">
                    The workflow runs on IBM Power using the existing llama.cpp inference stack and proxy layer,
                    demonstrating that practical enterprise AI for business teams can run close to internal systems
                    without requiring GPUs.
                  </p>

                  <h3 className="landing-page__label" style={{ marginTop: '2rem' }}>Next.js + Carbon Design System</h3>
                  <p className="landing-page__p">
                    The frontend follows the same reusable tabbed Carbon pattern already used across the demo set,
                    making the new RFP Assistant easy to position alongside the existing scenarios.
                  </p>
                </Column>

                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '2rem 1rem',
                      marginTop: '3rem',
                    }}>
                    <h3 className="landing-page__label" style={{ marginBottom: '2rem', textAlign: 'center' }}>
                      Technology Stack
                    </h3>

                    <Tile style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '1.5rem' }}>
                      <Application style={{ width: '64px', height: '64px', margin: '0 auto 1rem' }} />
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: 600 }}>Carbon UI</h4>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                        Next.js + Carbon Design System<br />
                        <strong>Port 3000</strong>
                      </p>
                    </Tile>

                    <Tile style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '1.5rem' }}>
                      <CloudServices style={{ width: '64px', height: '64px', margin: '0 auto 1rem' }} />
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: 600 }}>llama.cpp Server</h4>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                        Inference Engine + Node.js Proxy<br />
                        <strong>Ports 8080 & 3001</strong>
                      </p>
                    </Tile>

                    <Tile style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '1.5rem' }}>
                      <MachineLearningModel style={{ width: '64px', height: '64px', margin: '0 auto 1rem' }} />
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: 600 }}>Granite 4.0 Micro</h4>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                        Enterprise LLM for proposal assistance<br />
                        <strong>GGUF Format</strong>
                      </p>
                    </Tile>

                    <Tile
                      style={{
                        width: '100%',
                        maxWidth: '400px',
                        textAlign: 'center',
                        padding: '1.5rem',
                        background: 'linear-gradient(135deg, #0F62FE 0%, #0043CE 100%)',
                        color: 'white',
                      }}>
                      <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>IBM Power</div>
                      <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.9 }}>
                        PPC64LE Architecture<br />
                        <strong>CPU-Only AI Inference</strong>
                      </p>
                    </Tile>
                  </div>
                </Column>
              </Grid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Column>
    </Grid>
  );

  function renderRfpTab({
    title,
    intro,
    useCaseTitle,
    steps,
    solution,
    textareaLabel,
    entityLabel,
    primaryButton,
    loadingText,
    emptyText,
    processingSubtitle,
    tableTitle,
    tableDescription,
  }) {
    return (
      <TabPanel>
        <Grid className="tabs-group-content">
          <Column md={4} lg={16} sm={4} className="entity__tab-content">
            <h3 className="landing-page__subheading">{title}</h3>
            <p className="landing-page__p">{intro}</p>
          </Column>

          <Column lg={16} md={8} sm={4} className="landing-page__tab-content">
            <div
              style={{
                background: 'var(--cds-layer-02)',
                padding: '1.5rem',
                borderLeft: '4px solid var(--cds-border-interactive)',
                marginTop: '1rem',
                marginBottom: '1rem',
              }}>
              <h4 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1rem' }}>{useCaseTitle}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {steps.map((step, index) => (
                  <div key={index} style={{ display: 'flex', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 600, minWidth: '40px' }}>{index + 1}.</span>
                    <span dangerouslySetInnerHTML={{ __html: step }} />
                  </div>
                ))}
                <div
                  style={{
                    marginTop: '0.5rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--cds-border-subtle)',
                    fontStyle: 'italic',
                    color: 'var(--cds-text-secondary)',
                  }}>
                  <strong>Solution:</strong> {solution}
                </div>
              </div>
            </div>
          </Column>

          <Column lg={16} md={8} sm={4} className="landing-page__tab-content" style={{ marginTop: '1rem' }}>
            <Button
              kind="primary"
              size="lg"
              onClick={() => completion()}
              disabled={isLoading}
              style={{ marginBottom: '1rem' }}>
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
            <p className="landing-page__p">{textareaLabel}</p>
            <TextArea
              className="text-area-class"
              id="free-form-text"
              value={values.free_form_text ?? ''}
              onChange={onFreeFormChange}
              size="lg"
              rows={16}
            />
          </Column>

          <Column lg={16} md={8} sm={4} className="landing-page__tab-content">
            <p className="landing-page__p">{entityLabel}</p>
          </Column>
        </Grid>

        <Grid className="entity-grid">
          {(values.entities ?? []).map((f, i) => (
            <React.Fragment key={i}>
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
            <Button className="send-to-llm-class" onClick={() => completion()} disabled={isLoading}>
              {isLoading ? loadingText : primaryButton}
            </Button>
          </Column>

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

          {isLoading ? (
            <Column sm={4} md={8} lg={16} className="landing-page__tab-content">
              <div
                style={{
                  textAlign: 'center',
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem',
                }}>
                <Loading description="Processing" withOverlay={false} />
                <InlineNotification
                  kind="info"
                  title="Processing"
                  subtitle={processingSubtitle}
                  hideCloseButton
                  lowContrast
                />
              </div>
              <DataTableSkeleton
                headers={[
                  { key: 'label', header: 'Response Section' },
                  { key: 'value', header: 'Generated Content' },
                ]}
                showHeader
                showToolbar
                rowCount={Math.max(3, values.entities.filter((e) => (e.label || '').trim()).length)}
                columnCount={2}
              />
            </Column>
          ) : extractedRows.length === 0 ? (
            <Column sm={4} md={8} lg={16} className="landing-page__tab-content">
              <div
                style={{
                  textAlign: 'center',
                  padding: '3rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem',
                }}>
                <h4 style={{ margin: 0 }}>No response generated yet</h4>
                <p
                  style={{
                    color: 'var(--cds-text-secondary)',
                    maxWidth: '480px',
                    margin: 0,
                  }}>
                  {emptyText}
                </p>
              </div>
            </Column>
          ) : (
            <Column sm={4} md={8} lg={16} className="landing-page__tab-content">
              <DataTable
                rows={extractedRows}
                headers={[
                  { key: 'label', header: 'Response Section' },
                  { key: 'value', header: 'Generated Content' },
                ]}
                isSortable
                size="md">
                {({ rows, headers, getHeaderProps, getTableProps, getRowProps }) => (
                  <TableContainer
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{tableTitle}</span>
                        <AILabel size="sm">
                          <AILabelContent>
                            <div>
                              <p className="secondary">AI Generated</p>
                              <p className="secondary">Content by Granite 4.0</p>
                            </div>
                          </AILabelContent>
                        </AILabel>
                      </div>
                    }
                    description={tableDescription}>
                    <Table {...getTableProps()}>
                      <TableHead>
                        <TableRow>
                          {headers.map((header) => (
                            <TableHeader key={header.key} {...getHeaderProps({ header })}>
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
          )}
        </Grid>
      </TabPanel>
    );
  }
}

// Made with Bob