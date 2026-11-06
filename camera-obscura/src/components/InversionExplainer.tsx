import React, { useState } from 'react';
import { BookOpen, Layers, Lightbulb, Compass } from 'lucide-react';

export const InversionExplainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inversion' | 'similarTriangles' | 'computational'>('inversion');

  return (
    <div className="bg-[#0b1122] rounded-xl border border-slate-800 p-5 shadow-xl space-y-4">
      
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100 tracking-tight">
              Theoretical Principles & Inversion Mechanics
            </h2>
            <p className="text-[11px] text-slate-400">
              Core optics concepts for Computational Design students
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('inversion')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'inversion'
                ? 'bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Why Inversion Occurs
          </button>
          <button
            onClick={() => setActiveTab('similarTriangles')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'similarTriangles'
                ? 'bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Similar Triangles Proof
          </button>
          <button
            onClick={() => setActiveTab('computational')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'computational'
                ? 'bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Computational Design & 3D Frustum
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="text-xs text-slate-300 leading-relaxed">
        
        {/* Tab 1: Why Inversion Occurs */}
        {activeTab === 'inversion' && (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-800/80 space-y-2">
                <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>1. Straight-Ray Optical Model</span>
                </div>
                <p className="text-slate-300">
                  This explainer uses the classical geometric optics (straight-ray) approximation. Light traveling from any point on an object propagates along straight paths through homogeneous air directly toward the aperture.
                </p>
              </div>

              <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-800/80 space-y-2">
                <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>2. The Aperture Choke Point</span>
                </div>
                <p className="text-slate-300">
                  Because the pinhole aperture is small relative to the chamber, each point on the projection screen receives light from only one narrow bundle of rays arriving from the scene, preserving spatial correspondence without a glass lens.
                </p>
              </div>

              <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-800/80 space-y-2">
                <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>3. Optical Cross-Over (180° Inversion)</span>
                </div>
                <p className="text-slate-300">
                  Rays originating from the <strong className="text-amber-200 font-semibold">top</strong> of the object must travel downward to pass through the pinhole, continuing until they hit the bottom of the screen. Rays from the <strong className="text-sky-200 font-semibold">base</strong> travel upward. The result is a clean 180° point reflection (inverted vertically and reversed horizontally).
                </p>
              </div>
            </div>

            {/* Scientific Modeling Note clarifying straight-ray approximation vs wave diffraction */}
            <div className="bg-slate-950/70 rounded-lg p-3 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5">
              <span className="text-amber-400 font-mono font-bold mt-0.5">ℹ Note on Physical Optics:</span>
              <p>
                In advanced physical optics, electromagnetic waves also undergo wave diffraction and phase interference when passing through narrow apertures. This application intentionally applies the <strong className="text-slate-200 font-medium">geometric ray model</strong> (rectilinear propagation) to focus on fundamental perspective geometry and similar triangle proportions used in computational design.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Similar Triangles Proof */}
        {activeTab === 'similarTriangles' && (
          <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-800/80 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <span className="font-semibold text-slate-100 text-sm">
                Euclidean Geometry: Angle-Angle (AA) Triangle Similarity
              </span>
              <span className="font-mono text-amber-400 text-xs">
                Δ ABC ~ Δ A'B'C
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p>
                  Consider two right-angled triangles sharing the pinhole aperture vertex <span className="font-mono text-amber-300 font-bold">C</span>:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-slate-300">
                  <li>
                    <strong className="text-amber-300 font-mono">Δ ABC</strong> (World Space): Vertical object side is <span className="font-mono text-amber-200">AB = h_o</span>; horizontal base along the optical axis is <span className="font-mono text-amber-200">BC = d_o</span>.
                  </li>
                  <li>
                    <strong className="text-sky-300 font-mono">Δ A'B'C</strong> (Chamber Space): Vertical screen projection side is <span className="font-mono text-sky-200">A'B' = h_i</span>; horizontal base along the optical axis is <span className="font-mono text-sky-200">B'C = d_i</span>.
                  </li>
                </ul>
                <p>
                  Because the optical axis line and the chief light ray from <span className="font-mono">A</span> to <span className="font-mono">A'</span> form two straight intersecting lines meeting at vertex <span className="font-mono">C</span>, the vertical opposite angles are congruent: <span className="font-mono text-slate-200">angle(BCA) = angle(B'CA')</span>.
                </p>
                <p>
                  Both triangles share a right angle (90°) at their respective vertical bases. By Angle-Angle (AA) similarity, the triangles are geometrically similar.
                </p>
              </div>

              <div className="bg-slate-950/80 rounded-lg p-4 border border-slate-800/80 space-y-3">
                <div className="text-slate-400 text-[11px] font-mono">
                  Proportional side derivation:
                </div>
                
                <div className="flex items-center gap-3 font-mono text-sm text-slate-100 bg-slate-900/80 p-2.5 rounded border border-slate-800">
                  <span>A'B' / AB</span>
                  <span className="text-slate-500">=</span>
                  <span>B'C / BC</span>
                  <span className="text-slate-500">⟹</span>
                  <span className="text-amber-300 font-semibold">h_i / h_o = d_i / d_o</span>
                </div>

                <div className="text-slate-300 text-xs">
                  Multiplying both sides by <span className="font-mono text-amber-300">h_o</span> isolates image height:
                </div>

                <div className="p-3 bg-amber-950/40 border border-amber-600/40 rounded-md font-mono text-amber-300 font-bold text-center text-sm">
                  h_i = (h_o × d_i) / d_o
                </div>

                <div className="text-[11px] text-slate-400">
                  Image height scales linearly with screen distance (<span className="font-mono text-sky-300">d_i</span>) and inversely with object distance (<span className="font-mono text-amber-300">d_o</span>).
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Computational Design & 3D Frustum */}
        {activeTab === 'computational' && (
          <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-800/80 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <span className="font-semibold text-slate-100 text-sm">
                From Renaissance Drawing Machines to 3D Projection Matrices
              </span>
              <span className="font-mono text-amber-400 text-xs">
                Pinhole Camera Model
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p>
                  The Camera Obscura is the physical foundation of the <strong className="text-slate-100 font-semibold">Pinhole Camera Model</strong> used in computer graphics, photogrammetry, and 3D projection matrices:
                </p>
                <div className="font-mono text-[11px] bg-slate-950 p-3 rounded border border-slate-800 text-amber-300 space-y-1">
                  <div>x_projected = f × (X / Z)</div>
                  <div>y_projected = f × (Y / Z)</div>
                </div>
                <p>
                  Here, focal length <span className="font-mono text-sky-300">f</span> corresponds directly to the camera obscura screen distance (<span className="font-mono text-sky-300">d_i</span>), and 3D depth coordinate <span className="font-mono text-amber-300">Z</span> corresponds to object distance (<span className="font-mono text-amber-300">d_o</span>).
                </p>
              </div>

              <div className="space-y-2 bg-slate-950/60 p-3.5 rounded border border-slate-800/80">
                <div className="font-semibold text-amber-300">Why virtual 3D engines don't flip your render upside down:</div>
                <p className="text-slate-300">
                  In physical cameras and eyes, the physical screen sits <strong className="text-slate-100">behind</strong> the aperture (at distance -d_i), causing geometric inversion.
                </p>
                <p className="text-slate-300">
                  In computational rendering (WebGL, Three.js, OpenGL), graphics pipelines define a <strong className="text-sky-300 font-semibold">synthetic virtual near plane</strong> placed mathematically <strong className="text-slate-100">in front</strong> of the center of projection (at distance +f). This algebraic convention preserves upright orientation directly without needing to invert pixel buffers in memory.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
