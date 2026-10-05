import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, Home, Download, Check } from 'lucide-react';
import { TopicId } from '../types';
import { sounds } from '../utils/audio';
import { downloadProjectZip } from '../utils/exporter';

interface NavbarProps {
  currentView: 'home' | TopicId;
  onNavigate: (view: 'home' | TopicId) => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  audioEnabled,
  onToggleAudio,
}) => {
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
  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single Brand Wordmark */}
        <button
          onClick={() => {
            sounds.click();
            onNavigate('home');
          }}
          className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600/30 transition-colors">
            <span className="font-mono text-sm font-bold">&lt;/&gt;</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors">
            DataStructs
          </span>
        </button>

        {/* Zone 2: Clean Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => {
              sounds.click();
              onNavigate('home');
            }}
            className={`transition-colors py-1 ${
              currentView === 'home'
                ? 'text-indigo-400 border-b-2 border-indigo-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => {
              sounds.click();
              onNavigate('array');
            }}
            className={`transition-colors py-1 ${
              currentView === 'array'
                ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Arrays
          </button>
          <button
            onClick={() => {
              sounds.click();
              onNavigate('tree');
            }}
            className={`transition-colors py-1 ${
              currentView === 'tree'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Binary Trees
          </button>
          <button
            onClick={() => {
              sounds.click();
              onNavigate('stack');
            }}
            className={`transition-colors py-1 ${
              currentView === 'stack'
                ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Stacks
          </button>
          <button
            onClick={() => {
              sounds.click();
              onNavigate('queue');
            }}
            className={`transition-colors py-1 ${
              currentView === 'queue'
                ? 'text-violet-400 border-b-2 border-violet-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Queues
          </button>
          <button
            onClick={() => {
              sounds.click();
              onNavigate('linked-list');
            }}
            className={`transition-colors py-1 ${
              currentView === 'linked-list'
                ? 'text-rose-400 border-b-2 border-rose-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Linked Lists
          </button>
          <button
            onClick={() => {
              sounds.click();
              onNavigate('graph');
            }}
            className={`transition-colors py-1 ${
              currentView === 'graph'
                ? 'text-sky-400 border-b-2 border-sky-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Graphs
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onToggleAudio}
            title={audioEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects'}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
            aria-label={audioEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            onClick={handleDownload}
            disabled={downloading}
            title="Download entire project source files as a ZIP archive"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-lg transition-colors whitespace-nowrap"
          >
            {downloaded ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Saved .ZIP</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>{downloading ? 'Packing...' : 'Download ZIP'}</span>
              </>
            )}
          </button>

          {currentView !== 'home' ? (
            <button
              onClick={() => {
                sounds.click();
                onNavigate('home');
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <Home className="w-3.5 h-3.5" />
              <span>All Topics</span>
            </button>
          ) : (
            <button
              onClick={() => {
                sounds.click();
                onNavigate('array');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Lab</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
