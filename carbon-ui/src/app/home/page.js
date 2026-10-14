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
} from '@carbon/react';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <Grid className="landing-page" fullWidth>
      <Column lg={16} md={8} sm={4} className="landing-page__banner">
        <Breadcrumb noTrailingSlash aria-label="Page navigation">
          <BreadcrumbItem>
            <a href="/">Getting started</a>
          </BreadcrumbItem>
        </Breadcrumb>
        <h1 className="landing-page__heading">Resilient Distributed Data Meets Sovereign AI on IBM Power</h1>
      </Column>
      <Column lg={16} md={8} sm={4} className="landing-page__r2">
        <Tabs defaultSelectedIndex={0}>
          <TabList className="tabs-group" aria-label="Tab navigation">
            <Tab>About</Tab>
            <Tab>Resilience</Tab>
            <Tab>Data Sovereignty</Tab>
            <Tab>Agentic Intelligence</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Grid className="tabs-group-content">
                <Column md={4} lg={7} sm={4} className="landing-page__tab-content">
                  <h3 className="landing-page__subheading">GenAI on IBM Power + CockroachDB</h3>
                  <p className="landing-page__p">
                    Enterprise GenAI delivers maximum value when executed directly where mission-critical
                    data lives. By combining CockroachDB's distributed, zero-downtime transactional database
                    architecture with IBM Power's on-chip Matrix Math Accelerators (MMA), enterprises achieve
                    high-throughput AI inference without expensive GPU clusters, cloud egress fees, or data exposure.
                  </p>
                  <Button href="/entextract">Explore Demos</Button>
                </Column>
                <Column md={4} lg={{ span: 8, offset: 7 }} sm={4}>
                  <Image
                    className="landing-page__illo"
                    src="https://newsroom.ibm.com/image/Power11-Launch-SocialKit_Banner.png"
                    alt="IBM Power based on Power11 illustration"
                    width={604}
                    height={498}
                  />
                </Column>
              </Grid>
            </TabPanel>
            <TabPanel>
              <Grid className="tabs-group-content">
                <Column lg={16} md={8} sm={4} className="landing-page__tab-content">
                  <h3 className="landing-page__subheading">Zero-Downtime Resilience</h3>
                  <p className="landing-page__p">
                    Just as CockroachDB survives node and regional outages without data loss or downtime,
                    IBM Power delivers 99.999+% availability with hardware-enforced virtualization isolation.
                    Together, they form an uncompromised foundation for always-on transaction processing
                    and real-time operational AI.
                  </p>
                </Column>
              </Grid>
            </TabPanel>
            <TabPanel>
              <Grid className="tabs-group-content">
                <Column lg={16} md={8} sm={4} className="landing-page__tab-content">
                  <h3 className="landing-page__subheading">Total Data Locality & Compliance</h3>
                  <p className="landing-page__p">
                    Sensitive client, financial, and personal data never leaves your security perimeter.
                    Models like IBM Granite 4.0 run natively in memory on Power servers, analyzing live
                    CockroachDB records for entity extraction, PII redaction, and semantic retrieval with
                    complete compliance under EU AI Act, GDPR, and DORA regulations.
                  </p>
                </Column>
              </Grid>
            </TabPanel>
            <TabPanel>
              <Grid className="tabs-group-content">
                <Column lg={16} md={8} sm={4} className="landing-page__tab-content">
                  <h3 className="landing-page__subheading">The Agentic Database Era (Cockroach Continuum)</h3>
                  <p className="landing-page__p">
                    With Cockroach Continuum and Aegis, database operations shift from manual cluster firefighting
                    to autonomous estate governance. Local AI models assist SREs and DBAs by triaging telemetry,
                    optimizing slow queries, preventing deadlocks, and recommending dynamic storage placement.
                  </p>
                </Column>
              </Grid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Column>
      <Column lg={16} md={8} sm={4} className="landing-page__r3">
        <Grid>
          <Column lg={4} md={2} sm={4}>
            <h3 className="landing-page__label">Core Pillars</h3>
          </Column>
          <Column
            lg={{ start: 5, span: 3 }}
            md={{ start: 3, span: 6 }}
            sm={4}
            className="landing-page__title"
            style={{ textAlign: 'center' }}>
            <h4>💾 Data Locality</h4>
            <div>Run Granite AI directly where distributed data lives</div>
          </Column>
          <Column
            lg={{ start: 9, span: 3 }}
            md={{ start: 3, span: 6 }}
            sm={4}
            className="landing-page__title"
            style={{ textAlign: 'center' }}>
            <h4>🛡️ Zero Downtime</h4>
            <div>CockroachDB resilience on Power reliability</div>
          </Column>
          <Column
            lg={{ start: 13, span: 3 }}
            md={{ start: 3, span: 6 }}
            sm={4}
            className="landing-page__title"
            style={{ textAlign: 'center' }}>
            <h4>⚡ Energy & TCO</h4>
            <div>On-chip MMA inference without GPU power overhead</div>
          </Column>
        </Grid>
      </Column>
    </Grid>
  );
}

// Made with Bob
