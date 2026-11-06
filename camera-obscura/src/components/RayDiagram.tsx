import React, { useRef, useState, useCallback } from 'react';
import { OpticalParameters, OpticalComputation } from '../types';

interface RayDiagramProps {
  params: OpticalParameters;
  computation: OpticalComputation;
  onChangeParams: (updated: Partial<OpticalParameters>) => void;
}

export const RayDiagram: React.FC<RayDiagramProps> = ({
  params,
  computation,
  onChangeParams,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [activeDrag, setActiveDrag] = useState<'objectDist' | 'objectHeight' | 'screenDist' | null>(null);

  // Scaled Euclidean coordinate system:
  // Isotropic 1:1 scale: 92 pixels per meter in both X and Y.
  // Straight ray lines remain 100% Euclidean straight paths across the aperture vertex.
  const SCALE = 92; // 92 px per SI meter
  const PINHOLE_X = 730;
  const AXIS_Y = 250;
  const BOX_RIGHT = 870; // rear of the dark chamber
  const BOX_TOP = 40;
  const BOX_BOTTOM = 430;

  const objectX = PINHOLE_X - params.objectDistance * SCALE;
  const objectTopY = AXIS_Y - params.objectHeight * SCALE;
  const screenX = PINHOLE_X + params.screenDistance * SCALE;
  const imageTipY = AXIS_Y + computation.imageHeight * SCALE;

  // Standard fixed pinhole opening radius for the geometric model
  const apertureRadiusPx = 3.5;

  // Pointer drag handlers
  const handlePointerDown = (type: 'objectDist' | 'objectHeight' | 'screenDist') => (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as Element).setPointerCapture(e.pointerId);
    setActiveDrag(type);
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!activeDrag || !svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      // Convert client coords to SVG viewBox coords
      const svgX = (clientX / rect.width) * 960;
      const svgY = (clientY / rect.height) * 460;

      if (activeDrag === 'objectDist') {
        const rawDist = (PINHOLE_X - svgX) / SCALE;
        const clamped = Math.max(1.0, Math.min(6.0, Math.round(rawDist * 20) / 20));
        onChangeParams({ objectDistance: clamped });
      } else if (activeDrag === 'objectHeight') {
        const rawHeight = (AXIS_Y - svgY) / SCALE;
        const clamped = Math.max(0.5, Math.min(2.0, Math.round(rawHeight * 20) / 20));
        onChangeParams({ objectHeight: clamped });
      } else if (activeDrag === 'screenDist') {
        const rawDist = (svgX - PINHOLE_X) / SCALE;
        const clamped = Math.max(0.1, Math.min(1.0, Math.round(rawDist * 50) / 50));
        onChangeParams({ screenDistance: clamped });
      }
    },
    [activeDrag, onChangeParams]
  );

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeDrag) {
      try {
        (e.target as Element).releasePointerCapture(e.pointerId);
      } catch {
        // pointer capture fallback
      }
      setActiveDrag(null);
    }
  };

  // Render object graphic based on chosen type
  const renderObjectGraphic = (x: number, baseY: number, height: number, inverted = false) => {
    const scale = inverted ? -1 : 1;
    const transform = `translate(${x}, ${baseY}) scale(1, ${scale})`;
    const h = height;

    if (params.objectType === 'candle') {
      const candleW = 18;
      const candleH = h * 0.78;
      const flameH = h * 0.22;
      return (
        <g transform={transform}>
          {/* Candle Stand / Base */}
          <ellipse cx="0" cy="0" rx="18" ry="4" fill="#334155" stroke="#475569" strokeWidth="1" />
          <path d="M -12 0 L -8 -10 L 8 -10 L 12 0 Z" fill="#475569" />
          <rect x="-8" y="-14" width="16" height="4" rx="1" fill="#64748b" />
          
          {/* Wax Column */}
          <rect
            x={-candleW / 2}
            y={-14 - candleH}
            width={candleW}
            height={candleH}
            rx="2"
            fill="url(#waxGradient)"
            stroke="#d97706"
            strokeWidth="0.8"
          />
          {/* Candle Wick */}
          <line
            x1="0"
            y1={-14 - candleH}
            x2="0"
            y2={-14 - candleH - 6}
            stroke="#1e293b"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Flame Glow */}
          <circle
            cx="0"
            cy={-14 - candleH - flameH * 0.55}
            r={flameH * 0.75}
            fill="#f59e0b"
            opacity={inverted ? 0.35 : 0.45}
            filter="url(#flameBlur)"
          />
          {/* Flame Body */}
          <path
            d={`M 0 ${-14 - candleH - flameH} C 8 ${-14 - candleH - flameH * 0.4} 6 ${-14 - candleH - 4} 0 ${-14 - candleH - 2} C -6 ${-14 - candleH - 4} -8 ${-14 - candleH - flameH * 0.4} 0 ${-14 - candleH - flameH} Z`}
            fill="url(#flameGradient)"
          />
          {/* Inner White Flame Core */}
          <path
            d={`M 0 ${-14 - candleH - flameH * 0.75} C 3 ${-14 - candleH - flameH * 0.3} 2 ${-14 - candleH - 4} 0 ${-14 - candleH - 3} C -2 ${-14 - candleH - 4} -3 ${-14 - candleH - flameH * 0.3} 0 ${-14 - candleH - flameH * 0.75} Z`}
            fill="#fef3c7"
          />
        </g>
      );
    }

    if (params.objectType === 'arrow') {
      const headH = Math.min(32, h * 0.28);
      const headW = 28;
      const shaftW = 8;
      return (
        <g transform={transform}>
          {/* Base Plate */}
          <rect x="-16" y="-3" width="32" height="3" fill="#64748b" rx="1" />
          {/* Arrow Shaft */}
          <rect
            x={-shaftW / 2}
            y={-h + headH}
            width={shaftW}
            height={h - headH}
            fill={inverted ? '#f59e0b' : '#38bdf8'}
            opacity="0.9"
          />
          {/* Arrow Head */}
          <polygon
            points={`0,${-h} ${headW / 2},${-h + headH} ${-headW / 2},${-h + headH}`}
            fill={inverted ? '#fbbf24' : '#0ea5e9'}
          />
          {/* Text indicator without LaTeX */}
          <text
            x="14"
            y={-h + headH * 0.8}
            fill={inverted ? '#fbbf24' : '#38bdf8'}
            fontSize="9"
            fontFamily="JetBrains Mono"
            fontWeight="bold"
          >
            {inverted ? 'TIP (INVERTED)' : 'TIP'}
          </text>
        </g>
      );
    }

    if (params.objectType === 'tree') {
      const trunkW = 14;
      const trunkH = h * 0.4;
      const crownR = (h * 0.6) / 2;
      return (
        <g transform={transform}>
          {/* Soil Mound */}
          <ellipse cx="0" cy="0" rx="20" ry="4" fill="#334155" />
          {/* Trunk */}
          <rect x={-trunkW / 2} y={-trunkH} width={trunkW} height={trunkH} fill="#78350f" rx="1" />
          {/* Foliage Crown */}
          <circle cx="0" cy={-trunkH - crownR * 0.9} r={crownR * 1.1} fill="#166534" />
          <circle cx={-crownR * 0.5} cy={-trunkH - crownR * 0.8} r={crownR * 0.8} fill="#15803d" />
          <circle cx={crownR * 0.5} cy={-trunkH - crownR * 0.8} r={crownR * 0.8} fill="#15803d" />
          <circle cx="0" cy={-h + crownR * 0.8} r={crownR * 0.85} fill="#22c55e" opacity="0.9" />
          <circle cx="0" cy={-h} r="2.5" fill="#f59e0b" />
        </g>
      );
    }

    // Modern Architecture Pavilion
    const roofH = h * 0.25;
    const bldW = 34;
    return (
      <g transform={transform}>
        <rect x={-bldW / 2 - 6} y="-4" width={bldW + 12} height="4" fill="#475569" />
        <rect x={-bldW / 2} y={-h + roofH} width={bldW} height={h - roofH} fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
        <rect x={-bldW / 2 + 4} y={-h + roofH + 8} width={bldW - 8} height={h - roofH - 16} fill="#0ea5e9" opacity="0.3" />
        <rect x="-5" y="-16" width="10" height="16" fill="#f59e0b" opacity="0.8" />
        <polygon points={`0,${-h} ${bldW / 2 + 2},${-h + roofH} ${-bldW / 2 - 2},${-h + roofH}`} fill="#f59e0b" />
        <circle cx="0" cy={-h} r="2" fill="#fbbf24" />
      </g>
    );
  };

  return (
    <div className="relative w-full bg-[#070b16] rounded-xl border border-slate-800 shadow-2xl overflow-hidden select-none">
      {/* Visual Canvas Toolbar / Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-4 text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
            <span className="font-medium text-slate-200">Light Ray (Top)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
            <span className="font-medium text-slate-200">Baseline Ray</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
            <span className="w-4 border-t border-dashed border-slate-500" />
            <span>Optical Axis</span>
          </div>
        </div>

        {/* Display Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onChangeParams({ showSimilarTriangles: !params.showSimilarTriangles })}
            className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 ${
              params.showSimilarTriangles
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium'
                : 'text-slate-400 hover:text-slate-200 bg-slate-800/60 border border-slate-700/60'
            }`}
            title="Highlight similar right triangles meeting at the aperture vertex"
          >
            <span>Similar Triangles (Δ)</span>
          </button>

          <button
            onClick={() => onChangeParams({ showDimensions: !params.showDimensions })}
            className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 ${
              params.showDimensions
                ? 'bg-slate-700/60 text-slate-200 border border-slate-600'
                : 'text-slate-500 hover:text-slate-300 bg-slate-800/40 border border-slate-800'
            }`}
            title="Toggle dimension lines"
          >
            <span>Dimensions</span>
          </button>
        </div>
      </div>

      {/* SVG Optical Canvas */}
      <div className="relative w-full aspect-[960/460] min-h-[340px] max-h-[580px]">
        <svg
          ref={svgRef}
          viewBox="0 0 960 460"
          className="w-full h-full cursor-default"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <defs>
            <linearGradient id="chamberInterior" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#04060d" />
              <stop offset="100%" stopColor="#080e1e" />
            </linearGradient>

            <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.08" />
            </linearGradient>

            <linearGradient id="waxGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="50%" stopColor="#fde68a" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>

            <linearGradient id="flameGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#ea580c" />
              <stop offset="40%" stopColor="#f59e0b" />
              <stop offset="80%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#fef08a" />
            </linearGradient>

            <linearGradient id="screenGlass" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#e2e8f0" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
            </linearGradient>

            <filter id="flameBlur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" />
            </filter>

            <filter id="projectedGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <pattern id="metricGrid" width={SCALE} height="20" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="20" stroke="#1e293b" strokeWidth="1" strokeDasharray="2 3" />
            </pattern>
          </defs>

          {/* Outdoor world (left of aperture wall) */}
          <rect x="0" y="0" width={PINHOLE_X} height="460" fill="#080e1c" />
          
          {/* Ground grid pattern in outdoor world */}
          <rect x="0" y={AXIS_Y} width={PINHOLE_X} height={460 - AXIS_Y} fill="url(#metricGrid)" />
          
          {/* Ground surface line */}
          <line x1="0" y1={AXIS_Y} x2={PINHOLE_X} y2={AXIS_Y} stroke="#334155" strokeWidth="2" />
          
          {/* Outdoor ground meter ticks */}
          {Array.from({ length: 12 }).map((_, i) => {
            const gx = PINHOLE_X - (i + 1) * SCALE * 0.5;
            if (gx < 20) return null;
            return (
              <g key={`hatch-${i}`}>
                <line x1={gx} y1={AXIS_Y} x2={gx} y2={AXIS_Y + 8} stroke="#475569" strokeWidth="1.5" />
                <text x={gx} y={AXIS_Y + 20} fill="#64748b" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle">
                  -{(i + 1) * 0.5}m
                </text>
              </g>
            );
          })}

          {/* Camera Obscura Dark Chamber Enclosure */}
          <rect
            x={PINHOLE_X}
            y={BOX_TOP}
            width={BOX_RIGHT - PINHOLE_X + 60}
            height={BOX_BOTTOM - BOX_TOP}
            fill="url(#chamberInterior)"
          />

          {/* Chamber Roof, Floor, and Rear Wall */}
          <rect x={PINHOLE_X - 10} y={BOX_TOP - 16} width={BOX_RIGHT - PINHOLE_X + 80} height="16" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
          <rect x={PINHOLE_X - 10} y={BOX_BOTTOM} width={BOX_RIGHT - PINHOLE_X + 80} height="16" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
          <rect x={BOX_RIGHT + 50} y={BOX_TOP - 16} width="16" height={BOX_BOTTOM - BOX_TOP + 32} fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
          
          {/* Chamber Labels */}
          <text
            x={PINHOLE_X + 70}
            y={BOX_TOP + 24}
            fill="#94a3b8"
            fontSize="10"
            fontFamily="Outfit"
            fontWeight="600"
            letterSpacing="0.08em"
          >
            CAMERA OBSCURA CHAMBER
          </text>
          <text
            x={PINHOLE_X + 70}
            y={BOX_TOP + 38}
            fill="#64748b"
            fontSize="8.5"
            fontFamily="JetBrains Mono"
          >
            DARKROOM INTERIOR
          </text>

          {/* Optical Center Axis (Dashed centerline) */}
          <line
            x1="20"
            y1={AXIS_Y}
            x2={BOX_RIGHT + 40}
            y2={AXIS_Y}
            stroke="#475569"
            strokeWidth="1"
            strokeDasharray="5 5"
            opacity="0.7"
          />

          {/* Similar Triangles Highlight Shader (when enabled) */}
          {params.showSimilarTriangles && (
            <g>
              {/* Left Triangle (Object to Pinhole) */}
              <polygon
                points={`${objectX},${objectTopY} ${objectX},${AXIS_Y} ${PINHOLE_X},${AXIS_Y}`}
                fill="#f59e0b"
                fillOpacity="0.12"
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <path
                d={`M ${objectX + 12} ${AXIS_Y} L ${objectX + 12} ${AXIS_Y - 12} L ${objectX} ${AXIS_Y - 12}`}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1"
              />

              {/* Right Triangle (Pinhole to Image Screen) */}
              <polygon
                points={`${PINHOLE_X},${AXIS_Y} ${screenX},${AXIS_Y} ${screenX},${imageTipY}`}
                fill="#38bdf8"
                fillOpacity="0.14"
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <path
                d={`M ${screenX - 12} ${AXIS_Y} L ${screenX - 12} ${AXIS_Y + 12} L ${screenX} ${AXIS_Y + 12}`}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1"
              />

              {/* Clean Vertex Labels */}
              <text x={objectX - 16} y={objectTopY - 6} fill="#fbbf24" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">
                A (Object Top)
              </text>
              <text x={objectX - 16} y={AXIS_Y + 18} fill="#fbbf24" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">
                B (Object Base)
              </text>
              <text x={PINHOLE_X} y={AXIS_Y - 14} fill="#f59e0b" fontSize="12" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">
                C (Aperture Vertex)
              </text>
              <text x={screenX + 12} y={AXIS_Y - 8} fill="#38bdf8" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">
                B' (Screen Center)
              </text>
              <text x={screenX + 12} y={imageTipY + 16} fill="#38bdf8" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">
                A' (Inverted Tip)
              </text>
            </g>
          )}

          {/* Projected Light Beam inside the chamber */}
          <polygon
            points={`${PINHOLE_X},${AXIS_Y - apertureRadiusPx} ${PINHOLE_X},${AXIS_Y + apertureRadiusPx} ${screenX},${imageTipY} ${screenX},${AXIS_Y}`}
            fill="url(#beamGradient)"
            opacity="0.75"
          />

          {/* Primary Optical Rays (Chief Rays) */}
          {params.showRays && (
            <g>
              {/* Top Chief Ray (Golden Amber) */}
              <line
                x1={objectX}
                y1={objectTopY}
                x2={screenX}
                y2={imageTipY}
                stroke="#fbbf24"
                strokeWidth="2.5"
                strokeLinecap="round"
                filter="url(#projectedGlow)"
              />

              {/* Baseline Ray (Sky Blue) */}
              <line
                x1={objectX}
                y1={AXIS_Y}
                x2={screenX}
                y2={AXIS_Y}
                stroke="#38bdf8"
                strokeWidth="1.8"
                strokeLinecap="round"
              />

              {/* Midpoint Ray (Subtle Warm Amber) */}
              <line
                x1={objectX}
                y1={AXIS_Y - (params.objectHeight * SCALE) / 2}
                x2={screenX}
                y2={AXIS_Y + (computation.imageHeight * SCALE) / 2}
                stroke="#f59e0b"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.65"
              />

              {/* Pre-pinhole arrow */}
              {(() => {
                const midX1 = (objectX + PINHOLE_X) / 2;
                const midY1 = (objectTopY + AXIS_Y) / 2;
                const angle = Math.atan2(AXIS_Y - objectTopY, PINHOLE_X - objectX) * (180 / Math.PI);
                return (
                  <polygon
                    points="-6,-3 2,0 -6,3"
                    fill="#fbbf24"
                    transform={`translate(${midX1}, ${midY1}) rotate(${angle})`}
                  />
                );
              })()}

              {/* Post-pinhole arrow */}
              {(() => {
                const midX2 = (PINHOLE_X + screenX) / 2;
                const midY2 = (AXIS_Y + imageTipY) / 2;
                const angle = Math.atan2(imageTipY - AXIS_Y, screenX - PINHOLE_X) * (180 / Math.PI);
                return (
                  <polygon
                    points="-6,-3 2,0 -6,3"
                    fill="#fbbf24"
                    transform={`translate(${midX2}, ${midY2}) rotate(${angle})`}
                  />
                );
              })()}
            </g>
          )}

          {/* Aperture Wall */}
          <rect
            x={PINHOLE_X - 6}
            y={BOX_TOP}
            width="12"
            height={AXIS_Y - BOX_TOP - apertureRadiusPx}
            fill="#334155"
            stroke="#475569"
            strokeWidth="1.5"
          />
          <rect
            x={PINHOLE_X - 6}
            y={AXIS_Y + apertureRadiusPx}
            width="12"
            height={BOX_BOTTOM - (AXIS_Y + apertureRadiusPx)}
            fill="#334155"
            stroke="#475569"
            strokeWidth="1.5"
          />

          {/* Pinhole Opening Bracket */}
          <circle
            cx={PINHOLE_X}
            cy={AXIS_Y}
            r={apertureRadiusPx + 1}
            fill="#f59e0b"
            opacity="0.8"
            filter="url(#projectedGlow)"
          />
          <g transform={`translate(${PINHOLE_X}, ${BOX_TOP + 14})`}>
            <text fill="#fbbf24" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">
              PINHOLE
            </text>
            <text fill="#94a3b8" fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle" y="12">
              Aperture
            </text>
          </g>

          {/* The Object */}
          <g>
            {renderObjectGraphic(objectX, AXIS_Y, params.objectHeight * SCALE, false)}

            {/* Height Drag Handle */}
            <g
              transform={`translate(${objectX}, ${objectTopY})`}
              className="cursor-ns-resize group"
              onPointerDown={handlePointerDown('objectHeight')}
            >
              <circle
                r="9"
                fill="#0f172a"
                stroke="#f59e0b"
                strokeWidth="2"
                className="transition-transform group-hover:scale-125"
              />
              <path d="M 0 -4 L 3 -1 L -3 -1 Z M 0 4 L 3 1 L -3 1 Z" fill="#f59e0b" />
            </g>

            {/* Distance Drag Handle at Base */}
            <g
              transform={`translate(${objectX}, ${AXIS_Y + 12})`}
              className="cursor-ew-resize group"
              onPointerDown={handlePointerDown('objectDist')}
            >
              <rect
                x="-12"
                y="-7"
                width="24"
                height="14"
                rx="4"
                fill="#0f172a"
                stroke="#38bdf8"
                strokeWidth="1.5"
                className="transition-transform group-hover:scale-110"
              />
              <path d="M -7 0 L -4 -3 L -4 3 Z M 7 0 L 4 -3 L 4 3 Z" fill="#38bdf8" />
            </g>
          </g>

          {/* Projection Screen */}
          <g>
            <rect
              x={screenX - 3}
              y={BOX_TOP + 10}
              width="6"
              height={BOX_BOTTOM - BOX_TOP - 20}
              fill="url(#screenGlass)"
              stroke="#38bdf8"
              strokeWidth="1"
              strokeDasharray="6 2"
              className="cursor-ew-resize"
              onPointerDown={handlePointerDown('screenDist')}
            />
            <rect x={screenX - 7} y={BOX_TOP + 6} width="14" height="6" fill="#475569" rx="1" />
            <rect x={screenX - 7} y={BOX_BOTTOM - 12} width="14" height="6" fill="#475569" rx="1" />

            {/* Inverted Projected Image on Screen */}
            <g filter="url(#projectedGlow)" opacity="0.95">
              {renderObjectGraphic(screenX, AXIS_Y, computation.imageHeight * SCALE, true)}
            </g>

            {/* Screen Drag Handle on the rail */}
            <g
              transform={`translate(${screenX}, ${BOX_BOTTOM - 20})`}
              className="cursor-ew-resize group"
              onPointerDown={handlePointerDown('screenDist')}
            >
              <rect
                x="-10"
                y="-6"
                width="20"
                height="12"
                rx="3"
                fill="#0f172a"
                stroke="#38bdf8"
                strokeWidth="1.5"
                className="transition-transform group-hover:scale-110"
              />
              <path d="M -5 0 L -3 -2 L -3 2 Z M 5 0 L 3 -2 L 3 2 Z" fill="#38bdf8" />
            </g>

            {/* Screen Label */}
            <text
              x={screenX}
              y={BOX_TOP + 24}
              fill="#38bdf8"
              fontSize="9"
              fontFamily="JetBrains Mono"
              fontWeight="bold"
              textAnchor="middle"
            >
              SCREEN
            </text>
            <text
              x={screenX}
              y={BOX_TOP + 36}
              fill="#94a3b8"
              fontSize="8"
              fontFamily="JetBrains Mono"
              textAnchor="middle"
            >
              d_i = {params.screenDistance.toFixed(2)} m
            </text>
          </g>

          {/* Dimension Lines */}
          {params.showDimensions && (
            <g>
              {/* 1. Object Distance (d_o) */}
              <g transform={`translate(0, ${AXIS_Y + 45})`}>
                <line x1={objectX} y1="0" x2={PINHOLE_X} y2="0" stroke="#f59e0b" strokeWidth="1.2" />
                <line x1={objectX} y1="-5" x2={objectX} y2="5" stroke="#f59e0b" strokeWidth="1.2" />
                <line x1={PINHOLE_X} y1="-5" x2={PINHOLE_X} y2="5" stroke="#f59e0b" strokeWidth="1.2" />
                <polygon points={`${objectX},0 ${objectX + 6},-3 ${objectX + 6},3`} fill="#f59e0b" />
                <polygon points={`${PINHOLE_X},0 ${PINHOLE_X - 6},-3 ${PINHOLE_X - 6},3`} fill="#f59e0b" />
                <rect
                  x={(objectX + PINHOLE_X) / 2 - 46}
                  y="-10"
                  width="92"
                  height="20"
                  rx="4"
                  fill="#0b1120"
                  stroke="#f59e0b"
                  strokeWidth="1"
                />
                <text
                  x={(objectX + PINHOLE_X) / 2}
                  y="4"
                  fill="#fbbf24"
                  fontSize="10"
                  fontFamily="JetBrains Mono"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  d_o = {params.objectDistance.toFixed(2)} m
                </text>
              </g>

              {/* 2. Screen Distance (d_i) */}
              <g transform={`translate(0, ${AXIS_Y + 45})`}>
                <line x1={PINHOLE_X} y1="0" x2={screenX} y2="0" stroke="#38bdf8" strokeWidth="1.2" />
                <line x1={PINHOLE_X} y1="-5" x2={PINHOLE_X} y2="5" stroke="#38bdf8" strokeWidth="1.2" />
                <line x1={screenX} y1="-5" x2={screenX} y2="5" stroke="#38bdf8" strokeWidth="1.2" />
                <polygon points={`${PINHOLE_X},0 ${PINHOLE_X + 5},-2.5 ${PINHOLE_X + 5},2.5`} fill="#38bdf8" />
                <polygon points={`${screenX},0 ${screenX - 5},-2.5 ${screenX - 5},2.5`} fill="#38bdf8" />
                <rect
                  x={(PINHOLE_X + screenX) / 2 - 44}
                  y="-10"
                  width="88"
                  height="20"
                  rx="4"
                  fill="#0b1120"
                  stroke="#38bdf8"
                  strokeWidth="1"
                />
                <text
                  x={(PINHOLE_X + screenX) / 2}
                  y="4"
                  fill="#38bdf8"
                  fontSize="9.5"
                  fontFamily="JetBrains Mono"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  d_i = {params.screenDistance.toFixed(2)} m
                </text>
              </g>

              {/* 3. Object Height (h_o) */}
              <g transform={`translate(${objectX - 32}, 0)`}>
                <line x1="0" y1={objectTopY} x2="0" y2={AXIS_Y} stroke="#f59e0b" strokeWidth="1.2" />
                <line x1="-5" y1={objectTopY} x2="5" y2={objectTopY} stroke="#f59e0b" strokeWidth="1.2" />
                <line x1="-5" y1={AXIS_Y} x2="5" y2={AXIS_Y} stroke="#f59e0b" strokeWidth="1.2" />
                <polygon points={`0,${objectTopY} -3,${objectTopY + 6} 3,${objectTopY + 6}`} fill="#f59e0b" />
                <polygon points={`0,${AXIS_Y} -3,${AXIS_Y - 6} 3,${AXIS_Y - 6}`} fill="#f59e0b" />
                <rect
                  x="-46"
                  y={(objectTopY + AXIS_Y) / 2 - 10}
                  width="42"
                  height="20"
                  rx="4"
                  fill="#0b1120"
                  stroke="#f59e0b"
                  strokeWidth="1"
                />
                <text
                  x="-25"
                  y={(objectTopY + AXIS_Y) / 2 + 4}
                  fill="#fbbf24"
                  fontSize="9"
                  fontFamily="JetBrains Mono"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {params.objectHeight.toFixed(2)} m
                </text>
                <text
                  x="-25"
                  y={(objectTopY + AXIS_Y) / 2 - 14}
                  fill="#94a3b8"
                  fontSize="8"
                  fontFamily="JetBrains Mono"
                  textAnchor="middle"
                >
                  h_o
                </text>
              </g>

              {/* 4. Image Height (h_i) */}
              <g transform={`translate(${screenX + 24}, 0)`}>
                <line x1="0" y1={AXIS_Y} x2="0" y2={imageTipY} stroke="#38bdf8" strokeWidth="1.2" />
                <line x1="-5" y1={AXIS_Y} x2="5" y2={AXIS_Y} stroke="#38bdf8" strokeWidth="1.2" />
                <line x1="-5" y1={imageTipY} x2="5" y2={imageTipY} stroke="#38bdf8" strokeWidth="1.2" />
                <polygon points={`0,${AXIS_Y} -3,${AXIS_Y + 5} 3,${AXIS_Y + 5}`} fill="#38bdf8" />
                <polygon points={`0,${imageTipY} -3,${imageTipY - 5} 3,${imageTipY - 5}`} fill="#38bdf8" />
                <rect
                  x="8"
                  y={(AXIS_Y + imageTipY) / 2 - 10}
                  width="60"
                  height="20"
                  rx="4"
                  fill="#0b1120"
                  stroke="#38bdf8"
                  strokeWidth="1"
                />
                <text
                  x="38"
                  y={(AXIS_Y + imageTipY) / 2 + 4}
                  fill="#38bdf8"
                  fontSize="8.5"
                  fontFamily="JetBrains Mono"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {computation.imageHeight.toFixed(3)} m
                </text>
                <text
                  x="38"
                  y={(AXIS_Y + imageTipY) / 2 - 14}
                  fill="#94a3b8"
                  fontSize="8"
                  fontFamily="JetBrains Mono"
                  textAnchor="middle"
                >
                  h_i (Inv.)
                </text>
              </g>
            </g>
          )}

          {/* Interactive Cue */}
          <g transform="translate(18, 30)">
            <text fill="#64748b" fontSize="9" fontFamily="Outfit">
              Tip: Drag the object or screen directly in the canvas, or use the sliders below.
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};
