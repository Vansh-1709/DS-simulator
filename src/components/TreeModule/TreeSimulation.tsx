import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Plus, Trash2, Search, RotateCcw, Shuffle, Sparkles, CheckCircle } from 'lucide-react';
import { sounds } from '../../utils/audio';

export interface TreeNode {
  val: number;
  left?: TreeNode | null;
  right?: TreeNode | null;
  id: string;
}

interface LayoutNode {
  id: string;
  val: number;
  x: number;
  y: number;
  highlight?: 'visiting' | 'found' | 'target' | 'active' | 'successor';
}

interface LayoutEdge {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export const TreeSimulation: React.FC = () => {
  // Initial balanced tree: 50, 30, 70, 20, 40, 60, 80
  const [root, setRoot] = useState<TreeNode | null>({
    id: 'n50',
    val: 50,
    left: {
      id: 'n30',
      val: 30,
      left: { id: 'n20', val: 20, left: null, right: null },
      right: { id: 'n40', val: 40, left: null, right: null },
    },
    right: {
      id: 'n70',
      val: 70,
      left: { id: 'n60', val: 60, left: null, right: null },
      right: { id: 'n80', val: 80, left: null, right: null },
    },
  });

  const [inputVal, setInputVal] = useState<number>(45);
  const [searchVal, setSearchVal] = useState<number>(60);
  const [deleteVal, setDeleteVal] = useState<number>(30);
  const [activeHighlights, setActiveHighlights] = useState<{ [nodeId: string]: string }>({});
  const [traversalOutput, setTraversalOutput] = useState<number[]>([]);
  const [traversalType, setTraversalType] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('BST Invariant: Left Subtree < Root < Right Subtree');
  const [speed, setSpeed] = useState<number>(600);

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

  // Calculate Layout for SVG
  const calculateLayout = (
    node: TreeNode | null,
    x: number,
    y: number,
    gap: number,
    nodes: LayoutNode[] = [],
    edges: LayoutEdge[] = []
  ) => {
    if (!node) return { nodes, edges };

    nodes.push({
      id: node.id,
      val: node.val,
      x,
      y,
      highlight: activeHighlights[node.id] as any,
    });

    if (node.left) {
      const childX = x - gap;
      const childY = y + 70;
      edges.push({ id: `e-${node.id}-${node.left.id}`, x1: x, y1: y, x2: childX, y2: childY });
      calculateLayout(node.left, childX, childY, gap * 0.52, nodes, edges);
    }

    if (node.right) {
      const childX = x + gap;
      const childY = y + 70;
      edges.push({ id: `e-${node.id}-${node.right.id}`, x1: x, y1: y, x2: childX, y2: childY });
      calculateLayout(node.right, childX, childY, gap * 0.52, nodes, edges);
    }

    return { nodes, edges };
  };

  const { nodes: layoutNodes, edges: layoutEdges } = calculateLayout(root, 360, 50, 140);

  // Helper to clone tree
  const cloneTree = (node: TreeNode | null): TreeNode | null => {
    if (!node) return null;
    return {
      id: node.id,
      val: node.val,
      left: cloneTree(node.left || null),
      right: cloneTree(node.right || null),
    };
  };

