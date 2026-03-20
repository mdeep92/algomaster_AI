import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TOPICS } from '@/lib/data';
import { generateExplanation } from '@/lib/gemini';
import ReactMarkdown from 'react-markdown';
import { Bot, Code2, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import SortingVisualizer from '@/components/visualizers/SortingVisualizer';
import PathfindingVisualizer from '@/components/visualizers/PathfindingVisualizer';
import ProblemRunner from '@/components/ProblemRunner';

export default function TopicDetail() {
  const { topicId } = useParams();
  const topic = TOPICS.find(t => t.id === topicId);
  const [activeTab, setActiveTab] = useState<'theory' | 'visualize' | 'practice'>('theory');
  const [explanation, setExplanation] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (topic && activeTab === 'theory' && !explanation) {
      setLoading(true);
      generateExplanation(topic.title)
        .then(text => {
          setExplanation(text || 'Failed to load content.');
        })
        .finally(() => setLoading(false));
    }
  }, [topic, activeTab]);

  if (!topic) return <div>Topic not found</div>;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">{topic.title}</h1>
        <p className="text-neutral-400">{topic.description}</p>
      </div>

      <div className="flex items-center gap-4 border-b border-neutral-800 mb-6">
        <button
          onClick={() => setActiveTab('theory')}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
            activeTab === 'theory' 
              ? "border-indigo-500 text-indigo-400" 
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          )}
        >
          <Bot size={16} />
          Theory (AI Tutor)
        </button>
        <button
          onClick={() => setActiveTab('visualize')}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
            activeTab === 'visualize' 
              ? "border-indigo-500 text-indigo-400" 
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          )}
        >
          <PlayCircle size={16} />
          Visualize
        </button>
        <button
          onClick={() => setActiveTab('practice')}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
            activeTab === 'practice' 
              ? "border-indigo-500 text-indigo-400" 
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          )}
        >
          <Code2 size={16} />
          Practice
        </button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 bg-neutral-950/50 rounded-xl border border-neutral-800 p-6">
        {activeTab === 'theory' && (
          <div className="prose prose-invert max-w-none">
            {loading ? (
              <div className="flex items-center justify-center h-40 space-x-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            ) : (
              <ReactMarkdown>{explanation}</ReactMarkdown>
            )}
          </div>
        )}

        {activeTab === 'visualize' && (
          <div className="h-full">
            {topic.id === 'sorting' ? (
              <SortingVisualizer />
            ) : topic.id === 'graphs' || topic.id === 'searching' ? (
              <PathfindingVisualizer />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-neutral-500 gap-4">
                <PlayCircle size={48} className="opacity-20" />
                <p>Visualization for {topic.title} is coming soon.</p>
                <p className="text-sm">Try "Sorting Algorithms" or "Graphs" to see the visualizers in action.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'practice' && (
          <ProblemRunner topicTitle={topic.title} />
        )}
      </div>
    </div>
  );
}

