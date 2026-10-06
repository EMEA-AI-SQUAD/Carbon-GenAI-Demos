'use client';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Grid,
  Column,
  TextArea,
  InlineNotification,
  Tile,
  Loading,
  Tag,
} from '@carbon/react';
import { Chat } from '@carbon/icons-react';
import React, { useState, useRef } from 'react';
import { useLang } from '../lang-context';

const SUGGESTED = {
  ro: [
    'Ce documente sunt necesare la importul unui vehicul din China?',
    'Care sunt procedurile vamale pentru vehicule electrice importate?',
    'Ce verificări face RAR pentru omologarea vehiculelor importate?',
    'Care sunt penalitățile pentru declarații vamale incorecte?',
  ],
  en: [
    'What documents are required to import a vehicle from China?',
    'What are the customs procedures for imported electric vehicles?',
    'What checks does RAR carry out for imported vehicle homologation?',
    'What are the penalties for incorrect customs declarations?',
  ],
};

const T = {
  ro: {
    breadcrumb: 'Pagina principală',
    currentPage: 'Asistent RAG',
    heading: 'Asistent reglementări — RAR (Registrul Auto Român)',
    contextTile: <>Asistentul conversațional utilizează <strong>IBM AI Services RAG</strong> cu baza de cunoștințe
      RAR — reglementări de omologare și import vehicule, proceduri tehnice și cadrul legal pentru vehicule chineze.
      Toate datele rămân securizate on-premises. Modelul <strong>Granite 4.2:8b</strong> rulează local
      pe IBM Power.</>,
    suggestedLabel: 'Întrebări sugerate:',
    inputLabel: 'Întrebarea dumneavoastră',
    placeholder: 'Scrieți o întrebare despre reglementări, proceduri vamale sau importul de vehicule...',
    askBtn: 'Întreabă →',
    answerLabel: 'Răspuns',
    sourcesLabel: 'Surse:',
    noQuestion: 'Vă rugăm introduceți o întrebare.',
    errorService: 'Eroare la contactarea serviciului RAG.',
    aiGenerated: 'Generat de AI',
    waitMsg: 'Se caută în baza de cunoștințe...',
  },
  en: {
    breadcrumb: 'Home',
    currentPage: 'RAG Assistant',
    heading: 'Regulations Assistant — RAR (Romanian Automotive Register)',
    contextTile: <>The conversational assistant uses <strong>IBM AI Services RAG</strong> with the RAR
      knowledge base — vehicle homologation regulations, technical inspection procedures, and the legal framework for Chinese
      vehicles. All data remains securely on-premises. The <strong>Granite 4.2:8b</strong> model
      runs locally on IBM Power.</>,
    suggestedLabel: 'Suggested questions:',
    inputLabel: 'Your question',
    placeholder: 'Ask a question about regulations, customs procedures, or vehicle imports...',
    askBtn: 'Ask →',
    answerLabel: 'Answer',
    sourcesLabel: 'Sources:',
    noQuestion: 'Please enter a question.',
    errorService: 'Error contacting the RAG service.',
    aiGenerated: 'AI generated',
    waitMsg: 'Searching knowledge base...',
  },
};

