import React, { useState } from 'react';
import { TopicId } from './types';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { TopicView } from './components/TopicView';
import { sounds } from './utils/audio';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | TopicId>('home');
  const [initialTopicTab, setInitialTopicTab] = useState<'simulation' | 'game'>('simulation');
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);

  const handleToggleAudio = () => {
    const next = !audioEnabled;
    sounds.enabled = next;
    setAudioEnabled(next);
    if (next) sounds.click();
  };

  const handleSelectTopic = (topicId: TopicId, initialTab: 'simulation' | 'game' = 'simulation') => {
    setInitialTopicTab(initialTab);
    setCurrentView(topicId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* 3-Zone Top Bar Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'home') handleBackToHome();
          else handleSelectTopic(view, 'simulation');
        }}
        audioEnabled={audioEnabled}
        onToggleAudio={handleToggleAudio}
      />

      {/* Main Dynamic Viewport */}
      <main className="flex-1 pb-16">
        {currentView === 'home' ? (
          <HomeView onSelectTopic={handleSelectTopic} />
        ) : (
          <TopicView
            key={`${currentView}-${initialTopicTab}`}
            topicId={currentView}
            initialTab={initialTopicTab}
            onBack={handleBackToHome}
          />
        )}
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">DataStructs Interactive Lab</span>
            <span aria-hidden="true">·</span>
            <span>Computer Science Foundations</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>Arrays</span>
            <span aria-hidden="true">·</span>
            <span>Trees</span>
            <span aria-hidden="true">·</span>
            <span>Stacks</span>
            <span aria-hidden="true">·</span>
            <span>Queues</span>
            <span aria-hidden="true">·</span>
            <span>Linked Lists</span>
            <span aria-hidden="true">·</span>
            <span>Graphs</span>
          </div>

          <div>
            <span>Client-side Web Audio & Real-time Canvas</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
