import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Zap, Heart, RotateCcw, ArrowDown, ArrowUp, HelpCircle, Layers } from 'lucide-react';
import { sounds } from '../../utils/audio';

export const StackGame: React.FC = () => {
  const [tokens, setTokens] = useState<string[]>(['(', '{', '}', ')']);
  const [tokenIdx, setTokenIdx] = useState<number>(0);
  const [stack, setStack] = useState<string[]>([]);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(1);
  const [lives, setLives] = useState<number>(3);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>('Examine the incoming token: Push opening brackets, Pop to match closing ones!');

  const matches: { [key: string]: string } = {
    ')': '(',
    ']': '[',
    '}': '{',
  };

  const isOpening = (char: string) => char === '(' || char === '[' || char === '{';

  const generateStream = (level: number) => {
    // Generate valid balanced expressions with occasional trick
    const presets = [
      ['(', '[', ']', ')'],
      ['{', '(', ')', '}', '['],
      ['(', '{', '[', ']', '}', ')'],
      ['[', '(', ')', ']', '{', '}'],
      ['{', '[', '(', ')', ']', '}'],
    ];
    const stream = presets[Math.floor(Math.random() * presets.length)];
    setTokens(stream);
    setTokenIdx(0);
    setStack([]);
    setFeedback(`New token stream arriving! Token: '${stream[0]}'`);
  };

  useEffect(() => {
    generateStream(1);
  }, []);

  const handleAction = (action: 'push' | 'pop') => {
    if (isGameOver || tokenIdx >= tokens.length) return;
    const currentToken = tokens[tokenIdx];

    if (action === 'push') {
      if (isOpening(currentToken)) {
        if (stack.length >= 6) {
          sounds.error();
          setFeedback('Stack Overflow! Capacity exhausted.');
          const newLives = lives - 1;
          if (newLives <= 0) setIsGameOver(true);
          else {
            setLives(newLives);
            setCombo(1);
          }
          return;
        }
        sounds.insert();
        setStack((prev) => [...prev, currentToken]);
        advanceToken(100);
      } else {
        sounds.error();
        setFeedback(`Token '${currentToken}' is a closing bracket! Closing brackets must POP & match, not push.`);
        const newLives = lives - 1;
        if (newLives <= 0) setIsGameOver(true);
        else {
          setLives(newLives);
          setCombo(1);
        }
      }
    } else if (action === 'pop') {
      if (!isOpening(currentToken)) {
        if (stack.length === 0) {
          sounds.error();
          setFeedback('Stack Underflow! Tried to pop matching bracket from an empty stack.');
          const newLives = lives - 1;
          if (newLives <= 0) setIsGameOver(true);
          else {
            setLives(newLives);
            setCombo(1);
          }
          return;
        }

        const top = stack[stack.length - 1];
        if (top === matches[currentToken]) {
          sounds.success();
          setStack((prev) => prev.slice(0, prev.length - 1));
          advanceToken(150);
        } else {
          sounds.error();
          setFeedback(`Mismatch! Stack top was '${top}', which doesn't match '${currentToken}'.`);
          const newLives = lives - 1;
          if (newLives <= 0) setIsGameOver(true);
          else {
            setLives(newLives);
            setCombo(1);
          }
        }
      } else {
        sounds.error();
        setFeedback(`Token '${currentToken}' is an opening bracket! You must PUSH it onto the stack.`);
        const newLives = lives - 1;
        if (newLives <= 0) setIsGameOver(true);
        else {
          setLives(newLives);
          setCombo(1);
        }
      }
    }
  };

  const advanceToken = (basePoints: number) => {
    const pts = basePoints * combo;
    setScore((s) => s + pts);
    setCombo((c) => c + 1);

    const nextIdx = tokenIdx + 1;
    if (nextIdx >= tokens.length) {
      // Completed current stream
      try {
        confetti({ particleCount: 50, spread: 60 });
      } catch {
        // ignore
      }
      setFeedback('Stream successfully balanced and validated! Next challenge loading...');
      setTimeout(() => {
        generateStream(2);
      }, 1200);
    } else {
      setTokenIdx(nextIdx);
      setFeedback(`Correct! Next token: '${tokens[nextIdx]}'.`);
    }
  };

  const handleRestart = () => {
    sounds.swap();
    setScore(0);
    setCombo(1);
    setLives(3);
    setIsGameOver(false);
    generateStream(1);
  };

  const activeToken = tokens[tokenIdx];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6">
      {/* Top HUD */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-800">
        <div>
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            LIFO Arcade Challenge
          </span>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>Cargo LIFO & Bracket Equalizer</span>
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
          <h4 className="text-xl font-bold text-white">Stack Frame Corrupted</h4>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            You achieved <span className="font-mono text-cyan-400 font-bold">{score}</span> points.
            Push open delimiters and match the most recently pushed with incoming closing tags!
          </p>
          <button
            onClick={handleRestart}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Incoming Token Belt */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-950/80 border-2 border-cyan-400 text-cyan-200 font-mono text-3xl font-black flex items-center justify-center shadow-lg shadow-cyan-950/50">
                {activeToken || '✓'}
              </div>
              <div>
                <span className="text-xs text-slate-400">Current Incoming Token:</span>
                <div className="text-sm font-semibold text-white">
                  {isOpening(activeToken) ? 'Opening Delimiter' : 'Closing Delimiter'}
                </div>
              </div>
            </div>

            {/* Stream Queue */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-mono">Upcoming:</span>
              <div className="flex items-center gap-1.5">
                {tokens.slice(tokenIdx + 1).map((tok, i) => (
                  <span
                    key={i}
                    className="w-8 h-8 rounded bg-slate-800 border border-slate-700 font-mono text-xs font-bold text-slate-400 flex items-center justify-center"
                  >
                    {tok}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Active Stack Container Display */}
          <div className="flex items-center justify-center py-4">
            <div className="w-64 h-52 border-b-4 border-x-4 border-slate-700 rounded-b-2xl bg-slate-950/60 p-3 flex flex-col-reverse gap-2 shadow-inner">
              {stack.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-600 font-mono italic">
                  Stack is Empty
                </div>
              ) : (
                stack.map((item, idx) => (
                  <div
                    key={idx}
                    className="h-9 rounded-lg bg-cyan-950/90 border border-cyan-500 text-cyan-100 font-mono font-bold flex items-center justify-between px-3"
                  >
                    <span className="text-xs text-cyan-500">[{idx}]</span>
                    <span className="text-lg">{item}</span>
                    <span className="text-xs text-cyan-400 font-mono">
                      {idx === stack.length - 1 ? 'TOP' : ''}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Player Choice Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => handleAction('push')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-lg shadow-cyan-950/40 transition-all hover:scale-105"
            >
              <ArrowDown className="w-4 h-4" />
              <span>PUSH to Stack</span>
            </button>
            <button
              onClick={() => handleAction('pop')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-sm transition-all hover:scale-105"
            >
              <ArrowUp className="w-4 h-4 text-rose-400" />
              <span>POP & Match Top</span>
            </button>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2.5">
            <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-xs text-slate-300 font-medium">{feedback}</span>
          </div>
        </div>
      )}
    </div>
  );
};