  // Insert animated
  const handleInsert = async () => {
    if (!root) {
      sounds.insert();
      setRoot({ id: `n${inputVal}`, val: inputVal, left: null, right: null });
      return;
    }

    setIsPlaying(true);
    abortRef.current = false;
    setActiveHighlights({});
    setStatusText(`Searching insertion position for ${inputVal}...`);

    let curr: TreeNode | null = root;
    const treeCopy = cloneTree(root)!;
    let targetParent: TreeNode | null = null;
    let isLeftChild = false;

    while (curr) {
      if (abortRef.current) break;
      sounds.step();
      setActiveHighlights({ [curr.id]: 'visiting' });
      setStatusText(`Comparing ${inputVal} with current node ${curr.val}`);
      await delay(speed);

      if (inputVal === curr.val) {
        sounds.error();
        setStatusText(`Key ${inputVal} already exists in BST! Duplicates not permitted.`);
        setActiveHighlights({ [curr.id]: 'found' });
        setIsPlaying(false);
        return;
      }

      targetParent = curr;
      if (inputVal < curr.val) {
        setStatusText(`${inputVal} < ${curr.val} => Moving to LEFT child`);
        curr = curr.left || null;
        isLeftChild = true;
      } else {
        setStatusText(`${inputVal} > ${curr.val} => Moving to RIGHT child`);
        curr = curr.right || null;
        isLeftChild = false;
      }
    }

    if (!abortRef.current && targetParent) {
      sounds.insert();
      const newNode: TreeNode = {
        id: `n${inputVal}_${Date.now()}`,
        val: inputVal,
        left: null,
        right: null,
      };

      // Perform insertion in cloned tree
      const insertInClone = (node: TreeNode | null): TreeNode => {
        if (!node) return newNode;
        if (inputVal < node.val) node.left = insertInClone(node.left || null);
        else node.right = insertInClone(node.right || null);
        return node;
      };

      const updated = insertInClone(treeCopy);
      setRoot(updated);
      setActiveHighlights({ [newNode.id]: 'found' });
      setStatusText(`Inserted node ${inputVal} at leaf position!`);
      await delay(speed);
      setActiveHighlights({});
    }

    setIsPlaying(false);
  };

  // Search animated
  const handleSearch = async () => {
    if (!root) return;
    setIsPlaying(true);
    abortRef.current = false;
    setActiveHighlights({});
    setStatusText(`Searching for key ${searchVal} in BST...`);

    let curr: TreeNode | null = root;
    let found = false;

    while (curr) {
      if (abortRef.current) break;
      sounds.step();
      setActiveHighlights({ [curr.id]: 'visiting' });
      setStatusText(`Comparing search key ${searchVal} with node ${curr.val}...`);
      await delay(speed);

      if (curr.val === searchVal) {
        sounds.success();
        found = true;
        setActiveHighlights({ [curr.id]: 'found' });
        setStatusText(`Found key ${searchVal} in O(h) time!`);
        break;
      } else if (searchVal < curr.val) {
        setStatusText(`${searchVal} < ${curr.val} => Discard right, search left`);
        curr = curr.left || null;
      } else {
        setStatusText(`${searchVal} > ${curr.val} => Discard left, search right`);
        curr = curr.right || null;
      }
    }

    if (!found && !abortRef.current) {
      sounds.error();
      setStatusText(`Key ${searchVal} not found in binary search tree`);
      setActiveHighlights({});
    }

    setIsPlaying(false);
  };

  // Delete node
  const handleDelete = () => {
    sounds.remove();
    const deleteRecursive = (node: TreeNode | null, val: number): TreeNode | null => {
      if (!node) return null;
      if (val < node.val) {
        node.left = deleteRecursive(node.left || null, val);
        return node;
      } else if (val > node.val) {
        node.right = deleteRecursive(node.right || null, val);
        return node;
      } else {
        // Node found!
        // Case 1: Leaf
        if (!node.left && !node.right) return null;
        // Case 2: One child
        if (!node.left) return node.right || null;
        if (!node.right) return node.left || null;
        // Case 3: Two children -> find in-order successor (min in right subtree)
        let successor = node.right;
        while (successor.left) {
          successor = successor.left;
        }
        node.val = successor.val;
        node.id = `n${successor.val}_${Date.now()}`;
        node.right = deleteRecursive(node.right, successor.val);
        return node;
      }
    };

    const updated = deleteRecursive(cloneTree(root), deleteVal);
    setRoot(updated);
    setStatusText(`Deleted node ${deleteVal} and restored BST invariant`);
  };

