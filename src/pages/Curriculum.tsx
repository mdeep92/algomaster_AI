import React from 'react';
import { TOPICS } from '@/lib/data';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function Curriculum() {
  const categories = {
    basics: TOPICS.filter(t => t.category === 'basics'),
    'data-structures': TOPICS.filter(t => t.category === 'data-structures'),
    algorithms: TOPICS.filter(t => t.category === 'algorithms'),
    advanced: TOPICS.filter(t => t.category === 'advanced'),
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white tracking-tight">Curriculum</h1>
        <p className="text-neutral-400">A structured roadmap to DSA mastery.</p>
      </div>

      {Object.entries(categories).map(([key, topics]) => (
        <div key={key} className="space-y-4">
          <h2 className="text-xl font-semibold text-indigo-400 uppercase tracking-wider text-sm">
            {key.replace('-', ' ')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topics.map((topic) => {
              const Icon = topic.icon;
              return (
                <Link 
                  key={topic.id}
                  to={`/topic/${topic.id}`}
                  className="flex flex-col p-6 bg-neutral-950 border border-neutral-800 rounded-xl hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-neutral-900 rounded-lg text-neutral-300">
                      <Icon size={20} />
                    </div>
                    <ArrowRight size={16} className="text-neutral-600" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">{topic.title}</h3>
                  <p className="text-sm text-neutral-500">{topic.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
