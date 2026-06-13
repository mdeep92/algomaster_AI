import React, { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, CheckCircle2, AlertCircle, Loader2, Bot } from 'lucide-react';
import { checkSolution } from '@/lib/gemini';
import { useLocalStorage } from '@/lib/useLocalStorage';
import ReactMarkdown from 'react-markdown';

interface ProblemRunnerProps {
  topicTitle: string;
}

// Hard cap on user code execution so an infinite loop can't hang forever.
const EXECUTION_TIMEOUT_MS = 3000;

export default function ProblemRunner({ topicTitle }: ProblemRunnerProps) {
  const [output, setOutput] = useState<string[]>([]);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const workerRef = useRef<Worker | null>(null);

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
    const feedback = await checkSolution(`Implement ${topicTitle}`, code, 'javascript');
    setAiFeedback(feedback || "Could not generate feedback.");
    setIsChecking(false);
  };

  const resetCode = () => {
    if (confirm('Are you sure you want to reset your code?')) {
      setCode(defaultCode);
      setOutput([]);
      setAiFeedback(null);
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
          <div className="bg-neutral-900 border-b border-neutral-800 p-2 flex justify-between items-center">
            <span className="text-xs text-neutral-500 font-mono px-2">main.js</span>
            <div className="flex gap-2">
              <button
                onClick={runCode}
                disabled={isRunning}
                className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs rounded transition-colors disabled:opacity-50"
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
            defaultLanguage="javascript"
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
              <span className="text-neutral-600 italic">Run code to see output...</span>
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
