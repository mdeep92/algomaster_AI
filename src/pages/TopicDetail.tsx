import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TOPICS } from '@/lib/data';
import { generateExplanation } from '@/lib/gemini';
import ReactMarkdown from 'react-markdown';
import { Bot, Code2, PlayCircle, ChevronRight } from 'lucide-react';
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">{topic.title}</h1>
          <p className="text-neutral-400">{topic.description}</p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-neutral-500 uppercase tracking-widest bg-neutral-800/50 px-3 py-1.5 rounded-full border border-neutral-700/50">
          <span>{topic.category.replace('-', ' ')}</span>
          <ChevronRight size={12} />
          <span className="text-indigo-400">{topic.title}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 border-b border-neutral-800 mb-6">
        <button
          onClick={() => setActiveTab('theory')}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 flex items-center gap-2 relative",
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
            "px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 flex items-center gap-2",
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
            "px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 flex items-center gap-2",
            activeTab === 'practice' 
              ? "border-indigo-500 text-indigo-400" 
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          )}
        >
          <Code2 size={16} />
          Practice
        </button>
      </div>

      <div className="flex-1 min-h-0">
        {activeTab === 'theory' && (
          <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0">
            {/* Left Side: Topics List in a Decorated Box */}
            <div className="lg:w-72 flex-shrink-0 flex flex-col min-h-0">
              <div className="bg-neutral-900/80 backdrop-blur-md border border-neutral-800 rounded-2xl overflow-hidden flex flex-col h-full shadow-2xl shadow-black/40">
                <div className="p-4 border-b border-neutral-800 bg-neutral-900/50 flex items-center justify-between">
                  <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em]">
                    Curriculum
                  </h3>
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                  {TOPICS.map((t) => (
                    <Link
                      key={t.id}
                      to={`/topic/${t.id}`}
                      onClick={() => {
                        if (t.id !== topic.id) {
                          setExplanation(''); // Reset explanation for new topic
                        }
                      }}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-300 group relative overflow-hidden",
                        t.id === topic.id
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                          : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
                      )}
                    >
                      <div className={cn(
                        "p-1.5 rounded-lg transition-colors z-10",
                        t.id === topic.id ? "bg-white/20" : "bg-neutral-800 group-hover:bg-neutral-700"
                      )}>
                        <t.icon size={14} />
                      </div>
                      <span className="truncate font-medium z-10">{t.title}</span>
                      {t.id === topic.id && (
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-500 opacity-50" />
                      )}
                    </Link>
                  ))}
                </div>
                <div className="p-4 border-t border-neutral-800 bg-neutral-900/30">
                  <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-medium uppercase tracking-wider">
                    <div className="w-1 h-1 rounded-full bg-neutral-700" />
                    {TOPICS.length} Modules Total
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Theory Content */}
            <div className="flex-1 min-w-0 bg-neutral-900/40 border border-neutral-800 rounded-2xl overflow-hidden flex flex-col shadow-inner relative group/content">
              {/* Subtle background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/5 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none" />

              <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar relative z-10">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-6">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-indigo-500/20 rounded-full" />
                      <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-white font-medium">AI Tutor is preparing your lesson</p>
                      <p className="text-neutral-500 text-xs animate-pulse">Analyzing {topic.title} concepts...</p>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-invert max-w-none 
                    prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight
                    prose-h1:text-4xl prose-h2:text-2xl prose-h2:border-b prose-h2:border-neutral-800 prose-h2:pb-2 prose-h2:mt-12
                    prose-p:text-neutral-300 prose-p:leading-relaxed
                    prose-strong:text-indigo-400 prose-strong:font-semibold
                    prose-code:text-indigo-300 prose-code:bg-indigo-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
                    prose-pre:bg-neutral-950 prose-pre:border prose-pre:border-neutral-800 prose-pre:rounded-xl prose-pre:shadow-2xl
                    prose-li:text-neutral-300
                    prose-blockquote:border-l-indigo-500 prose-blockquote:bg-indigo-500/5 prose-blockquote:py-1 prose-blockquote:px-6 prose-blockquote:rounded-r-lg
                    prose-img:rounded-2xl prose-img:shadow-2xl
                    prose-table:border prose-table:border-neutral-800 prose-table:rounded-xl prose-table:overflow-hidden
                    prose-th:bg-neutral-800/50 prose-th:px-4 prose-th:py-3
                    prose-td:px-4 prose-td:py-3 prose-td:border-t prose-td:border-neutral-800
                  ">
                    <ReactMarkdown>{explanation}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'visualize' && (
          <div className="h-full bg-neutral-950/50 rounded-2xl border border-neutral-800 p-6 overflow-hidden">
            {topic.id === 'sorting' ? (
              <SortingVisualizer />
            ) : topic.id === 'graphs' || topic.id === 'searching' ? (
              <PathfindingVisualizer />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-neutral-500 gap-4">
                <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center border border-neutral-800">
                  <PlayCircle size={40} className="opacity-20" />
                </div>
                <div className="text-center">
                  <p className="text-white font-medium">Visualization Coming Soon</p>
                  <p className="text-sm text-neutral-500 mt-1">We're working on a custom visualizer for {topic.title}.</p>
                  <div className="mt-6 flex gap-2 justify-center">
                    <Link to="/topic/sorting" className="text-xs text-indigo-400 hover:underline">Try Sorting</Link>
                    <span className="text-neutral-700">•</span>
                    <Link to="/topic/graphs" className="text-xs text-indigo-400 hover:underline">Try Graphs</Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'practice' && (
          <div className="h-full bg-neutral-950/50 rounded-2xl border border-neutral-800 overflow-hidden">
            <ProblemRunner topicTitle={topic.title} />
          </div>
        )}
      </div>
    </div>
  );
}