export default function RagAssistantPage() {
  const { lang } = useLang();
  const t = T[lang];
  const suggested = SUGGESTED[lang];

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const answerRef = useRef(null);

  async function handleAsk(q) {
    const text = (q || question).trim();
    if (!text) { setErrorMsg(t.noQuestion); return; }
    setIsLoading(true);
    setErrorMsg('');
    setAnswer('');
    setSources([]);

    try {
      const response = await fetch('/api/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text, top_k: 3 }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error || `Error ${response.status}`);
      }
      const result = await response.json();
      // RAG backend returns: { answer: "...", sources: [...] } or { response: "..." }
      setAnswer(result?.answer ?? result?.response ?? JSON.stringify(result));
      setSources(result?.sources ?? result?.context ?? []);
      setTimeout(() => answerRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.message || t.errorService);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSuggested(q) {
    setQuestion(q);
    handleAsk(q);
  }

  return (
    <Grid className="landing-page" fullWidth>
      <Column lg={16} md={8} sm={4} className="landing-page__banner">
        <Breadcrumb noTrailingSlash aria-label="Page navigation">
          <BreadcrumbItem><a href="/">{t.breadcrumb}</a></BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>{t.currentPage}</BreadcrumbItem>
        </Breadcrumb>
        <h1 className="landing-page__heading">{t.heading}</h1>
      </Column>

      <Column lg={16} md={8} sm={4} style={{ padding: '0 1rem 1rem' }}>
        <Tile style={{ background: 'var(--cds-layer-02)', padding: '1.5rem' }}>
          <p style={{ margin: 0, fontSize: '0.9375rem' }}>{t.contextTile}</p>
        </Tile>
      </Column>

      {/* Suggested questions */}
      <Column lg={16} md={8} sm={4} style={{ padding: '0 1rem 1rem' }}>
        <p style={{ marginBottom: '0.75rem', fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
          {t.suggestedLabel}
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {suggested.map((q, i) => (
            <Button key={i} kind="tertiary" size="sm" onClick={() => handleSuggested(q)}
              style={{ textAlign: 'left', whiteSpace: 'normal', height: 'auto', padding: '0.5rem 1rem' }}>
              {q}
            </Button>
          ))}
        </div>
      </Column>

      {/* Input */}
      <Column lg={12} md={6} sm={4} style={{ padding: '0 1rem 0.5rem' }}>
        <TextArea
          id="rag-question"
          labelText={t.inputLabel}
          value={question}
          onChange={e => setQuestion(e.target.value)}
          rows={3}
          placeholder={t.placeholder}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAsk(); } }}
        />
      </Column>
      <Column lg={4} md={2} sm={4} style={{ padding: '0 1rem 1.5rem', display: 'flex', alignItems: 'flex-end' }}>
        <Button onClick={() => handleAsk()} disabled={isLoading} style={{ width: '100%' }}>
          {isLoading ? <Loading small withOverlay={false} /> : t.askBtn}
        </Button>
      </Column>

      {errorMsg && (
        <Column lg={16} md={8} sm={4} style={{ padding: '0 1rem 1rem' }}>
          <InlineNotification kind="error" title={errorMsg} hideCloseButton lowContrast />
        </Column>
      )}

      {/* Answer */}
      {(answer || isLoading) && (
        <Column lg={16} md={8} sm={4} style={{ padding: '0 1rem 2rem' }} ref={answerRef}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <Chat size={20} />
            <h3 style={{ margin: 0 }}>{t.answerLabel}</h3>
            {answer && (
              <Tag type="blue" size="sm">{t.aiGenerated} · IBM AI Services RAG · Granite 4.2:8b</Tag>
            )}
          </div>
          {isLoading
            ? <p style={{ color: 'var(--cds-text-secondary)', fontStyle: 'italic' }}>{t.waitMsg}</p>
            : (
              <Tile style={{ background: 'var(--cds-layer-02)', padding: '1.5rem' }}>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{answer}</p>
                {sources.length > 0 && (
                  <div style={{ marginTop: '1rem', borderTop: '1px solid var(--cds-border-subtle)', paddingTop: '0.75rem' }}>
                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.8125rem', color: 'var(--cds-text-secondary)' }}>
                      {t.sourcesLabel}
                    </p>
                    {sources.map((src, i) => (
                      <Tag key={i} type="gray" size="sm" style={{ marginRight: '0.5rem', marginBottom: '0.25rem' }}>
                        {typeof src === 'string' ? src : (src?.title ?? src?.source ?? `Source ${i + 1}`)}
                      </Tag>
                    ))}
                  </div>
                )}
              </Tile>
            )
          }
        </Column>
      )}
    </Grid>
  );
}

// Made with Bob
