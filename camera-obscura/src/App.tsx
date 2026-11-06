import React, { useState, useMemo } from 'react';
import { OpticalParameters, DEFAULT_PARAMETERS, PRESETS } from './types';
import { computeOptics } from './utils/optics';
import { Navbar } from './components/Navbar';
import { RayDiagram } from './components/RayDiagram';
import { GroundGlassPreview } from './components/GroundGlassPreview';
import { ControlDeck } from './components/ControlDeck';
import { FormulaBreakdown } from './components/FormulaBreakdown';
import { InversionExplainer } from './components/InversionExplainer';

export default function App() {
  const [params, setParams] = useState<OpticalParameters>(DEFAULT_PARAMETERS);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('studio-standard');
  const [activeView, setActiveView] = useState<'split' | 'diagram' | 'screen'>('split');

  // Deterministic optical computation
  const computation = useMemo(() => {
    return computeOptics(params);
  }, [params]);

  const handleReset = () => {
    setParams(DEFAULT_PARAMETERS);
    setSelectedPresetId('studio-standard');
  };

  const handleChangeParams = (updated: Partial<OpticalParameters>) => {
    setParams((prev) => ({
      ...prev,
      ...updated,
    }));
    // If the change diverges from current preset, mark custom
    setSelectedPresetId('custom');
  };

  const handleSelectPreset = (presetId: string) => {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setParams((prev) => ({
        ...prev,
        ...preset.params,
      }));
      setSelectedPresetId(preset.id);
    }
  };

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* 3-Zone Navigation Header */}
      <Navbar
        onReset={handleReset}
        selectedPresetId={selectedPresetId}
        onSelectPreset={handleSelectPreset}
        activeView={activeView}
        onSelectView={setActiveView}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Scenario Banner / Quick Context */}
        <section aria-label="Explainer introduction" className="flex flex-wrap items-center justify-between gap-3 bg-[#0d1428] rounded-xl border border-slate-800/80 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <p className="text-xs text-slate-300">
              <strong className="text-amber-300 font-semibold">Computational Design Optics:</strong>{' '}
              Examine how rectilinear light rays through an aperture form an inverted real image on a screen plane.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Object: <strong className="text-amber-300">{params.objectDistance.toFixed(2)}m</strong></span>
            <span className="text-slate-600">|</span>
            <span>Screen: <strong className="text-sky-300">{params.screenDistance.toFixed(2)}m</strong></span>
            <span className="text-slate-600">|</span>
            <span>Image Height: <strong className="text-amber-400">{computation.imageHeight.toFixed(3)}m</strong></span>
          </div>
        </section>

        {/* Visual Simulation Stage */}
        <section aria-label="Optical simulation stage">
          {activeView === 'split' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Ray Diagram (Main Stage) */}
              <div className="lg:col-span-7 xl:col-span-8">
                <RayDiagram
                  params={params}
                  computation={computation}
                  onChangeParams={handleChangeParams}
                />
              </div>

              {/* Ground Glass Screen Preview (Inside Chamber) */}
              <div className="lg:col-span-5 xl:col-span-4">
                <GroundGlassPreview
                  params={params}
                  computation={computation}
                />
              </div>
            </div>
          ) : activeView === 'diagram' ? (
            <RayDiagram
              params={params}
              computation={computation}
              onChangeParams={handleChangeParams}
            />
          ) : (
            <div className="max-w-3xl mx-auto">
              <GroundGlassPreview
                params={params}
                computation={computation}
              />
            </div>
          )}
        </section>

        {/* Interactive Parameter Controls Deck */}
        <section aria-label="Parameter sliders">
          <ControlDeck
            params={params}
            onChangeParams={handleChangeParams}
            onReset={handleReset}
          />
        </section>

        {/* Deterministic Mathematical Formula Breakdown */}
        <section aria-label="Formula breakdown and calculations">
          <FormulaBreakdown
            params={params}
            computation={computation}
          />
        </section>

        {/* Theoretical Explanation of Inversion & Similar Triangles */}
        <section aria-label="Theory and inversion mechanics">
          <InversionExplainer />
        </section>

      </main>

      {/* Clean Accessible Footer */}
      <footer className="border-t border-slate-800/80 bg-[#060a14] py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Camera Obscura Explainer</span>
            <span>·</span>
            <span>Computational Design & Optical Geometry</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Deterministic Pinhole Projection</span>
            <span>·</span>
            <span>SI Metric Units (Meters)</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
