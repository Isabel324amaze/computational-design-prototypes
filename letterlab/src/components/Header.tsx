import React from 'react';
import {
  FileText,
  Info,
  RotateCcw,
  Download,
  BookOpen,
} from 'lucide-react';

interface HeaderProps {
  onOpenDiagram: () => void;
  onReset: () => void;
  onDownloadTranscript: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDiagram,
  onReset,
  onDownloadTranscript,
}) => {
  return (
    <header className="bg-[#FAF8F5] border-b border-stone-300 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-900 text-white flex items-center justify-center shadow-xs border border-emerald-950">
            <span className="font-serif font-bold text-lg tracking-tighter">LL</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
                LetterLab
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-300">
                Computational Design Prototype
              </span>
            </div>
            <p className="text-xs text-stone-600 font-sans">
              Grounded letter-writing agent &bull; Aims to use only supplied facts; users must review before sending
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Download Plain-Text Session Transcript */}
          <button
            onClick={onDownloadTranscript}
            className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            title="Download plain-text session transcript (excludes credentials)"
          >
            <Download className="w-3.5 h-3.5 text-emerald-800" />
            <span className="hidden sm:inline">Download Transcript (.txt)</span>
            <span className="sm:hidden">Transcript</span>
          </button>

          {/* Info Button for System Architecture Diagram */}
          <button
            onClick={onOpenDiagram}
            className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            title="Open System Architecture & Role Card Diagram"
          >
            <Info className="w-4 h-4 text-emerald-800" />
            <span>System Diagram & Specs</span>
          </button>

          {/* Reset session button */}
          <button
            onClick={onReset}
            className="p-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-600 hover:text-stone-900 transition-colors shadow-2xs cursor-pointer"
            title="Reset conversation and facts matrix"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
