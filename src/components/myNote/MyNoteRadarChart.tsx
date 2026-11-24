import React from 'react';
import type { MyNoteRadarAxis } from '../../utils/myNoteSummary';

interface MyNoteRadarChartProps {
  axes: readonly MyNoteRadarAxis[];
  hasAnyActivity: boolean;
}

/**
 * Renders the 5-axis pentagon radar SVG visualizing fan activity in MyNote.
 */
export const MyNoteRadarChart: React.FC<MyNoteRadarChartProps> = ({
  axes,
  hasAnyActivity,
}) => {
  const cx = 166;
  const cy = 125;
  const maxRadius = 92;
  const rings = [0.25, 0.5, 0.75, 1];

  const pointAt = (index: number, ratio: number): [number, number] => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / 5;
    return [
      Number((cx + maxRadius * ratio * Math.cos(angle)).toFixed(2)),
      Number((cy + maxRadius * ratio * Math.sin(angle)).toFixed(2)),
    ];
  };

  const labelAnchor = (index: number): { x: number; y: number; anchor: 'middle' | 'start' | 'end' } => {
    const [x, y] = pointAt(index, 1.11);
    if (index === 0) return { x, y: y - 5, anchor: 'middle' };
    if (index === 1 || index === 2) return { x: x + 5, y: y + 4, anchor: 'start' };
    return { x: x - 5, y: y + 4, anchor: 'end' };
  };

  const polygonPoints = axes
    .map((axis, idx) => pointAt(idx, Math.max(0.08, axis.value)).join(','))
    .join(' ');

  return (
    <div className="mn-radar-wrap">
      <svg
        viewBox="0 0 332 226"
        className="mn-radar-svg"
        role="img"
        aria-label={`推し活バランスグラフ: ${axes.map((a) => `${a.label} ${a.rawLabel}`).join(' / ')}`}
      >
        {rings.map((ratio) => {
          const pts = Array.from({ length: 5 }, (_, idx) => pointAt(idx, ratio).join(',')).join(' ');
          return (
            <polygon
              key={ratio}
              points={pts}
              fill="none"
              stroke="#e5dccb"
              strokeWidth="1"
            />
          );
        })}

        {axes.map((axis, idx) => {
          const [px, py] = pointAt(idx, 1);
          const lbl = labelAnchor(idx);
          return (
            <g key={axis.id}>
              <line
                x1={cx}
                y1={cy}
                x2={px}
                y2={py}
                stroke="#dcd1bd"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <text
                x={lbl.x}
                y={lbl.y}
                textAnchor={lbl.anchor}
                fontSize="11"
                fontWeight="700"
                fill="#44403C"
              >
                {axis.label}
              </text>
            </g>
          );
        })}

        {hasAnyActivity ? (
          <g>
            <polygon
              points={polygonPoints}
              fill="rgba(200, 62, 43, 0.17)"
              stroke="#C83E2B"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            {axes.map((axis, idx) => {
              const [px, py] = pointAt(idx, Math.max(0.08, axis.value));
              return (
                <circle
                  key={axis.id}
                  cx={px}
                  cy={py}
                  r="3.2"
                  fill="#C83E2B"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                />
              );
            })}
          </g>
        ) : (
          <text
            x={cx}
            y={cy + 4}
            textAnchor="middle"
            fontSize="10.5"
            fontWeight="700"
            fill="#68625C"
          >
            記録が増えると形が育ちます
          </text>
        )}
      </svg>
    </div>
  );
};
