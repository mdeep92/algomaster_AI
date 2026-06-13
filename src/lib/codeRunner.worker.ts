/**
 * Web Worker that executes user-submitted JavaScript off the main thread.
 *
 * Running untrusted code here (instead of `new Function` on the UI thread)
 * means infinite loops or crashes can't freeze the page — the main thread
 * terminates this worker if it exceeds a timeout. `console.*` output is
 * captured and posted back so the UI can render it.
 */

type RunResult = {
  ok: boolean;
  logs: string[];
  error?: string;
};

const format = (value: unknown): string => {
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

self.onmessage = (event: MessageEvent<string>) => {
  const code = event.data;
  const logs: string[] = [];

  const capture = (...args: unknown[]) => {
    logs.push(args.map(format).join(' '));
  };

  // Shadow the global console inside the user's function so all output is captured.
  const sandboxConsole = { log: capture, info: capture, warn: capture, error: capture };

  let result: RunResult;
  try {
    const userFunc = new Function('console', code);
    userFunc(sandboxConsole);
    result = { ok: true, logs };
  } catch (err) {
    result = { ok: false, logs, error: err instanceof Error ? err.message : String(err) };
  }

  (self as unknown as Worker).postMessage(result);
};
