import React, { useState } from 'react';
import { Sparkles, Gamepad2, Play, ArrowRight, ShieldCheck, Cpu, Terminal, Compass, Layers, GitBranch, Binary, Database, Download, Check } from 'lucide-react';
import { TopicId, TopicMeta } from '../types';
import { TOPICS } from '../data/topics';
import { sounds } from '../utils/audio';
import { downloadProjectZip } from '../utils/exporter';

interface HomeViewProps {
  onSelectTopic: (topicId: TopicId, initialTab?: 'simulation' | 'game') => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onSelectTopic }) => {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = async () => {
    sounds.click();
    setDownloading(true);
    try {
      await downloadProjectZip();
      setDownloaded(true);
      sounds.success();
      setTimeout(() => setDownloaded(false), 2500);
    } catch {
      sounds.error();
    } finally {
      setDownloading(false);
    }
  };
  const getTopicIcon = (id: TopicId) => {
    switch (id) {
      case 'array':
        return <Binary className="w-5 h-5 text-emerald-400" />;
      case 'tree':
        return <GitBranch className="w-5 h-5 text-amber-400" />;
      case 'stack':
        return <Layers className="w-5 h-5 text-cyan-400" />;
      case 'queue':
        return <Database className="w-5 h-5 text-violet-400" />;
      case 'linked-list':
        return <Terminal className="w-5 h-5 text-rose-400" />;
      case 'graph':
        return <Compass className="w-5 h-5 text-sky-400" />;
    }
  };

  const getTopicAccentBorder = (id: TopicId) => {
    switch (id) {
      case 'array':
        return 'hover:border-emerald-500/50 group-hover:text-emerald-400';
      case 'tree':
        return 'hover:border-amber-500/50 group-hover:text-amber-400';
      case 'stack':
        return 'hover:border-cyan-500/50 group-hover:text-cyan-400';
      case 'queue':
        return 'hover:border-violet-500/50 group-hover:text-violet-400';
      case 'linked-list':
        return 'hover:border-rose-500/50 group-hover:text-rose-400';
      case 'graph':
        return 'hover:border-sky-500/50 group-hover:text-sky-400';
    }
  };

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-800/60 text-xs font-semibold text-indigo-300">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Interactive Computer Science Laboratory</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight text-balance max-w-4xl mx-auto">
          Master Data Structures Through Visual Simulation & Play
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed text-balance">
          Explore memory layouts, trace pointer movements step-by-step, and test your algorithmic intuition with hands-on learning games.
        </p>

        {/* Hero Quick Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => {
              sounds.click();
              onSelectTopic('array', 'simulation');
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-950/50 transition-all hover:scale-102"
          >
            <Play className="w-4 h-4" />
            <span>Launch Visualizer</span>
          </button>

          <button
            onClick={() => {
              sounds.click();
              onSelectTopic('array', 'game');
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-sm transition-all hover:scale-102"
          >
            <Gamepad2 className="w-4 h-4 text-emerald-400" />
            <span>Play Algorithmic Games</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 font-bold text-sm transition-all hover:scale-102"
          >
            {downloaded ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">Project Downloaded</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-indigo-400" />
                <span>{downloading ? 'Packing Archive...' : 'Download Project (.zip)'}</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Core Topics Selection Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              Curated Curriculum
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
              Select a Data Structure Topic
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            6 Specialized Topics · 6 Interactive Sandboxes · 6 Arcade Games
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOPICS.map((topic) => (
            <div
              key={topic.id}
              className={`group bg-slate-900/80 hover:bg-slate-900 border border-slate-800 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between shadow-lg ${getTopicAccentBorder(
                topic.id
              )}`}
            >
              <div>
                {/* Top Meta Line (Zero-pill clean typography) */}
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center">
                      {getTopicIcon(topic.id)}
                    </div>
                    <span className="font-medium text-slate-300">{topic.category}</span>
                  </div>
                  <span className="font-mono text-slate-400 font-semibold">
                    {topic.complexity.access}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {topic.name}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {topic.description}
                </p>

                {/* Game Spotlight Callout */}
                <div className="mt-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-1">
                    <Gamepad2 className="w-3.5 h-3.5" />
                    <span>Mini-Game: {topic.gameTitle}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    {topic.gameDescription}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2">
                <button
                  onClick={() => {
                    sounds.click();
                    onSelectTopic(topic.id, 'simulation');
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white transition-colors"
                >
                  <Play className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Simulation</span>
                </button>

                <button
                  onClick={() => {
                    sounds.click();
                    onSelectTopic(topic.id, 'game');
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800 text-xs font-semibold text-emerald-300 transition-colors"
                >
                  <Gamepad2 className="w-3.5 h-3.5" />
                  <span>Play Game</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Educational Methodology Principles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-700/60 flex items-center justify-center text-indigo-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">01. Direct Memory Visualization</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Observe contiguous vs fragmented heap memory allocations, pointers, shifts, and stack frames with real-time feedback.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-700/60 flex items-center justify-center text-amber-400">
              <Terminal className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">02. Step-by-Step Algorithm Tracing</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Step forward, pause, and inspect variables at every cycle of Binary Search, BFS waves, Tree Traversals, and Pointer Inversions.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">03. Gamified Mastery Challenges</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Test your understanding under dynamic game conditions — balance delimiter brackets, place BST keys, and optimize network hops.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
