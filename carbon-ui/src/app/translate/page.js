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

const SAMPLE_DOCUMENTS = [
  {
    id: 'mg4',
    label: '🇨🇳 MG4 EV — Declarație în chineză',
    description: 'Declarație de import în limba chineză (Mandarin), pentru un MG4 EV importat prin Cluj-Napoca.',
    text: DOC_MG4_CHINESE,
  },
  {
    id: 'custom',
    label: '✏️ Text personalizat',
    description: 'Introduceți propriul text în limba chineză sau orice altă limbă pentru traducere.',
    text: '',
  },
];

export default function TranslatePage() {
  const [sourceText, setSourceText] = useState(DOC_MG4_CHINESE);
  const [translatedText, setTranslatedText] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedDoc, setSelectedDoc] = useState('mg4');

  async function handleTranslate() {
    const text = sourceText.trim();
    if (!text) {
      setErrorMsg('Nu există text de tradus.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    setTranslatedText('');
    setDetectedLanguage('');

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          source_language: 'auto',
          target_language: 'Romanian',
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error || err?.detail || `Eroare serviciu: ${response.status}`);
      }

      const result = await response.json();
      // AI Services returns: { data: { translation: "...", source_language: "...", target_language: "..." }, ... }
      const data = result?.data ?? result;
      setTranslatedText(data?.translation ?? '');
      setDetectedLanguage(data?.source_language ?? '');
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.message || 'Eroare la contactarea serviciului de traducere.');
    } finally {
      setIsLoading(false);
    }
  }

  function loadDocument(docId) {
    setSelectedDoc(docId);
    const doc = SAMPLE_DOCUMENTS.find(d => d.id === docId);
    if (doc) {
      setSourceText(doc.text);
      setTranslatedText('');
      setErrorMsg('');
      setDetectedLanguage('');
    }
  }

  return (
    <Grid className="landing-page" fullWidth>
      <Column lg={16} md={8} sm={4} className="landing-page__banner">
        <Breadcrumb noTrailingSlash aria-label="Page navigation">
          <BreadcrumbItem>
            <a href="/">Pagina principală</a>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>Traducere documente</BreadcrumbItem>
        </Breadcrumb>
        <h1 className="landing-page__heading">
          Traducere automată documente în limbă chineză
        </h1>
      </Column>

      {/* Context panel */}
      <Column lg={16} md={8} sm={4} style={{ padding: '0 1rem 1rem' }}>
        <Tile style={{ background: 'var(--cds-layer-02)', padding: '1.5rem' }}>
          <p style={{ margin: 0, fontSize: '0.9375rem' }}>
            Serviciul <strong>IBM AI Services Translation</strong> traduce automat declarațiile vamale
            și documentele tehnice din chineză în română. Documentele procesate rămân în rețeaua internă
            DGPCI — nu ajung în niciun serviciu cloud extern. Modelul Granite 4.2:8b rulează local
            pe IBM Power10.
          </p>
        </Tile>
      </Column>

      {/* Document selector */}
      <Column lg={16} md={8} sm={4} style={{ padding: '0 1rem 1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Selectați documentul</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {SAMPLE_DOCUMENTS.map(doc => (
            <Tile
              key={doc.id}
              style={{
                cursor: 'pointer',
                padding: '1rem 1.5rem',
                minWidth: '220px',
                border: selectedDoc === doc.id
                  ? '2px solid var(--cds-border-interactive)'
                  : '1px solid var(--cds-border-subtle)',
                background: selectedDoc === doc.id
                  ? 'var(--cds-layer-selected)'
                  : 'var(--cds-layer-01)',
              }}
              onClick={() => loadDocument(doc.id)}
            >
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9375rem' }}>{doc.label}</h4>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--cds-text-secondary)' }}>
                {doc.description}
              </p>
            </Tile>
          ))}
        </div>
      </Column>

      {/* Main two-panel area */}
      <Column lg={8} md={4} sm={4} style={{ padding: '0 1rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <DocumentBlank size={20} />
          <h3 style={{ margin: 0 }}>Document sursă</h3>
          {detectedLanguage && (
            <Tag type="blue" size="sm">
              Detectat: {detectedLanguage}
            </Tag>
          )}
        </div>
        <TextArea
          id="source-text"
          labelText=""
          value={sourceText}
          onChange={e => {
            setSourceText(e.target.value);
            setSelectedDoc('custom');
          }}
          rows={24}
          placeholder="Lipiți sau scrieți textul în chineză (sau altă limbă) aici..."
          style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
        />
      </Column>

      <Column lg={8} md={4} sm={4} style={{ padding: '0 1rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <Translate size={20} />
          <h3 style={{ margin: 0 }}>Traducere în română</h3>
          {translatedText && (
            <AILabel size="sm">
              <AILabelContent>
                <div>
                  <p className="secondary">Generat de AI</p>
                  <p className="secondary">IBM AI Services — Translation</p>
                  <p className="secondary">Model: Granite 4.2:8b · IBM Power10</p>
                </div>
              </AILabelContent>
            </AILabel>
          )}
        </div>

        {isLoading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            minHeight: '400px',
            border: '1px solid var(--cds-border-subtle)',
            borderRadius: '2px',
            padding: '2rem',
          }}>
            <Loading description="Se traduce..." withOverlay={false} />
            <p style={{ color: 'var(--cds-text-secondary)', margin: 0 }}>
              Granite 4.2 traduce documentul...
            </p>
          </div>
        ) : translatedText ? (
          <TextArea
            id="translated-text"
            labelText=""
            value={translatedText}
            readOnly
            rows={24}
            style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
          />
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            minHeight: '400px',
            border: '1px dashed var(--cds-border-subtle)',
            borderRadius: '2px',
            background: 'var(--cds-layer-01)',
            padding: '2rem',
          }}>
            <Translate size={48} style={{ color: 'var(--cds-icon-disabled)' }} />
            <p style={{ color: 'var(--cds-text-secondary)', margin: 0, textAlign: 'center' }}>
              Traducerea va apărea aici după ce apăsați butonul de mai jos.
            </p>
          </div>
        )}
      </Column>

      {/* Action + error row */}
      <Column lg={16} md={8} sm={4} style={{ padding: '0 1rem 2rem' }}>
        {errorMsg && (
          <InlineNotification
            kind="error"
            title="Eroare"
            subtitle={errorMsg}
            onCloseButtonClick={() => setErrorMsg('')}
            lowContrast
            style={{ marginBottom: '1rem' }}
          />
        )}
        <Button
          kind="primary"
          size="lg"
          onClick={handleTranslate}
          disabled={isLoading || !sourceText.trim()}
          renderIcon={Translate}
        >
          {isLoading ? 'Se traduce...' : 'Traduce documentul în română'}
        </Button>
      </Column>
    </Grid>
  );
}
