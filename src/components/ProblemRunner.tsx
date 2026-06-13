import React, { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Loader2, Bot, AlertCircle, RotateCcw } from 'lucide-react';
import { checkSolution } from '@/lib/ai';
import { useLocalStorage } from '@/lib/useLocalStorage';
import ReactMarkdown from 'react-markdown';

interface ProblemRunnerProps {
  topicTitle: string;
}

// Hard cap on user code execution so an infinite loop can't hang forever.
const EXECUTION_TIMEOUT_MS = 3000;

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', ext: 'js' },
  { id: 'typescript', label: 'TypeScript', ext: 'ts' },
  { id: 'python', label: 'Python', ext: 'py' },
  { id: 'java', label: 'Java', ext: 'java' },
  { id: 'cpp', label: 'C++', ext: 'cpp' },
] as const;

// Only JavaScript can run in-browser (the Web Worker executes JS); other
// languages are still available for AI Review.
const RUNNABLE_LANGUAGE = 'javascript';

export default function ProblemRunner({ topicTitle }: ProblemRunnerProps) {
  const [output, setOutput] = useState<string[]>([]);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  // Remember the user's preferred language across sessions.
  const [language, setLanguage] = useLocalStorage('algomaster:practice-language', 'javascript');
  const activeLang = LANGUAGES.find((l) => l.id === language) ?? LANGUAGES[0];
  const canRun = language === RUNNABLE_LANGUAGE;

  const defaultCode = `// Write a function to implement ${topicTitle}
// You can use console.log to debug

function solution(input) {
  // Your code here
  return input;
}

// Example usage:
// console.log(solution([1, 2, 3]));
`;

  // Persist the user's code per topic so edits survive reloads.
  const [code, setCode] = useLocalStorage(`algomaster:code:${topicTitle}`, defaultCode);

  // Tear down any running worker on unmount.
  useEffect(() => {
    return () => workerRef.current?.terminate();
  }, []);

  const runCode = () => {
    // Cancel a previous in-flight run, if any.
    workerRef.current?.terminate();
    setOutput([]);
    setIsRunning(true);

    const worker = new Worker(new URL('../lib/codeRunner.worker.ts', import.meta.url), {
      type: 'module',
    });
    workerRef.current = worker;

    const timeout = setTimeout(() => {
      worker.terminate();
      workerRef.current = null;
      setOutput(['Error: Execution timed out (possible infinite loop).']);
      setIsRunning(false);
    }, EXECUTION_TIMEOUT_MS);

    worker.onmessage = (event: MessageEvent<{ ok: boolean; logs: string[]; error?: string }>) => {
      clearTimeout(timeout);
      const { ok, logs, error } = event.data;
      const lines = [...logs];
      if (!ok && error) lines.push(`Error: ${error}`);
      setOutput(lines.length > 0 ? lines : ['Code executed successfully (no output)']);
      setIsRunning(false);
      worker.terminate();
      workerRef.current = null;
    };

    worker.onerror = (event) => {
      clearTimeout(timeout);
      setOutput([`Error: ${event.message}`]);
      setIsRunning(false);
      worker.terminate();
      workerRef.current = null;
    };

    worker.postMessage(code);
  };

  const handleAICheck = async () => {
    setIsChecking(true);
    setAiFeedback(null);
    setReviewError(null);
    try {
      const feedback = await checkSolution(`Implement ${topicTitle}`, code, language);
      setAiFeedback(feedback || 'Could not generate feedback.');
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : 'Failed to check solution.');
    } finally {
      setIsChecking(false);
    }
  };

  const resetCode = () => {
    if (confirm('Are you sure you want to reset your code?')) {
      setCode(defaultCode);
      setOutput([]);
      setAiFeedback(null);
      setReviewError(null);
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-4">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="mb-4 p-4 bg-neutral-900 rounded-lg border border-neutral-800 flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Problem: Implement {topicTitle}</h3>
            <p className="text-neutral-400 text-sm">Write a function to demonstrate the core concepts of {topicTitle}.</p>
          </div>
          <button
            onClick={resetCode}
            className="text-xs text-neutral-500 hover:text-white transition-colors"
          >
            Reset to Default
          </button>
        </div>

        <div className="flex-1 border border-neutral-800 rounded-lg overflow-hidden flex flex-col">
          <div className="bg-neutral-900 border-b border-neutral-800 p-2 flex justify-between items-center gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs text-neutral-500 font-mono px-2 truncate">main.{activeLang.ext}</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-neutral-800 text-neutral-200 text-xs rounded px-2 py-1 border border-neutral-700 focus:outline-none focus:border-indigo-500"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.id} value={l.id}>{l.label}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={runCode}
                disabled={isRunning || !canRun}
                title={canRun ? undefined : 'In-browser execution supports JavaScript only'}
                className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                {isRunning ? "Running..." : "Run Code"}
              </button>
              <button
                onClick={handleAICheck}
                disabled={isChecking}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded transition-colors disabled:opacity-50"
              >
                {isChecking ? <Loader2 size={14} className="animate-spin" /> : <Bot size={14} />}
                {isChecking ? "Analyzing..." : "AI Review"}
              </button>
            </div>
          </div>
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={(value) => setCode(value || '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              padding: { top: 16 },
              scrollBeyondLastLine: false,
            }}
          />
        </div>
      </div>

      <div className="lg:w-96 flex flex-col gap-4 min-w-0">
        {/* Console Output */}
        <div className="h-1/3 bg-neutral-950 border border-neutral-800 rounded-lg flex flex-col overflow-hidden">
          <div className="bg-neutral-900 border-b border-neutral-800 px-3 py-2 text-xs font-medium text-neutral-400">
            Console Output
          </div>
          <div className="flex-1 p-3 font-mono text-sm text-neutral-300 overflow-y-auto">
            {output.length === 0 ? (
              <span className="text-neutral-600 italic">
                {canRun ? 'Run code to see output...' : 'In-browser run supports JavaScript only. Use AI Review for other languages.'}
              </span>
            ) : (
              output.map((line, i) => (
                <div key={i} className="border-b border-neutral-800/50 last:border-0 py-1">
                  {line}
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Feedback */}
        <div className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg flex flex-col overflow-hidden">
          <div className="bg-neutral-900 border-b border-neutral-800 px-3 py-2 text-xs font-medium text-neutral-400 flex items-center gap-2">
            <Bot size={14} /> AI Feedback
          </div>
          <div className="flex-1 p-4 overflow-y-auto prose prose-invert prose-sm max-w-none">
            {isChecking ? (
              <div className="flex flex-col items-center justify-center h-full text-neutral-500 gap-2">
                <Loader2 className="animate-spin" />
                <span>Analyzing your code...</span>
              </div>
            ) : reviewError ? (
              <div className="flex flex-col items-center justify-center h-full text-center gap-3 not-prose">
                <AlertCircle className="text-red-400" />
                <p className="text-sm text-neutral-400">{reviewError}</p>
                <button
                  onClick={handleAICheck}
                  className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs rounded transition-colors"
                >
                  <RotateCcw size={14} /> Retry
                </button>
              </div>
            ) : aiFeedback ? (
              <ReactMarkdown>{aiFeedback}</ReactMarkdown>
            ) : (
              <div className="text-neutral-600 italic text-center mt-10">
                Click "AI Review" to get feedback on your solution.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
