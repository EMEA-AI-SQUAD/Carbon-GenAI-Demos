/**
 * llmClient.js — lightweight OpenAI-compatible chat completions client
 * using the native fetch API. Drop-in replacement for the openai npm package
 * for non-streaming calls against llama-server (port 3001 proxy → 8080).
 *
 * Usage:
 *   import { createLlmClient } from '../llmClient';
 *   const client = createLlmClient();
 *   const result = await client.chat.completions.create({ model, messages, stream: false, temperature });
 *   const text = result?.choices?.[0]?.message?.content ?? '';
 */

const getApiUrl = () =>
  typeof window !== 'undefined'
    ? `http://${window.location.hostname}:3001/v1`
    : 'http://localhost:3001/v1';

export function createLlmClient() {
  return {
    chat: {
      completions: {
        async create({ model = 'gpt-3.5-turbo', messages, stream = false, temperature = 0 }) {
          const url = `${getApiUrl()}/chat/completions`;
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model, messages, stream, temperature }),
          });
          if (!res.ok) {
            const body = await res.text().catch(() => '');
            throw new Error(`LLM request failed: ${res.status} ${body}`);
          }
          return res.json();
        },
      },
    },
  };
}
