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

export default function CarbonPage() {
return (
  <Grid className="carbon-page" fullWidth>
<Column lg={16} md={8} sm={4} className="carbon-page__banner">
<Breadcrumb noTrailingSlash aria-label="Page navigation">
    <BreadcrumbItem>
      <a href="/">Getting started</a>
    </BreadcrumbItem>
  </Breadcrumb>
  <h1 className="carbon-page__heading">Design &amp; build with Carbon</h1>
</Column>
<Column lg={16} md={8} sm={4} className="carbon-page__r2">
  <Tabs defaultSelectedIndex={0}>
<TabList className="tabs-group" aria-label="Tab navigation">
      <Tab>About</Tab>
      <Tab>Design</Tab>
      <Tab>Develop</Tab>
    </TabList>
    <TabPanels>
      <TabPanel>
        <Grid className="tabs-group-content">
          <Column md={4} lg={7} sm={4} className="carbon-page__tab-content">
            <h3 className="carbon-page__subheading">What is Carbon?</h3>
            <p className="carbon-page__p">
              Carbon is IBM’s open-source design system for digital products and
              experiences. With the IBM Design Language as its foundation, the
              system consists of working code, design tools and resources, human
              interface guidelines, and a vibrant community of contributors.
            </p>
            <Button>Learn more</Button>
          </Column>
        </Grid>
      </TabPanel>
      <TabPanel>
        <Grid className="tabs-group-content">
          <Column lg={16} md={8} sm={4} className="carbon-page__tab-content">
            <p className="carbon-page__p">
              Rapidly build beautiful and accessible experiences. The Carbon kit
              contains all resources you need to get started.
            </p>
          </Column>
        </Grid>
      </TabPanel>
      <TabPanel>
        <Grid className="tabs-group-content">
          <Column lg={16} md={8} sm={4} className="carbon-page__tab-content">
            <p className="carbon-page__p">
              Carbon provides styles and components in Vanilla, React, Angular,
              and Vue for anyone building on the web.
            </p>
          </Column>
        </Grid>
      </TabPanel>
    </TabPanels>
  </Tabs>
</Column>
<Column lg={16} md={8} sm={4} className="carbon-page__r3">
  <Grid>
    <Column lg={4} md={2} sm={4}>
      <h3 className="carbon-page__label">The Principles</h3>
    </Column>
    <Column
      lg={{ start: 5, span: 3 }}
      md={{ start: 3, span: 6 }}
      sm={4}
      className="carbon-page__title">
      Carbon is Open
    </Column>
    <Column
      lg={{ start: 9, span: 3 }}
      md={{ start: 3, span: 6 }}
      sm={4}
      className="carbon-page__title">
      Carbon is Modular
    </Column>
    <Column
      lg={{ start: 13, span: 3 }}
      md={{ start: 3, span: 6 }}
      sm={4}
      className="carbon-page__title">
      Carbon is Consistent
    </Column>
  </Grid>
</Column>
  </Grid>
);
}
