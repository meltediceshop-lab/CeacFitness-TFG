'use client';

import { useMemo } from 'react';

interface DataPoint {
  date: string; // YYYY-MM-DD
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  color?: string;
  unit?: string;
  height?: number;
  showDots?: boolean;
}

export function LineChart({
  data,
  color = '#10b981',
  unit = '',
  height = 140,
  showDots = true,
}: LineChartProps) {
  const sorted = useMemo(
    () => [...data].sort((a, b) => a.date.localeCompare(b.date)),
    [data]
  );

  const { points, pathD, min, max } = useMemo(() => {
    if (sorted.length < 2) return { points: [], pathD: '', min: 0, max: 0 };

    const values = sorted.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const W = 300;
    const H = height - 24; // leave room for labels
    const PAD_X = 8;
    const PAD_Y = 8;

    const xStep = (W - PAD_X * 2) / (sorted.length - 1);

    const toX = (i: number) => PAD_X + i * xStep;
    const toY = (v: number) => PAD_Y + (1 - (v - min) / range) * (H - PAD_Y * 2);

    const points = sorted.map((d, i) => ({ x: toX(i), y: toY(d.value), ...d }));

    // Smooth bezier path
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpX = (prev.x + curr.x) / 2;
      pathD += ` C ${cpX} ${prev.y} ${cpX} ${curr.y} ${curr.x} ${curr.y}`;
    }

    return { points, pathD, min, max };
  }, [sorted, height]);

  if (sorted.length < 2) {
    return (
      <div
        className="flex items-center justify-center text-stone-400 text-xs"
        style={{ height }}
      >
        Necesitas al menos 2 registros para ver la gráfica
      </div>
    );
  }

  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const delta = last.value - first.value;
  const deltaSign = delta > 0 ? '+' : '';

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 300 ${height - 24}`}
        className="w-full"
        style={{ height: height - 24 }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map(t => (
          <line
            key={t}
            x1="8"
            y1={(8 + t * (height - 24 - 16))}
            x2="292"
            y2={(8 + t * (height - 24 - 16))}
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-stone-200 dark:text-stone-700"
            strokeDasharray="4 4"
          />
        ))}

        {/* Area fill */}
        <defs>
          <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {points.length > 1 && (
          <path
            d={`${pathD} L ${points[points.length - 1].x} ${height - 24 - 8} L ${points[0].x} ${height - 24 - 8} Z`}
            fill={`url(#grad-${color.replace('#', '')})`}
          />
        )}

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dots */}
        {showDots && points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />
        ))}
      </svg>

      {/* X axis labels + delta */}
      <div className="flex justify-between items-center mt-1 px-2">
        <span className="text-[10px] text-stone-400">
          {first.date.slice(5).replace('-', '/')}
        </span>
        <span
          className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md"
          style={{
            color: delta === 0 ? '#64748b' : delta > 0 ? '#f97316' : '#10b981',
            backgroundColor: delta === 0 ? '#f1f5f9' : delta > 0 ? '#fff7ed' : '#ecfdf5',
          }}
        >
          {deltaSign}{delta.toFixed(1)}{unit}
        </span>
        <span className="text-[10px] text-stone-400">
          {last.date.slice(5).replace('-', '/')}
        </span>
      </div>
    </div>
  );
}

/** Mini sparkline for dashboard card (no labels, no dots) */
export function SparkLine({
  data,
  color = '#10b981',
  height = 40,
}: {
  data: { value: number }[];
  color?: string;
  height?: number;
}) {
  const pathD = useMemo(() => {
    if (data.length < 2) return '';
    const values = data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const W = 80;
    const H = height;
    const xStep = W / (data.length - 1);
    const toX = (i: number) => i * xStep;
    const toY = (v: number) => H - ((v - min) / range) * H * 0.8 - H * 0.1;

    const pts = data.map((d, i) => ({ x: toX(i), y: toY(d.value) }));
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const cpX = (pts[i - 1].x + pts[i].x) / 2;
      d += ` C ${cpX} ${pts[i - 1].y} ${cpX} ${pts[i].y} ${pts[i].x} ${pts[i].y}`;
    }
    return d;
  }, [data, height]);

  if (!pathD) return null;

  return (
    <svg viewBox={`0 0 80 ${height}`} className="w-20" style={{ height }}>
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
