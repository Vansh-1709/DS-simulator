import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Zap, Heart, RotateCcw, HelpCircle, Server, ArrowRight } from 'lucide-react';
import { sounds } from '../../utils/audio';

type Channel = 'ALPHA' | 'BETA' | 'GAMMA';

interface Packet {
  id: string;
  channel: Channel;
  packetId: number;
}

export const QueueGame: React.FC = () => {
  const [queue, setQueue] = useState<Packet[]>([]);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(1);
  const [lives, setLives] = useState<number>(3);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>('FIFO Router: Dispatch the FRONT packet to its designated channel!');

  const maxCapacity = 5;
  const packetCounterRef = useRef<number>(101);

  // Spawn incoming packet
  const spawnPacket = () => {
    if (isGameOver) return;
    const channels: Channel[] = ['ALPHA', 'BETA', 'GAMMA'];
    const chosen = channels[Math.floor(Math.random() * channels.length)];

    setQueue((prev) => {
      if (prev.length >= maxCapacity) {
        sounds.error();
        setFeedback('Buffer Overflow! Packet dropped because FIFO queue was full.');
        setLives((l) => {
          const nextL = l - 1;
          if (nextL <= 0) setIsGameOver(true);
          return nextL;
        });
        return prev;
      }
      sounds.insert();
      const newP: Packet = {
        id: Math.random().toString(),
        channel: chosen,
        packetId: packetCounterRef.current++,
      };
      return [...prev, newP];
    });
  };

  useEffect(() => {
    // Initial 2 packets
    setQueue([
      { id: '1', channel: 'ALPHA', packetId: 101 },
      { id: '2', channel: 'BETA', packetId: 102 },
    ]);
    packetCounterRef.current = 103;

    // Periodic incoming packets
    const timer = setInterval(() => {
      spawnPacket();
    }, 2800);

    return () => clearInterval(timer);
  }, [isGameOver]);

  const handleDispatch = (targetChannel: Channel) => {
    if (isGameOver || queue.length === 0) return;

    const frontPacket = queue[0];
    if (frontPacket.channel === targetChannel) {
      sounds.success();
      setQueue((prev) => prev.slice(1));
      const pts = 100 * combo;
      setScore((s) => s + pts);
      setCombo((c) => c + 1);
      setFeedback(`Packet #${frontPacket.packetId} successfully routed to Channel ${targetChannel}! +${pts} pts`);

      if (score + pts >= 800 && combo % 5 === 0) {
        try {
          confetti({ particleCount: 40, spread: 50 });
        } catch {
          // ignore
        }
      }
    } else {
      sounds.error();
      const nextLives = lives - 1;
      setFeedback(`Routing Failure! Front packet #${frontPacket.packetId} destination is ${frontPacket.channel}, not ${targetChannel}.`);
      if (nextLives <= 0) setIsGameOver(true);
      else {
        setLives(nextLives);
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
    setQueue([
      { id: '1', channel: 'ALPHA', packetId: 101 },
      { id: '2', channel: 'BETA', packetId: 102 },
    ]);
    packetCounterRef.current = 103;
    setFeedback('FIFO Router rebooted. Route the front packet!');
  };

  const getChannelColor = (c: Channel) => {
    if (c === 'ALPHA') return 'bg-cyan-950/80 border-cyan-500 text-cyan-200';
    if (c === 'BETA') return 'bg-emerald-950/80 border-emerald-500 text-emerald-200';
    return 'bg-amber-950/80 border-amber-500 text-amber-200';
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6">
      {/* Top HUD */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-800">
        <div>
          <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
            FIFO Streaming Game
          </span>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-violet-400" />
            <span>Packet Router & Conveyor Master</span>
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
          <h4 className="text-xl font-bold text-white">Buffer Overflow! Packets Dropped</h4>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            You successfully dispatched packets totaling a score of{' '}
            <span className="font-mono text-violet-400 font-bold">{score}</span>.
          </p>
          <button
            onClick={handleRestart}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reboot Router</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Conveyor Belt Queue */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-mono font-bold">
                ← FRONT (Next Out)
              </span>
              <span className="font-mono">
                Buffer Load: {queue.length} / {maxCapacity}
              </span>
              <span className="flex items-center gap-1 text-rose-400 font-mono font-bold">
                REAR (Incoming) →
              </span>
            </div>

            <div className="h-28 border border-slate-800 rounded-xl bg-slate-900/60 p-3 flex items-center gap-3 overflow-x-auto">
              {queue.length === 0 ? (
                <div className="w-full text-center text-xs text-slate-600 font-mono italic">
                  Queue Buffer Empty · Awaiting incoming packets...
                </div>
              ) : (
                queue.map((pkt, idx) => (
                  <div
                    key={pkt.id}
                    className={`w-28 h-20 rounded-xl border flex flex-col justify-between p-2 shadow shrink-0 transition-all ${
                      idx === 0 ? 'ring-2 ring-emerald-400 scale-105' : ''
                    } ${getChannelColor(pkt.channel)}`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span>{idx === 0 ? 'HEAD' : `+${idx}`}</span>
                      <span>#{pkt.packetId}</span>
                    </div>
                    <div className="text-center font-mono font-bold text-sm">
                      {pkt.channel}
                    </div>
                    <div className="text-[10px] text-center text-slate-400">
                      Channel {pkt.channel[0]}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Dispatch Gateways */}
          <div>
            <span className="text-xs text-slate-400 block mb-2">
              Dispatch FRONT Packet to Destination Gateway:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleDispatch('ALPHA')}
                disabled={queue.length === 0}
                className="py-3 px-4 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-600 text-cyan-200 font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-102 disabled:opacity-50"
              >
                <span>Route to ALPHA (Cyan)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleDispatch('BETA')}
                disabled={queue.length === 0}
                className="py-3 px-4 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600 text-emerald-200 font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-102 disabled:opacity-50"
              >
                <span>Route to BETA (Green)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleDispatch('GAMMA')}
                disabled={queue.length === 0}
                className="py-3 px-4 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-600 text-amber-200 font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-102 disabled:opacity-50"
              >
                <span>Route to GAMMA (Amber)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2.5">
            <HelpCircle className="w-4 h-4 text-violet-400 shrink-0" />
            <span className="text-xs text-slate-300 font-medium">{feedback}</span>
          </div>
        </div>
      )}
    </div>
  );
};
