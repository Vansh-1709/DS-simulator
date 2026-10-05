import React, { useState, useRef, useEffect } from 'react';
import { ArrowDown, ArrowUp, Eye, Trash2, CheckCircle2, XCircle, Play, RotateCcw } from 'lucide-react';
import { sounds } from '../../utils/audio';

export const StackSimulation: React.FC = () => {
  const [stack, setStack] = useState<number[]>([15, 30, 45, 60]);
  const [pushVal, setPushVal] = useState<number>(75);
  const [peekActive, setPeekActive] = useState<boolean>(false);
  const [capacity] = useState<number>(7);
  const [status, setStatus] = useState<string>('Stack operates on LIFO (Last-In, First-Out)');

  // Parentheses validator state
  const [parenString, setParenString] = useState<string>('{[()]}');
  const [parenStack, setParenStack] = useState<string[]>([]);
  const [parenActiveIdx, setParenActiveIdx] = useState<number>(-1);
  const [parenResult, setParenResult] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  const abortRef = useRef<boolean>(false);

  useEffect(() => {
    return () => {
      abortRef.current = true;
    };
  }, []);

  const delay = (ms: number) =>
    new Promise((resolve) => {
      const t = setTimeout(resolve, ms);
      if (abortRef.current) clearTimeout(t);
    });

  const handlePush = () => {
    if (stack.length >= capacity) {
      sounds.error();
      setStatus('Stack Overflow! Capacity limit (7) reached.');
      return;
    }
    sounds.insert();
    setStack((prev) => [...prev, pushVal]);
    setPeekActive(false);
    setStatus(`Pushed [${pushVal}] onto top of stack. O(1) time complexity.`);
    setPushVal((v) => v + 15);
  };

  const handlePop = () => {
    if (stack.length === 0) {
      sounds.error();
      setStatus('Stack Underflow! Cannot pop from an empty stack.');
      return;
    }
    sounds.remove();
    const popped = stack[stack.length - 1];
    setStack((prev) => prev.slice(0, prev.length - 1));
    setPeekActive(false);
    setStatus(`Popped [${popped}] from top of stack. O(1) time complexity.`);
  };

  const handlePeek = () => {
    if (stack.length === 0) {
      sounds.error();
      setStatus('Stack is empty. Nothing to peek.');
      return;
    }
    sounds.step();
    setPeekActive(true);
    const top = stack[stack.length - 1];
    setStatus(`Top element (TOS) is [${top}]. No elements removed.`);
    setTimeout(() => setPeekActive(false), 2000);
  };

  const handleClear = () => {
    sounds.swap();
    setStack([]);
    setPeekActive(false);
    setStatus('Stack cleared');
  };

  // Run Parenthesis Check simulation
  const handleValidateParentheses = async () => {
    setIsEvaluating(true);
    abortRef.current = false;
    setParenStack([]);
    setParenActiveIdx(-1);
    setParenResult(null);

    const s = parenString.trim();
    const tempStack: string[] = [];
    const pairs: { [key: string]: string } = { ')': '(', ']': '[', '}': '{' };

    for (let i = 0; i < s.length; i++) {
      if (abortRef.current) break;
      const char = s[i];
      setParenActiveIdx(i);

      if (char === '(' || char === '[' || char === '{') {
        sounds.insert();
        tempStack.push(char);
        setParenStack([...tempStack]);
        setStatus(`Encountered opening bracket '${char}' => PUSH onto call stack.`);
      } else if (char === ')' || char === ']' || char === '}') {
        sounds.step();
        if (tempStack.length === 0) {
          sounds.error();
          setParenResult('Invalid! Closing bracket found with empty stack.');
          setIsEvaluating(false);
          return;
        }
        const top = tempStack.pop()!;
        setParenStack([...tempStack]);
        if (top !== pairs[char]) {
          sounds.error();
          setParenResult(`Mismatch! Popped '${top}' does not match closing '${char}'.`);
          setIsEvaluating(false);
          return;
        }
        setStatus(`Matched '${top}' with '${char}' => Valid pair cleared.`);
      }
      await delay(600);
    }

    if (!abortRef.current) {
      if (tempStack.length === 0) {
        sounds.success();
        setParenResult('Valid Parentheses! Stack cleanly emptied.');
      } else {
        sounds.error();
        setParenResult('Invalid! Unmatched opening brackets left on stack.');
      }
    }
    setIsEvaluating(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Visual Stack Cylinder */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-semibold text-white">Stack Memory Cylinder</h3>
                <span className="text-xs text-slate-400">
                  Size: <span className="font-mono text-cyan-400 font-bold">{stack.length}</span> / {capacity}
                </span>
              </div>
              <button
                onClick={handleClear}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-900 rounded transition-colors"
              >
                Clear
              </button>
            </div>

            {/* Vertical Stack Frame */}
            <div className="py-2 flex items-center justify-center">
              <div className="w-56 h-[300px] border-b-4 border-x-4 border-slate-700 rounded-b-2xl bg-slate-950/70 p-3 flex flex-col-reverse gap-2 relative shadow-inner">
                {stack.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-600 font-mono italic">
                    Stack is Empty
                  </div>
                ) : (
                  stack.map((val, idx) => {
                    const isTop = idx === stack.length - 1;
                    return (
                      <div
                        key={idx}
                        className={`h-9 rounded-lg border flex items-center justify-between px-3 transition-all duration-300 shadow ${
                          isTop
                            ? peekActive
                              ? 'bg-cyan-950 border-cyan-400 text-cyan-200 ring-2 ring-cyan-400'
                              : 'bg-indigo-950/90 border-indigo-400 text-indigo-100'
                            : 'bg-slate-800/90 border-slate-700 text-slate-300'
                        }`}
                      >
                        <span className="text-[10px] font-mono text-slate-400">#{idx}</span>
                        <span className="font-mono font-bold text-sm">{val}</span>
                        <span className="text-[10px] font-mono text-cyan-400 font-semibold">
                          {isTop ? 'TOS ←' : ''}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Interactive Stack Action Buttons */}
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={pushVal}
                onChange={(e) => setPushVal(Number(e.target.value))}
                className="w-24 px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
              <button
                onClick={handlePush}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors shadow-sm"
              >
                <ArrowDown className="w-3.5 h-3.5" />
                <span>Push( {pushVal} )</span>
              </button>
              <button
                onClick={handlePop}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-200 font-semibold text-xs transition-colors"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>Pop()</span>
              </button>
              <button
                onClick={handlePeek}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-400">{status}</p>
          </div>
        </div>

        {/* Right Column: Real-World Use Case: Parenthesis & Call Stack Visualizer */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="pb-3 mb-4 border-b border-slate-800">
              <h3 className="text-base font-semibold text-white">Syntax Parser & Call Frame Simulator</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Every compiler checks balanced delimiters using a Stack.
              </p>
            </div>

            {/* Expression Input */}
            <div className="space-y-3">
              <label className="text-xs text-slate-400 block">Expression to Validate</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={parenString}
                  onChange={(e) => setParenString(e.target.value)}
                  disabled={isEvaluating}
                  className="flex-1 px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-cyan-300 font-mono tracking-wider focus:border-cyan-500 focus:outline-none"
                />
                <button
                  onClick={handleValidateParentheses}
                  disabled={isEvaluating}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Parse</span>
                </button>
              </div>

              {/* Presets */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Presets:</span>
                {['{[()]}', '({[]})', '((())', '[(])'].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setParenString(preset)}
                    disabled={isEvaluating}
                    className="font-mono px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Token Stream */}
            <div className="mt-6">
              <span className="text-xs text-slate-400 block mb-2">Token Stream Scanning:</span>
              <div className="flex items-center gap-2 overflow-x-auto py-2">
                {parenString.split('').map((char, idx) => (
                  <div
                    key={idx}
                    className={`w-9 h-11 rounded-lg border font-mono text-lg font-bold flex items-center justify-center transition-all ${
                      parenActiveIdx === idx
                        ? 'bg-cyan-950 border-cyan-400 text-cyan-200 ring-2 ring-cyan-400 scale-110'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {char}
                  </div>
                ))}
              </div>
            </div>

            {/* Parser Stack State */}
            <div className="mt-4">
              <span className="text-xs text-slate-400 block mb-2">Parser Stack (Open Delimiters):</span>
              <div className="flex items-center gap-2 min-h-[44px] p-2 bg-slate-950 rounded-lg border border-slate-800">
                {parenStack.length === 0 ? (
                  <span className="text-xs text-slate-600 font-mono italic">Stack is Empty</span>
                ) : (
                  parenStack.map((item, idx) => (
                    <div
                      key={idx}
                      className="w-8 h-8 rounded bg-cyan-950 border border-cyan-700 text-cyan-300 font-mono font-bold flex items-center justify-center"
                    >
                      {item}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Validation Verdict */}
          {parenResult && (
            <div
              className={`mt-4 p-3 rounded-lg border flex items-center gap-2.5 ${
                parenResult.includes('Valid')
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-800 text-rose-300'
              }`}
            >
              {parenResult.includes('Valid') ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span className="text-xs font-semibold">{parenResult}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
