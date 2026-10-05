import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Zap, Heart, RotateCcw, Link2, HelpCircle, Check, AlertTriangle } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface ScrambledNode {
  id: string;
  val: number;
  addr: string;
}

export const LinkedListGame: React.FC = () => {
  const [level, setLevel] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(1);
  const [lives, setLives] = useState<number>(3);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [scrambledNodes, setScrambledNodes] = useState<ScrambledNode[]>([]);
  const [linkedChain, setLinkedChain] = useState<ScrambledNode[]>([]);
  const [feedback, setFeedback] = useState<string>('Memory allocator fragmented! Click nodes in ascending order to link pointers.');

  // Initialize level
  const initLevel = (lvl: number) => {
    const count = Math.min(4 + lvl, 6);
    const values: number[] = [];
    while (values.length < count) {
      const v = Math.floor(Math.random() * 85) + 10;
      if (!values.includes(v)) values.push(v);
    }

    const hexAddrs = ['0x10A', '0x2B4', '0x3F8', '0x5C2', '0x7E1', '0x9D0'].slice(0, count);

    const generated: ScrambledNode[] = values.map((val, idx) => ({
      id: Math.random().toString(),
      val,
      addr: hexAddrs[idx],
    }));

    // Shuffle the array
    const shuffled = [...generated].sort(() => Math.random() - 0.5);
    setScrambledNodes(shuffled);
    setLinkedChain([]);
    setFeedback('Link the fragmented memory blocks by picking the smallest available value first!');
  };

  useEffect(() => {
    initLevel(level);
  }, [level]);

  const handleNodeClick = (node: ScrambledNode) => {
    if (isGameOver) return;

    // Remaining unlinked nodes
    const remaining = scrambledNodes.filter((n) => !linkedChain.some((c) => c.id === n.id));
    const smallestRemaining = [...remaining].sort((a, b) => a.val - b.val)[0];

    if (node.id === smallestRemaining.id) {
      sounds.insert();
      const updated = [...linkedChain, node];
      setLinkedChain(updated);
      const pts = 80 * combo;
      setScore((s) => s + pts);

      if (updated.length === scrambledNodes.length) {
        sounds.success();
        try {
          confetti({ particleCount: 50, spread: 60 });
        } catch {
          // ignore
        }
        setFeedback(`Chain complete! All ${updated.length} nodes successfully linked to NULL!`);
        setTimeout(() => {
          setLevel((l) => l + 1);
        }, 1200);
      } else {
        setFeedback(`Linked node [${node.val}] at ${node.addr}. Next pointer points to: next smallest node.`);
      }
    } else {
      sounds.error();
      const nextLives = lives - 1;
      setFeedback(`Incorrect link! Node [${node.val}] is not the smallest unlinked value (Expected [${smallestRemaining.val}]).`);
      if (nextLives <= 0) setIsGameOver(true);
      else {
        setLives(nextLives);
        setCombo(1);
      }
    }
  };

  const handleRestart = () => {
    sounds.swap();
    setScore(0);
    setCombo(1);
    setLives(3);
    setIsGameOver(false);
    setLevel(1);
    initLevel(1);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6">
      {/* Top HUD */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-800">
        <div>
          <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
            Pointer Repair Game · Level {level}
          </span>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Link2 className="w-5 h-5 text-rose-400" />
            <span>Pointer Rescue & Memory Linker</span>
          </h3>
        </div>

        <div className="flex items-center gap-5 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">Score:</span>
            <span className="text-white font-bold tabular-nums">{score}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">Combo:</span>
            <span className="text-cyan-400 font-bold tabular-nums">{combo}x</span>
          </div>

          <div className="flex items-center gap-1">
            {[...Array(3)].map((_, i) => (
              <Heart
                key={i}
                className={`w-4 h-4 ${i < lives ? 'text-rose-500 fill-rose-500' : 'text-slate-700'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {isGameOver ? (
        <div className="py-12 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-rose-950/60 border border-rose-800 flex items-center justify-center text-rose-400">
            <Heart className="w-7 h-7" />
          </div>
          <h4 className="text-xl font-bold text-white">Pointer Dangling / Segmentation Fault</h4>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            You linked nodes achieving a score of{' '}
            <span className="font-mono text-rose-400 font-bold">{score}</span>.
          </p>
          <button
            onClick={handleRestart}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart Mission</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Repaired Chain */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-3 font-mono">
              Constructed Pointer Sequence:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto min-h-[70px] py-1">
              <span className="font-mono text-xs font-bold text-emerald-400 mr-1">HEAD →</span>
              {linkedChain.length === 0 ? (
                <span className="text-xs text-slate-600 font-mono italic">
                  No nodes linked yet · Click a memory block below to initialize HEAD
                </span>
              ) : (
                linkedChain.map((node, i) => (
                  <React.Fragment key={node.id}>
                    <div className="px-3 py-2 rounded-lg bg-rose-950/80 border border-rose-600 text-rose-100 flex items-center gap-2 shadow shrink-0">
                      <span className="font-mono font-bold">{node.val}</span>
                      <span className="font-mono text-[10px] text-rose-400">{node.addr}</span>
                    </div>
                    {i < linkedChain.length - 1 ? (
                      <span className="text-rose-400 font-bold text-sm">→</span>
                    ) : (
                      <span className="text-slate-500 font-mono text-xs">→ NULL</span>
                    )}
                  </React.Fragment>
                ))
              )}
            </div>
          </div>

          {/* Fragmented Memory Pool */}
          <div>
            <span className="text-xs text-slate-400 block mb-2 font-mono">
              Scattered Heap Memory Blocks (Click next smallest value to link):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {scrambledNodes.map((node) => {
                const isLinked = linkedChain.some((c) => c.id === node.id);
                return (
                  <button
                    key={node.id}
                    onClick={() => handleNodeClick(node)}
                    disabled={isLinked}
                    className={`h-24 rounded-xl border flex flex-col justify-between p-3 transition-all ${
                      isLinked
                        ? 'bg-slate-950/50 border-slate-900 text-slate-700 opacity-40 cursor-not-allowed'
                        : 'bg-slate-800/90 border-slate-700 text-white hover:border-rose-500 hover:scale-105 active:scale-95 shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>Heap</span>
                      <span>{node.addr}</span>
                    </div>
                    <div className="text-2xl font-mono font-bold text-center">
                      {node.val}
                    </div>
                    <div className="text-[10px] font-mono text-center text-rose-400">
                      {isLinked ? '✓ Linked' : '*next: ?'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2.5">
            <HelpCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="text-xs text-slate-300 font-medium">{feedback}</span>
          </div>
        </div>
      )}
    </div>
  );
};
