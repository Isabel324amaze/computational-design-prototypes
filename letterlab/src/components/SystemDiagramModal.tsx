import React, { useState } from 'react';
import {
  X,
  ArrowRight,
  Database,
  Cpu,
  UserCheck,
  FileText,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  BookOpen,
  MessageSquare,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface SystemDiagramModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemDiagramModal: React.FC<SystemDiagramModalProps> = ({ isOpen, onClose }) => {
  const [activeStep, setActiveStep] = useState<number>(0);

  if (!isOpen) return null;

  const steps = [
    {
      id: 'input',
      title: '1. User Input (Fragmented Notes)',
      icon: MessageSquare,
      category: 'Student Voice',
      color: 'border-amber-400 bg-amber-50/70 text-amber-900',
      description: 'Raw, unstructured student thoughts, emotional tone (worried, stressed), and partial project status.',
      example: '"Prototype is half-done, physics constraints glitching, original deadline Friday 5pm, stressed..."',
      guardrail: 'No manual formatting or formal academic framing required from the student.',
    },
    {
      id: 'context',
      title: '2. State Context + System Instructions + Reference Facts',
      icon: Database,
      category: 'Grounding Aggregator',
      color: 'border-emerald-500 bg-emerald-50/70 text-emerald-950',
      description: 'Extracts known fact slots, checks for missing required fields, bundles course reference facts, and applies the strict Grounded Role Card.',
      example: 'Required slots: Recipient, Purpose, Original Deadline, Requested Deadline, Truthful Reason.',
      guardrail: 'If syllabus policy is not in Reference Facts, it is strictly marked as "Unknown". No invented rules.',
    },
    {
      id: 'gemini',
      title: '3. Gemini 3.8 Flash Multi-turn Reasoning',
      icon: Cpu,
      category: 'LLM Engine',
      color: 'border-teal-600 bg-teal-50/70 text-teal-950',
      description: 'Executes grounded generation with dedicated systemInstruction and multi-turn conversational history.',
      example: 'Applies grounding constraints: aims to use only supplied facts and refuses fabricated excuses or false promises.',
      guardrail: 'Zero simulation of success; actual errors and quota limits are bubbled up immediately.',
    },
    {
      id: 'router',
      title: '4. Decision: Clarification (≤2 Questions) OR Draft',
      icon: Sparkles,
      category: 'Adaptive Router',
      color: 'border-stone-400 bg-stone-50 text-stone-900',
      description: 'If required fields are missing, asks at most two questions about missing slots. Once complete, outputs subject + draft under word limit.',
      example: 'Missing Recipient & Requested Deadline -> Asks: "Who is the recipient?" & "What deadline are you requesting?"',
      guardrail: 'Does not invent assumed dates or recipient names when absent.',
    },
    {
      id: 'review',
      title: '5. Human Review & Direct Draft Control',
      icon: UserCheck,
      category: 'Human-in-the-Loop',
      color: 'border-emerald-600 bg-emerald-100/60 text-emerald-900',
      description: 'The student reviews the draft, inspects the visible facts matrix, edits wording inline, and copies to their own email client.',
      example: 'Word counter validation, truthfulness checklist, manual send only.',
      guardrail: 'No email-sending integration. The user reviews the draft and decides whether to send it.',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#FAF8F5] text-stone-900 rounded-2xl border border-stone-300 shadow-2xl p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-300">
                SYSTEM ARCHITECTURE & ROLE CARD
              </span>
              <span className="text-xs text-stone-700 font-mono">v1.2 Grounded</span>
            </div>
            <h2 className="mt-2 text-2xl font-serif font-bold text-stone-900 tracking-tight">
              LetterLab System Dataflow Diagram
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              How fragmented student notes are converted into truthful, reviewable professor letters (aims to use only supplied facts; users must review).
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-200/60 rounded-xl transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* The Visual Labeled Flow Diagram */}
        <div className="mt-6 p-5 bg-[#F4F1EA] rounded-xl border border-stone-300">
          <div className="text-xs font-mono font-semibold text-stone-500 uppercase tracking-wider mb-4">
            Pipeline Architecture Flow
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isSelected = activeStep === idx;
              return (
                <div key={step.id} className="relative flex flex-col">
                  <button
                    onClick={() => setActiveStep(idx)}
                    className={`flex-1 flex flex-col items-center text-center p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? `${step.color} shadow-md scale-[1.02] ring-2 ring-emerald-700/20`
                        : 'border-stone-300 bg-white/70 hover:bg-white text-stone-700'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white shadow-xs border border-stone-200 mb-2">
                      <Icon className="w-5 h-5 text-emerald-800" />
                    </div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500 mb-0.5">
                      Step {idx + 1}
                    </span>
                    <span className="text-xs font-semibold leading-tight text-stone-900">
                      {step.title.split('. ')[1]}
                    </span>
                  </button>

                  {idx < steps.length - 1 && (
                    <div className="hidden md:flex absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 text-stone-400 pointer-events-none">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Step Deep Dive */}
        <div className="mt-6 p-5 bg-white rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
              <h3 className="font-serif font-bold text-lg text-stone-900">
                {steps[activeStep].title}
              </h3>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 bg-stone-100 rounded text-stone-600 border border-stone-200">
              {steps[activeStep].category}
            </span>
          </div>

          <p className="text-sm text-stone-700 leading-relaxed">
            {steps[activeStep].description}
          </p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#FAF8F5] rounded-lg border border-stone-200">
              <span className="font-mono font-semibold text-emerald-800 block mb-1">
                Data Representation / Example:
              </span>
              <p className="text-stone-600 italic">
                {steps[activeStep].example}
              </p>
            </div>
            <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200/80">
              <span className="font-mono font-semibold text-amber-800 flex items-center gap-1 mb-1">
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                Hard Grounding Guardrail:
              </span>
              <p className="text-amber-900/90">
                {steps[activeStep].guardrail}
              </p>
            </div>
          </div>
        </div>

        {/* Role Card & Safety Specification */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[#F5F2EB] rounded-xl border border-stone-300">
            <div className="flex items-center gap-2 text-emerald-900 font-serif font-bold text-sm mb-2">
              <BookOpen className="w-4 h-4 text-emerald-700" />
              Role Card Specifications
            </div>
            <ul className="space-y-1.5 text-xs text-stone-700">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                <span><strong>Role Name:</strong> Grounded Letter Writing Assistant</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                <span><strong>Purpose:</strong> Accurate, reviewable academic email drafts.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                <span><strong>Required 5 Slots:</strong> Recipient, Purpose, Original Deadline, Requested Deadline, Truthful Reason.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                <span><strong>Question Constraint:</strong> Ask at most 2 questions, strictly targeting missing fields.</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-[#F5F2EB] rounded-xl border border-stone-300">
            <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-sm mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Negative Constraints (What the Agent Refuses)
            </div>
            <ul className="space-y-1.5 text-xs text-stone-700">
              <li className="flex items-start gap-1.5">
                <span className="text-red-600 font-mono font-bold shrink-0">✕</span>
                <span><strong>Never Invent Facts:</strong> No fabricated progress, research, emergencies, illnesses, or policies.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-red-600 font-mono font-bold shrink-0">✕</span>
                <span><strong>Unknown Policies:</strong> If course rules are absent in Reference Facts, explicitly label them "Unknown".</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-red-600 font-mono font-bold shrink-0">✕</span>
                <span><strong>Refusal of False Excuses:</strong> Explicitly refuses suggestions like "say my laptop died", guides to honest communication.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-red-600 font-mono font-bold shrink-0">✕</span>
                <span><strong>No Auto-Sending:</strong> Output is review-only. Student retains 100% agency before sending.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-sm rounded-xl transition-colors shadow-xs"
          >
            Close Diagram
          </button>
        </div>
      </div>
    </div>
  );
};
