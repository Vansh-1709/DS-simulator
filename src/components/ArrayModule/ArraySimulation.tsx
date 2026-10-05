import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Trash2, Search, ArrowRightLeft, Shuffle, CheckCircle, Info } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface ArrayElement {
  id: string;
  val: number;
  highlight?: 'active' | 'comparing' | 'target' | 'success' | 'shifted' | 'low' | 'high' | 'mid';
}

export const ArraySimulation: React.FC = () => {
  const [array, setArray] = useState<ArrayElement[]>([
    { id: '1', val: 12 },
    { id: '2', val: 25 },
    { id: '3', val: 34 },
    { id: '4', val: 48 },
    { id: '5', val: 56 },
    { id: '6', val: 71 },
    { id: '7', val: 89 },
  ]);

  const [inputVal, setInputVal] = useState<number>(42);
  const [inputIdx, setInputIdx] = useState<number>(3);
  const [searchTarget, setSearchTarget] = useState<number>(56);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(600); // ms
  const [activePointers, setActivePointers] = useState<{ [key: string]: number }>({});
  const [codeLine, setCodeLine] = useState<string>('// Select an operation to inspect step-by-step');
  const [stats, setStats] = useState<{ comparisons: number; shifts: number; status: string }>({
    comparisons: 0,
    shifts: 0,
    status: 'Ready',
  });

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

  const resetHighlights = (arr: ArrayElement[] = array): ArrayElement[] => {
    return arr.map((item): ArrayElement => ({ ...item, highlight: undefined }));
  };

  const handleRandomize = () => {
    abortRef.current = true;
    setIsPlaying(false);
    sounds.swap();
    const count = 7;
    const newArr: ArrayElement[] = [];
    for (let i = 0; i < count; i++) {
      newArr.push({
        id: Math.random().toString(),
        val: Math.floor(Math.random() * 90) + 10,
      });
    }
    setArray(newArr);
    setActivePointers({});
    setCodeLine('// Generated new random contiguous array');
    setStats({ comparisons: 0, shifts: 0, status: 'Randomized' });
  };

  const handleSort = () => {
    sounds.swap();
    const sorted = [...array].sort((a, b) => a.val - b.val);
    setArray(resetHighlights(sorted));
    setCodeLine('// Array sorted in ascending order O(n log n)');
    setStats({ comparisons: 0, shifts: 0, status: 'Array Sorted' });
  };

  // Animated Insertion at Index
  const handleInsert = async () => {
    if (array.length >= 10) {
      sounds.error();
      setStats((s) => ({ ...s, status: 'Array reached visual capacity (10 elements)' }));
      return;
    }
    const idx = Math.max(0, Math.min(inputIdx, array.length));
    setIsPlaying(true);
    abortRef.current = false;
    setStats({ comparisons: 0, shifts: 0, status: `Inserting ${inputVal} at index [${idx}]...` });
    setCodeLine(`for (let i = n - 1; i >= ${idx}; i--) arr[i + 1] = arr[i]; // Shift right`);

    // Create copy with placeholder
    const current = [...array];
    sounds.click();

    // Visual shift step-by-step
    let shiftsCount = 0;
    for (let i = current.length - 1; i >= idx; i--) {
      if (abortRef.current) break;
      setActivePointers({ shift_from: i, shift_to: i + 1 });
      sounds.step();
      current[i].highlight = 'shifted';
      setArray([...current]);
      shiftsCount++;
      setStats((s) => ({ ...s, shifts: shiftsCount }));
      await delay(speed);
    }

    if (!abortRef.current) {
      sounds.insert();
      const newElem: ArrayElement = { id: Math.random().toString(), val: inputVal, highlight: 'success' };
      current.splice(idx, 0, newElem);
      setActivePointers({ inserted: idx });
      setCodeLine(`arr[${idx}] = ${inputVal}; // O(1) assignment after O(n) shifts`);
      setArray([...current]);
      setStats((s) => ({ ...s, status: `Successfully inserted ${inputVal} at index ${idx}` }));
      await delay(speed * 1.5);
      setArray(resetHighlights(current));
      setActivePointers({});
    }
    setIsPlaying(false);
  };

  // Animated Deletion at Index
  const handleDelete = async () => {
    if (array.length <= 2) {
      sounds.error();
      setStats((s) => ({ ...s, status: 'Minimum array size reached' }));
      return;
    }
    const idx = Math.max(0, Math.min(inputIdx, array.length - 1));
    setIsPlaying(true);
    abortRef.current = false;
    setStats({ comparisons: 0, shifts: 0, status: `Deleting element at index [${idx}]...` });
    sounds.remove();

    const current = [...array];
    current[idx].highlight = 'target';
    setArray([...current]);
    setActivePointers({ target: idx });
    setCodeLine(`deleted_val = arr[${idx}]; // Element targeted for deletion`);
    await delay(speed);

    // Shift left
    let shiftsCount = 0;
    for (let i = idx; i < current.length - 1; i++) {
      if (abortRef.current) break;
      sounds.step();
      setActivePointers({ shift_dest: i, shift_src: i + 1 });
      current[i] = { ...current[i + 1], highlight: 'shifted' };
      shiftsCount++;
      setStats((s) => ({ ...s, shifts: shiftsCount }));
      setCodeLine(`arr[${i}] = arr[${i + 1}]; // Left-shift element`);
      setArray([...current]);
      await delay(speed);
    }

    if (!abortRef.current) {
      sounds.success();
      current.pop();
      setArray(resetHighlights(current));
      setActivePointers({});
      setCodeLine(`n--; // Size decremented, contiguous memory preserved`);
      setStats((s) => ({ ...s, status: `Deleted index ${idx}. Total shifts: ${shiftsCount}` }));
    }
    setIsPlaying(false);
  };

  // Linear Search
  const handleLinearSearch = async () => {
    setIsPlaying(true);
    abortRef.current = false;
    let comparisons = 0;
    let found = false;

    setStats({ comparisons: 0, shifts: 0, status: `Linear searching for ${searchTarget}...` });
    setCodeLine(`for (let i = 0; i < arr.length; i++) { if (arr[i] === target) return i; }`);

    const current = resetHighlights();

    for (let i = 0; i < current.length; i++) {
      if (abortRef.current) break;
      comparisons++;
      setActivePointers({ i });
      current[i].highlight = 'comparing';
      setArray([...current]);
      setStats((s) => ({ ...s, comparisons }));
      sounds.step();
      await delay(speed);

      if (current[i].val === searchTarget) {
        current[i].highlight = 'success';
        setArray([...current]);
        sounds.success();
        found = true;
        setStats((s) => ({ ...s, status: `Target ${searchTarget} found at index ${i}!` }));
        setCodeLine(`return ${i}; // Target matched after ${comparisons} comparison(s)`);
        break;
      } else {
        current[i].highlight = undefined;
      }
    }

    if (!found && !abortRef.current) {
      sounds.error();
      setStats((s) => ({ ...s, status: `Target ${searchTarget} not found in array` }));
      setCodeLine(`return -1; // Target not found (Full O(n) scan)`);
    }

    setIsPlaying(false);
  };

  // Binary Search
  const handleBinarySearch = async () => {
    // Check if sorted
    const isSorted = array.every((item, i, arr) => i === 0 || item.val >= arr[i - 1].val);
    if (!isSorted) {
      sounds.error();
      setStats((s) => ({ ...s, status: 'Array must be sorted for Binary Search! Click "Sort Ascending".' }));
      return;
    }

    setIsPlaying(true);
    abortRef.current = false;
    let comparisons = 0;
    let low = 0;
    let high = array.length - 1;
    let found = false;

    setStats({ comparisons: 0, shifts: 0, status: `Binary searching for ${searchTarget}...` });
    const current = resetHighlights();

    while (low <= high) {
      if (abortRef.current) break;
      const mid = Math.floor((low + high) / 2);
      comparisons++;

      // Update highlights
      current.forEach((el, idx) => {
        if (idx < low || idx > high) {
          el.highlight = undefined;
        } else if (idx === mid) {
          el.highlight = 'mid';
        } else if (idx === low) {
          el.highlight = 'low';
        } else if (idx === high) {
          el.highlight = 'high';
        } else {
          el.highlight = 'comparing';
        }
      });

      setActivePointers({ low, mid, high });
      setArray([...current]);
      setStats((s) => ({ ...s, comparisons }));
      setCodeLine(`mid = Math.floor((${low} + ${high}) / 2) = ${mid}; // Checking arr[${mid}] = ${current[mid].val}`);
      sounds.step();
      await delay(speed * 1.2);

      if (current[mid].val === searchTarget) {
        sounds.success();
        current[mid].highlight = 'success';
        setArray([...current]);
        found = true;
        setStats((s) => ({ ...s, status: `Match! Target ${searchTarget} discovered at index ${mid} in ${comparisons} step(s)` }));
        setCodeLine(`return ${mid}; // O(log n) efficiency achieved!`);
        break;
      } else if (current[mid].val < searchTarget) {
        sounds.swap();
        setCodeLine(`arr[${mid}] (${current[mid].val}) < ${searchTarget} => Discard left half: low = mid + 1`);
        low = mid + 1;
      } else {
        sounds.swap();
        setCodeLine(`arr[${mid}] (${current[mid].val}) > ${searchTarget} => Discard right half: high = mid - 1`);
        high = mid - 1;
      }
      await delay(speed);
    }

    if (!found && !abortRef.current) {
      sounds.error();
      setStats((s) => ({ ...s, status: `Target ${searchTarget} does not exist in array` }));
      setCodeLine(`low > high (${low} > ${high}) => return -1; // Interval exhausted`);
    }

    setIsPlaying(false);
  };

  // Two-Pointer Reverse
  const handleTwoPointerReverse = async () => {
    setIsPlaying(true);
    abortRef.current = false;
    let left = 0;
    let right = array.length - 1;
    const current = resetHighlights();

    setStats({ comparisons: 0, shifts: 0, status: 'Reversing array using Two Pointers (Left & Right)...' });
    setCodeLine(`while (left < right) { swap(arr[left++], arr[right--]); }`);

    while (left < right) {
      if (abortRef.current) break;
      setActivePointers({ left, right });
      current[left].highlight = 'low';
      current[right].highlight = 'high';
      setArray([...current]);
      sounds.step();
      await delay(speed);

      // Swap
      sounds.swap();
      const temp = current[left];
      current[left] = current[right];
      current[right] = temp;
      current[left].highlight = 'success';
      current[right].highlight = 'success';
      setArray([...current]);
      setStats((s) => ({ ...s, shifts: s.shifts + 1 }));
      await delay(speed);

      left++;
      right--;
    }

    sounds.success();
    setActivePointers({});
    setArray(resetHighlights(current));
    setStats((s) => ({ ...s, status: 'Array reversed in O(n/2) = O(n) time, O(1) auxiliary space!' }));
    setCodeLine('// Reversal complete with two pointers');
    setIsPlaying(false);
  };

  return (
    <div className="space-y-6">
      {/* Visual Array Canvas */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        {/* Top Info Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-white">Contiguous Memory Array</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Length: <span className="font-mono text-emerald-400 font-semibold">{array.length}</span> ·
              Capacity: <span className="font-mono text-slate-300">10 slots</span> ·
              Base Address: <span className="font-mono text-slate-400">0x2000</span>
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Comparisons: </span>
              <span className="text-cyan-400 font-bold tabular-nums">{stats.comparisons}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Memory Shifts: </span>
              <span className="text-amber-400 font-bold tabular-nums">{stats.shifts}</span>
            </div>
          </div>
        </div>

        {/* Visual Cells Display */}
        <div className="py-6 overflow-x-auto">
          <div className="flex items-end justify-center gap-2 min-w-[500px]">
            {array.map((item, idx) => {
              const hexAddr = `0x${(0x2000 + idx * 4).toString(16).toUpperCase()}`;

              // Determine color based on highlight state
              let cellBg = 'bg-slate-800/90 border-slate-700 text-white';
              if (item.highlight === 'comparing') cellBg = 'bg-indigo-900/80 border-indigo-400 text-indigo-100 ring-2 ring-indigo-400/40';
              if (item.highlight === 'shifted') cellBg = 'bg-amber-950/80 border-amber-500 text-amber-200 ring-2 ring-amber-500/40';
              if (item.highlight === 'target') cellBg = 'bg-rose-950/80 border-rose-500 text-rose-200 ring-2 ring-rose-500/40';
              if (item.highlight === 'success') cellBg = 'bg-emerald-950/90 border-emerald-400 text-emerald-100 ring-2 ring-emerald-400/50 scale-105';
              if (item.highlight === 'mid') cellBg = 'bg-cyan-950/90 border-cyan-400 text-cyan-100 ring-2 ring-cyan-400/50 scale-105';
              if (item.highlight === 'low') cellBg = 'bg-emerald-900/70 border-emerald-400 text-emerald-200';
              if (item.highlight === 'high') cellBg = 'bg-rose-900/70 border-rose-400 text-rose-200';

              return (
                <div key={item.id} className="flex flex-col items-center group transition-all duration-200">
                  {/* Pointers Label */}
                  <div className="h-6 flex items-center justify-center text-[11px] font-mono font-bold tracking-tight">
                    {activePointers.i === idx && <span className="text-indigo-400">i ↓</span>}
                    {activePointers.low === idx && <span className="text-emerald-400">low ↓</span>}
                    {activePointers.mid === idx && <span className="text-cyan-400 font-black">MID ↓</span>}
                    {activePointers.high === idx && <span className="text-rose-400">high ↓</span>}
                    {activePointers.left === idx && <span className="text-emerald-400">left →</span>}
                    {activePointers.right === idx && <span className="text-rose-400">← right</span>}
                    {activePointers.inserted === idx && <span className="text-emerald-400">new ↓</span>}
                    {activePointers.target === idx && <span className="text-rose-400">del ↓</span>}
                  </div>

                  {/* Main Value Cell */}
                  <div
                    className={`w-14 h-16 sm:w-16 sm:h-18 rounded-xl border flex flex-col items-center justify-center transition-all duration-200 shadow-lg ${cellBg}`}
                  >
                    <span className="font-mono text-xl sm:text-2xl font-bold tracking-tight">{item.val}</span>
                  </div>

                  {/* Array Index */}
                  <div className="mt-2 text-center">
                    <span className="text-xs font-mono font-medium text-slate-400">[{idx}]</span>
                  </div>

                  {/* Memory Address */}
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">{hexAddr}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Callout & Live Pseudocode Line */}
        <div className="mt-4 p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-medium text-slate-200">{stats.status}</span>
          </div>
          <div className="font-mono text-xs text-indigo-300 bg-indigo-950/50 px-2.5 py-1 rounded border border-indigo-900/60 max-w-xl truncate">
            {codeLine}
          </div>
        </div>
      </div>

      {/* Interactive Controls Deck */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Panel 1: Insert & Delete Operations */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Insertion & Deletion
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Value</label>
              <input
                type="number"
                value={inputVal}
                onChange={(e) => setInputVal(Number(e.target.value))}
                disabled={isPlaying}
                className="w-full px-3 py-1.5 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Index [0-{array.length}]</label>
              <input
                type="number"
                min="0"
                max={array.length}
                value={inputIdx}
                onChange={(e) => setInputIdx(Number(e.target.value))}
                disabled={isPlaying}
                className="w-full px-3 py-1.5 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleInsert}
              disabled={isPlaying}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/80 rounded-lg transition-colors disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Insert at [{inputIdx}]</span>
            </button>
            <button
              onClick={handleDelete}
              disabled={isPlaying}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-300 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/80 rounded-lg transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete [{inputIdx}]</span>
            </button>
          </div>
        </div>

        {/* Panel 2: Search Algorithms */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Searching Algorithms
          </h4>
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Target Search Value</label>
            <input
              type="number"
              value={searchTarget}
              onChange={(e) => setSearchTarget(Number(e.target.value))}
              disabled={isPlaying}
              className="w-full px-3 py-1.5 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleLinearSearch}
              disabled={isPlaying}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-800/80 rounded-lg transition-colors disabled:opacity-50"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Linear O(n)</span>
            </button>
            <button
              onClick={handleBinarySearch}
              disabled={isPlaying}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/80 rounded-lg transition-colors disabled:opacity-50"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Binary O(log n)</span>
            </button>
          </div>
        </div>

        {/* Panel 3: Array Transformations & Speed */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Array Utilities & Playback
          </h4>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSort}
              disabled={isPlaying}
              className="flex-1 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors disabled:opacity-50"
            >
              Sort Ascending
            </button>
            <button
              onClick={handleTwoPointerReverse}
              disabled={isPlaying}
              className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors disabled:opacity-50"
            >
              <ArrowRightLeft className="w-3 h-3 text-amber-400" />
              <span>Two-Pointer Rev</span>
            </button>
          </div>
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              onClick={handleRandomize}
              disabled={isPlaying}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors disabled:opacity-50"
            >
              <Shuffle className="w-3.5 h-3.5 text-indigo-400" />
              <span>Randomize</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Speed</span>
              <input
                type="range"
                min="200"
                max="1200"
                step="100"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-20 accent-indigo-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
