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
  RESUME_SEARCH,
  SHORTLIST_INTERVIEW,
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

export default function TalentAcquisitionPage() {
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

    console.log('Calling LLM for Talent Acquisition generation...');
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
      'Job Requisition / Job Description Generation',
      'Resume Search & Candidate Summaries',
      'Candidate Shortlist / Interview Pack',
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
        <h1 className="landing-page__heading">Talent Acquisition with IBM Power</h1>
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
              setValues(RESUME_SEARCH);
            } else if (selectedIndex === 3) {
              setValues(SHORTLIST_INTERVIEW);
            }
          }}>
          <TabList className="tabs-group" aria-label="Tab navigation">
            <Tab>Why IBM Power</Tab>
            <Tab>Job Requisition / Job Description Generation</Tab>
            <Tab>Resume Search & Candidate Summaries</Tab>
            <Tab>Candidate Shortlist / Interview Pack</Tab>
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
                  <h2 className="landing-page__subheading">Why IBM Power for Talent Acquisition Workflows</h2>
                  <p className="landing-page__p" style={{ marginTop: '2rem', marginBottom: '3rem' }}>
                    Talent teams handle sensitive hiring plans, candidate data, and assessment content. Running AI-assisted
                    recruitment workflows on IBM Power helps keep hiring information close to internal systems while
                    accelerating job creation, resume review, and interview preparation.
                  </p>
                </Column>

                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '2rem' }}>
                    <MachineLearningModel style={{ width: '80px', height: '80px', flexShrink: 0 }} />
                    <div>
                      <h3 className="landing-page__label" style={{ marginTop: 0 }}>Faster Hiring Content Creation</h3>
                      <p className="landing-page__p">
                        <strong>Generate job descriptions from requisitions quickly.</strong> Hiring teams can turn
                        structured role requests into polished, inclusive job descriptions with consistent formatting.
                      </p>
                    </div>
                  </div>
                </Column>
                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <ul style={{ marginLeft: '1rem', marginTop: '1.5rem' }}>
                    <li>Faster role launch for recruiters</li>
                    <li>More consistent job description quality</li>
                    <li>Reusable inclusive language patterns</li>
                    <li>Reduced manual drafting effort</li>
                  </ul>
                </Column>

                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '2rem' }}>
                    <Security style={{ width: '80px', height: '80px', flexShrink: 0 }} />
                    <div>
                      <h3 className="landing-page__label" style={{ marginTop: 0 }}>Candidate Data Stays Internal</h3>
                      <p className="landing-page__p">
                        Resume summaries, candidate shortlists, and interview notes can be processed within controlled
                        enterprise environments, helping protect personal and confidential hiring data.
                      </p>
                    </div>
                  </div>
                </Column>
                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <ul style={{ marginLeft: '1rem', marginTop: '1.5rem' }}>
                    <li>Supports privacy-conscious recruitment workflows</li>
                    <li>Reduces exposure of personal data externally</li>
                    <li>Aligns with enterprise governance requirements</li>
                    <li>Useful for regulated hiring environments</li>
                  </ul>
                </Column>

                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '2rem' }}>
                    <DataStorage style={{ width: '80px', height: '80px', flexShrink: 0 }} />
                    <div>
                      <h3 className="landing-page__label" style={{ marginTop: 0 }}>Canonical Candidate Summaries</h3>
                      <p className="landing-page__p">
                        Different resume styles can be turned into structured summaries that are easier to browse, compare,
                        and search across a talent pipeline.
                      </p>
                    </div>
                  </div>
                </Column>
                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <ul style={{ marginLeft: '1rem', marginTop: '1.5rem' }}>
                    <li>Improved candidate browsing and search</li>
                    <li>Consistent summary format for recruiters</li>
                    <li>Faster triage of large applicant pools</li>
                    <li>Better handoff to hiring managers</li>
                  </ul>
                </Column>

                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '2rem' }}>
                    <Enterprise style={{ width: '80px', height: '80px', flexShrink: 0 }} />
                    <div>
                      <h3 className="landing-page__label" style={{ marginTop: 0 }}>Repeatable Hiring Productivity</h3>
                      <p className="landing-page__p">
                        The same guided AI pattern can support requisition writing, resume summarization, and interview
                        preparation, giving recruiting teams a repeatable workflow rather than isolated prompts.
                      </p>
                    </div>
                  </div>
                </Column>
                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <ul style={{ marginLeft: '1rem', marginTop: '1.5rem' }}>
                    <li>Shared structure across recruiting tasks</li>
                    <li>Less time spent on admin-heavy work</li>
                    <li>More time for candidate engagement</li>
                    <li>Easy demonstration of AI value in HR</li>
                  </ul>
                </Column>
              </Grid>
            </TabPanel>

            {renderTalentTab({
              title: 'Job Requisition / Job Description Generation',
              useTextArea: true,
              intro:
                'This demo turns a hiring request into a polished job description. It is especially useful when recruiters and hiring managers want consistent structure, stronger inclusive language, and expanded role details.',
              useCaseTitle: '📄 Use Case: Requisition to Job Description Generation',
              steps: [
                'A hiring manager enters a structured requisition with the role purpose, responsibilities, and required skills.',
                'The assistant expands this into a <strong>professional job description</strong>, including stronger wording for <strong>diversity and compensation sections</strong>.',
                'This saves recruiter time and creates a <strong>more consistent hiring output</strong> across roles.',
              ],
              solution:
                'Granite 4.0 converts the requisition into a polished job description that can be reviewed and published quickly.',
              textareaLabel:
                'Below is the hiring request. The AI will transform it into a complete job description using the configured writing guidance.',
              entityLabel:
                'Below are the sections to generate for the job description. These define the standard output recruiters and hiring managers want.',
              primaryButton: 'Generate Job Description',
              loadingText: 'Generating Job Description…',
              emptyText:
                'Review the requisition above, then click Generate Job Description to create the structured role description.',
              processingSubtitle: 'Granite 4.0 is generating the job description...',
              tableTitle: 'Job Description Output',
              tableDescription: 'Structured hiring content generated from the requisition',
            })}

            {renderTalentTab({
              title: 'Resume Search & Candidate Summaries',
              intro:
                'This demo shows how resume content can be normalized into concise summaries and search-oriented outputs that make varied candidate profiles easier to browse.',
              useCaseTitle: '🔍 Use Case: Candidate Browsing and Canonical Summaries',
              steps: [
                'A recruiter needs to review candidates coming from <strong>different formats and writing styles</strong>.',
                'Instead of reading every profile in full, the assistant creates <strong>concise summaries and search-friendly candidate notes</strong>.',
                'This gives the hiring team a <strong>single canonical view</strong> of the candidate pool for faster browsing and search.',
              ],
              solution:
                'Granite 4.0 converts candidate repository content into concise, structured summaries that are easier to compare and search.',
              textareaLabel:
                'Below is a candidate repository snapshot. The AI will summarize the pool and produce concise candidate views for browsing.',
              entityLabel:
                'Below are the sections to generate for candidate search and summary output.',
              primaryButton: 'Generate Candidate Summaries',
              loadingText: 'Generating Candidate Summaries…',
              emptyText:
                'Review the candidate repository above, then click Generate Candidate Summaries to create the search-friendly output.',
              processingSubtitle: 'Granite 4.0 is summarizing the candidate repository...',
              tableTitle: 'Candidate Summary Output',
              tableDescription: 'Structured candidate browsing and search output',
            })}

            {renderTalentTab({
              title: 'Candidate Shortlist / Interview Pack',
              useTextArea: true,
              intro:
                'This demo helps hiring teams move from candidate review to interview preparation by creating shortlist guidance, interview focus areas, and targeted question prompts.',
              useCaseTitle: '🎯 Use Case: Shortlisting and Interview Preparation',
              steps: [
                'The hiring panel has a small set of strong candidates and needs a <strong>faster way to compare them</strong>.',
                'The assistant creates a <strong>structured shortlist recommendation</strong>, highlights strengths and risks, and proposes interview themes.',
                'This helps recruiters and hiring managers move to the next stage with <strong>clear, actionable interview guidance</strong>.',
              ],
              solution:
                'Granite 4.0 turns shortlist inputs into a concise hiring pack that supports panel alignment and better interviews.',
              textareaLabel:
                'Below is the shortlist context and candidate highlights. The AI will generate a shortlist recommendation and interview pack.',
              entityLabel:
                'Below are the sections to generate for the shortlist and interview output.',
              primaryButton: 'Generate Interview Pack',
              loadingText: 'Generating Interview Pack…',
              emptyText:
                'Review the shortlist details above, then click Generate Interview Pack to create the structured hiring output.',
              processingSubtitle: 'Granite 4.0 is generating the shortlist and interview pack...',
              tableTitle: 'Shortlist / Interview Pack Output',
              tableDescription: 'Structured hiring recommendation and interview guidance',
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
                    applied to recruiting workflows such as job description generation, candidate summarization,
                    and interview preparation.
                  </p>

                  <h3 className="landing-page__label" style={{ marginTop: '2rem' }}>IBM Granite 4.0 Micro</h3>
                  <p className="landing-page__p">
                    Granite 4.0 Micro is used to convert hiring inputs into structured outputs such as job descriptions,
                    canonical candidate summaries, and interview guidance.
                  </p>

                  <h3 className="landing-page__label" style={{ marginTop: '2rem' }}>Reusable HR Templates</h3>
                  <p className="landing-page__p">
                    The application provides structured output sections so HR users can focus on hiring context and
                    decisions instead of prompt design and formatting.
                  </p>

                  <h3 className="landing-page__label" style={{ marginTop: '2rem' }}>CPU-Only Inference on IBM Power</h3>
                  <p className="landing-page__p">
                    The workflow runs on IBM Power using the existing llama.cpp inference stack and proxy layer,
                    demonstrating practical business AI for talent acquisition without requiring GPUs.
                  </p>

                  <h3 className="landing-page__label" style={{ marginTop: '2rem' }}>Next.js + Carbon Design System</h3>
                  <p className="landing-page__p">
                    The frontend follows the same reusable tabbed Carbon pattern already used across the demo set,
                    making the new Talent Acquisition page easy to present alongside the other use cases.
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
                        Enterprise LLM for hiring workflows<br />
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

  function renderTalentTab({
    title,
    useTextArea = false,
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