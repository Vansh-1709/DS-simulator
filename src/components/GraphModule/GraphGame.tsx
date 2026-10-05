import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Zap, Heart, RotateCcw, Compass, HelpCircle, Check, ArrowRight } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface PathNode {
  id: string;
  name: string;
  neighbors: { [target: string]: number }; // weight
}

export const GraphGame: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string[]>(['A']);
  const [accumulatedCost, setAccumulatedCost] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(1);
  const [lives, setLives] = useState<number>(3);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isRoundWon, setIsRoundWon] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>('Origin: Server [A] · Navigate to Gateway [F] with minimal latency!');

  // Network topology
  const graph: { [key: string]: { [target: string]: number } } = {
    A: { B: 4, C: 2 },
    B: { A: 4, C: 1, D: 5 },
    C: { A: 2, B: 1, D: 8, E: 7 },
    D: { B: 5, C: 8, E: 2, F: 6 },
    E: { C: 7, D: 2, F: 3 },
    F: { D: 6, E: 3 },
  };

  const optimalCostAtoF = 10; // A -> B(4) or A -> C(2) -> B(3) -> D(8) -> E(10)... optimal: A -> C (2) + C -> B (1) = 3 + B -> D (5) = 8... wait: A(2)->C(1)->B(5)->D(2)->E(3)->F = 2+1+5+2+3 = 13.
  // Let's check shortest from A to F:
  // A -> C (2) -> E (7) -> F (3) = 12
  // A -> C (2) -> B (1) -> D (5) -> E (2) -> F (3) = 13
  // A -> B (4) -> D (5) -> E (2) -> F (3) = 14
  // A -> C (2) -> D (8) -> E (2) -> F (3) = 15
  // A -> B (4) -> D (5) -> F (6) = 15
  // Shortest is A -> C -> E -> F = 2 + 7 + 3 = 12!

  const currentNode = currentPath[currentPath.length - 1];
  const availableNeighbors = Object.entries(graph[currentNode] || {}).filter(
    ([neighbor]) => !currentPath.includes(neighbor)
  );

  const handleHopTo = (neighbor: string, weight: number) => {
    if (isGameOver || isRoundWon) return;

    sounds.step();
    const nextPath = [...currentPath, neighbor];
    const nextCost = accumulatedCost + weight;
    setCurrentPath(nextPath);
    setAccumulatedCost(nextCost);

    if (neighbor === 'F') {
      // Reached destination!
      if (nextCost <= 12) {
        // Optimal!
        sounds.success();
        try {
          confetti({ particleCount: 60, spread: 70 });
        } catch {
          // ignore
        }
        const pts = 250 * combo;
        setScore((s) => s + pts);
        setCombo((c) => c + 1);
        setIsRoundWon(true);
        setFeedback(`GENIUS! Optimal route discovered: ${nextPath.join(' → ')} with lowest latency (${nextCost}ms)! +${pts} pts`);
      } else {
        // Sub-optimal route
        sounds.error();
        const nextLives = lives - 1;
        setFeedback(`Destination reached, but total cost was ${nextCost}ms. Optimal shortest route is 12ms (A → C → E → F).`);
        if (nextLives <= 0) setIsGameOver(true);
        else {
          setLives(nextLives);
          setCombo(1);
        }
      }
    } else {
      setFeedback(`Hopped to Server [${neighbor}] (+${weight}ms). Total latency: ${nextCost}ms. Choose next hop!`);
    }
  };

  const handleRestartRoute = () => {
    sounds.swap();
    setCurrentPath(['A']);
    setAccumulatedCost(0);
    setIsRoundWon(false);
    setFeedback('Route reset to Origin Server [A]. Navigate to Gateway [F]!');
  };

  const handleFullReset = () => {
    sounds.swap();
    setScore(0);
    setCombo(1);
    setLives(3);
    setIsGameOver(false);
    handleRestartRoute();
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6">
      {/* HUD */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-800">
        <div>
          <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
            Graph Routing Challenge
          </span>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-sky-400" />
            <span>Network Navigator: Shortest Path Dash</span>
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
          <h4 className="text-xl font-bold text-white">Network Packet Expired</h4>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            You achieved a score of <span className="font-mono text-sky-400 font-bold">{score}</span>.
            Study the edge weights carefully to minimize path sum.
          </p>
          <button
            onClick={handleFullReset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Mission Status */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400">Target Destination:</span>
              <div className="text-base font-bold text-white flex items-center gap-2">
                <span>Gateway [F]</span>
                <span className="text-xs font-normal text-emerald-400 font-mono">
                  (Benchmark Shortest: 12ms)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
                Accumulated Latency:{' '}
                <span className="text-amber-400 font-bold text-sm">{accumulatedCost}ms</span>
              </div>
              <button
                onClick={handleRestartRoute}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
              >
                Reset Route
              </button>
            </div>
          </div>

          {/* Current Path Strip */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-xs text-slate-400 font-mono block mb-2">Active Route:</span>
            <div className="flex items-center gap-2 overflow-x-auto">
              {currentPath.map((node, i) => (
                <React.Fragment key={i}>
                  <div className="px-3 py-1.5 rounded-lg bg-sky-950 border border-sky-600 text-sky-200 font-mono font-bold text-sm">
                    {node}
                  </div>
                  {i < currentPath.length - 1 && <span className="text-slate-500">→</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Neighbor Choices */}
          {!isRoundWon ? (
            <div>
              <span className="text-xs text-slate-400 block mb-2 font-mono">
                Available Edge Hops from Server [{currentNode}]:
              </span>
              {availableNeighbors.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center text-rose-400 text-xs font-mono">
                  Dead end! No unvisited neighbors. Click 'Reset Route' above.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {availableNeighbors.map(([neighbor, weight]) => (
                    <button
                      key={neighbor}
                      onClick={() => handleHopTo(neighbor, weight)}
                      className="p-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 hover:border-sky-500 text-left transition-all hover:scale-102 flex items-center justify-between shadow-md"
                    >
                      <div>
                        <div className="font-mono text-base font-bold text-white">
                          Server [{neighbor}]
                        </div>
                        <span className="text-xs text-slate-400 font-mono">
                          Hop latency: +{weight}ms
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-sky-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-emerald-950/40 border border-emerald-800 text-center space-y-3">
              <Check className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="text-lg font-bold text-white">Optimal Path Secured!</h4>
              <p className="text-xs text-slate-300">
                You navigated the shortest path through the server graph with optimal 12ms latency!
              </p>
              <button
                onClick={handleRestartRoute}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
              >
                Play Next Run
              </button>
            </div>
          )}

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2.5">
            <HelpCircle className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="text-xs text-slate-300 font-medium">{feedback}</span>
          </div>
        </div>
      )}
    </div>
  );
};
