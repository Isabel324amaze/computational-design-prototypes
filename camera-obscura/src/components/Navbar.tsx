import React from 'react';
import { RotateCcw, Compass, Sliders, Eye } from 'lucide-react';
import { PRESETS } from '../types';

interface NavbarProps {
  onReset: () => void;
  selectedPresetId: string;
  onSelectPreset: (presetId: string) => void;
  activeView: 'split' | 'diagram' | 'screen';
  onSelectView: (view: 'split' | 'diagram' | 'screen') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onReset,
  selectedPresetId,
  onSelectPreset,
  activeView,
  onSelectView,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-[#0a1022]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Compass className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold tracking-tight text-slate-100 whitespace-nowrap">
                  Camera Obscura
                </span>
                <span className="hidden sm:inline-block text-xs font-mono text-amber-400/90 bg-amber-950/60 border border-amber-800/50 px-2 py-0.5 rounded">
                  Optics Lab
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                Computational Design · Ray Geometry & Pinhole Inversion
              </p>
            </div>
          </div>

          {/* Zone 2: View Switcher & Preset Select */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Mode Switcher */}
            <div className="hidden lg:flex items-center p-1 bg-slate-900/90 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => onSelectView('split')}
                className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                  activeView === 'split'
                    ? 'bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Ray diagram and ground glass screen side-by-side"
              >
                Dual View
              </button>
              <button
                onClick={() => onSelectView('diagram')}
                className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                  activeView === 'diagram'
                    ? 'bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Expanded optical ray diagram"
              >
                Ray Diagram
              </button>
              <button
                onClick={() => onSelectView('screen')}
                className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeView === 'screen'
                    ? 'bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Camera interior frosted screen view"
              >
                <Eye className="w-3.5 h-3.5" />
                Screen View
              </button>
            </div>

            {/* Presets Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <label htmlFor="preset-select" className="hidden sm:inline font-mono text-slate-400">
                Preset:
              </label>
              <select
                id="preset-select"
                value={selectedPresetId}
                onChange={(e) => onSelectPreset(e.target.value)}
                className="bg-slate-900 border border-slate-700/80 rounded-md px-2.5 py-1.5 text-xs text-amber-300 focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
              >
                {PRESETS.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Zone 3: Primary Action: Reset Defaults */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors shadow-sm focus-visible:outline-2 focus-visible:outline-amber-400"
              title="Reset all distances and heights to default benchmark parameters"
              aria-label="Reset parameters to defaults"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
