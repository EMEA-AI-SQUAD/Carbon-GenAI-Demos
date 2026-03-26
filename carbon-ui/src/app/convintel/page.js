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
  Tag,
  Tile,
} from '@carbon/react';
import {
  Application,
  CloudServices,
  MachineLearningModel,
  Security,
  DataStorage,
  Enterprise,
  Microservices,
  Globe,
} from '@carbon/pictograms-react';
import React, { useMemo, useState } from 'react';
import { DEFAULTS, SALES_CALL, SUPPORT_TICKET } from "./defaults";
import { buildMessages } from "./messages";
import { getExpectedKeys, parseModelJson, reconcileOutput, buildKeyLabelMap } from "./postprocess";
import OpenAI from 'openai';

const API_URL = 'http://localhost:3001/v1';

const openai_client = new OpenAI({
  baseURL: API_URL,
  apiKey: 'sk-no-key-required',
  dangerouslyAllowBrowser: true,
});

export default function ConversationIntelligencePage() {
  const [values, setValues] = useState(() => DEFAULTS);
  const messages = useMemo(() => buildMessages(values), [values]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [extractedRows, setExtractedRows] = useState([]); // [{ id, label, value }]
  const [activeTab, setActiveTab] = useState(0);
  const [processingTab, setProcessingTab] = useState(null); // Track which demo tab is processing
  const [isComplete, setIsComplete] = useState(false); // Track if LLM processing is complete

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

    console.log("Calling LLM for Conversation Intelligence extraction...");
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
        fillValue: "Not determined",
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

  // Function to handle clicking the sticky notification to return to results
  const handleReturnToResults = () => {
    if (processingTab !== null) {
      setActiveTab(processingTab);
    }
  };

  // Get demo tab name for display
  const getDemoTabName = (tabIndex) => {
    const names = ['Why IBM Power', 'Sales Intelligence', 'Multilingual Support', 'Meeting Intelligence', 'What We\'re Using'];
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
        <h1 className="landing-page__heading">Conversation Intelligence with IBM Power</h1>
      </Column>
      <Column lg={16} md={8} sm={4} className="landing-page__r2">
        <Tabs selectedIndex={activeTab} onChange={({ selectedIndex }) => {
          setActiveTab(selectedIndex);
          // Only clear results if we're not returning to a tab with completed results
          const shouldClearResults = !(isComplete && selectedIndex === processingTab);
          
          if (shouldClearResults) {
            setExtractedRows([]);
            setErrorMsg('');
          }
          
          // Load appropriate defaults
          if (selectedIndex === 1) {
            setValues(DEFAULTS);
          } else if (selectedIndex === 2) {
            setValues(SALES_CALL);
          } else if (selectedIndex === 3) {
            setValues(SUPPORT_TICKET);
          }
        }}>
          <TabList className="tabs-group" aria-label="Tab navigation">
            <Tab>Why IBM Power</Tab>
            <Tab>Sales Intelligence</Tab>
            <Tab>Multilingual Support</Tab>
            <Tab>Meeting Intelligence</Tab>
            <Tab>What We're Using</Tab>
          </TabList>
          <TabPanels>
            {/* Why IBM Power Tab */}
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
                <Column lg={16} md={8} sm={4} className="landing-page__tab-content">
                  <h2 className="landing-page__subheading">Why IBM Power for Conversation Intelligence</h2>
                  <p className="landing-page__p" style={{ marginTop: '2rem', marginBottom: '3rem' }}>
                    Analyzing customer conversations, sales calls, and support interactions with AI on IBM Power
                    provides unique advantages for enterprise operations and customer experience management.
                  </p>
                </Column>

                {/* Benefit 1: Real-time Analysis */}
                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '2rem' }}>
                    <MachineLearningModel style={{ width: '80px', height: '80px', flexShrink: 0 }} />
                    <div>
                      <h3 className="landing-page__label" style={{ marginTop: 0 }}>Real-time Conversation Analysis</h3>
                      <p className="landing-page__p">
                        <strong>Analyze conversations as they happen.</strong> Extract insights from customer interactions in real-time without cloud latency.
                      </p>
                    </div>
                  </div>
                </Column>
                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <ul style={{ marginLeft: '1rem', marginTop: '1.5rem' }}>
                    <li>Immediate sentiment analysis during calls</li>
                    <li>Live agent coaching and guidance</li>
                    <li>Instant escalation detection</li>
                    <li>Real-time compliance monitoring</li>
                  </ul>
                </Column>

                {/* Benefit 2: Privacy & Compliance */}
                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '2rem' }}>
                    <Security style={{ width: '80px', height: '80px', flexShrink: 0 }} />
                    <div>
                      <h3 className="landing-page__label" style={{ marginTop: 0 }}>Privacy-First Processing</h3>
                      <p className="landing-page__p">
                        Customer conversations stay within your infrastructure, ensuring privacy and regulatory compliance.
                      </p>
                    </div>
                  </div>
                </Column>
                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <ul style={{ marginLeft: '1rem', marginTop: '1.5rem' }}>
                    <li>No conversation data sent to cloud services</li>
                    <li>GDPR and data residency compliance</li>
                    <li>Protected customer information</li>
                    <li>Secure call recording analysis</li>
                  </ul>
                </Column>

                {/* Benefit 3: Integrated Analytics */}
                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '2rem' }}>
                    <DataStorage style={{ width: '80px', height: '80px', flexShrink: 0 }} />
                    <div>
                      <h3 className="landing-page__label" style={{ marginTop: 0 }}>Integrated with Business Systems</h3>
                      <p className="landing-page__p">
                        AI analysis runs alongside CRM, ticketing, and business intelligence systems on the same platform.
                      </p>
                    </div>
                  </div>
                </Column>
                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <ul style={{ marginLeft: '1rem', marginTop: '1.5rem' }}>
                    <li>Direct integration with existing databases</li>
                    <li>No data movement between systems</li>
                    <li>Unified analytics platform</li>
                    <li>Seamless workflow integration</li>
                  </ul>
                </Column>

                {/* Benefit 4: Cost Efficiency */}
                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '2rem' }}>
                    <Enterprise style={{ width: '80px', height: '80px', flexShrink: 0 }} />
                    <div>
                      <h3 className="landing-page__label" style={{ marginTop: 0 }}>Cost-Effective at Scale</h3>
                      <p className="landing-page__p">
                        Process thousands of conversations without per-call API costs or cloud service fees.
                      </p>
                    </div>
                  </div>
                </Column>
                <Column lg={8} md={4} sm={4} className="landing-page__tab-content">
                  <ul style={{ marginLeft: '1rem', marginTop: '1.5rem' }}>
                    <li>No per-transaction cloud costs</li>
                    <li>Predictable infrastructure expenses</li>
                    <li>Unlimited conversation analysis</li>
                    <li>No bandwidth charges for data transfer</li>
                  </ul>
                </Column>
              </Grid>
            </TabPanel>

            {/* Customer Service Demo Tab */}
            <TabPanel>
              <Grid className="tabs-group-content">
                <Column md={4} lg={16} sm={4} className="entity__tab-content">
                  <h3 className="landing-page__subheading">Customer Service Conversation Analysis</h3>
                  <p className="landing-page__p">
                    This demo analyzes customer service interactions to extract key insights about sentiment,
                    resolution status, agent performance, and customer satisfaction. The AI identifies patterns
                    that help improve service quality and operational efficiency.
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
                    <h4 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1rem' }}>
                      📞 Use Case: Customer Service Quality Monitoring
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600, minWidth: '40px' }}>1.</span>
                        <span>A customer service team handles hundreds of calls daily, but <strong>manual quality review is time-consuming</strong> and only covers a small sample.</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600, minWidth: '40px' }}>2.</span>
                        <span>Managers need to identify <strong>negative sentiment, unresolved issues, and training opportunities</strong> across all interactions.</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600, minWidth: '40px' }}>3.</span>
                        <span>The team must track <strong>resolution rates, customer effort, and agent performance</strong> to improve service quality.</span>
                      </div>
                      <div style={{
                        marginTop: '0.5rem',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid var(--cds-border-subtle)',
                        fontStyle: 'italic',
                        color: 'var(--cds-text-secondary)'
                      }}>
                        <strong>Solution:</strong> Granite 4.0 automatically analyzes every conversation, extracting sentiment, resolution status, and performance metrics for comprehensive quality monitoring.
                      </div>
                    </div>
                  </div>
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

                <Column lg={16} md={8} sm={4} className="landing-page__tab-content">
                  <p className="landing-page__p">
                    Below is a customer service conversation transcript. The AI will analyze the interaction
                    to extract insights about sentiment, resolution, and service quality.
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
                    Below are the intelligence metrics to extract from the conversation. These insights help
                    monitor service quality, identify training needs, and improve customer satisfaction.
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
                    {isLoading ? 'Analyzing Conversation…' : 'Analyze Conversation'}
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
                        subtitle="Granite 4.0 is analyzing the conversation for insights..."
                        hideCloseButton
                        lowContrast
                      />
                    </div>
                    <DataTableSkeleton
                      headers={[
                        { key: 'label', header: 'Metric' },
                        { key: 'value', header: 'Analysis Result' },
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
                      <h4 style={{ margin: 0 }}>No analysis yet</h4>
                      <p style={{
                        color: 'var(--cds-text-secondary)',
                        maxWidth: '400px',
                        margin: 0
                      }}>
                        Review the conversation above, then click
                        <strong> Analyze Conversation</strong> to extract intelligence insights.
                      </p>
                    </div>
                  </Column>
                ) : (
                  <Column sm={4} md={8} lg={16} className="landing-page__tab-content">
                    <DataTable
                      rows={extractedRows}
                      headers={[
                        { key: 'label', header: 'Metric' },
                        { key: 'value', header: 'Analysis Result' },
                      ]}
                      isSortable
                      size="md"
                    >
                      {({ rows, headers, getHeaderProps, getTableProps, getRowProps }) => (
                        <TableContainer
                          title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span>Conversation Intelligence</span>
                              <AILabel size="sm">
                                <AILabelContent>
                                  <div>
                                    <p className="secondary">AI Generated</p>
                                    <p className="secondary">Insights by Granite 4.0</p>
                                  </div>
                                </AILabelContent>
                              </AILabel>
                            </div>
                          }
                          description="Key insights extracted from conversation analysis"
                        >
                          <Table {...getTableProps()}>
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
                )}
              </Grid>
            </TabPanel>

            {/* Sales Call Tab */}
            <TabPanel>
              <Grid className="tabs-group-content">
                <Column lg={16} md={8} sm={4} className="landing-page__tab-content">
                  <h3 className="landing-page__subheading">Multilingual Customer Support with Sentiment Analysis</h3>
                  <p className="landing-page__p">
                    Below is a customer support conversation in German. The AI will analyze sentiment journey,
                    detect urgency, translate key points, and assess resolution quality.
                  </p>
                </Column>
              </Grid>
            </TabPanel>

            {/* Support Ticket Tab */}
            <TabPanel>
              <Grid className="tabs-group-content">
                <Column lg={16} md={8} sm={4} className="landing-page__tab-content">
                  <h3 className="landing-page__subheading">Meeting Intelligence & Action Items</h3>
                  <p className="landing-page__p">
                    Below is an internal team meeting transcript. The AI will extract action items with owners,
                    identify key decisions, and generate a structured meeting summary.
                    Extract insights from support interactions to track issue severity, resolution time,
                    and customer satisfaction. Identify patterns for proactive support improvements.
                  </p>
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

                  <h3 className="landing-page__label" style={{ marginTop: '2rem' }}>IBM Granite 4.0 Micro</h3>
                  <p className="landing-page__p">
                    Our foundation is IBM's Granite 4.0 Micro large language model, specifically designed for enterprise use cases.
                    This model excels at entity extraction, text analysis, and structured data generation while maintaining a
                    compact footprint suitable for on-premises deployment.
                  </p>

                  <h3 className="landing-page__label" style={{ marginTop: '2rem' }}>llama.cpp Inference Engine</h3>
                  <p className="landing-page__p">
                    We're using llama.cpp as our inference engine, running in CPU-only mode. This is important to note:
                    <strong> we are not using GPUs, and we are not using IBM Spyre accelerators</strong> for this demonstration.
                    The entire inference workload runs on standard IBM Power CPU cores, demonstrating the raw computational
                    capability of the Power architecture for AI workloads.
                  </p>

                  <h3 className="landing-page__label" style={{ marginTop: '2rem' }}>RHEL on IBM Power</h3>
                  <p className="landing-page__p">
                    Everything runs within a single Red Hat Enterprise Linux (RHEL) logical partition (LPAR) on IBM Power.
                    The LLM server, proxy layer, and web application all coexist in the same virtual server environment,
                    demonstrating the consolidation capabilities of IBM Power.
                  </p>

                  <h3 className="landing-page__label" style={{ marginTop: '2rem' }}>Modern Web Stack</h3>
                  <p className="landing-page__p">
                    The user interface is built with Next.js and IBM's Carbon Design System, providing a responsive and
                    accessible experience. A Node.js proxy layer handles communication between the web frontend and the
                    llama.cpp server, managing API requests and responses efficiently.
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

                    {/* Middleware Layer */}
                    <Tile style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '1.5rem' }}>
                      <CloudServices style={{ width: '64px', height: '64px', margin: '0 auto 1rem' }} />
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: 600 }}>llama.cpp Server</h4>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                        Inference Engine + Node.js Proxy<br/>
                        <strong>Ports 8080 & 3001</strong>
                      </p>
                    </Tile>

                    {/* AI Model Layer */}
                    <Tile style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '1.5rem' }}>
                      <MachineLearningModel style={{ width: '64px', height: '64px', margin: '0 auto 1rem' }} />
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: 600 }}>Granite 4.0 Micro</h4>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                        IBM's Enterprise LLM<br/>
                        <strong>GGUF Format</strong>
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
          </TabPanels>
        </Tabs>
      </Column>
    </Grid>
  );
}

// Made with Bob