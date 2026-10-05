import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Compass, MapPin, Share2, HelpCircle } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface Vertex {
  id: string;
  label: string;
  x: number;
  y: number;
  highlight?: 'visiting' | 'visited' | 'path' | 'start' | 'target';
}

interface Edge {
  id: string;
  from: string;
  to: string;
  weight: number;
  highlight?: 'active' | 'path';
}

export const GraphSimulation: React.FC = () => {
  const [vertices, setVertices] = useState<Vertex[]>([
    { id: 'A', label: 'A', x: 80, y: 150 },
    { id: 'B', label: 'B', x: 220, y: 70 },
    { id: 'C', label: 'C', x: 220, y: 230 },
    { id: 'D', label: 'D', x: 380, y: 70 },
    { id: 'E', label: 'E', x: 380, y: 230 },
    { id: 'F', label: 'F', x: 520, y: 150 },
  ]);

  const [edges, setEdges] = useState<Edge[]>([
    { id: 'e1', from: 'A', to: 'B', weight: 4 },
    { id: 'e2', from: 'A', to: 'C', weight: 2 },
    { id: 'e3', from: 'B', to: 'C', weight: 1 },
    { id: 'e4', from: 'B', to: 'D', weight: 5 },
    { id: 'e5', from: 'C', to: 'E', weight: 8 },
    { id: 'e6', from: 'C', to: 'D', weight: 10 },
    { id: 'e7', from: 'D', to: 'E', weight: 2 },
    { id: 'e8', from: 'D', to: 'F', weight: 6 },
    { id: 'e9', from: 'E', to: 'F', weight: 3 },
  ]);

  const [traversalTape, setTraversalTape] = useState<string[]>([]);
  const [queueOrStack, setQueueOrStack] = useState<string[]>([]);
  const [status, setStatus] = useState<string>('Graph with 6 vertices & 9 weighted edges. Select an algorithm to run.');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [startNode, setStartNode] = useState<string>('A');
  const [targetNode, setTargetNode] = useState<string>('F');

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

  const resetHighlights = () => {
    setVertices((prev) => prev.map((v) => ({ ...v, highlight: undefined })));
    setEdges((prev) => prev.map((e) => ({ ...e, highlight: undefined })));
    setTraversalTape([]);
    setQueueOrStack([]);
  };

  // Run BFS
  const handleBFS = async () => {
    setIsPlaying(true);
    abortRef.current = false;
    resetHighlights();
    setStatus(`Executing Breadth-First Search (BFS) from source [${startNode}] using a FIFO Queue...`);

    const visited = new Set<string>();
    const queue: string[] = [startNode];
    visited.add(startNode);
    setQueueOrStack([startNode]);

    const order: string[] = [];

    while (queue.length > 0) {
      if (abortRef.current) break;
      const u = queue.shift()!;
      setQueueOrStack([...queue]);
      order.push(u);
      setTraversalTape([...order]);
      sounds.step();

      setVertices((prev) =>
        prev.map((v) => (v.id === u ? { ...v, highlight: 'visiting' } : v))
      );
      setStatus(`Dequeued vertex [${u}]. Visiting neighbors...`);
      await delay(600);

      // Find neighbors
      const neighbors: string[] = [];
      edges.forEach((e) => {
        if (e.from === u && !visited.has(e.to)) neighbors.push(e.to);
        if (e.to === u && !visited.has(e.from)) neighbors.push(e.from);
      });

      for (const n of neighbors) {
        if (!visited.has(n)) {
          visited.add(n);
          queue.push(n);
          sounds.insert();
          setQueueOrStack([...queue]);
        }
      }

      setVertices((prev) =>
        prev.map((v) => (v.id === u ? { ...v, highlight: 'visited' } : v))
      );
      await delay(400);
    }

    if (!abortRef.current) {
      sounds.success();
      setStatus(`BFS completed in O(V + E) time! Traversal order: ${order.join(' → ')}`);
    }
    setIsPlaying(false);
  };

  // Run DFS
  const handleDFS = async () => {
    setIsPlaying(true);
    abortRef.current = false;
    resetHighlights();
    setStatus(`Executing Depth-First Search (DFS) from source [${startNode}] using Recursion/Call Stack...`);

    const visited = new Set<string>();
    const order: string[] = [];

    const dfsVisit = async (u: string) => {
      if (abortRef.current) return;
      visited.add(u);
      order.push(u);
      setTraversalTape([...order]);
      sounds.step();

      setVertices((prev) =>
        prev.map((v) => (v.id === u ? { ...v, highlight: 'visiting' } : v))
      );
      setStatus(`DFS visiting vertex [${u}]. Exploring deepest reachable branch...`);
      await delay(600);

      setVertices((prev) =>
        prev.map((v) => (v.id === u ? { ...v, highlight: 'visited' } : v))
      );

      // Find neighbors
      const neighbors: string[] = [];
      edges.forEach((e) => {
        if (e.from === u && !visited.has(e.to)) neighbors.push(e.to);
        if (e.to === u && !visited.has(e.from)) neighbors.push(e.from);
      });

      for (const n of neighbors) {
        if (!visited.has(n)) {
          await dfsVisit(n);
        }
      }
    };

    await dfsVisit(startNode);

    if (!abortRef.current) {
      sounds.success();
      setStatus(`DFS completed! Traversal order: ${order.join(' → ')}`);
    }
    setIsPlaying(false);
  };

  // Dijkstra Shortest Path
  const handleDijkstra = async () => {
    setIsPlaying(true);
    abortRef.current = false;
    resetHighlights();
    setStatus(`Running Dijkstra's Algorithm: Shortest path from [${startNode}] to [${targetNode}]...`);

    // Standard Dijkstra implementation
    const dist: { [key: string]: number } = {};
    const prev: { [key: string]: string | null } = {};
    const unvisited = new Set<string>();

    vertices.forEach((v) => {
      dist[v.id] = Infinity;
      prev[v.id] = null;
      unvisited.add(v.id);
    });
    dist[startNode] = 0;

    while (unvisited.size > 0) {
      if (abortRef.current) break;
      // Pick vertex with min dist
      let currMin: string | null = null;
      unvisited.forEach((u) => {
        if (!currMin || dist[u] < dist[currMin]) {
          currMin = u;
        }
      });

      if (!currMin || dist[currMin] === Infinity) break;
      const u: string = currMin;
      unvisited.delete(u);

      sounds.step();
      setVertices((prevVerts) =>
        prevVerts.map((v) => (v.id === u ? { ...v, highlight: 'visiting' } : v))
      );
      setStatus(`Evaluating vertex [${u}] with current shortest distance = ${dist[u]}`);
      await delay(500);

      // Relax edges
      edges.forEach((e) => {
        let neighbor: string | null = null;
        if (e.from === u && unvisited.has(e.to)) neighbor = e.to;
        if (e.to === u && unvisited.has(e.from)) neighbor = e.from;

        if (neighbor) {
          const alt = dist[u] + e.weight;
          if (alt < dist[neighbor]) {
            dist[neighbor] = alt;
            prev[neighbor] = u;
          }
        }
      });

      setVertices((prevVerts) =>
        prevVerts.map((v) => (v.id === u ? { ...v, highlight: 'visited' } : v))
      );

      if (u === targetNode) break;
    }

    // Reconstruct path
    const path: string[] = [];
    let curr: string | null = targetNode;
    while (curr) {
      path.unshift(curr);
      curr = prev[curr];
    }

    if (!abortRef.current && path[0] === startNode) {
      sounds.success();
      setTraversalTape(path);
      // Highlight vertices & edges on path
      setVertices((prevVerts) =>
        prevVerts.map((v) => (path.includes(v.id) ? { ...v, highlight: 'path' } : v))
      );
      setEdges((prevEdges) =>
        prevEdges.map((e) => {
          for (let i = 0; i < path.length - 1; i++) {
            if (
              (e.from === path[i] && e.to === path[i + 1]) ||
              (e.to === path[i] && e.from === path[i + 1])
            ) {
              return { ...e, highlight: 'path' };
            }
          }
          return e;
        })
      );
      setStatus(`Shortest path found: ${path.join(' → ')} with total weight = ${dist[targetNode]}!`);
    } else {
      sounds.error();
      setStatus(`No path exists between [${startNode}] and [${targetNode}].`);
    }

    setIsPlaying(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6">
        {/* Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-white">Weighted Network Graph Canvas</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Vertices: <span className="font-mono text-sky-400 font-bold">|V| = 6</span> ·
              Edges: <span className="font-mono text-cyan-400 font-bold">|E| = 9</span> ·
              Traversal Cost: <span className="font-mono text-emerald-400">O(V + E)</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetHighlights}
              disabled={isPlaying}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors disabled:opacity-50"
            >
              Reset Highlights
            </button>
          </div>
        </div>

        {/* Graph SVG Visualizer */}
        <div className="w-full h-[320px] bg-slate-950/70 rounded-xl border border-slate-800/80 flex items-center justify-center overflow-auto relative">
          <svg viewBox="0 0 600 300" className="w-full h-full min-w-[550px] select-none">
            {/* Edges */}
            {edges.map((e) => {
              const u = vertices.find((v) => v.id === e.from)!;
              const v = vertices.find((vert) => vert.id === e.to)!;
              const midX = (u.x + v.x) / 2;
              const midY = (u.y + v.y) / 2;

              let stroke = '#334155';
              let strokeWidth = '2';
              if (e.highlight === 'path') {
                stroke = '#0284C7';
                strokeWidth = '4';
              }

              return (
                <g key={e.id}>
                  <line
                    x1={u.x}
                    y1={u.y}
                    x2={v.x}
                    y2={v.y}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                  {/* Weight Badge */}
                  <rect
                    x={midX - 10}
                    y={midY - 9}
                    width="20"
                    height="18"
                    rx="4"
                    fill="#090D16"
                    stroke="#1E293B"
                    strokeWidth="1"
                  />
                  <text
                    x={midX}
                    y={midY + 4}
                    textAnchor="middle"
                    fill="#94A3B8"
                    fontSize="11"
                    fontFamily="JetBrains Mono"
                    fontWeight="bold"
                  >
                    {e.weight}
                  </text>
                </g>
              );
            })}

            {/* Vertices */}
            {vertices.map((v) => {
              let fill = '#1E293B';
              let stroke = '#64748B';
              let textFill = '#F8FAFC';

              if (v.highlight === 'visiting') {
                fill = '#0369A1';
                stroke = '#38BDF8';
                textFill = '#E0F2FE';
              } else if (v.highlight === 'visited') {
                fill = '#1E3A8A';
                stroke = '#60A5FA';
                textFill = '#DBEAFE';
              } else if (v.highlight === 'path') {
                fill = '#065F46';
                stroke = '#34D399';
                textFill = '#D1FAE5';
              }

              return (
                <g key={v.id} className="cursor-pointer">
                  <circle
                    cx={v.x}
                    cy={v.y}
                    r="22"
                    fill={fill}
                    stroke={stroke}
                    strokeWidth="2.5"
                    className="transition-colors duration-200 shadow-md"
                  />
                  <text
                    x={v.x}
                    y={v.y + 5}
                    textAnchor="middle"
                    fill={textFill}
                    fontSize="14"
                    fontWeight="bold"
                    fontFamily="JetBrains Mono"
                  >
                    {v.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Live Sequence Output Tape */}
        {traversalTape.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider shrink-0">
              Sequence:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto">
              {traversalTape.map((nodeId, idx) => (
                <React.Fragment key={idx}>
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-sky-950/80 border border-sky-700 text-sky-200">
                    {nodeId}
                  </span>
                  {idx < traversalTape.length - 1 && (
                    <span className="text-slate-500 font-bold">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Live Status Callout */}
        <div className="mt-4 p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
          <span className="text-xs font-medium text-slate-300">{status}</span>
        </div>
      </div>

      {/* Control Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* BFS Traversal */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Breadth-First Search
          </h4>
          <p className="text-xs text-slate-400">
            Explores neighbor vertices level-by-level using a FIFO queue.
          </p>
          <button
            onClick={handleBFS}
            disabled={isPlaying}
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Run BFS from [{startNode}]</span>
          </button>
        </div>

        {/* DFS Traversal */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Depth-First Search
          </h4>
          <p className="text-xs text-slate-400">
            Traverses along each branch before backtracking using a call stack.
          </p>
          <button
            onClick={handleDFS}
            disabled={isPlaying}
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Run DFS from [{startNode}]</span>
          </button>
        </div>

        {/* Dijkstra Shortest Path */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Dijkstra Shortest Path
          </h4>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Target:</span>
            <select
              value={targetNode}
              onChange={(e) => setTargetNode(e.target.value)}
              disabled={isPlaying}
              className="px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-white font-mono"
            >
              {vertices
                .filter((v) => v.id !== startNode)
                .map((v) => (
                  <option key={v.id} value={v.id}>
                    Node {v.label}
                  </option>
                ))}
            </select>
          </div>
          <button
            onClick={handleDijkstra}
            disabled={isPlaying}
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors disabled:opacity-50"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Find Shortest Path</span>
          </button>
        </div>
      </div>
    </div>
  );
};
