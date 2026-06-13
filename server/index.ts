/**
 * AlgoMaster AI backend.
 *
 * Keeps GEMINI_API_KEY server-side (it is no longer bundled into the client)
 * and exposes thin JSON endpoints the SPA calls for AI features. In production
 * it also serves the built static assets from `dist/`.
 */
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { GoogleGenAI } from '@google/genai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Centralized model ids — update here if the available Gemini models change.
const FLASH_MODEL = 'gemini-3-flash-preview';
const PRO_MODEL = 'gemini-3.1-pro-preview';

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
if (!ai) {
  console.warn('GEMINI_API_KEY is not set. /api/explain and /api/review will return 503.');
}

const app = express();
app.use(express.json({ limit: '1mb' }));

const requireAI = (res: express.Response): boolean => {
  if (!ai) {
    res.status(503).json({ error: 'AI is not configured. Set GEMINI_API_KEY on the server.' });
    return false;
  }
  return true;
};

app.post('/api/explain', async (req, res) => {
  if (!requireAI(res)) return;
  const { topic, context } = req.body ?? {};
  if (typeof topic !== 'string' || !topic.trim()) {
    return res.status(400).json({ error: 'A "topic" string is required.' });
  }
  try {
    const response = await ai!.models.generateContent({
      model: FLASH_MODEL,
      contents: `Explain the Data Structure or Algorithm topic: "${topic}".
      Context: ${context || 'General introduction'}.
      Provide a clear, concise explanation suitable for a student preparing for technical interviews.
      Include time and space complexity analysis where applicable.
      Use Markdown for formatting.`,
    });
    res.json({ text: response.text });
  } catch (err) {
    console.error('Error generating explanation:', err);
    res.status(502).json({ error: 'Failed to generate explanation. Please try again.' });
  }
});

app.post('/api/review', async (req, res) => {
  if (!requireAI(res)) return;
  const { problem, code, language } = req.body ?? {};
  if (typeof problem !== 'string' || typeof code !== 'string') {
    return res.status(400).json({ error: '"problem" and "code" strings are required.' });
  }
  const lang = typeof language === 'string' && language ? language : 'javascript';
  try {
    const response = await ai!.models.generateContent({
      model: PRO_MODEL, // Pro for stronger code reasoning.
      contents: `You are a technical interviewer at a top tech company.
      Problem: ${problem}
      Candidate's Code (${lang}):
      \`\`\`${lang}
      ${code}
      \`\`\`

      Please evaluate the solution.
      1. Is it correct?
      2. What is the Time and Space complexity?
      3. Are there any edge cases missed?
      4. Suggest improvements or a more optimal approach if one exists.

      Keep the tone encouraging but rigorous. Use Markdown.`,
    });
    res.json({ text: response.text });
  } catch (err) {
    console.error('Error checking solution:', err);
    res.status(502).json({ error: 'Failed to check solution.' });
  }
});

// Serve the built SPA in production (run `npm run build` first).
const distDir = path.resolve(__dirname, '..', 'dist');
app.use(express.static(distDir));
app.get('*', (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
  console.log(`AlgoMaster AI server listening on http://localhost:${PORT}`);
});
