import React from 'react';
import { TOPICS } from '@/lib/data';
import { Link } from 'react-router-dom';
import { Code2, ArrowRight, BrainCircuit } from 'lucide-react';

export default function Practice() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white tracking-tight">Practice Arena</h1>
        <p className="text-neutral-400">Apply your knowledge by solving coding challenges.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TOPICS.map((topic) => (
          <div 
            key={topic.id}
            className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 flex flex-col"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                <Code2 size={20} />
              </div>
              <h3 className="font-medium text-white">{topic.title}</h3>
            </div>
            
            <p className="text-sm text-neutral-500 mb-6 flex-1">
              Implement {topic.title} and verify your solution with AI analysis.
            </p>

            <Link 
              to={`/topic/${topic.id}`}
              className="flex items-center justify-center gap-2 w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-colors text-sm font-medium border border-neutral-800"
            >
              Start Challenge <ArrowRight size={16} />
            </Link>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 rounded-xl p-8 text-center space-y-4">
        <div className="mx-auto w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400">
          <BrainCircuit size={24} />
        </div>
        <h2 className="text-xl font-bold text-white">Mock Interview Mode</h2>
        <p className="text-neutral-400 max-w-lg mx-auto">
          Ready for the real deal? Our AI interviewer can simulate a full technical interview session.
        </p>
        <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors" disabled>
          Coming Soon
        </button>
      </div>
    </div>
  );
}
