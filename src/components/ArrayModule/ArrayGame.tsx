import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Target, Zap, Heart, Trophy, RotateCcw, HelpCircle, Check, ArrowLeft, ArrowRight } from 'lucide-react';
import { sounds } from '../../utils/audio';

type GameMode = 'binary_search' | 'two_pointer';

interface GameState {
  mode: GameMode;
  level: number;
  score: number;
  combo: number;
  lives: number;
  isGameOver: boolean;
  isWon: boolean;
}

export const ArrayGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    mode: 'binary_search',
    level: 1,
    score: 0,
    combo: 1,
    lives: 3,
    isGameOver: false,
    isWon: false,
  });

  // Binary search state
  const [bsArray, setBsArray] = useState<number[]>([]);
  const [bsLow, setBsLow] = useState<number>(0);
  const [bsHigh, setBsHigh] = useState<number>(0);
  const [bsTarget, setBsTarget] = useState<number>(0);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const [awaitingDecision, setAwaitingDecision] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>('Select the exact middle index [mid = floor((low+high)/2)]');

  // Two-pointer state
  const [tpArray, setTpArray] = useState<number[]>([]);
  const [tpLeft, setTpLeft] = useState<number>(0);
  const [tpRight, setTpRight] = useState<number>(0);
  const [tpTargetSum, setTpTargetSum] = useState<number>(0);

  // Initialize Binary Search level
  const initBsLevel = useCallback((level: number) => {
    const size = Math.min(9 + level * 2, 15);
    // Generate sorted unique numbers
    const arr: number[] = [];
    let current = Math.floor(Math.random() * 8) + 2;
    for (let i = 0; i < size; i++) {
      current += Math.floor(Math.random() * 6) + 3;
      arr.push(current);
    }
    const targetIdx = Math.floor(Math.random() * size);
    setBsArray(arr);
    setBsLow(0);
    setBsHigh(arr.length - 1);
    setBsTarget(arr[targetIdx]);
    setRevealedIndices(new Set());
    setAwaitingDecision(null);
    setFeedback(`Target: ${arr[targetIdx]}. Calculate mid = floor((0 + ${arr.length - 1}) / 2) and click that slot!`);
  }, []);

  // Initialize Two-Pointer level
  const initTpLevel = useCallback(() => {
    const size = 10;
    const arr: number[] = [];
    let current = 2;
    for (let i = 0; i < size; i++) {
      current += Math.floor(Math.random() * 5) + 2;
      arr.push(current);
    }
    // Pick two random distinct indices
    const i = Math.floor(Math.random() * 4);
    const j = Math.floor(Math.random() * 4) + 5;
    const sum = arr[i] + arr[j];

    setTpArray(arr);
    setTpLeft(0);
    setTpRight(arr.length - 1);
    setTpTargetSum(sum);
    setFeedback(`Find two numbers that sum to ${sum}! Use L++ or R-- to adjust.`);
  }, []);

  // On mount or mode switch
  useEffect(() => {
    if (gameState.mode === 'binary_search') {
      initBsLevel(gameState.level);
    } else {
      initTpLevel();
    }
  }, [gameState.mode, gameState.level, initBsLevel, initTpLevel]);

  // Handle Binary Search Index Click
  const handleBsSlotClick = (idx: number) => {
    if (gameState.isGameOver || awaitingDecision !== null) return;

    // Check if slot is within current bounds [low, high]
    if (idx < bsLow || idx > bsHigh) {
      sounds.error();
      setFeedback(`Index [${idx}] is outside the active interval [${bsLow}, ${bsHigh}]!`);
      return;
    }

    const expectedMid = Math.floor((bsLow + bsHigh) / 2);
    if (idx === expectedMid) {
      sounds.insert();
      const updated = new Set(revealedIndices);
      updated.add(idx);
      setRevealedIndices(updated);
      setAwaitingDecision(idx);

      if (bsArray[idx] === bsTarget) {
        setFeedback(`Exact Match! Value at [${idx}] is ${bsArray[idx]}. Confirm to win round!`);
      } else {
        setFeedback(
          `Mid [${idx}] = ${bsArray[idx]}. Target is ${bsTarget}. Choose: Target is LESS or GREATER?`
        );
      }
    } else {
      sounds.error();
      const newLives = gameState.lives - 1;
      setFeedback(`Incorrect mid! (low: ${bsLow} + high: ${bsHigh}) / 2 = floor(${bsLow + bsHigh}/2) = ${expectedMid}`);
      if (newLives <= 0) {
        setGameState((s) => ({ ...s, lives: 0, isGameOver: true }));
      } else {
        setGameState((s) => ({ ...s, lives: newLives, combo: 1 }));
      }
    }
  };

  // Handle Binary Search Decision
  const handleDecision = (decision: 'less' | 'greater' | 'found') => {
    if (awaitingDecision === null) return;

    const midVal = bsArray[awaitingDecision];
    let correct = false;

    if (decision === 'found' && midVal === bsTarget) {
      correct = true;
    } else if (decision === 'less' && bsTarget < midVal) {
      correct = true;
    } else if (decision === 'greater' && bsTarget > midVal) {
      correct = true;
    }

    if (correct) {
      sounds.success();
      if (decision === 'found') {
        // Round Won!
        try {
          confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
        } catch {
          // ignore
        }
        const pts = 100 * gameState.combo;
        const nextLevel = gameState.level + 1;
        setGameState((s) => ({
          ...s,
          score: s.score + pts,
          combo: s.combo + 1,
          level: nextLevel,
        }));
        setFeedback(`Awesome! Found ${bsTarget} in optimal O(log n) steps! +${pts} pts`);
        setTimeout(() => {
          if (nextLevel > 5) {
            setGameState((s) => ({ ...s, isWon: true }));
          } else {
            initBsLevel(nextLevel);
          }
        }, 1200);
      } else if (decision === 'less') {
        const nextHigh = awaitingDecision - 1;
        setBsHigh(nextHigh);
        setAwaitingDecision(null);
        setFeedback(`Target is smaller than ${midVal}. Updated high = mid - 1 (${nextHigh}). Now pick next mid!`);
      } else {
        const nextLow = awaitingDecision + 1;
        setBsLow(nextLow);
        setAwaitingDecision(null);
        setFeedback(`Target is greater than ${midVal}. Updated low = mid + 1 (${nextLow}). Now pick next mid!`);
      }
    } else {
      sounds.error();
      const newLives = gameState.lives - 1;
      setFeedback(`Wrong decision! Mid value was ${midVal} while Target is ${bsTarget}.`);
      if (newLives <= 0) {
        setGameState((s) => ({ ...s, lives: 0, isGameOver: true }));
      } else {
        setGameState((s) => ({ ...s, lives: newLives, combo: 1 }));
      }
    }
  };

  // Two-Pointer controls
  const handleTpMove = (action: 'left_inc' | 'right_dec') => {
    if (gameState.isGameOver || tpLeft >= tpRight) return;

    let newL = tpLeft;
    let newR = tpRight;

    if (action === 'left_inc' && tpLeft + 1 < tpRight) {
      newL = tpLeft + 1;
      sounds.step();
      setTpLeft(newL);
    } else if (action === 'right_dec' && tpRight - 1 > tpLeft) {
      newR = tpRight - 1;
      sounds.step();
      setTpRight(newR);
    }

    const currentSum = tpArray[newL] + tpArray[newR];
    if (currentSum === tpTargetSum) {
      sounds.success();
      try {
        confetti({ particleCount: 50, spread: 50 });
      } catch {
        // ignore
      }
      const pts = 150 * gameState.combo;
      setGameState((s) => ({
        ...s,
        score: s.score + pts,
        combo: s.combo + 1,
      }));
      setFeedback(`BINGO! ${tpArray[newL]} + ${tpArray[newR]} = ${tpTargetSum}! +${pts} pts`);
      setTimeout(() => {
        initTpLevel();
      }, 1500);
    } else if (currentSum < tpTargetSum) {
      setFeedback(`Sum is ${currentSum} (< ${tpTargetSum}). Sum is too small: advance Left pointer (L++)!`);
    } else {
      setFeedback(`Sum is ${currentSum} (> ${tpTargetSum}). Sum is too large: retreat Right pointer (R--)!`);
    }
  };

  const handleRestart = () => {
    sounds.swap();
    setGameState({
      mode: 'binary_search',
      level: 1,
      score: 0,
      combo: 1,
      lives: 3,
      isGameOver: false,
      isWon: false,
    });
    initBsLevel(1);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6">
      {/* Top HUD */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-800">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Data Structure Game
          </span>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            <span>{gameState.mode === 'binary_search' ? 'Binary Search Speedrun' : 'Two-Pointer Target Finder'}</span>
          </h3>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
          <button
            onClick={() => {
              sounds.click();
              setGameState((s) => ({ ...s, mode: 'binary_search' }));
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              gameState.mode === 'binary_search'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Binary Search Mode
          </button>
          <button
            onClick={() => {
              sounds.click();
              setGameState((s) => ({ ...s, mode: 'two_pointer' }));
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              gameState.mode === 'two_pointer'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Two-Pointer Mode
          </button>
        </div>

        {/* Meters */}
        <div className="flex items-center gap-5 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">Score:</span>
            <span className="text-white font-bold tabular-nums">{gameState.score}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">Combo:</span>
            <span className="text-cyan-400 font-bold tabular-nums">{gameState.combo}x</span>
          </div>

          <div className="flex items-center gap-1">
            {[...Array(3)].map((_, i) => (
              <Heart
                key={i}
                className={`w-4 h-4 ${
                  i < gameState.lives ? 'text-rose-500 fill-rose-500' : 'text-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Game Stage */}
      {gameState.isGameOver ? (
        <div className="py-12 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-rose-950/60 border border-rose-800 flex items-center justify-center text-rose-400">
            <Heart className="w-7 h-7" />
          </div>
          <h4 className="text-xl font-bold text-white">Simulation Terminated</h4>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            You achieved a score of <span className="font-mono text-emerald-400 font-bold">{gameState.score}</span>.
            Review the logarithmic midpoint formula and try again!
          </p>
          <button
            onClick={handleRestart}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>
        </div>
      ) : gameState.isWon ? (
        <div className="py-12 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-amber-950/60 border border-amber-500 flex items-center justify-center text-amber-400">
            <Trophy className="w-8 h-8" />
          </div>
          <h4 className="text-2xl font-bold text-white">Algorithm Master!</h4>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Outstanding! You cleared all levels with a final score of{' '}
            <span className="font-mono text-amber-400 font-bold">{gameState.score}</span>.
          </p>
          <button
            onClick={handleRestart}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart Challenge</span>
          </button>
        </div>
      ) : gameState.mode === 'binary_search' ? (
        <div className="space-y-6">
          {/* Objective Banner */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center">
                <Target className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-xs text-slate-400">Target Value to Locate:</span>
                <div className="text-2xl font-mono font-black text-white">{bsTarget}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                low = <span className="text-emerald-400 font-bold">{bsLow}</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                high = <span className="text-rose-400 font-bold">{bsHigh}</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                Expected mid = <span className="text-cyan-400 font-bold">{Math.floor((bsLow + bsHigh) / 2)}</span>
              </div>
            </div>
          </div>

          {/* Interactive Array Slots */}
          <div className="overflow-x-auto py-4">
            <div className="flex items-center justify-center gap-2 min-w-[600px]">
              {bsArray.map((val, idx) => {
                const inRange = idx >= bsLow && idx <= bsHigh;
                const isRevealed = revealedIndices.has(idx);
                const isMid = awaitingDecision === idx;

                let slotStyle = 'bg-slate-800/80 border-slate-700 text-slate-400 cursor-pointer hover:border-slate-500';
                if (!inRange) {
                  slotStyle = 'bg-slate-950/40 border-slate-900 text-slate-700 opacity-30 cursor-not-allowed';
                } else if (isMid) {
                  slotStyle = 'bg-cyan-950/90 border-cyan-400 text-cyan-200 ring-2 ring-cyan-400 shadow-cyan-950/50 scale-105';
                } else if (isRevealed) {
                  slotStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleBsSlotClick(idx)}
                    disabled={!inRange || awaitingDecision !== null}
                    className={`w-12 h-16 sm:w-14 sm:h-18 rounded-xl border flex flex-col items-center justify-center transition-all duration-200 shadow ${slotStyle}`}
                  >
                    <span className="text-[10px] font-mono text-slate-500 mb-0.5">[{idx}]</span>
                    <span className="font-mono text-lg font-bold">
                      {isRevealed || isMid ? val : '?'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Decision Buttons (when mid is selected) */}
          {awaitingDecision !== null ? (
            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/60 animate-in fade-in space-y-3 text-center">
              <p className="text-xs font-semibold text-cyan-300">
                Mid value is <span className="font-mono font-bold text-white">{bsArray[awaitingDecision]}</span> · Target is <span className="font-mono font-bold text-white">{bsTarget}</span>
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => handleDecision('less')}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors"
                >
                  Target &lt; {bsArray[awaitingDecision]} (Go Left)
                </button>
                <button
                  onClick={() => handleDecision('found')}
                  className="px-5 py-2 text-xs font-bold text-emerald-100 bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-colors"
                >
                  <Check className="w-3.5 h-3.5 inline mr-1" />
                  Target == {bsArray[awaitingDecision]} (Found!)
                </button>
                <button
                  onClick={() => handleDecision('greater')}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors"
                >
                  Target &gt; {bsArray[awaitingDecision]} (Go Right)
                </button>
              </div>
            </div>
          ) : null}

          {/* Instruction / Live Feedback Banner */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2.5">
            <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs text-slate-300 font-medium">{feedback}</span>
          </div>
        </div>
      ) : (
        /* Two Pointer Game Mode */
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center">
                <Target className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-xs text-slate-400">Target Sum:</span>
                <div className="text-2xl font-mono font-black text-white">{tpTargetSum}</div>
              </div>
            </div>

            <div className="text-xs font-mono px-3 py-2 rounded-lg bg-slate-900 border border-slate-800">
              Current: arr[{tpLeft}] ({tpArray[tpLeft]}) + arr[{tpRight}] ({tpArray[tpRight]}) ={' '}
              <span className="text-amber-400 font-bold">
                {tpArray[tpLeft] + tpArray[tpRight]}
              </span>
            </div>
          </div>

          {/* Interactive Two-Pointer Array View */}
          <div className="overflow-x-auto py-4">
            <div className="flex items-center justify-center gap-2 min-w-[500px]">
              {tpArray.map((val, idx) => {
                const isLeft = tpLeft === idx;
                const isRight = tpRight === idx;

                let cellBg = 'bg-slate-800/80 border-slate-700 text-slate-300';
                if (isLeft) cellBg = 'bg-emerald-950 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400/50';
                if (isRight) cellBg = 'bg-rose-950 border-rose-400 text-rose-200 ring-2 ring-rose-400/50';

                return (
                  <div key={idx} className="flex flex-col items-center">
                    <div className="h-6 text-[11px] font-mono font-bold">
                      {isLeft && <span className="text-emerald-400">LEFT →</span>}
                      {isRight && <span className="text-rose-400">← RIGHT</span>}
                    </div>
                    <div
                      className={`w-12 h-16 sm:w-14 sm:h-18 rounded-xl border flex flex-col items-center justify-center shadow transition-all ${cellBg}`}
                    >
                      <span className="text-[10px] font-mono text-slate-500 mb-0.5">[{idx}]</span>
                      <span className="font-mono text-lg font-bold">{val}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Two-Pointer Navigation Buttons */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => handleTpMove('left_inc')}
              disabled={tpLeft + 1 >= tpRight}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700 text-emerald-200 text-xs font-semibold transition-colors disabled:opacity-40"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Advance Left (L++) [Sum Too Small]</span>
            </button>
            <button
              onClick={() => handleTpMove('right_dec')}
              disabled={tpRight - 1 <= tpLeft}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-700 text-rose-200 text-xs font-semibold transition-colors disabled:opacity-40"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Retreat Right (R--) [Sum Too Large]</span>
            </button>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2.5">
            <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs text-slate-300 font-medium">{feedback}</span>
          </div>
        </div>
      )}
    </div>
  );
};