  // Traversal playback
  const runTraversal = async (type: 'inorder' | 'preorder' | 'postorder' | 'levelorder') => {
    if (!root) return;
    setIsPlaying(true);
    abortRef.current = false;
    setActiveHighlights({});
    setTraversalOutput([]);
    setTraversalType(type);

    const order: TreeNode[] = [];

    const inorder = (node: TreeNode | null) => {
      if (!node) return;
      inorder(node.left || null);
      order.push(node);
      inorder(node.right || null);
    };

    const preorder = (node: TreeNode | null) => {
      if (!node) return;
      order.push(node);
      preorder(node.left || null);
      preorder(node.right || null);
    };

    const postorder = (node: TreeNode | null) => {
      if (!node) return;
      postorder(node.left || null);
      postorder(node.right || null);
      order.push(node);
    };

    const levelorder = (start: TreeNode) => {
      const q: TreeNode[] = [start];
      while (q.length > 0) {
        const n = q.shift()!;
        order.push(n);
        if (n.left) q.push(n.left);
        if (n.right) q.push(n.right);
      }
    };

    if (type === 'inorder') inorder(root);
    if (type === 'preorder') preorder(root);
    if (type === 'postorder') postorder(root);
    if (type === 'levelorder') levelorder(root);

    setStatusText(`Executing ${type.toUpperCase()} traversal...`);

    const resultTape: number[] = [];
    for (const node of order) {
      if (abortRef.current) break;
      sounds.step();
      setActiveHighlights({ [node.id]: 'found' });
      resultTape.push(node.val);
      setTraversalOutput([...resultTape]);
      await delay(speed);
    }

    if (!abortRef.current) {
      sounds.success();
      setStatusText(
        type === 'inorder'
          ? 'In-Order Traversal yields strictly sorted ascending order!'
          : `${type.toUpperCase()} traversal completed (${order.length} nodes)`
      );
    }
    setIsPlaying(false);
  };

  // Tree stats
  const getTreeHeight = (node: TreeNode | null): number => {
    if (!node) return 0;
    return 1 + Math.max(getTreeHeight(node.left || null), getTreeHeight(node.right || null));
  };

  const countNodes = (node: TreeNode | null): number => {
    if (!node) return 0;
    return 1 + countNodes(node.left || null) + countNodes(node.right || null);
  };

  const handleResetBalanced = () => {
    sounds.swap();
    setRoot({
      id: 'n50',
      val: 50,
      left: {
        id: 'n30',
        val: 30,
        left: { id: 'n20', val: 20, left: null, right: null },
        right: { id: 'n40', val: 40, left: null, right: null },
      },
      right: {
        id: 'n70',
        val: 70,
        left: { id: 'n60', val: 60, left: null, right: null },
        right: { id: 'n80', val: 80, left: null, right: null },
      },
    });
    setActiveHighlights({});
    setTraversalOutput([]);
    setStatusText('Reset to balanced BST');
  };

