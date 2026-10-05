import React, { useState } from 'react';
import { ArrowLeft, Play, Gamepad2, BookOpen, Layers } from 'lucide-react';
import { TopicId, TopicMeta } from '../types';
import { TOPICS } from '../data/topics';
import { ComplexityTable } from './ComplexityTable';
import { ArraySimulation } from './ArrayModule/ArraySimulation';
import { ArrayGame } from './ArrayModule/ArrayGame';
import { TreeSimulation } from './TreeModule/TreeSimulation';
import { TreeGame } from './TreeModule/TreeGame';
import { StackSimulation } from './StackModule/StackSimulation';
import { StackGame } from './StackModule/StackGame';
import { QueueSimulation } from './QueueModule/QueueSimulation';
import { QueueGame } from './QueueModule/QueueGame';
import { LinkedListSimulation } from './LinkedListModule/LinkedListSimulation';
import { LinkedListGame } from './LinkedListModule/LinkedListGame';
import { GraphSimulation } from './GraphModule/GraphSimulation';
import { GraphGame } from './GraphModule/GraphGame';
import { sounds } from '../utils/audio';

interface TopicViewProps {
  topicId: TopicId;
  onBack: () => void;
  initialTab?: 'simulation' | 'game' | 'theory';
}

export const TopicView: React.FC<TopicViewProps> = ({ topicId, onBack, initialTab = 'simulation' }) => {
  const [activeTab, setActiveTab] = useState<'simulation' | 'game' | 'theory'>(initialTab);
  const topic: TopicMeta = TOPICS.find((t) => t.id === topicId) || TOPICS[0];

  const renderContent = () => {
    if (activeTab === 'game') {
      switch (topicId) {
        case 'array':
          return <ArrayGame />;
        case 'tree':
          return <TreeGame />;
        case 'stack':
          return <StackGame />;
        case 'queue':
          return <QueueGame />;
        case 'linked-list':
          return <LinkedListGame />;
        case 'graph':
          return <GraphGame />;
        default:
          return <ArrayGame />;
      }
    }

    if (activeTab === 'theory') {
      return (
        <div className="space-y-6">
          <ComplexityTable complexity={topic.complexity} topicName={topic.name} />

          {/* Deep Dive & Real World Usage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h4 className="text-sm font-semibold text-white">Core Invariants & Memory Model</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {topic.description}
              </p>
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80 text-xs font-mono text-slate-300 space-y-1">
                <div className="text-slate-500">// Engineering Memory Footprint:</div>
                <div>{topic.name} requires {topic.complexity.space} space overhead.</div>
                <div>Optimal for: {topic.category} workloads.</div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h4 className="text-sm font-semibold text-white">Real-World Production Applications</h4>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {topic.realWorldExamples.map((ex, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-indigo-400 font-mono font-bold">0{i + 1}.</span>
                    <span>{ex}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      );
    }

    // Default: Simulation
    switch (topicId) {
      case 'array':
        return <ArraySimulation />;
      case 'tree':
        return <TreeSimulation />;
      case 'stack':
        return <StackSimulation />;
      case 'queue':
        return <QueueSimulation />;
      case 'linked-list':
        return <LinkedListSimulation />;
      case 'graph':
        return <GraphSimulation />;
      default:
        return <ArraySimulation />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <button
              onClick={() => {
                sounds.click();
                onBack();
              }}
              className="hover:text-white transition-colors flex items-center gap-1 focus:outline-none"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Catalog</span>
            </button>
            <span aria-hidden="true">·</span>
            <span>{topic.category}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {topic.name}
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl text-balance">
            {topic.tagline}
          </p>
        </div>

        {/* Segmented Control Mode Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl self-start md:self-auto">
          <button
            onClick={() => {
              sounds.click();
              setActiveTab('simulation');
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'simulation'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Interactive Visualizer</span>
          </button>

          <button
            onClick={() => {
              sounds.click();
              setActiveTab('game');
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'game'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Learning Game</span>
          </button>

          <button
            onClick={() => {
              sounds.click();
              setActiveTab('theory');
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'theory'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Complexity & Theory</span>
          </button>
        </div>
      </div>

      {/* Main Dynamic Stage */}
      <div>{renderContent()}</div>
    </div>
  );
};
