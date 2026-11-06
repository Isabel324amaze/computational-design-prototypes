import React from 'react';
import { OpticalParameters, ObjectType } from '../types';
import { Sliders, Flame, ArrowUp, Trees, Building2, Minus, Plus } from 'lucide-react';

interface ControlDeckProps {
  params: OpticalParameters;
  onChangeParams: (updated: Partial<OpticalParameters>) => void;
  onReset: () => void;
}

export const ControlDeck: React.FC<ControlDeckProps> = ({
  params,
  onChangeParams,
  onReset,
}) => {
  const handleStep = (key: keyof OpticalParameters, step: number, min: number, max: number) => {
    const current = Number(params[key]);
    const next = Math.max(min, Math.min(max, Math.round((current + step) * 100) / 100));
    onChangeParams({ [key]: next });
  };

  const objectTypes: { id: ObjectType; label: string; icon: React.ReactNode }[] = [
    { id: 'candle', label: 'Lit Candle', icon: <Flame className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'arrow', label: 'Vector Arrow', icon: <ArrowUp className="w-3.5 h-3.5 text-sky-400" /> },
    { id: 'tree', label: 'Landscape Tree', icon: <Trees className="w-3.5 h-3.5 text-emerald-400" /> },
    { id: 'pavilion', label: 'Architecture', icon: <Building2 className="w-3.5 h-3.5 text-purple-400" /> },
  ];

  return (
    <div className="bg-[#0b1122] rounded-xl border border-slate-800 p-5 shadow-xl space-y-6">
      
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100 tracking-tight">
              Optical Bench Parameters
            </h2>
            <p className="text-[11px] text-slate-400">
              Interactive physical dimensions (clearly labeled in meters)
            </p>
          </div>
        </div>

        {/* Object Subject Switcher */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
          {objectTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => onChangeParams({ objectType: t.id })}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
                params.objectType === t.id
                  ? 'bg-amber-500/20 text-amber-300 font-medium border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={`Switch object to ${t.label}`}
            >
              {t.icon}
              <span className="hidden sm:inline text-[11px]">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Primary Sliders Grid: Exactly 3 Required Distance & Height Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* 1. Object Distance (d_o): 1.0 m to 6.0 m */}
        <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-800/90 space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="slider-do" className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Object Distance (<span className="font-mono text-amber-300">d_o</span>)</span>
            </label>
            <div className="flex items-center gap-1">
              <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/70 border border-amber-800/60 px-2 py-0.5 rounded tabular-nums">
                {params.objectDistance.toFixed(2)} m
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleStep('objectDistance', -0.1, 1.0, 6.0)}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              aria-label="Decrease object distance by 0.1 meter"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <input
              id="slider-do"
              type="range"
              min="1.0"
              max="6.0"
              step="0.05"
              value={params.objectDistance}
              onChange={(e) => onChangeParams({ objectDistance: parseFloat(e.target.value) })}
              className="w-full accent-amber-500"
              aria-label="Object distance in meters"
              aria-valuemin={1.0}
              aria-valuemax={6.0}
              aria-valuenow={params.objectDistance}
            />
            <button
              onClick={() => handleStep('objectDistance', 0.1, 1.0, 6.0)}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              aria-label="Increase object distance by 0.1 meter"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>Min: 1.0 m</span>
            <span className="text-slate-400">Object to Pinhole</span>
            <span>Max: 6.0 m</span>
          </div>
        </div>

        {/* 2. Object Height (h_o): 0.5 m to 2.0 m */}
        <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-800/90 space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="slider-ho" className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Object Height (<span className="font-mono text-amber-300">h_o</span>)</span>
            </label>
            <div className="flex items-center gap-1">
              <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/70 border border-amber-800/60 px-2 py-0.5 rounded tabular-nums">
                {params.objectHeight.toFixed(2)} m
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleStep('objectHeight', -0.05, 0.5, 2.0)}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              aria-label="Decrease object height by 0.05 meter"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <input
              id="slider-ho"
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={params.objectHeight}
              onChange={(e) => onChangeParams({ objectHeight: parseFloat(e.target.value) })}
              className="w-full accent-amber-500"
              aria-label="Object height in meters"
              aria-valuemin={0.5}
              aria-valuemax={2.0}
              aria-valuenow={params.objectHeight}
            />
            <button
              onClick={() => handleStep('objectHeight', 0.05, 0.5, 2.0)}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              aria-label="Increase object height by 0.05 meter"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>Min: 0.5 m</span>
            <span className="text-slate-400">Vertical Height</span>
            <span>Max: 2.0 m</span>
          </div>
        </div>

        {/* 3. Screen Distance (d_i): 0.1 m to 1.0 m */}
        <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-800/90 space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="slider-di" className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span>Screen Distance (<span className="font-mono text-sky-300">d_i</span>)</span>
            </label>
            <div className="flex items-center gap-1">
              <span className="text-xs font-mono font-bold text-sky-300 bg-sky-950/70 border border-sky-800/60 px-2 py-0.5 rounded tabular-nums">
                {params.screenDistance.toFixed(2)} m
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleStep('screenDistance', -0.05, 0.1, 1.0)}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              aria-label="Decrease screen distance by 0.05 meter"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <input
              id="slider-di"
              type="range"
              min="0.1"
              max="1.0"
              step="0.02"
              value={params.screenDistance}
              onChange={(e) => onChangeParams({ screenDistance: parseFloat(e.target.value) })}
              className="w-full accent-sky-400"
              aria-label="Screen distance in meters"
              aria-valuemin={0.1}
              aria-valuemax={1.0}
              aria-valuenow={params.screenDistance}
            />
            <button
              onClick={() => handleStep('screenDistance', 0.05, 0.1, 1.0)}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              aria-label="Increase screen distance by 0.05 meter"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>Min: 0.1 m</span>
            <span className="text-slate-400">Pinhole to Screen</span>
            <span>Max: 1.0 m</span>
          </div>
        </div>

      </div>

      {/* Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/70 text-xs text-slate-400">
        <p>
          Governing formula: <span className="font-mono text-amber-300 font-semibold">Image Height = Object Height × Screen Distance / Object Distance</span>
        </p>
        <span className="text-slate-400">
          Units: meters (m)
        </span>
      </div>

    </div>
  );
};
