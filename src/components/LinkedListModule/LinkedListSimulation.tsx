import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Plus, Trash2, RotateCcw, Shuffle, Sparkles, AlertCircle } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface NodeData {
  id: string;
  val: number;
  highlight?: 'active' | 'slow' | 'fast' | 'cycle' | 'new';
}

export const LinkedListSimulation: React.FC = () => {
  const [nodes, setNodes] = useState<NodeData[]>([
    { id: '1', val: 14 },
    { id: '2', val: 28 },
    { id: '3', val: 42 },
    { id: '4', val: 56 },
  ]);
  const [isDoubly, setIsDoubly] = useState<boolean>(false);
  const [inputVal, setInputVal] = useState<number>(35);
  const [inputIdx, setInputIdx] = useState<number>(2);
  const [hasCycle, setHasCycle] = useState<boolean>(false);
  const [isReversing, setIsReversing] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('Linked nodes store value and pointer reference to next node');

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

  // Insert at Head
  const handleInsertHead = () => {
    if (nodes.length >= 7) {
      sounds.error();
      setStatus('Visual limit reached (7 nodes)');
      return;
    }
    sounds.insert();
    const newNode: NodeData = { id: Math.random().toString(), val: inputVal, highlight: 'new' };
    setNodes([newNode, ...nodes]);
    setStatus(`Inserted [${inputVal}] at Head in O(1) constant time! No element shifting required.`);
    setInputVal((v) => v + 7);
    setTimeout(() => {
      setNodes((current) => current.map((n) => ({ ...n, highlight: undefined })));
    }, 1000);
  };

  // Insert at Tail
  const handleInsertTail = () => {
    if (nodes.length >= 7) {
      sounds.error();
      setStatus('Visual limit reached (7 nodes)');
      return;
    }
    sounds.insert();
    const newNode: NodeData = { id: Math.random().toString(), val: inputVal, highlight: 'new' };
    setNodes([...nodes, newNode]);
    setStatus(`Appended [${inputVal}] at Tail. O(1) if tail pointer is maintained.`);
    setInputVal((v) => v + 7);
    setTimeout(() => {
      setNodes((current) => current.map((n) => ({ ...n, highlight: undefined })));
    }, 1000);
  };

  // Delete Head
  const handleDeleteHead = () => {
    if (nodes.length <= 1) {
      sounds.error();
      setStatus('Cannot empty list below 1 node');
      return;
    }
    sounds.remove();
    const removedVal = nodes[0].val;
    setNodes(nodes.slice(1));
    setStatus(`Deleted Head [${removedVal}] in O(1) time. Head pointer re-assigned.`);
  };

  // Reverse list animated
  const handleReverse = async () => {
    if (nodes.length <= 1) return;
    setIsReversing(true);
    abortRef.current = false;
    setStatus('Reversing list using three pointers: prev, curr, next...');

    const current = [...nodes];
    for (let i = 0; i < current.length; i++) {
      if (abortRef.current) break;
      sounds.step();
      current[i].highlight = 'active';
      setNodes([...current]);
      setStatus(`Node #${i} [${current[i].val}]: Inverting next pointer`);
      await delay(500);
    }

    if (!abortRef.current) {
      sounds.success();
      setNodes(current.reverse().map((n) => ({ ...n, highlight: undefined })));
      setStatus('List completely reversed in O(n) time, O(1) auxiliary space!');
    }
    setIsReversing(false);
  };

  // Toggle Cycle & Floyd's Tortoise and Hare
  const handleFloydsCycleDemo = async () => {
    if (nodes.length < 4) return;
    setIsReversing(true);
    abortRef.current = false;
    setHasCycle(true);
    setStatus("Cycle injected! Running Floyd's Tortoise & Hare Cycle Detection (Slow = 1x, Fast = 2x)...");

    let slow = 0;
    let fast = 0;
    const n = nodes.length;

    for (let step = 0; step < 8; step++) {
      if (abortRef.current) break;
      slow = (slow + 1) % n;
      fast = (fast + 2) % n;

      sounds.step();
      setNodes((prev) =>
        prev.map((item, idx) => {
          if (idx === slow && idx === fast) return { ...item, highlight: 'cycle' };
          if (idx === slow) return { ...item, highlight: 'slow' };
          if (idx === fast) return { ...item, highlight: 'fast' };
          return { ...item, highlight: undefined };
        })
      );
      setStatus(`Step ${step + 1}: Tortoise at Node #${slow}, Hare at Node #${fast}`);
      await delay(700);

      if (slow === fast) {
        sounds.success();
        setStatus(`Cycle Confirmed! Fast pointer met Slow pointer at Node #${slow}!`);
        break;
      }
    }

    setIsReversing(false);
  };

  const handleReset = () => {
    sounds.swap();
    setHasCycle(false);
    setNodes([
      { id: '1', val: 14 },
      { id: '2', val: 28 },
      { id: '3', val: 42 },
      { id: '4', val: 56 },
    ]);
    setStatus('Reset Linked List');
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6">
        {/* Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-white">Dynamic Pointer Chain</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Node Count: <span className="font-mono text-rose-400 font-bold">{nodes.length}</span> ·
              Architecture: <span className="font-mono text-slate-300">{isDoubly ? 'Doubly Linked' : 'Singly Linked'}</span> ·
              Cycle Detected: <span className="font-mono text-amber-400">{hasCycle ? 'Yes (Loop active)' : 'None (Terminates at NULL)'}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sounds.click();
                setIsDoubly(!isDoubly);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              {isDoubly ? 'Switch to Singly Linked' : 'Switch to Doubly Linked'}
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-rose-400 border border-slate-800 rounded transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Visual Linked Nodes Strip */}
        <div className="py-6 overflow-x-auto">
          <div className="flex items-center justify-start sm:justify-center gap-2 min-w-[620px] px-2">
            {/* Head Pointer indicator */}
            <div className="flex flex-col items-center mr-1">
              <span className="text-[10px] font-mono font-bold text-emerald-400">HEAD</span>
              <div className="w-1.5 h-6 bg-emerald-500 rounded my-1"></div>
            </div>

            {nodes.map((node, idx) => {
              let nodeBorder = 'border-slate-700 bg-slate-800/90 text-white';
              if (node.highlight === 'slow') nodeBorder = 'border-cyan-400 bg-cyan-950 text-cyan-200 ring-2 ring-cyan-400';
              if (node.highlight === 'fast') nodeBorder = 'border-amber-400 bg-amber-950 text-amber-200 ring-2 ring-amber-400';
              if (node.highlight === 'cycle') nodeBorder = 'border-emerald-400 bg-emerald-950 text-emerald-200 ring-4 ring-emerald-400 scale-105';
              if (node.highlight === 'active') nodeBorder = 'border-rose-400 bg-rose-950 text-rose-200 ring-2 ring-rose-400';
              if (node.highlight === 'new') nodeBorder = 'border-emerald-400 bg-emerald-950 text-emerald-200 ring-2 ring-emerald-400';

              return (
                <React.Fragment key={node.id}>
                  {/* Node Box */}
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-mono text-slate-500 mb-1">Node #{idx}</span>
                    <div
                      className={`h-16 rounded-xl border flex overflow-hidden shadow-lg transition-all duration-200 ${nodeBorder}`}
                    >
                      {/* Optional Prev Pointer for Doubly */}
                      {isDoubly && (
                        <div className="w-8 border-r border-slate-700/80 bg-slate-900/60 flex items-center justify-center font-mono text-[10px] text-slate-400">
                          {idx === 0 ? 'null' : 'prev'}
                        </div>
                      )}

                      {/* Node Data Field */}
                      <div className="w-14 sm:w-16 flex items-center justify-center font-mono text-xl font-bold">
                        {node.val}
                      </div>

                      {/* Node Next Pointer Field */}
                      <div className="w-8 border-l border-slate-700/80 bg-slate-900/60 flex items-center justify-center font-mono text-[10px] text-rose-400 font-bold">
                        *next
                      </div>
                    </div>

                    {/* Floy's Pointers Tags */}
                    <div className="h-5 text-[10px] font-mono font-bold mt-1">
                      {node.highlight === 'slow' && <span className="text-cyan-400">SLOW (1x)</span>}
                      {node.highlight === 'fast' && <span className="text-amber-400">FAST (2x)</span>}
                      {node.highlight === 'cycle' && <span className="text-emerald-400">INTERSECT!</span>}
                    </div>
                  </div>

                  {/* Pointer Arrow to next node */}
                  {idx < nodes.length - 1 ? (
                    <div className="flex flex-col items-center justify-center px-1">
                      <div className="flex items-center text-rose-400">
                        <div className="w-4 sm:w-6 h-0.5 bg-rose-500"></div>
                        <span className="text-sm font-bold -ml-1">►</span>
                      </div>
                      {isDoubly && (
                        <div className="flex items-center text-slate-400 -mt-1">
                          <span className="text-sm font-bold -mr-1">◄</span>
                          <div className="w-4 sm:w-6 h-0.5 bg-slate-500"></div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Tail Pointer or Cycle Back Loop */
                    <div className="flex items-center text-slate-500 px-2 font-mono text-xs">
                      {hasCycle ? (
                        <div className="flex items-center text-amber-400 gap-1 font-bold">
                          <span>⤴ loop → [#0]</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-0.5 bg-slate-600"></div>
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-slate-400">
                            NULL
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Live Status */}
        <div className="mt-4 p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
          <span className="text-xs font-medium text-slate-300">{status}</span>
        </div>
      </div>

      {/* Control Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Insert Actions */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Insertion Operations
          </h4>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={inputVal}
              onChange={(e) => setInputVal(Number(e.target.value))}
              disabled={isReversing}
              className="w-24 px-3 py-1.5 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:border-rose-500 focus:outline-none"
            />
            <button
              onClick={handleInsertHead}
              disabled={isReversing}
              className="flex-1 px-3 py-2 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-700 text-rose-200 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              Insert Head O(1)
            </button>
            <button
              onClick={handleInsertTail}
              disabled={isReversing}
              className="flex-1 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              Insert Tail
            </button>
          </div>
        </div>

        {/* Delete Actions */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Deletion Operations
          </h4>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDeleteHead}
              disabled={isReversing}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Head O(1)</span>
            </button>
          </div>
        </div>

        {/* Advanced Algorithms */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Pointer Algorithms
          </h4>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReverse}
              disabled={isReversing}
              className="flex-1 px-3 py-2 rounded-lg bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-800 text-indigo-300 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              Reverse List
            </button>
            <button
              onClick={handleFloydsCycleDemo}
              disabled={isReversing}
              className="flex-1 px-3 py-2 rounded-lg bg-amber-950/60 hover:bg-amber-900 border border-amber-800 text-amber-300 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              Detect Cycle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
