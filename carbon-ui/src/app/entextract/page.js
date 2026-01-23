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
} from '@carbon/react';
import Image from 'next/image';
import React, { useMemo, useState } from 'react';
import { DEFAULTS } from "./defaults";
import { buildMessages } from "./messages";
import { getExpectedKeys, parseModelJson, reconcileOutput, buildKeyLabelMap } from "./postprocess";
import OpenAI from 'openai';
import { runExtractionWithStreaming } from "./extraction";

const API_URL = 'http://p1270-pvm1.p1270.cecc.ihost.com:3001/v1';

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
    setErrorMsg(e?.message || 'Failed to contact the LLM.');
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
  	<Tabs defaultSelectedIndex={0}>
	<TabList className="tabs-group" aria-label="Tab navigation">
      	  <Tab>Book Review</Tab>
      	  <Tab>IT Opps Email</Tab>
          <Tab>Quote Email</Tab>
    	</TabList>
	<TabPanels>
      	  <TabPanel>
            <Grid className="tabs-group-content">
              <Column md={4} lg={7} sm={4} className="entity__tab-content">
                <h3 className="landing-page__subheading">Extract key points from unscructured text</h3>
                  <p className="landing-page__p">
		    In this version of the Entity Extraction demo, we will use the LLM 
		    running in this IBM Power Virtual Server to extract details about 
		    a book from the unstuctured text below. You can alter the text to 
		    test getting results from different inputs. This demo come from an 
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
          Again, you can feel free to change these are you like, to extract other details if desired.
      </p>
  </Column>
</Grid>

{/* Entities, two columns per row */}
  {(values.entities ?? []).map((f, i) => (
	<Grid key={i} className="entity-row">

      {/* Label column */}
<Column sm={2} md={4} lg={4}>
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
<Column sm={2} md={4} lg={12}>
        <TextArea
          id={`definition-${i}`}
          labelText={`Definition ${i + 1}`}
          value={f.definition ?? ''}
          onChange={onEntityChange(i, 'definition')}
          size="sm"
          rows={1}
        />
</Column>
	</Grid>
  ))}

<Grid className="tabs-group-content">
  <Column sm={4} md={8} lg={16} className="landing-page__tab-content">
    <Button className="send-to-llm-class" onClick={()=>completion()} disabled={isLoading}>
      {isLoading ? 'Sending…' : 'Send Prompt to LLM'}
    </Button>
  </Column>

{/* Results */}
<Column sm={4} md={8} lg={16} className="landing-page__tab-content">

{/* 1) Skeleton while loading */}
  {isLoading ? (
<DataTableSkeleton
        // You can optionally pass headers (for column titles), Carbon supports both signatures.
        headers={[
          { key: 'label', header: 'Entity' },
          { key: 'value', header: 'Value' },
        ]}
        showHeader
        showToolbar
        rowCount={Math.max(3, values.entities.filter(e => (e.label || '').trim()).length)}
        columnCount={2}
      />
  ) : extractedRows.length === 0 ? (
    // Empty state
    <p>
      No results yet. Edit the text and entities, then click <em>Send Prompt to LLM</em>.
    </p>
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
            <TableContainer>
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
</Grid>
);
}
