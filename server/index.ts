/**
 * AlgoMaster AI backend.
 *
 * Keeps ANTHROPIC_API_KEY server-side (it is never bundled into the client)
 * and exposes thin JSON endpoints the SPA calls for AI features. In production
 * it also serves the built static assets from `dist/`.
 *
 * Requests use Claude via the official Anthropic SDK with adaptive thinking,
 * and stream server-side so long lessons / reviews don't hit request timeouts;
 * we assemble the final text with `stream.finalMessage()` before responding.
 */
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import Anthropic from '@anthropic-ai/sdk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Anthropic's most capable model. Change here if you want a different Claude model.
const MODEL = 'claude-opus-4-8';

const apiKey = process.env.ANTHROPIC_API_KEY;
const client = apiKey ? new Anthropic({ apiKey }) : null;
if (!client) {
  console.warn('ANTHROPIC_API_KEY is not set. /api/explain and /api/review will return 503.');
}

const app = express();
app.use(express.json({ limit: '1mb' }));

const requireAI = (res: express.Response): boolean => {
  if (!client) {
    res.status(503).json({ error: 'AI is not configured. Set ANTHROPIC_API_KEY on the server.' });
    return false;
  }
  return true;
};

// Collect the assistant's text, ignoring thinking blocks.
const textOf = (message: Anthropic.Message): string =>
  message.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('');

app.post('/api/explain', async (req, res) => {
  if (!requireAI(res)) return;
  const { topic, context } = req.body ?? {};
  if (typeof topic !== 'string' || !topic.trim()) {
    return res.status(400).json({ error: 'A "topic" string is required.' });
  }
  try {
    const stream = client!.messages.stream({
      model: MODEL,
      max_tokens: 8192,
      thinking: { type: 'adaptive' },
      output_config: { effort: 'medium' },
      system:
        'You are an expert computer science tutor helping a student prepare for technical interviews. ' +
        'Explain clearly and concisely, and use Markdown for formatting.',
      messages: [
        {
          role: 'user',
          content: `Explain the Data Structure or Algorithm topic: "${topic}".
Context: ${context || 'General introduction'}.
Include time and space complexity analysis where applicable.`,
        },
      ],
    });
    const message = await stream.finalMessage();
    res.json({ text: textOf(message) });
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
    const stream = client!.messages.stream({
      model: MODEL,
      max_tokens: 4096,
      thinking: { type: 'adaptive' },
      output_config: { effort: 'high' }, // higher effort for rigorous code reasoning
      system:
        'You are a technical interviewer at a top tech company. ' +
        'Keep the tone encouraging but rigorous, and use Markdown.',
      messages: [
        {
          role: 'user',
          content: `Problem: ${problem}
Candidate's Code (${lang}):
\`\`\`${lang}
${code}
\`\`\`

Please evaluate the solution:
1. Is it correct?
2. What is the Time and Space complexity?
3. Are there any edge cases missed?
4. Suggest improvements or a more optimal approach if one exists.`,
        },
      ],
    });
    const message = await stream.finalMessage();
    res.json({ text: textOf(message) });
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
