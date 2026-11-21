import type React from 'react';

interface MustacheMarkProps {
  className?: string;
  width?: number;
  height?: number;
  fill?: string;
  accentFill?: string | null;
  scale?: number;
}

/**
 * Renders the brand's mustache motif SVG mark with configurable scale and fill colors.
 */
export const MustacheMark: React.FC<MustacheMarkProps> = ({
  className,
  width,
  height,
  fill = '#2d3c3a',
  accentFill = '#bd604e',
  scale = 0.145,
}) => (
  <svg
    viewBox="0 0 100 55"
    width={width}
    height={height}
    aria-hidden="true"
    className={className}
  >
    <g transform={`translate(50 28) scale(${scale}) translate(-370 -125)`}>
      <path
        fill={fill}
        d="M370 86 C356 66 338 62 316 62 C254 62 234 156 174 156 C138 156 112 142 112 120 C112 102 125 94 140 94 C153 94 160 103 160 114 C160 124 151 130 142 130 C136 130 132 126 132 121 C132 117 125 117 125 122 C125 132 133 139 144 139 C159 139 170 128 170 112 C170 94 155 82 136 82 C108 82 88 104 88 134 C88 172 144 188 214 188 C286 188 336 156 362 128 C366 124 368 122 370 122 C372 122 374 124 378 128 C404 156 454 188 526 188 C596 188 652 172 652 134 C652 104 632 82 604 82 C585 82 570 94 570 112 C570 128 581 139 596 139 C607 139 615 132 615 122 C615 117 608 117 608 121 C608 126 604 130 598 130 C589 130 580 124 580 114 C580 103 587 94 600 94 C615 94 628 102 628 120 C628 142 602 156 566 156 C506 156 486 62 424 62 C402 62 384 66 370 86 Z"
      />
      {accentFill !== null && (
        <path
          d="M370 96 C360 82 346 88 349 101 C351 110 370 120 370 120 C370 120 389 110 391 101 C394 88 380 82 370 96 Z"
          fill={accentFill}
        />
      )}
    </g>
  </svg>
);
