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
  <h1 className="landing-page__heading">Demonstrate GenAI adding value with IBM Power</h1>
</Column>
<Column lg={16} md={8} sm={4} className="landing-page__r2">
  <Tabs defaultSelectedIndex={0}>
<TabList className="tabs-group" aria-label="Tab navigation">
      <Tab>About</Tab>
      <Tab>Secure</Tab>
      <Tab>Flexible</Tab>
    </TabList>
    <TabPanels>
      <TabPanel>
        <Grid className="tabs-group-content">
          <Column md={4} lg={7} sm={4} className="landing-page__tab-content">
            <h3 className="landing-page__subheading">GenAI on IBM Power</h3>
            <p className="landing-page__p">
		GenAI, running in IBM Power, can deliver business benefit without
		needing to use expensive and energy hungry GPUs. You can derive
		business benefit by using Open Source GenAI that are augmented
		by the Matrix Maths Accelerator that is designed into every IBM Power
		server.
            </p>
            <Button>Learn more</Button>
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
            <p className="landing-page__p">
		Your data can remain safe and secure inside IBM Power, without needing
		to leave your control. IBM Power also has orders of magnitude fewer
		security vulnerabilities in the virtualisation that is in the heart of
		every IBM Power server, lowering the surface area that can be attacked
		by bad actors.
            </p>
          </Column>
        </Grid>
      </TabPanel>
      <TabPanel>
        <Grid className="tabs-group-content">
          <Column lg={16} md={8} sm={4} className="landing-page__tab-content">
            <p className="landing-page__p">
		These demos use the Granite 4.0 model, running in this IBM Power virtual
		server, which was downloaded from Huggingface. You can easily swap this
		model for others, such as Mystral or the Llama models from Meta. You can 
		therefore be free to pick which every model best suits your use case, and
		use different models in different virtual servers. You are not restricted
		to the resources in GPUs, or to the model served by a given provider.
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
      <h3 className="landing-page__label">The Principles</h3>
    </Column>
    <Column
      lg={{ start: 5, span: 3 }}
      md={{ start: 3, span: 6 }}
      sm={4}
      className="landing-page__title">
	Run GenAI Models where you data lives
    </Column>
    <Column
      lg={{ start: 9, span: 3 }}
      md={{ start: 3, span: 6 }}
      sm={4}
      className="landing-page__title">
	Ensure data sovereignty 
    </Column>
    <Column
      lg={{ start: 13, span: 3 }}
      md={{ start: 3, span: 6 }}
      sm={4}
      className="landing-page__title">
	Legendary reliablity
    </Column>
  </Grid>
</Column>
  </Grid>
);
}
