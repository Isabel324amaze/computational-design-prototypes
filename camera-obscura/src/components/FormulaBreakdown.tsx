import React from 'react';
import { OpticalParameters, OpticalComputation } from '../types';
import { formatMeters, formatCentimeters } from '../utils/optics';
import { Calculator, Check, Scale, Maximize2 } from 'lucide-react';

interface FormulaBreakdownProps {
  params: OpticalParameters;
  computation: OpticalComputation;
}

export const FormulaBreakdown: React.FC<FormulaBreakdownProps> = ({
  params,
  computation,
}) => {
  const { objectDistance: d_o, objectHeight: h_o, screenDistance: d_i } = params;
  const { imageHeight: h_i, magnification: M } = computation;

  const reductionFactor = M > 0 ? (1 / M).toFixed(2) : '0';

  return (
    <div className="bg-[#0b1122] rounded-xl border border-slate-800 p-5 shadow-xl space-y-5">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100 tracking-tight">
              Deterministic Formula & Geometric Computation
            </h2>
            <p className="text-[11px] text-slate-400">
              Fundamental Camera Obscura equation derived from Euclidean similar triangles
            </p>
          </div>
        </div>

        <div className="text-[11px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2.5 py-1 rounded">
          Linear Pinhole Model
        </div>
      </div>

      {/* Main Formula Highlight Card with JSX Math Rendering */}
      <div className="bg-[#0e172e] rounded-xl border border-amber-500/30 p-4 sm:p-5 shadow-inner">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Governing Optical Equation
        </div>

        {/* Symbolic Formula Display */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 py-3 font-mono text-lg sm:text-2xl text-slate-100">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <span>h_i</span>
            <span className="text-slate-400 font-normal">=</span>
          </div>

          <div className="inline-flex flex-col items-center">
            <div className="px-3 pb-1 border-b-2 border-slate-600 text-slate-100 flex items-center gap-2">
              <span className="text-amber-300 font-semibold">h_o</span>
              <span className="text-slate-400">×</span>
              <span className="text-sky-300 font-semibold">d_i</span>
            </div>
            <div className="pt-1 text-amber-300 font-semibold">
              d_o
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-slate-400 text-sm font-sans font-normal border-l border-slate-700/80 pl-6">
            <span>Image Height</span>
            <span>=</span>
            <span>(Object Height × Screen Distance) / Object Distance</span>
          </div>
        </div>

        {/* Real-time Numeric Substitution Display with SI meters */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-center gap-2 sm:gap-4 font-mono text-sm sm:text-base text-slate-200">
          <span className="text-amber-400 font-bold">
            h_i
          </span>
          <span className="text-slate-500">=</span>
          
          <div className="inline-flex flex-col items-center">
            <div className="px-2 pb-0.5 border-b border-slate-600 flex items-center gap-1.5 text-xs sm:text-sm">
              <span className="text-amber-300">{h_o.toFixed(2)} m</span>
              <span className="text-slate-400">×</span>
              <span className="text-sky-300">{d_i.toFixed(2)} m</span>
            </div>
            <div className="pt-0.5 text-amber-300 text-xs sm:text-sm">
              {d_o.toFixed(2)} m
            </div>
          </div>

          <span className="text-slate-500">=</span>
          <span className="text-xs sm:text-sm text-slate-300">
            {(h_o * d_i).toFixed(4)} m² / {d_o.toFixed(2)} m
          </span>

          <span className="text-amber-400 font-bold text-base sm:text-lg">
            = {formatMeters(h_i, 3)}
          </span>

          <span className="text-xs font-sans text-amber-300/90 bg-amber-950/70 border border-amber-800/60 px-2.5 py-1 rounded-md">
            ({formatCentimeters(h_i, 1)})
          </span>
        </div>
      </div>

      {/* KPI Metric Summary Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Metric 1: Computed Image Height */}
        <div className="bg-slate-900/70 rounded-lg p-4 border border-slate-800/80">
          <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Maximize2 className="w-4 h-4 text-amber-400" />
            <span>Image Height (h_i)</span>
          </div>
          <div className="mt-2 text-2xl font-mono font-bold text-amber-300 tabular-nums">
            {formatMeters(h_i, 3)}
          </div>
          <div className="text-xs font-mono text-slate-400 mt-1">
            {formatCentimeters(h_i, 2)} ({((h_i / h_o) * 100).toFixed(1)}% of original object height)
          </div>
        </div>

        {/* Metric 2: Magnification Ratio */}
        <div className="bg-slate-900/70 rounded-lg p-4 border border-slate-800/80">
          <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-sky-400" />
            <span>Scale Factor / Magnification (M)</span>
          </div>
          <div className="mt-2 text-2xl font-mono font-bold text-sky-300 tabular-nums">
            {M.toFixed(3)}×
          </div>
          <div className="text-xs font-mono text-slate-400 mt-1">
            Ratio 1 : {reductionFactor} (d_i / d_o)
          </div>
        </div>

      </div>

      {/* Mathematical Proof Step: Similar Triangles Equality */}
      <div className="bg-slate-900/50 rounded-lg p-3.5 border border-slate-800 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-3 h-3" />
          </div>
          <span>
            <strong className="text-slate-100 font-semibold">Similar Triangles Invariant:</strong>{' '}
            The ratio of height to distance is conserved across both sides:
            <span className="font-mono text-amber-300 ml-1">h_o / d_o = h_i / d_i</span>.
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="text-amber-400 font-medium">
            {h_o.toFixed(2)} / {d_o.toFixed(2)} = {computation.objectRatio.toFixed(4)}
          </span>
          <span className="text-slate-400 font-bold">=</span>
          <span className="text-sky-400 font-medium">
            {h_i.toFixed(3)} / {d_i.toFixed(2)} = {computation.imageRatio.toFixed(4)}
          </span>
        </div>
      </div>

    </div>
  );
};
