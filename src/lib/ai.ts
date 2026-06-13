/**
 * Client-side wrappers for the AI endpoints. The Anthropic API key lives on the
 * server (see `server/index.ts`), which calls Claude; the browser only talks to
 * our own `/api` routes, proxied to the backend in dev (see vite.config.ts).
 *
 * These functions throw on failure so callers can render proper error states
 * and offer a retry, rather than silently rendering a fallback string.
 */

async function postJSON(url: string, body: unknown): Promise<string> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Network error — is the AI server running?');
  }

  if (!response.ok) {
    const message = await response
      .json()
      .then((d) => d?.error as string | undefined)
      .catch(() => undefined);
    throw new Error(message || `Request failed (${response.status}).`);
  }

  const data = (await response.json()) as { text?: string };
  return data.text ?? '';
}

export const generateExplanation = (topic: string, context?: string) =>
  postJSON('/api/explain', { topic, context });

export const checkSolution = (problem: string, code: string, language: string) =>
  postJSON('/api/review', { problem, code, language });
