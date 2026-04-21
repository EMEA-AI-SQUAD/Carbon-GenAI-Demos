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
  EVENT_CAMPAIGN,
  PARTNER_ENABLEMENT,
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

export default function BriefBuilderPage() {
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

    console.log('Calling LLM for Brief Builder generation...');
    try {
      const result = await openai_client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        stream: false,
        temperature: 0.4,
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
      'Product Launch Brief',
      'Event Campaign Brief',
      'Partner Enablement Brief',
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
        <h1 className="landing-page__heading">Brief Builder with IBM Power</h1>
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
              setValues(EVENT_CAMPAIGN);
            } else if (selectedIndex === 3) {
              setValues(PARTNER_ENABLEMENT);
            }
          }}>
          <TabList className="tabs-group" aria-label="Tab navigation">
            <Tab>Why IBM Power</Tab>
            <Tab>Product Launch Brief</Tab>
            <Tab>Event Campaign Brief</Tab>
            <Tab>Partner Enablement Brief</Tab>
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
                  <h2 className="landing-page__subheading">Why IBM Power for Marketing Brief Generation</h2>
                  <p className="landing-page__p" style={{ marginTop: '2rem', marginBottom: '3rem' }}>
                    Marketing, product, and partner teams often need to generate structured campaign briefs
                    from fragmented input. Running this workflow on IBM Power keeps strategy, launch plans,
                    and internal context close to the business systems and people who use them.
                  </p>
                </Column>

                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '2rem' }}>
                    <MachineLearningModel style={{ width: '80px', height: '80px', flexShrink: 0 }} />
                    <div>
                      <h3 className="landing-page__label" style={{ marginTop: 0 }}>Fast Content Structuring</h3>
                      <p className="landing-page__p">
                        <strong>Turn notes into reusable marketing briefs.</strong> Teams can transform
                        product details, audience information, and campaign goals into a standard output format
                        in seconds.
                      </p>
                    </div>
                  </div>
                </Column>
                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <ul style={{ marginLeft: '1rem', marginTop: '1.5rem' }}>
                    <li>Consistent brief templates across teams</li>
                    <li>Faster launch planning and campaign setup</li>
                    <li>Reduced manual drafting effort</li>
                    <li>Easy adaptation for multiple use cases</li>
                  </ul>
                </Column>

                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '2rem' }}>
                    <Security style={{ width: '80px', height: '80px', flexShrink: 0 }} />
                    <div>
                      <h3 className="landing-page__label" style={{ marginTop: 0 }}>Internal Strategy Stays Internal</h3>
                      <p className="landing-page__p">
                        Product launches, partner plans, and campaign priorities can be processed within your
                        infrastructure, helping protect roadmap information and sensitive go-to-market details.
                      </p>
                    </div>
                  </div>
                </Column>
                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <ul style={{ marginLeft: '1rem', marginTop: '1.5rem' }}>
                    <li>No need to move roadmap context externally</li>
                    <li>Better control over launch information</li>
                    <li>Supports data locality and sovereignty goals</li>
                    <li>Aligned with enterprise governance expectations</li>
                  </ul>
                </Column>

                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '2rem' }}>
                    <DataStorage style={{ width: '80px', height: '80px', flexShrink: 0 }} />
                    <div>
                      <h3 className="landing-page__label" style={{ marginTop: 0 }}>Close to Business Systems</h3>
                      <p className="landing-page__p">
                        Brief generation can sit near CRM, product management, content operations, and analytics
                        systems, making it easier to operationalize AI-assisted campaign planning.
                      </p>
                    </div>
                  </div>
                </Column>
                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <ul style={{ marginLeft: '1rem', marginTop: '1.5rem' }}>
                    <li>Reusable output for downstream teams</li>
                    <li>Supports campaign operations at scale</li>
                    <li>Integrates with internal approval processes</li>
                    <li>Enables standardized launch documentation</li>
                  </ul>
                </Column>

                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '2rem' }}>
                    <Enterprise style={{ width: '80px', height: '80px', flexShrink: 0 }} />
                    <div>
                      <h3 className="landing-page__label" style={{ marginTop: 0 }}>Repeatable Productivity Gains</h3>
                      <p className="landing-page__p">
                        A shared structure with tuned instructions can be reused for product, event, and partner
                        briefs, giving teams a repeatable productivity pattern rather than a one-off prompt.
                      </p>
                    </div>
                  </div>
                </Column>
                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <ul style={{ marginLeft: '1rem', marginTop: '1.5rem' }}>
                    <li>One workflow, multiple briefing scenarios</li>
                    <li>Predictable outputs for stakeholders</li>
                    <li>Lower prompt engineering overhead for users</li>
                    <li>Demonstrable AI value for business teams</li>
                  </ul>
                </Column>
              </Grid>
            </TabPanel>

            {renderBriefTab({
              title: 'Product Launch Brief Builder',
              intro:
                'This demo shows how a product manager can turn feature notes, audience details, launch goals, tone, and required sections into a ready-to-refine marketing campaign brief.',
              useCaseTitle: '🚀 Use Case: New Feature Launch Brief Creation',
              steps: [
                'A product manager has a new feature to launch, but the input is scattered across notes, positioning points, and stakeholder comments.',
                'She needs a <strong>consistent campaign brief format</strong> for marketing and sales teams without rewriting the structure each time.',
                'She wants the output to reflect a <strong>specific tone, audience, and call-to-action</strong> so the draft is immediately useful.',
              ],
              solution:
                'Granite 4.0 uses the product details plus a predefined brief template to generate a structured first draft that can be refined instead of created from scratch.',
              textareaLabel:
                'Below is the product launch input. The AI will convert it into a structured campaign brief using the configured template and style instructions.',
              entityLabel:
                'Below are the brief sections to generate. These fields define the standard template the business wants every launch brief to follow.',
              primaryButton: 'Generate Brief',
              loadingText: 'Generating Brief…',
              emptyText:
                'Review the launch information above, then click Generate Brief to create a structured campaign brief.',
              processingSubtitle: 'Granite 4.0 is generating the product launch brief...',
              tableTitle: 'Product Launch Brief',
              tableDescription: 'Structured brief output generated from the launch scenario',
            })}

            {renderBriefTab({
              title: 'Event Campaign Brief Builder',
              intro:
                'This variation creates a campaign brief for an event, webinar, or conference presence. It converts objectives, audience, messaging, and channels into an executable brief for field and digital teams.',
              useCaseTitle: '🎤 Use Case: Event and Webinar Campaign Planning',
              steps: [
                'A campaign manager is preparing for an upcoming event and needs a <strong>clear brief for demand generation, social, and SDR follow-up</strong>.',
                'The core details are available, but they need to be transformed into a <strong>standard briefing structure</strong> used by the company.',
                'The team wants messaging tailored to the event audience, desired outcomes, and <strong>campaign tone</strong> without manually formatting every section.',
              ],
              solution:
                'Granite 4.0 turns event planning inputs into a reusable campaign brief covering goals, messages, channels, assets, and measurement.',
              textareaLabel:
                'Below is the event campaign input. The AI will structure the information into a campaign brief aligned to the selected style and template.',
              entityLabel:
                'Below are the sections the event campaign brief should contain. These can be adjusted, but the default template reflects a common internal standard.',
              primaryButton: 'Generate Event Brief',
              loadingText: 'Generating Event Brief…',
              emptyText:
                'Review the event information above, then click Generate Event Brief to create the campaign brief.',
              processingSubtitle: 'Granite 4.0 is generating the event campaign brief...',
              tableTitle: 'Event Campaign Brief',
              tableDescription: 'Structured brief output generated from the event scenario',
            })}

            {renderBriefTab({
              title: 'Partner Enablement Brief Builder',
              intro:
                'This variation helps alliance, channel, or field marketing teams create a concise brief for partner enablement and co-marketing execution.',
              useCaseTitle: '🤝 Use Case: Partner Launch and Enablement Planning',
              steps: [
                'A partner marketing manager needs a brief for a joint campaign, but requirements are spread across partner notes, launch goals, and enablement dependencies.',
                'The team needs a <strong>repeatable internal template</strong> so partner-facing and internal teams align on goals, assets, responsibilities, and timing.',
                'They want the generated draft to reflect the right <strong>tone, audience, and joint value proposition</strong> before sharing for review.',
              ],
              solution:
                'Granite 4.0 converts partner launch information into a standardized enablement brief, reducing manual drafting and improving consistency across partner motions.',
              textareaLabel:
                'Below is the partner enablement input. The AI will generate a structured brief that can be shared internally and refined for execution.',
              entityLabel:
                'Below are the brief sections to generate for the partner scenario. These define the standard structure for partner launch planning.',
              primaryButton: 'Generate Partner Brief',
              loadingText: 'Generating Partner Brief…',
              emptyText:
                'Review the partner information above, then click Generate Partner Brief to create the structured brief.',
              processingSubtitle: 'Granite 4.0 is generating the partner enablement brief...',
              tableTitle: 'Partner Enablement Brief',
              tableDescription: 'Structured brief output generated from the partner scenario',
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
                    applying it to structured content generation for business teams.
                  </p>

                  <h3 className="landing-page__label" style={{ marginTop: '2rem' }}>IBM Granite 4.0 Micro</h3>
                  <p className="landing-page__p">
                    Granite 4.0 Micro is used to transform semi-structured launch notes into standardized brief
                    sections with consistent formatting and output discipline.
                  </p>

                  <h3 className="landing-page__label" style={{ marginTop: '2rem' }}>Prompted Output Template</h3>
                  <p className="landing-page__p">
                    Instead of asking users to craft complex prompts, the application provides a reusable brief
                    template and scenario-specific examples so teams can focus on business inputs.
                  </p>

                  <h3 className="landing-page__label" style={{ marginTop: '2rem' }}>CPU-Only Inference on IBM Power</h3>
                  <p className="landing-page__p">
                    The workflow runs on IBM Power using the existing llama.cpp inference stack and proxy layer,
                    demonstrating that useful business AI can run close to enterprise data without a GPU dependency.
                  </p>

                  <h3 className="landing-page__label" style={{ marginTop: '2rem' }}>Next.js + Carbon Design System</h3>
                  <p className="landing-page__p">
                    The frontend follows the same reusable tabbed Carbon pattern already used across the demo
                    catalogue, making this new use case easy to present alongside the existing ones.
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
                    }}
                  >
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
                        Enterprise LLM for structured content generation<br />
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
                      }}
                    >
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

  function renderBriefTab({
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
              }}
            >
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
                  }}
                >
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
            <p className="landing-page__p">{textareaLabel}</p>
            <TextArea
              className="text-area-class"
              id="free-form-text"
              value={values.free_form_text ?? ''}
              onChange={onFreeFormChange}
              size="lg"
              rows={14}
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
                }}
              >
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
                  { key: 'label', header: 'Brief Section' },
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
                }}
              >
                <h4 style={{ margin: 0 }}>No brief generated yet</h4>
                <p
                  style={{
                    color: 'var(--cds-text-secondary)',
                    maxWidth: '480px',
                    margin: 0,
                  }}
                >
                  {emptyText}
                </p>
              </div>
            </Column>
          ) : (
            <Column sm={4} md={8} lg={16} className="landing-page__tab-content">
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0 }}>{tableTitle}</h3>
                  <AILabel size="sm">
                    <AILabelContent>
                      <div>
                        <p className="secondary">AI Generated</p>
                        <p className="secondary">Content by Granite 4.0</p>
                      </div>
                    </AILabelContent>
                  </AILabel>
                </div>
                <p style={{ marginBottom: '1rem', color: 'var(--cds-text-secondary)' }}>
                  {tableDescription}
                </p>
                <TextArea
                  labelText=""
                  value={extractedRows.map(row => `${row.label}\n${row.value}\n`).join('\n')}
                  rows={20}
                  readOnly
                  style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                />
                <Button
                  kind="tertiary"
                  size="sm"
                  style={{ marginTop: '1rem' }}
                  onClick={() => {
                    const briefText = extractedRows.map(row => `${row.label}\n${row.value}\n`).join('\n');
                    navigator.clipboard.writeText(briefText);
                  }}
                >
                  Copy Brief to Clipboard
                </Button>
              </div>
            </Column>
          )}
        </Grid>
      </TabPanel>
    );
  }
}

// Made with Bob