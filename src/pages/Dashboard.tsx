import React from 'react';
import { TOPICS } from '@/lib/data';
import { ArrowRight, CheckCircle2, Circle, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white tracking-tight">Welcome back, Master in Training</h1>
        <p className="text-neutral-400">Your journey to cracking the coding interview continues.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Topics Mastered</p>
              <p className="text-2xl font-bold text-white">0 / {TOPICS.length}</p>
            </div>
          </div>
          <div className="w-full bg-neutral-900 rounded-full h-2">
            <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '0%' }} />
          </div>
        </div>
        
        {/* Add more stats here later */}
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-white">Your Learning Path</h2>
        <div className="grid gap-4">
          {TOPICS.map((topic, index) => {
            const Icon = topic.icon;
            return (
              <Link 
                key={topic.id}
                to={`/topic/${topic.id}`}
                className="group flex items-center gap-4 p-4 bg-neutral-950 border border-neutral-800 rounded-xl hover:border-indigo-500/50 transition-all hover:bg-neutral-900"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-neutral-900 rounded-lg flex items-center justify-center group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-colors text-neutral-500">
                  <Icon size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-white group-hover:text-indigo-400 transition-colors">
                    {index + 1}. {topic.title}
                  </h3>
                  <p className="text-sm text-neutral-500 truncate">{topic.description}</p>
                </div>
                <div className="flex-shrink-0 text-neutral-600 group-hover:text-indigo-400 transition-colors">
                  <ArrowRight size={20} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