  return (
    <div className="space-y-6">
      {/* SVG Canvas Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        {/* Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-white">Hierarchical BST Canvas</h3>
            <p className="text-xs text-slate-400">
              Nodes: <span className="font-mono text-amber-400 font-semibold">{countNodes(root)}</span> ·
              Height: <span className="font-mono text-cyan-400 font-semibold">{getTreeHeight(root)}</span> ·
              Search: <span className="font-mono text-emerald-400 font-semibold">O(log n) average</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetBalanced}
              disabled={isPlaying}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset Balanced Tree</span>
            </button>
          </div>
        </div>

        {/* Tree SVG Graph */}
        <div className="w-full h-[320px] overflow-auto flex items-center justify-center bg-slate-950/60 rounded-xl border border-slate-800/80 relative">
          <svg viewBox="0 0 720 320" className="w-full h-full min-w-[650px] select-none">
            {/* Edge Lines */}
            {layoutEdges.map((edge) => (
              <line
                key={edge.id}
                x1={edge.x1}
                y1={edge.y1}
                x2={edge.x2}
                y2={edge.y2}
                stroke="#334155"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            ))}

            {/* Tree Nodes */}
            {layoutNodes.map((node) => {
              let circleFill = '#1E293B';
              let circleStroke = '#64748B';
              let textFill = '#F8FAFC';

              if (node.highlight === 'visiting') {
                circleFill = '#312E81';
                circleStroke = '#818CF8';
                textFill = '#C7D2FE';
              } else if (node.highlight === 'found') {
                circleFill = '#064E3B';
                circleStroke = '#34D399';
                textFill = '#A7F3D0';
              }

              return (
                <g key={node.id} className="cursor-pointer transition-all duration-300">
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="22"
                    fill={circleFill}
                    stroke={circleStroke}
                    strokeWidth="2.5"
                    className="transition-colors duration-200 shadow-md"
                  />
                  <text
                    x={node.x}
                    y={node.y + 5}
                    textAnchor="middle"
                    fill={textFill}
                    fontSize="13"
                    fontWeight="bold"
                    fontFamily="JetBrains Mono"
                  >
                    {node.val}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Live Traversal Output Strip */}
        {traversalOutput.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider shrink-0">
              {traversalType}:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {traversalOutput.map((val, idx) => (
                <span
                  key={idx}
                  className="font-mono text-xs font-bold px-2 py-1 rounded bg-amber-950/60 border border-amber-800/80 text-amber-200"
                >
                  {val}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Live Status callout */}
        <div className="mt-4 p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span className="text-xs font-medium text-slate-300">{statusText}</span>
        </div>
      </div>

      {/* Control Deck */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Insert & Search */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Tree Operations
          </h4>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={inputVal}
              onChange={(e) => setInputVal(Number(e.target.value))}
              disabled={isPlaying}
              placeholder="Value"
              className="w-24 px-3 py-1.5 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:border-amber-500 focus:outline-none"
            />
            <button
              onClick={handleInsert}
              disabled={isPlaying}
              className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800/80 rounded-lg transition-colors disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Insert BST Node</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              value={searchVal}
              onChange={(e) => setSearchVal(Number(e.target.value))}
              disabled={isPlaying}
              className="w-24 px-3 py-1.5 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:border-amber-500 focus:outline-none"
            />
            <button
              onClick={handleSearch}
              disabled={isPlaying}
              className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-amber-300 bg-amber-950/60 hover:bg-amber-900 border border-amber-800/80 rounded-lg transition-colors disabled:opacity-50"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Trace Path (Search)</span>
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
            <input
              type="number"
              value={deleteVal}
              onChange={(e) => setDeleteVal(Number(e.target.value))}
              disabled={isPlaying}
              className="w-24 px-3 py-1.5 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:border-rose-500 focus:outline-none"
            />
            <button
              onClick={handleDelete}
              disabled={isPlaying}
              className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-rose-300 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 rounded-lg transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Node</span>
            </button>
          </div>
        </div>

        {/* Traversals */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Tree Traversals
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => runTraversal('inorder')}
              disabled={isPlaying}
              className="px-3 py-2 text-xs font-medium text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/60 rounded-lg transition-colors disabled:opacity-50"
            >
              In-Order (Sorted)
            </button>
            <button
              onClick={() => runTraversal('preorder')}
              disabled={isPlaying}
              className="px-3 py-2 text-xs font-medium text-indigo-300 bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-800/60 rounded-lg transition-colors disabled:opacity-50"
            >
              Pre-Order (DLR)
            </button>
            <button
              onClick={() => runTraversal('postorder')}
              disabled={isPlaying}
              className="px-3 py-2 text-xs font-medium text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/60 rounded-lg transition-colors disabled:opacity-50"
            >
              Post-Order (LRD)
            </button>
            <button
              onClick={() => runTraversal('levelorder')}
              disabled={isPlaying}
              className="px-3 py-2 text-xs font-medium text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/60 rounded-lg transition-colors disabled:opacity-50"
            >
              Level-Order (BFS)
            </button>
          </div>
        </div>

        {/* Speed & Properties */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Playback & Invariant
          </h4>
          <div className="space-y-2 text-xs text-slate-400">
            <p>
              • In-Order traversal visits nodes in ascending order: <code className="text-amber-300 font-mono">Left → Root → Right</code>.
            </p>
            <p>
              • BST Search takes <code className="text-cyan-300 font-mono">O(h)</code> time, where h is the tree height.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
            <span className="text-xs text-slate-400">Step Delay</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-slate-300">{speed}ms</span>
              <input
                type="range"
                min="200"
                max="1000"
                step="100"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-20 accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
