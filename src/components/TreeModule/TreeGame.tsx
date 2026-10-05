import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Zap, Heart, RotateCcw, ArrowLeft, ArrowRight, Check, HelpCircle, Sparkles } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface GameNode {
  id: string;
  val: number;
  left?: GameNode | null;
  right?: GameNode | null;
}

export const TreeGame: React.FC = () => {
  const [mode, setMode] = useState<'routing' | 'traversal'>('routing');
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(1);
  const [lives, setLives] = useState<number>(3);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>('Route incoming key down the BST: Left if smaller, Right if larger.');

  // Routing Game State
  const [tree, setTree] = useState<GameNode>({
    id: 'r50',
    val: 50,
    left: { id: 'l25', val: 25, left: null, right: null },
    right: { id: 'r75', val: 75, left: null, right: null },
  });
  const [incomingVal, setIncomingVal] = useState<number>(15);
  const [currentNodeId, setCurrentNodeId] = useState<string>('r50');

  // Traversal Game State
  const [harvestTargetOrder, setHarvestTargetOrder] = useState<number[]>([]);
  const [harvestedValues, setHarvestedValues] = useState<number[]>([]);
  const [harvestType, setHarvestType] = useState<'inorder' | 'preorder'>('inorder');

  // Find node by id
  const findNode = (node: GameNode | null, id: string): GameNode | null => {
    if (!node) return null;
    if (node.id === id) return node;
    return findNode(node.left || null, id) || findNode(node.right || null, id);
  };

  // Generate new incoming value that doesn't duplicate
  const generateNewIncoming = (t: GameNode) => {
    const existing = new Set<number>();
    const collect = (n: GameNode | null) => {
      if (!n) return;
      existing.add(n.val);
      collect(n.left || null);
      collect(n.right || null);
    };
    collect(t);

    let newVal = Math.floor(Math.random() * 90) + 5;
    while (existing.has(newVal)) {
      newVal = Math.floor(Math.random() * 90) + 5;
    }
    setIncomingVal(newVal);
    setCurrentNodeId('r50');
  };

  // Setup Traversal level
  const initTraversalLevel = () => {
    // Standard 5-node or 7-node tree
    const t: GameNode = {
      id: 'h40',
      val: 40,
      left: {
        id: 'h20',
        val: 20,
        left: { id: 'h10', val: 10, left: null, right: null },
        right: { id: 'h30', val: 30, left: null, right: null },
      },
      right: {
        id: 'h60',
        val: 60,
        left: { id: 'h50', val: 50, left: null, right: null },
        right: { id: 'h70', val: 70, left: null, right: null },
      },
    };

    const inOrderVals = [10, 20, 30, 40, 50, 60, 70];
    setTree(t);
    setHarvestTargetOrder(inOrderVals);
    setHarvestedValues([]);
    setFeedback('Harvest the fruits in IN-ORDER traversal (Sorted order: Left → Root → Right). Click node [10] to start!');
  };

  useEffect(() => {
    if (mode === 'routing') {
      setTree({
        id: 'r50',
        val: 50,
        left: { id: 'l25', val: 25, left: null, right: null },
        right: { id: 'r75', val: 75, left: null, right: null },
      });
      setIncomingVal(30);
      setCurrentNodeId('r50');
      setFeedback('Route incoming key 30. Is 30 < 50 or > 50?');
    } else {
      initTraversalLevel();
    }
  }, [mode]);

  // Handle Routing step
  const handleRoutingStep = (action: 'go_left' | 'go_right' | 'place') => {
    if (isGameOver) return;
    const curr = findNode(tree, currentNodeId);
    if (!curr) return;

    if (action === 'go_left') {
      if (incomingVal < curr.val) {
        if (curr.left) {
          sounds.step();
          setCurrentNodeId(curr.left.id);
          setFeedback(`${incomingVal} < ${curr.val} is correct! Now at node [${curr.left.val}]. Next step?`);
        } else {
          sounds.error();
          setFeedback(`Left spot is empty! You should choose 'Place Here'.`);
        }
      } else {
        sounds.error();
        const newLives = lives - 1;
        setFeedback(`BST Violation! ${incomingVal} is NOT less than ${curr.val}.`);
        if (newLives <= 0) setIsGameOver(true);
        else {
          setLives(newLives);
          setCombo(1);
        }
      }
    } else if (action === 'go_right') {
      if (incomingVal > curr.val) {
        if (curr.right) {
          sounds.step();
          setCurrentNodeId(curr.right.id);
          setFeedback(`${incomingVal} > ${curr.val} is correct! Now at node [${curr.right.val}]. Next step?`);
        } else {
          sounds.error();
          setFeedback(`Right spot is empty! You should choose 'Place Here'.`);
        }
      } else {
        sounds.error();
        const newLives = lives - 1;
        setFeedback(`BST Violation! ${incomingVal} is NOT greater than ${curr.val}.`);
        if (newLives <= 0) setIsGameOver(true);
        else {
          setLives(newLives);
          setCombo(1);
        }
      }
    } else if (action === 'place') {
      // Check if place is valid
      const canPlaceLeft = incomingVal < curr.val && !curr.left;
      const canPlaceRight = incomingVal > curr.val && !curr.right;

      if (canPlaceLeft || canPlaceRight) {
        sounds.success();
        try {
          confetti({ particleCount: 40, spread: 50 });
        } catch {
          // ignore
        }
        const pts = 120 * combo;
        setScore((s) => s + pts);
        setCombo((c) => c + 1);

        // Mutate tree
        const newNode: GameNode = {
          id: `node_${incomingVal}_${Date.now()}`,
          val: incomingVal,
          left: null,
          right: null,
        };
        if (canPlaceLeft) curr.left = newNode;
        else curr.right = newNode;

        setFeedback(`Perfect! Node ${incomingVal} placed properly adhering to BST! +${pts} pts`);
        setTimeout(() => {
          generateNewIncoming(tree);
        }, 1000);
      } else {
        sounds.error();
        const newLives = lives - 1;
        setFeedback(`Cannot place here! You must continue down the tree branch.`);
        if (newLives <= 0) setIsGameOver(true);
        else {
          setLives(newLives);
          setCombo(1);
        }
      }
    }
  };

  // Handle Traversal Harvest click
  const handleHarvestClick = (val: number) => {
    if (isGameOver) return;
    const nextExpected = harvestTargetOrder[harvestedValues.length];

    if (val === nextExpected) {
      sounds.success();
      const updated = [...harvestedValues, val];
      setHarvestedValues(updated);
      const pts = 100 * combo;
      setScore((s) => s + pts);

      if (updated.length === harvestTargetOrder.length) {
        try {
          confetti({ particleCount: 70, spread: 70 });
        } catch {
          // ignore
        }
        setFeedback(`All fruits harvested in perfect IN-ORDER! The BST is fully reaped!`);
      } else {
        setFeedback(`Harvested [${val}]! Next in-order fruit expected: [${harvestTargetOrder[updated.length]}].`);
      }
    } else {
      sounds.error();
      const newLives = lives - 1;
      setFeedback(`Incorrect! For IN-ORDER, left subtree comes before root and right. Expected: [${nextExpected}], but clicked [${val}].`);
      if (newLives <= 0) setIsGameOver(true);
      else {
        setLives(newLives);
        setCombo(1);
      }
    }
  };

  const handleRestart = () => {
    sounds.swap();
    setScore(0);
    setCombo(1);
    setLives(3);
    setIsGameOver(false);
    if (mode === 'routing') {
      setTree({
        id: 'r50',
        val: 50,
        left: { id: 'l25', val: 25, left: null, right: null },
        right: { id: 'r75', val: 75, left: null, right: null },
      });
      setIncomingVal(30);
      setCurrentNodeId('r50');
      setFeedback('Route incoming key 30. Is 30 < 50 or > 50?');
    } else {
      initTraversalLevel();
    }
  };

  const currActiveNode = findNode(tree, currentNodeId);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6">
      {/* HUD Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-800">
        <div>
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
            Binary Search Tree Challenge
          </span>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>{mode === 'routing' ? 'BST Routing Architect' : 'In-Order Traversal Harvest'}</span>
          </h3>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
          <button
            onClick={() => {
              sounds.click();
              setMode('routing');
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              mode === 'routing' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Routing Mode
          </button>
          <button
            onClick={() => {
              sounds.click();
              setMode('traversal');
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              mode === 'traversal' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Traversal Harvest
          </button>
        </div>

        {/* Scores & Hearts */}
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
          <h4 className="text-xl font-bold text-white">Tree Invariant Broken</h4>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            You scored <span className="font-mono text-amber-400 font-bold">{score}</span>.
            Remember: Left subtree is always strictly smaller than the parent node!
          </p>
          <button
            onClick={handleRestart}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      ) : mode === 'routing' ? (
        <div className="space-y-6">
          {/* Target Banner */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center">
                <span className="font-mono text-2xl font-black text-amber-300">{incomingVal}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400">Incoming Key to Insert:</span>
                <div className="text-sm font-semibold text-white">Route this key into the BST</div>
              </div>
            </div>

            <div className="text-xs font-mono px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              Currently Inspecting Node:{' '}
              <span className="text-amber-400 font-bold text-sm">[{currActiveNode?.val ?? '?'}]</span>
            </div>
          </div>

          {/* Interactive Routing Decision Controls */}
          <div className="flex flex-wrap items-center justify-center gap-4 py-4">
            <button
              onClick={() => handleRoutingStep('go_left')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-sm font-semibold transition-all hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
              <span>{incomingVal} &lt; {currActiveNode?.val} (Go Left)</span>
            </button>

            <button
              onClick={() => handleRoutingStep('place')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold shadow-lg shadow-amber-950/40 transition-all hover:scale-105"
            >
              <Check className="w-4 h-4" />
              <span>Place Node Here (Empty Leaf)</span>
            </button>

            <button
              onClick={() => handleRoutingStep('go_right')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-sm font-semibold transition-all hover:scale-105"
            >
              <span>{incomingVal} &gt; {currActiveNode?.val} (Go Right)</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          </div>

          {/* Feedback banner */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2.5">
            <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs text-slate-300 font-medium">{feedback}</span>
          </div>
        </div>
      ) : (
        /* Traversal Harvest Mode */
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400">Harvest Mission:</span>
              <div className="text-sm font-semibold text-white">
                Click the tree nodes below in strictly sorted <span className="text-amber-400 font-bold">IN-ORDER</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <span className="text-slate-400">Basket:</span>
              {harvestedValues.length === 0 ? (
                <span className="text-slate-600">(empty)</span>
              ) : (
                harvestedValues.map((v, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold">
                    {v}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Node Grid for Harvest */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 py-4">
            {[10, 20, 30, 40, 50, 60, 70].map((v) => {
              const isHarvested = harvestedValues.includes(v);
              return (
                <button
                  key={v}
                  onClick={() => handleHarvestClick(v)}
                  disabled={isHarvested}
                  className={`h-20 rounded-xl border flex flex-col items-center justify-center transition-all ${
                    isHarvested
                      ? 'bg-emerald-950/40 border-emerald-900/60 text-emerald-500 opacity-40 cursor-not-allowed'
                      : 'bg-slate-800/90 border-slate-700 text-white hover:border-amber-500 hover:scale-105 active:scale-95 shadow-md'
                  }`}
                >
                  <span className="text-xs text-slate-400 font-mono">Node</span>
                  <span className="text-2xl font-mono font-bold mt-1">{v}</span>
                </button>
              );
            })}
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2.5">
            <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs text-slate-300 font-medium">{feedback}</span>
          </div>
        </div>
      )}
    </div>
  );
};
