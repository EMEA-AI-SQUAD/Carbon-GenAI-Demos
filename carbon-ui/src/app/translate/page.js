'use client';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Grid,
  Column,
  TextArea,
  InlineNotification,
  AILabel,
  AILabelContent,
  Tile,
  Loading,
  Tag,
} from '@carbon/react';
import { Translate, DocumentBlank } from '@carbon/icons-react';
import React, { useState } from 'react';
import { DOC_MG4_CHINESE } from '../entextract/defaults';
import { useLang } from '../lang-context';

const T = {
  ro: {
    breadcrumb: 'Pagina principală',
    pageTitle: 'Traducere automată documente în limbă chineză',
    currentPage: 'Traducere documente',
    contextTile: <>Serviciul <strong>IBM AI Services Translation</strong> traduce automat declarațiile vamale
      și documentele tehnice din chineză în română. Documentele procesate rămân în rețeaua internă
      DGPCI — nu ajung în niciun serviciu cloud extern. Modelul Granite 4.2:8b rulează local
      pe IBM Power10.</>,
    selectDoc: 'Selectați documentul',
    sourceLabel: 'Document sursă',
    targetLabel: 'Traducere în română',
    translateBtn: 'Traduceți →',
    placeholder: 'Lipiți sau scrieți textul în chineză (sau altă limbă) aici...',
    detected: 'Detectat:',
    noText: 'Nu există text de tradus.',
    errorService: 'Eroare la contactarea serviciului de traducere.',
    errorPrefix: 'Eroare serviciu:',
    aiGenerated: 'Generat de AI',
    doc1Label: '🇨🇳 MG4 EV — Declarație în chineză',
    doc1Desc: 'Declarație de import în limba chineză (Mandarin), pentru un MG4 EV importat prin Cluj-Napoca.',
    doc2Label: '✏️ Text personalizat',
    doc2Desc: 'Introduceți propriul text în limba chineză sau orice altă limbă pentru traducere.',
  },
  en: {
    breadcrumb: 'Home',
    pageTitle: 'Automatic translation of Chinese-language documents',
    currentPage: 'Document Translation',
    contextTile: <>The <strong>IBM AI Services Translation</strong> service automatically translates customs
      declarations and technical documents from Chinese into Romanian. Processed documents remain within
      the DGPCI internal network — they never reach any external cloud service. The Granite 4.2:8b model
      runs locally on IBM Power10.</>,
    selectDoc: 'Select document',
    sourceLabel: 'Source document',
    targetLabel: 'Romanian translation',
    translateBtn: 'Translate →',
    placeholder: 'Paste or type Chinese (or other language) text here...',
    detected: 'Detected:',
    noText: 'No text to translate.',
    errorService: 'Error contacting the translation service.',
    errorPrefix: 'Service error:',
    aiGenerated: 'AI generated',
    doc1Label: '🇨🇳 MG4 EV — Chinese declaration',
    doc1Desc: 'Import declaration in Chinese (Mandarin) for an MG4 EV imported via Cluj-Napoca.',
    doc2Label: '✏️ Custom text',
    doc2Desc: 'Enter your own Chinese or other language text for translation.',
  },
};

