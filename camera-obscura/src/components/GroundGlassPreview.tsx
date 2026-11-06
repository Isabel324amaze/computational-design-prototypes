import React, { useState } from 'react';
import { OpticalParameters, OpticalComputation } from '../types';
import { formatCentimeters, formatMeters } from '../utils/optics';
import { Grid, Eye } from 'lucide-react';

interface GroundGlassPreviewProps {
  params: OpticalParameters;
  computation: OpticalComputation;
}

export const GroundGlassPreview: React.FC<GroundGlassPreviewProps> = ({
  params,
  computation,
}) => {
  const [showTracingGrid, setShowTracingGrid] = useState(true);
  const [showComparisonPip, setShowComparisonPip] = useState(true);

  // Scaled height on the preview screen:
  // The preview frame represents a frosted glass viewing plane of height ~1.2 meters.
  // We map computation.imageHeight to percentage of preview height.
  const previewScreenHeightMeters = 1.2;
  const heightPercent = Math.min(95, Math.max(10, (computation.imageHeight / previewScreenHeightMeters) * 100));

  const renderSubject = (isInverted: boolean) => {
    if (params.objectType === 'candle') {
      return (
        <div
          className={`flex flex-col items-center justify-center transition-all duration-150 ${
            isInverted ? 'rotate-180 scale-x-[-1]' : ''
          }`}
          style={{ height: `${heightPercent}%` }}
        >
          {/* Flame */}
          <div className="relative flex flex-col items-center">
            <div className="w-12 h-16 rounded-full bg-amber-400/40 blur-md absolute -top-4 pointer-events-none" />
            <div className="w-5 h-10 rounded-[50%_50%_35%_35%] bg-gradient-to-t from-orange-600 via-amber-400 to-yellow-200 shadow-[0_0_15px_rgba(251,191,36,0.9)] animate-pulse" />
            <div className="w-2 h-4 -mt-5 rounded-full bg-amber-100 shadow-[0_0_8px_#ffffff]" />
            <div className="w-1 h-3 bg-stone-900 mt-1 rounded-sm" />
          </div>

          {/* Wax Pillar */}
          <div className="w-8 flex-1 min-h-[40px] bg-gradient-to-r from-amber-100 via-amber-50 to-amber-200 border border-amber-300/40 rounded-t-sm shadow-md flex flex-col justify-between items-center py-2">
            <div className="w-6 h-1 bg-amber-200/60 rounded-full" />
            <div className="w-1 h-12 bg-amber-200/50 rounded-full self-start ml-1.5" />
          </div>

          {/* Candlestick Base */}
          <div className="w-16 h-3 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-800 rounded-sm border-t border-slate-500 shadow-lg" />
          <div className="w-20 h-2 bg-slate-900 rounded-full" />
        </div>
      );
    }

    if (params.objectType === 'arrow') {
      return (
        <div
          className={`flex flex-col items-center justify-between transition-all duration-150 ${
            isInverted ? 'rotate-180 scale-x-[-1]' : ''
          }`}
          style={{ height: `${heightPercent}%` }}
        >
          {/* Arrow Tip */}
          <div className="flex flex-col items-center">
            <div className="w-0 h-0 border-x-[20px] border-x-transparent border-b-[32px] border-b-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]" />
            <span className="text-[10px] font-mono font-bold text-amber-200 mt-1 bg-black/60 px-1.5 py-0.5 rounded">
              TIP
            </span>
          </div>

          {/* Shaft */}
          <div className="w-4 flex-1 bg-gradient-to-r from-amber-400 to-amber-500 my-1 shadow-inner rounded-sm" />

          {/* Base */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono font-bold text-sky-300 mb-1 bg-black/60 px-1.5 py-0.5 rounded">
              BASE
            </span>
            <div className="w-16 h-4 bg-sky-600 rounded-sm shadow-md" />
          </div>
        </div>
      );
    }

    if (params.objectType === 'tree') {
      return (
        <div
          className={`flex flex-col items-center justify-end transition-all duration-150 ${
            isInverted ? 'rotate-180 scale-x-[-1]' : ''
          }`}
          style={{ height: `${heightPercent}%` }}
        >
          {/* Crown */}
          <div className="relative flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-emerald-700 border-2 border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.3)] relative z-10">
              <div className="absolute top-2 left-3 w-10 h-10 rounded-full bg-emerald-500/40" />
            </div>
            <div className="w-16 h-16 rounded-full bg-emerald-600 absolute -top-4 -left-3" />
            <div className="w-16 h-16 rounded-full bg-emerald-800 absolute -top-2 -right-3" />
          </div>
          {/* Trunk */}
          <div className="w-6 flex-1 min-h-[30px] bg-gradient-to-r from-amber-900 to-stone-800 rounded-sm -mt-2 z-0" />
          {/* Mound */}
          <div className="w-20 h-3 bg-stone-700 rounded-full" />
        </div>
      );
    }

    // Pavilion
    return (
      <div
        className={`flex flex-col items-center justify-end transition-all duration-150 ${
          isInverted ? 'rotate-180 scale-x-[-1]' : ''
        }`}
        style={{ height: `${heightPercent}%` }}
      >
        <div className="w-1.5 h-6 bg-amber-400" />
        <div className="w-0 h-0 border-x-[36px] border-x-transparent border-b-[24px] border-b-amber-500" />
        <div className="w-20 flex-1 min-h-[35px] bg-sky-950/80 border border-sky-400/60 flex items-center justify-center p-1">
          <div className="w-6 h-10 bg-amber-500/60 rounded-t-sm" />
        </div>
        <div className="w-28 h-4 bg-slate-700 rounded-sm" />
      </div>
    );
  };

  return (
    <div className="relative bg-[#070b16] rounded-xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-slate-200">Ground Glass Screen</span>
          <span className="text-[11px] font-mono text-amber-400/90 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
            Inside Darkroom
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTracingGrid(!showTracingGrid)}
            className={`p-1.5 rounded transition-colors flex items-center gap-1 text-[11px] ${
              showTracingGrid
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 bg-slate-800/50'
            }`}
            title="Toggle perspective tracing grid (Dürer veil)"
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Grid</span>
          </button>

          <button
            onClick={() => setShowComparisonPip(!showComparisonPip)}
            className={`p-1.5 rounded transition-colors flex items-center gap-1 text-[11px] ${
              showComparisonPip
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200 bg-slate-800/50'
            }`}
            title="Toggle picture-in-picture upright reference"
          >
            <span className="hidden sm:inline">Upright Ref</span>
            <span className="sm:hidden">Ref</span>
          </button>
        </div>
      </div>

      {/* Screen Viewport with Frosted Glass Look */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-[#03060f] flex items-center justify-center p-6 overflow-hidden">
        {/* Frame Border of Tracing Screen */}
        <div className="absolute inset-3 rounded-lg border-4 border-[#2b1f14] shadow-[inset_0_0_30px_rgba(0,0,0,0.9)] pointer-events-none z-20">
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-amber-700/80" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-amber-700/80" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-amber-700/80" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-amber-700/80" />
        </div>

        {/* Frosted Glass Surface */}
        <div
          className="absolute inset-4 rounded bg-[#0b1222]/85 backdrop-blur-[1px] shadow-[inset_0_0_60px_rgba(0,0,0,0.95)] z-0"
          style={{
            backgroundImage: `radial-gradient(circle at center, rgba(245, 158, 11, 0.12) 0%, rgba(2, 6, 23, 0.85) 75%)`,
          }}
        />

        {/* Perspective Tracing Grid Overlay */}
        {showTracingGrid && (
          <div
            className="absolute inset-4 z-10 pointer-events-none opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(to right, #94a3b8 1px, transparent 1px),
                linear-gradient(to bottom, #94a3b8 1px, transparent 1px)
              `,
              backgroundSize: '36px 36px',
            }}
          />
        )}

        {/* Crosshair Center */}
        <div className="absolute inset-4 z-10 pointer-events-none flex items-center justify-center">
          <div className="w-8 border-t border-dashed border-amber-400/30" />
          <div className="h-8 border-l border-dashed border-amber-400/30 absolute" />
        </div>

        {/* Inverted Subject (Rendered on Ground Glass) */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          {renderSubject(true)}
        </div>

        {/* Inversion Badge & Measured Size Overlay */}
        <div className="absolute bottom-6 left-6 z-30 flex flex-col gap-1 pointer-events-none">
          <div className="flex items-center gap-1.5 bg-[#0a1020]/90 border border-amber-500/40 rounded px-2.5 py-1 text-[11px] font-mono text-amber-300 shadow-md">
            <span className="font-bold">INVERTED & REVERSED (180°)</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 bg-black/70 px-2 py-0.5 rounded">
            Projected Height: <span className="text-amber-300 font-semibold">{formatCentimeters(computation.imageHeight)}</span> ({formatMeters(computation.imageHeight)})
          </div>
        </div>

        {/* Picture-in-Picture: Upright Real Object */}
        {showComparisonPip && (
          <div className="absolute top-6 right-6 z-30 bg-[#091124]/95 border border-slate-700/80 rounded-lg p-2.5 shadow-xl w-28 flex flex-col items-center">
            <span className="text-[9px] font-mono text-slate-400 mb-1.5 uppercase tracking-wider text-center">
              Outside (Real)
            </span>
            <div className="w-full h-24 bg-slate-950/80 rounded border border-slate-800 flex items-center justify-center overflow-hidden p-1">
              <div className="w-full h-full flex items-center justify-center scale-75">
                {renderSubject(false)}
              </div>
            </div>
            <span className="text-[9px] font-mono text-amber-300 font-medium mt-1">
              {formatMeters(params.objectHeight, 2)} Upright
            </span>
          </div>
        )}
      </div>

      {/* Screen Observation Note */}
      <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Translucent frosted tracing screen (projection plane)</span>
        <span className="font-mono text-amber-400">Scale: {(computation.magnification).toFixed(3)}×</span>
      </div>
    </div>
  );
};
