import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { MiniAnimType } from '../data/types';
import { SparkleButton } from './SparkleButton';

interface MiniAnimationProps {
  type: MiniAnimType;
  title: string;
  subtitle: string;
}

export const MiniAnimation: React.FC<MiniAnimationProps> = ({ type, title, subtitle }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState<1 | 2>(1);
  const [epoch, setEpoch] = useState(0);
  const [manualStep, setManualStep] = useState<number | null>(null);
  const pulseBoostRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let t = manualStep !== null ? manualStep * 1.45 : 0;
    let lastTime = performance.now();
    let hidden = typeof document !== 'undefined' ? document.hidden : false;
    const onVis = () => {
      hidden = document.hidden;
      lastTime = performance.now();
    };
    document.addEventListener('visibilitychange', onVis);

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (hidden) return;
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      if (manualStep !== null) {
        t = manualStep * 1.45 + Math.sin(now * 0.004) * 0.18;
      } else if (playing) {
        t += dt * speed + pulseBoostRef.current * 0.12;
      }
      pulseBoostRef.current = Math.max(0, pulseBoostRef.current - dt * 2.5);

      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Cool slate technical blueprint background + faint grid
      ctx.fillStyle = '#f3f5f8';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(15,23,42,0.06)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 28) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += 28) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      const phase = t % 6;

      if (type === 'typing') {
        // Animated text editor + Ctrl+S save pulse
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = 'rgba(15,23,42,0.22)';
        ctx.fillRect(46, 26, W - 92, 140);
        ctx.strokeRect(46, 26, W - 92, 140);

        const text = 'Salom, Informatika! Hujjat saqlandi [Ctrl+S].';
        const chars = Math.min(text.length, Math.floor((t * 10) % (text.length + 14)));
        const shown = text.slice(0, chars);
        ctx.fillStyle = '#0f172a';
        ctx.font = '15px "IBM Plex Mono", monospace';
        ctx.fillText(shown + (Math.floor(t * 3) % 2 === 0 ? '|' : ''), 64, 72);

        // Selection highlight in second phase
        if (chars > 18) {
          ctx.fillStyle = 'rgba(37,99,235,0.16)';
          ctx.fillRect(64, 92, 210, 24);
          ctx.fillStyle = '#0f172a';
          ctx.font = '12px "IBM Plex Mono", monospace';
          ctx.fillText('Ctrl+C -> Ctrl+V -> Ctrl+S', 70, 108);
        }

        // Virtual keys at bottom
        const keys = ['Ctrl', 'C', 'V', 'S', 'Backspace'];
        keys.forEach((k, i) => {
          const active = Math.floor(t * 1.5) % keys.length === i;
          const kx = 72 + i * 96;
          ctx.fillStyle = active ? '#2563eb' : '#e2e8f0';
          ctx.strokeStyle = 'rgba(15,23,42,0.25)';
          ctx.fillRect(kx, 186, 82, 34);
          ctx.strokeRect(kx, 186, 82, 34);
          ctx.fillStyle = active ? '#ffffff' : '#0f172a';
          ctx.font = '12px "IBM Plex Mono", monospace';
          ctx.fillText(k, kx + 10, 207);
        });
      } else if (type === 'raster') {
        // Pixel drawing + rotation animation
        const cells = 7;
        const cellSz = 22;
        const ox = 80;
        const oy = 38;
        const pattern = [
          0, 0, 1, 1, 1, 0, 0,
          0, 1, 0, 0, 0, 1, 0,
          1, 0, 1, 0, 1, 0, 1,
          1, 0, 0, 0, 0, 0, 1,
          1, 0, 1, 1, 1, 0, 1,
          0, 1, 0, 0, 0, 1, 0,
          0, 0, 1, 1, 1, 0, 0,
        ];
        const reveal = Math.floor((t * 14) % 56);
        for (let i = 0; i < cells * cells; i++) {
          const r = (i / cells) | 0;
          const c = i % cells;
          const on = pattern[i] === 1 && i <= reveal;
          ctx.fillStyle = on ? '#2563eb' : '#ffffff';
          ctx.strokeStyle = 'rgba(15,23,42,0.18)';
          ctx.fillRect(ox + c * cellSz, oy + r * cellSz, cellSz, cellSz);
          ctx.strokeRect(ox + c * cellSz, oy + r * cellSz, cellSz, cellSz);
        }

        // Right side: Rotate / Flip preview shape
        ctx.save();
        ctx.translate(425, 118);
        ctx.rotate((t * 0.9) % (Math.PI * 2));
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(-38, -24, 76, 48);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(14, -12, 16, 24);
        ctx.restore();

        ctx.fillStyle = '#0f172a';
        ctx.font = '11px "IBM Plex Mono", monospace';
        ctx.fillText('PIKSEL PANJARASI (LINE/BRUSH)', 68, 212);
        ctx.fillText('ROTATE / FLIP', 378, 212);
      } else if (type === 'chart') {
        // Animated bar chart + X/Y axes
        const vals = [45, 82, 63, 94, 58];
        const labels = ['5-A', '5-B', '6-A', '6-B', '7-A'];
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(80, 32);
        ctx.lineTo(80, 185);
        ctx.lineTo(520, 185);
        ctx.stroke();

        const prog = Math.min(1, (t % 4) / 2.2);
        const colors = ['#38bdf8', '#0284c7', '#2563eb', '#059669', '#0f172a'];
        vals.forEach((v, i) => {
          const h = v * 1.35 * (0.2 + 0.8 * Math.abs(Math.sin(prog * Math.PI * 0.5 + i * 0.1)));
          const bx = 112 + i * 78;
          ctx.fillStyle = colors[i];
          ctx.fillRect(bx, 185 - h, 44, h);
          ctx.fillStyle = '#0f172a';
          ctx.font = '11px "IBM Plex Mono", monospace';
          ctx.fillText(labels[i], bx + 8, 204);
          ctx.fillText(`${Math.round((v * h) / (v * 1.35))}`, bx + 12, 178 - h);
        });
        ctx.fillStyle = '#0f172a';
        ctx.font = '11px "IBM Plex Mono", monospace';
        ctx.fillText('Y', 62, 42);
        ctx.fillText('X-O‘QI', 485, 204);
      } else if (type === 'maze' || type === 'scratch') {
        // Robot maze path or Scratch polygon drawing
        if (type === 'maze') {
          const path = [
            [0, 0], [1, 0], [1, 1], [1, 2], [2, 2], [3, 2], [3, 3], [4, 3], [4, 4]
          ];
          const sz = 34;
          const ox = 120;
          const oy = 24;
          const walls = new Set(['2,0', '0,1', '2,1', '3,1', '0,3', '1,3', '2,3']);
          for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
              const isWall = walls.has(`${c},${r}`);
              ctx.fillStyle = isWall ? '#0f172a' : r === 4 && c === 4 ? '#10b981' : '#ffffff';
              ctx.strokeStyle = 'rgba(15,23,42,0.2)';
              ctx.fillRect(ox + c * sz, oy + r * sz, sz, sz);
              ctx.strokeRect(ox + c * sz, oy + r * sz, sz, sz);
            }
          }
          const idx = Math.floor(t * 2.2) % path.length;
          const [rx, ry] = path[idx];
          ctx.fillStyle = '#2563eb';
          ctx.beginPath();
          ctx.arc(ox + rx * sz + sz / 2, oy + ry * sz + sz / 2, 11, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#0f172a';
          ctx.font = '12px "IBM Plex Mono", monospace';
          ctx.fillText(`QADAM #${idx + 1}: OLDINGA / BURILISH`, 330, 88);
          ctx.fillText('REPEAT + BLOK-SXEMA', 330, 114);
        } else {
          // Scratch PEN polygon loop
          const sides = 6;
          const cx = 200;
          const cy = 115;
          const rad = 68;
          const prog = (t * 1.4) % (sides + 1.5);
          ctx.strokeStyle = '#2563eb';
          ctx.lineWidth = 3;
          ctx.beginPath();
          for (let i = 0; i <= Math.min(sides, Math.floor(prog)); i++) {
            const ang = (i / sides) * Math.PI * 2 - Math.PI / 2;
            const px = cx + Math.cos(ang) * rad;
            const py = cy + Math.sin(ang) * rad;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();

          const currI = Math.min(sides, Math.floor(prog));
          const ang = (currI / sides) * Math.PI * 2 - Math.PI / 2;
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad, 8, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = '12px "IBM Plex Mono", monospace';
          ctx.fillText('PEN DOWN', 340, 74);
          ctx.fillText('REPEAT 6 [', 340, 98);
          ctx.fillText('  MOVE 60', 340, 120);
          ctx.fillText('  TURN 60°', 340, 142);
          ctx.fillText(']', 340, 164);
        }
      } else if (type === 'email' || type === 'network') {
        // Packet / Email transfer between nodes
        const nodes =
          type === 'email'
            ? [
                { x: 95, y: 112, label: 'YUBORUVCHI' },
                { x: 290, y: 112, label: 'MAIL SERVER' },
                { x: 485, y: 112, label: 'QABUL QILUVCHI' },
              ]
            : [
                { x: 85, y: 112, label: 'MODEM' },
                { x: 220, y: 112, label: 'ROUTER / SHLYUZ' },
                { x: 365, y: 112, label: 'SWITCH' },
                { x: 500, y: 112, label: 'KOMPYUTER' },
              ];

        ctx.strokeStyle = 'rgba(15,23,42,0.28)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(nodes[0].x, nodes[0].y);
        ctx.lineTo(nodes[nodes.length - 1].x, nodes[nodes.length - 1].y);
        ctx.stroke();

        // Moving packet
        const pNorm = (t * 0.45) % 1;
        const px = nodes[0].x + (nodes[nodes.length - 1].x - nodes[0].x) * pNorm;
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(px - 12, 100, 24, 24);
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px "IBM Plex Mono", monospace';
        ctx.fillText(type === 'email' ? '@' : 'PKT', px - 9, 116);

        nodes.forEach((n) => {
          ctx.fillStyle = '#f3f5f8';
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2;
          ctx.fillRect(n.x - 36, n.y - 28, 72, 56);
          ctx.strokeRect(n.x - 36, n.y - 28, 72, 56);
          ctx.fillStyle = '#0f172a';
          ctx.font = '10px "IBM Plex Mono", monospace';
          ctx.fillText(n.label, n.x - 34, n.y + 46);
        });
      } else if (type === 'excel' || type === 'database') {
        // Table cell calculation or PK->FK join animation
        const cols = type === 'excel' ? ['A', 'B', 'C = A+B'] : ['ID (PK)', 'ISM', 'SINF_ID (FK)'];
        const rows =
          type === 'excel'
            ? [
                ['15', '25', '=A2+B2 -> 40'],
                ['30', '45', '=A3+B3 -> 75'],
                ['20', '10', '=A4+B4 -> 30'],
              ]
            : [
                ['#101', 'Aziza', 'S-06'],
                ['#102', 'Jasur', 'S-07'],
                ['#103', 'Madina', 'S-06'],
              ];

        const activeRow = Math.floor(t * 1.1) % 3;
        cols.forEach((c, ci) => {
          const x = 68 + ci * 155;
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x, 32, 148, 28);
          ctx.fillStyle = '#f8fafc';
          ctx.font = '11px "IBM Plex Mono", monospace';
          ctx.fillText(c, x + 10, 50);
        });
        rows.forEach((r, ri) => {
          const y = 64 + ri * 38;
          const hl = ri === activeRow;
          r.forEach((val, ci) => {
            const x = 68 + ci * 155;
            ctx.fillStyle = hl ? 'rgba(37,99,235,0.16)' : '#ffffff';
            ctx.strokeStyle = hl ? '#2563eb' : 'rgba(15,23,42,0.2)';
            ctx.fillRect(x, y, 148, 34);
            ctx.strokeRect(x, y, 148, 34);
            ctx.fillStyle = '#0f172a';
            ctx.font = '12px "IBM Plex Mono", monospace';
            ctx.fillText(val, x + 10, y + 21);
          });
        });
        ctx.fillStyle = '#0f172a';
        ctx.font = '11px "IBM Plex Mono", monospace';
        ctx.fillText(
          type === 'excel'
            ? `FAOL QATOR #${activeRow + 1}: FORMULA AVTO-HISOBLANMOQDA`
            : `QUERY / 3NF BOG‘LANISH: QATOR #${activeRow + 1} TEKSHIRILDI`,
          68,
          208
        );
      } else if (type === 'html' || type === 'jsloop') {
        // Code layers or JS array loop highlight
        if (type === 'html') {
          const layers = [
            { name: '1. HTML (Tuzilma)', color: '#38bdf8', y: 40 },
            { name: '2. CSS (Dizayn/Stil)', color: '#2563eb', y: 92 },
            { name: '3. JS (Xulq-atvor)', color: '#0f172a', y: 144 },
          ];
          const active = Math.floor(t) % 3;
          layers.forEach((l, i) => {
            const off = active === i ? 12 : 0;
            ctx.fillStyle = l.color;
            ctx.fillRect(72 + off, l.y, 230, 38);
            ctx.fillStyle = i === 0 ? '#0f172a' : '#f8fafc';
            ctx.font = '12px "IBM Plex Mono", monospace';
            ctx.fillText(l.name, 84 + off, l.y + 23);
          });
          // Rendered miniature preview on right
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#0f172a';
          ctx.fillRect(350, 42, 180, 140);
          ctx.strokeRect(350, 42, 180, 140);
          ctx.fillStyle = active >= 1 ? '#2563eb' : '#0f172a';
          ctx.font = 'bold 16px sans-serif';
          ctx.fillText('Salom Veb!', 386, 86);
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(386, 108, 106, 28);
          ctx.strokeRect(386, 108, 106, 28);
          ctx.fillStyle = '#0f172a';
          ctx.font = '11px "IBM Plex Mono", monospace';
          ctx.fillText('BOSING ->', 402, 126);
        } else {
          const arr = [12, 24, 36, 48, 60];
          const idx = Math.floor(t * 1.4) % arr.length;
          ctx.fillStyle = '#0f172a';
          ctx.font = '13px "IBM Plex Mono", monospace';
          ctx.fillText(`for (let i = 0; i < 5; i++)  // hozir i = ${idx}`, 74, 48);
          arr.forEach((v, i) => {
            const bx = 74 + i * 92;
            const hl = i === idx;
            ctx.fillStyle = hl ? '#2563eb' : '#ffffff';
            ctx.strokeStyle = '#0f172a';
            ctx.fillRect(bx, 76, 78, 62);
            ctx.strokeRect(bx, 76, 78, 62);
            ctx.fillStyle = hl ? '#ffffff' : '#0f172a';
            ctx.font = 'bold 18px "IBM Plex Mono", monospace';
            ctx.fillText(`${v}`, bx + 26, 112);
            ctx.fillStyle = '#0f172a';
            ctx.font = '11px "IBM Plex Mono", monospace';
            ctx.fillText(`a[${i}]`, bx + 24, 158);
          });
          ctx.fillText(`NATIJA: console.log(a[${idx}]) -> ${arr[idx]}`, 74, 198);
        }
      } else if (type === 'video') {
        // Timeline clips + audio wave animation
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(60, 28, 460, 68);
        const frameNo = (Math.floor(t * 12) % 24) + 1;
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`KADR #${frameNo} · 16:9 · SUBTITR FAOL`, 160, 66);
        ctx.font = '12px "IBM Plex Mono", monospace';

        // Audio waveform
        for (let i = 0; i < 46; i++) {
          const amp = 10 + Math.abs(Math.sin(t * 4 + i * 0.4)) * 42;
          ctx.fillStyle = i % 2 === 0 ? '#2563eb' : '#0284c7';
          ctx.fillRect(64 + i * 10, 155 - amp / 2, 6, amp);
        }
        ctx.fillStyle = '#0f172a';
        ctx.fillText('AUDIO TREK + REVERBERATSIYA / NARRATION', 135, 208);
      } else if (type === 'hardware' || type === 'sensor' || type === 'expert') {
        const boxes =
          type === 'hardware'
            ? ['KIRITISH (OCR)', 'CPU + RAM', 'CHIQARISH / SSD']
            : type === 'sensor'
            ? ['HARORAT SENSORI', 'MIKROPROTSESSOR', 'SOVUTGICH / IJRO']
            : ['BILIMLAR BAZASI', 'YAKUNLOVCHI MEXANIZM', 'TAVSIYA / UI'];
        const pulse = (t * 0.7) % 1;
        boxes.forEach((b, i) => {
          const bx = 54 + i * 172;
          const active = Math.floor(pulse * 3) === i;
          ctx.fillStyle = active ? '#2563eb' : '#ffffff';
          ctx.strokeStyle = '#0f172a';
          ctx.fillRect(bx, 72, 146, 76);
          ctx.strokeRect(bx, 72, 146, 76);
          ctx.fillStyle = active ? '#ffffff' : '#0f172a';
          ctx.font = '10px "IBM Plex Mono", monospace';
          ctx.fillText(b, bx + 10, 114);
        });
        ctx.fillStyle = '#0f172a';
        ctx.font = '12px "IBM Plex Mono", monospace';
        ctx.fillText('SIGNAL VA QAROR QABUL QILISH ZANJIRI ->', 138, 192);
      } else if (type === 'security') {
        // Firewall filtering packets
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(280, 28, 22, 168);
        ctx.fillStyle = '#38bdf8';
        ctx.font = '10px "IBM Plex Mono", monospace';
        ctx.fillText('FW', 284, 116);

        const pktX = 70 + ((t * 110) % 210);
        const isThreat = Math.floor(t / 2) % 2 === 1;
        ctx.fillStyle = isThreat ? '#dc2626' : '#10b981';
        ctx.fillRect(isThreat ? Math.min(pktX, 250) : 70 + ((t * 140) % 410), 96, 28, 24);
        ctx.fillStyle = '#0f172a';
        ctx.font = '12px "IBM Plex Mono", monospace';
        ctx.fillText(
          isThreat ? 'BLOKLANDI: PHISHING / TROYAN!' : 'RUXSAT ETILDI: HTTPS XAVFSIZ',
          135,
          212
        );
      } else if (type === 'gantt') {
        const tasks = [
          { name: 'Tahlil', start: 0, len: 2, color: '#38bdf8' },
          { name: 'Dizayn', start: 2, len: 2, color: '#0284c7' },
          { name: 'Kodlash', start: 3, len: 4, color: '#2563eb' },
          { name: 'Sinov', start: 6, len: 2, color: '#0f172a' },
        ];
        const currWeek = phase * 1.4;
        tasks.forEach((tk, i) => {
          const y = 36 + i * 38;
          ctx.fillStyle = '#0f172a';
          ctx.font = '11px "IBM Plex Mono", monospace';
          ctx.fillText(tk.name, 48, y + 18);
          ctx.fillStyle = 'rgba(15,23,42,0.08)';
          ctx.fillRect(130, y, 400, 24);
          ctx.fillStyle = tk.color;
          ctx.fillRect(130 + tk.start * 48, y, tk.len * 48, 24);
        });
        // Current week scan line
        const wx = 130 + Math.min(395, currWeek * 48);
        ctx.strokeStyle = '#059669';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(wx, 24);
        ctx.lineTo(wx, 192);
        ctx.stroke();
        ctx.fillStyle = '#0f172a';
        ctx.font = '11px "IBM Plex Mono", monospace';
        ctx.fillText(`GANTT HAFTALIK NAZORAT: ${Math.min(8, Math.ceil(currWeek))}-HAFTA`, 130, 212);
      }
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [type, playing, speed, epoch, manualStep]);

  const handleCanvasInteract = () => {
    pulseBoostRef.current = 1.6;
    if (manualStep !== null) {
      setManualStep((s) => ((s ?? 0) + 1) % 4);
    } else if (!playing) {
      setPlaying(true);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--grid)] bg-[var(--surface)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--grid)] px-4 py-3">
        <div>
          <h4 className="text-sm font-medium text-[var(--ink)]">{title}</h4>
          <p className="text-xs text-[var(--dim)]">{subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <SparkleButton
            variant="secondary"
            size="xs"
            withParticles={false}
            onClick={() => {
              setManualStep(null);
              setPlaying((p) => !p);
            }}
          >
            {playing && manualStep === null ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            <span>{playing && manualStep === null ? 'Pauza' : 'Avto'}</span>
          </SparkleButton>
          {[0, 1, 2, 3].map((stepIdx) => (
            <SparkleButton
              key={stepIdx}
              variant={manualStep === stepIdx ? 'active' : 'secondary'}
              size="xs"
              withParticles={false}
              onClick={() => setManualStep((cur) => (cur === stepIdx ? null : stepIdx))}
              title={`${stepIdx + 1}-bosqichga o‘tish`}
            >
              {stepIdx + 1}-Q
            </SparkleButton>
          ))}
          <SparkleButton
            variant="secondary"
            size="xs"
            withParticles={false}
            onClick={() => {
              setManualStep(null);
              setSpeed((s) => (s === 1 ? 2 : 1));
            }}
          >
            {speed}x
          </SparkleButton>
          <SparkleButton
            variant="secondary"
            size="xs"
            withParticles={false}
            className="sparkle-icon-only"
            onClick={() => {
              setManualStep(null);
              setPlaying(true);
              setEpoch((e) => e + 1);
            }}
            aria-label="Qayta boshlash"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </SparkleButton>
        </div>
      </div>

      <div className="p-3">
        <canvas
          ref={canvasRef}
          width={580}
          height={230}
          onClick={handleCanvasInteract}
          title="Animatsiyani tezlashtirish yoki keyingi qadamga o‘tish uchun bosing"
          className="h-auto w-full cursor-pointer rounded-xl border border-[#0f172a]/15 bg-[#f3f5f8]"
        />
        <div className="mt-2 flex items-center justify-between px-1 font-mono-tech text-[10px] uppercase text-[var(--dim)]">
          <span>Interaktiv sxema: bosqichni tanlang (1-Q..4-Q) yoki maydonni bosing</span>
          <span>{manualStep !== null ? `Qadam #${manualStep + 1}` : playing ? `Jonli · ${speed}x` : 'Pauzada'}</span>
        </div>
      </div>
    </div>
  );
};