export default function TranslatePage() {
  const { lang } = useLang();
  const t = T[lang];

  const SAMPLE_DOCUMENTS = [
    { id: 'mg4',    label: t.doc1Label, description: t.doc1Desc, text: DOC_MG4_CHINESE },
    { id: 'custom', label: t.doc2Label, description: t.doc2Desc, text: '' },
  ];

  const [sourceText, setSourceText] = useState(DOC_MG4_CHINESE);
  const [translatedText, setTranslatedText] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedDoc, setSelectedDoc] = useState('mg4');

  async function handleTranslate() {
    const text = sourceText.trim();
    if (!text) { setErrorMsg(t.noText); return; }
    setIsLoading(true);
    setErrorMsg('');
    setTranslatedText('');
    setDetectedLanguage('');

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, source_language: 'auto', target_language: 'Romanian' }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error || err?.detail || `${t.errorPrefix} ${response.status}`);
      }
      const result = await response.json();
      const data = result?.data ?? result;
      setTranslatedText(data?.translation ?? '');
      setDetectedLanguage(data?.source_language ?? '');
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.message || t.errorService);
    } finally {
      setIsLoading(false);
    }
  }

  function loadDocument(docId) {
    setSelectedDoc(docId);
    const doc = SAMPLE_DOCUMENTS.find(d => d.id === docId);
    if (doc) { setSourceText(doc.text); setTranslatedText(''); setErrorMsg(''); setDetectedLanguage(''); }
  }

  return (
    <Grid className="landing-page" fullWidth>
      <Column lg={16} md={8} sm={4} className="landing-page__banner">
        <Breadcrumb noTrailingSlash aria-label="Page navigation">
          <BreadcrumbItem><a href="/">{t.breadcrumb}</a></BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>{t.currentPage}</BreadcrumbItem>
        </Breadcrumb>
        <h1 className="landing-page__heading">{t.pageTitle}</h1>
      </Column>

      <Column lg={16} md={8} sm={4} style={{ padding: '0 1rem 1rem' }}>
        <Tile style={{ background: 'var(--cds-layer-02)', padding: '1.5rem' }}>
          <p style={{ margin: 0, fontSize: '0.9375rem' }}>{t.contextTile}</p>
        </Tile>
      </Column>

      <Column lg={16} md={8} sm={4} style={{ padding: '0 1rem 1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>{t.selectDoc}</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {SAMPLE_DOCUMENTS.map(doc => (
            <Tile key={doc.id} style={{
              cursor: 'pointer', padding: '1rem 1.5rem', minWidth: '220px',
              border: selectedDoc === doc.id ? '2px solid var(--cds-border-interactive)' : '1px solid var(--cds-border-subtle)',
              background: selectedDoc === doc.id ? 'var(--cds-layer-selected)' : 'var(--cds-layer-01)',
            }} onClick={() => loadDocument(doc.id)}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9375rem' }}>{doc.label}</h4>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--cds-text-secondary)' }}>{doc.description}</p>
            </Tile>
          ))}
        </div>
      </Column>

      <Column lg={8} md={4} sm={4} style={{ padding: '0 1rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <DocumentBlank size={20} />
          <h3 style={{ margin: 0 }}>{t.sourceLabel}</h3>
          {detectedLanguage && <Tag type="blue" size="sm">{t.detected} {detectedLanguage}</Tag>}
        </div>
        <TextArea id="source-text" labelText="" value={sourceText}
          onChange={e => { setSourceText(e.target.value); setSelectedDoc('custom'); }}
          rows={24} placeholder={t.placeholder}
          style={{ fontFamily: 'monospace', fontSize: '0.875rem' }} />
      </Column>

      <Column lg={8} md={4} sm={4} style={{ padding: '0 1rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <Translate size={20} />
          <h3 style={{ margin: 0 }}>{t.targetLabel}</h3>
          {translatedText && (
            <AILabel size="sm">
              <AILabelContent>
                <div>
                  <p className="secondary">{t.aiGenerated}</p>
                  <p className="secondary">IBM AI Services — Translation</p>
                  <p className="secondary">Model: Granite 4.2:8b · IBM Power10</p>
                </div>
              </AILabelContent>
            </AILabel>
          )}
        </div>
        <TextArea id="translated-text" labelText="" value={translatedText} readOnly
          rows={24} placeholder=""
          style={{ fontFamily: 'monospace', fontSize: '0.875rem', background: 'var(--cds-layer-02)' }} />
      </Column>

      <Column lg={16} md={8} sm={4} style={{ padding: '0 1rem 2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Button onClick={handleTranslate} disabled={isLoading}>
          {isLoading ? <Loading small withOverlay={false} /> : t.translateBtn}
        </Button>
        {errorMsg && (
          <InlineNotification kind="error" title={errorMsg} hideCloseButton lowContrast
            style={{ maxWidth: '600px' }} />
        )}
      </Column>
    </Grid>
  );
}

// Made with Bob
