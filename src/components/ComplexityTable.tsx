import React from 'react';
import { ComplexityInfo } from '../types';

interface ComplexityTableProps {
  complexity: ComplexityInfo;
  topicName: string;
}

export const ComplexityTable: React.FC<ComplexityTableProps> = ({ complexity, topicName }) => {
  const getBadgeColor = (val: string) => {
    if (val.includes('O(1)')) return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60';
    if (val.includes('log n')) return 'text-cyan-400 bg-cyan-950/40 border-cyan-800/60';
    if (val.includes('O(n)')) return 'text-amber-400 bg-amber-950/40 border-amber-800/60';
    return 'text-rose-400 bg-rose-950/40 border-rose-800/60';
  };

  const rows = [
    { label: 'Access (by index / root)', value: complexity.access, note: 'Direct memory offset or depth traversal' },
    { label: 'Search (by key / value)', value: complexity.search, note: 'Worst-case lookup overhead' },
    { label: 'Insertion', value: complexity.insertion, note: 'Adding an element at boundaries or middle' },
    { label: 'Deletion', value: complexity.deletion, note: 'Removal with potential reallocation/splice' },
    { label: 'Space Complexity', value: complexity.space, note: 'Auxiliary memory scaling with N items' },
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden p-5">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <h4 className="text-sm font-semibold text-slate-200">
          Asymptotic Complexity Matrix · {topicName}
        </h4>
        <span className="text-xs text-slate-400 font-mono">Worst Case Analysis</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between"
          >
            <span className="text-xs font-medium text-slate-400 mb-1">{row.label}</span>
            <div className="my-1.5">
              <span
                className={`inline-block font-mono text-sm font-bold px-2 py-0.5 rounded border tabular-nums ${getBadgeColor(
                  row.value
                )}`}
              >
                {row.value}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 line-clamp-1">{row.note}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
