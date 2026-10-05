import React, { useState } from 'react';
import { ArrowRight, LogIn, LogOut, RotateCcw, Eye, CircleDot } from 'lucide-react';
import { sounds } from '../../utils/audio';

export const QueueSimulation: React.FC = () => {
  const [mode, setMode] = useState<'linear' | 'circular'>('circular');
  // Circular buffer parameters
  const capacity = 6;
  const [buffer, setBuffer] = useState<(number | null)[]>([10, 20, 30, null, null, null]);
  const [front, setFront] = useState<number>(0);
  const [rear, setRear] = useState<number>(2);
  const [count, setCount] = useState<number>(3);
  const [inputVal, setInputVal] = useState<number>(40);
  const [status, setStatus] = useState<string>('FIFO: Elements are enqueued at Rear and dequeued from Front');

  // Enqueue
  const handleEnqueue = () => {
    if (count >= capacity) {
      sounds.error();
      setStatus('Queue Full! Enqueue rejected (buffer overflow).');
      return;
    }
    sounds.insert();
    const nextRear = (rear + 1) % capacity;
    const newBuffer = [...buffer];
    newBuffer[nextRear] = inputVal;

    setBuffer(newBuffer);
    setRear(nextRear);
    setCount(count + 1);
    setStatus(`Enqueued [${inputVal}] at rear index [${nextRear}]. Formula: rear = (rear + 1) % ${capacity}`);
    setInputVal((v) => v + 10);
  };

  // Dequeue
  const handleDequeue = () => {
    if (count === 0) {
      sounds.error();
      setStatus('Queue Empty! Cannot dequeue from an empty queue.');
      return;
    }
    sounds.remove();
    const dequeuedVal = buffer[front];
    const newBuffer = [...buffer];
    newBuffer[front] = null;

    const nextFront = (front + 1) % capacity;
    setBuffer(newBuffer);
    setFront(nextFront);
    setCount(count - 1);
    setStatus(`Dequeued [${dequeuedVal}] from front index [${front}]. Formula: front = (front + 1) % ${capacity}`);
  };

  const handleClear = () => {
    sounds.swap();
    setBuffer([null, null, null, null, null, null]);
    setFront(0);
    setRear(-1);
    setCount(0);
    setStatus('Queue cleared');
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6">
        {/* Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-white">Queue & Circular Ring Buffer</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Size: <span className="font-mono text-violet-400 font-bold">{count}</span> / {capacity} ·
              Front Pointer: <span className="font-mono text-emerald-400">[{front}]</span> ·
              Rear Pointer: <span className="font-mono text-rose-400">[{rear >= 0 ? rear : 'none'}]</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sounds.click();
                setMode(mode === 'circular' ? 'linear' : 'circular');
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              Switch to {mode === 'circular' ? 'Linear Strip' : 'Circular Ring'}
            </button>
            <button
              onClick={handleClear}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-rose-400 border border-slate-800 rounded transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Circular Ring SVG Display */}
        {mode === 'circular' ? (
          <div className="py-4 flex flex-col items-center justify-center">
            <div className="relative w-72 h-72">
              <svg viewBox="0 0 300 300" className="w-full h-full select-none">
                {/* Background Ring Track */}
                <circle cx="150" cy="150" r="100" fill="none" stroke="#1E293B" strokeWidth="36" />

                {/* Ring Slots */}
                {buffer.map((val, idx) => {
                  const angle = (idx * (360 / capacity) - 90) * (Math.PI / 180);
                  const x = 150 + 100 * Math.cos(angle);
                  const y = 150 + 100 * Math.sin(angle);

                  const isFront = count > 0 && front === idx;
                  const isRear = count > 0 && rear === idx;

                  let stroke = '#334155';
                  let fill = '#0F172A';
                  if (val !== null) {
                    fill = '#581C87'; // Purple
                    stroke = '#A855F7';
                  }

                  return (
                    <g key={idx}>
                      {/* Slot Node */}
                      <circle
                        cx={x}
                        cy={y}
                        r="22"
                        fill={fill}
                        stroke={stroke}
                        strokeWidth="2.5"
                        className="transition-all duration-300"
                      />
                      <text
                        x={x}
                        y={y + 5}
                        textAnchor="middle"
                        fill={val !== null ? '#F3E8FF' : '#475569'}
                        fontSize="14"
                        fontWeight="bold"
                        fontFamily="JetBrains Mono"
                      >
                        {val !== null ? val : '—'}
                      </text>

                      {/* Index Label */}
                      <text
                        x={150 + 130 * Math.cos(angle)}
                        y={150 + 130 * Math.sin(angle) + 4}
                        textAnchor="middle"
                        fill="#64748B"
                        fontSize="11"
                        fontFamily="JetBrains Mono"
                      >
                        [{idx}]
                      </text>
                    </g>
                  );
                })}

                {/* Center Hub Metrics */}
                <circle cx="150" cy="150" r="50" fill="#090D16" stroke="#1E293B" strokeWidth="2" />
                <text x="150" y="145" textAnchor="middle" fill="#94A3B8" fontSize="11" fontFamily="JetBrains Mono">
                  OCCUPIED
                </text>
                <text x="150" y="165" textAnchor="middle" fill="#C084FC" fontSize="18" fontWeight="bold" fontFamily="JetBrains Mono">
                  {count} / {capacity}
                </text>
              </svg>
            </div>

            {/* Pointers Indicator */}
            <div className="flex items-center gap-6 mt-4 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span className="text-slate-400">Front (Dequeue):</span>
                <span className="text-emerald-400 font-bold">[{front}]</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                <span className="text-slate-400">Rear (Enqueue):</span>
                <span className="text-rose-400 font-bold">[{rear >= 0 ? rear : 'none'}]</span>
              </div>
            </div>
          </div>
        ) : (
          /* Linear Queue View */
          <div className="py-8 overflow-x-auto">
            <div className="flex items-center justify-center gap-3 min-w-[500px]">
              {buffer.map((val, idx) => {
                const isFront = count > 0 && front === idx;
                const isRear = count > 0 && rear === idx;

                return (
                  <div key={idx} className="flex flex-col items-center">
                    <div className="h-6 text-[11px] font-mono font-bold">
                      {isFront && <span className="text-emerald-400">FRONT ↓</span>}
                      {isRear && <span className="text-rose-400">REAR ↓</span>}
                    </div>

                    <div
                      className={`w-16 h-18 rounded-xl border flex flex-col items-center justify-center transition-all ${
                        val !== null
                          ? 'bg-violet-950/80 border-violet-500 text-violet-100'
                          : 'bg-slate-950 border-slate-800 text-slate-700'
                      }`}
                    >
                      <span className="text-[10px] font-mono text-slate-500">[{idx}]</span>
                      <span className="font-mono text-xl font-bold mt-1">
                        {val !== null ? val : 'empty'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Live Status */}
        <div className="mt-4 p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
          <span className="text-xs font-medium text-slate-300">{status}</span>
        </div>
      </div>

      {/* Control Actions */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={inputVal}
            onChange={(e) => setInputVal(Number(e.target.value))}
            className="w-24 px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:border-violet-500 focus:outline-none"
          />
          <button
            onClick={handleEnqueue}
            disabled={count >= capacity}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Enqueue( {inputVal} )</span>
          </button>
        </div>

        <div>
          <button
            onClick={handleDequeue}
            disabled={count === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-200 font-semibold text-xs transition-colors disabled:opacity-50"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Dequeue()</span>
          </button>
        </div>
      </div>
    </div>
  );
};
