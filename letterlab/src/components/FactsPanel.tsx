import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  HelpCircle,
  ShieldCheck,
  ShieldAlert,
  Edit3,
  BookOpen,
  ChevronDown,
  ChevronUp,
  FileText,
  User,
  Calendar,
  Sparkles,
  Info,
} from 'lucide-react';
import { FactState } from '../types';

interface FactsPanelProps {
  facts: FactState;
  onUpdateFacts: (newFacts: FactState) => void;
  referenceFacts: string;
  onUpdateReferenceFacts: (newRef: string) => void;
  activeWordCount?: number;
}

export const FactsPanel: React.FC<FactsPanelProps> = ({
  facts,
  onUpdateFacts,
  referenceFacts,
  onUpdateReferenceFacts,
  activeWordCount = 0,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showReferenceDetails, setShowReferenceDetails] = useState(false);
  const [tempFacts, setTempFacts] = useState<FactState>(facts);

  // Sync tempFacts when facts prop changes
  React.useEffect(() => {
    setTempFacts(facts);
  }, [facts]);

  const requiredSlots = [
    {
      key: 'recipient' as const,
      label: 'Recipient',
      icon: User,
      value: facts.recipient,
      description: 'Instructor / Professor name or title',
      placeholder: 'e.g. Professor Chen',
    },
    {
      key: 'purpose' as const,
      label: 'Purpose',
      icon: FileText,
      value: facts.purpose,
      description: 'Clear academic objective or request',
      placeholder: 'e.g. Extension request for computational design prototype',
    },
    {
      key: 'originalDeadline' as const,
      label: 'Original Deadline',
      icon: Clock,
      value: facts.originalDeadline,
      description: 'Official submission time on syllabus',
      placeholder: 'e.g. This Friday at 5:00 PM',
    },
    {
      key: 'requestedDeadline' as const,
      label: 'Requested Deadline',
      icon: Calendar,
      value: facts.requestedDeadline,
      description: 'Realistic new target date & time',
      placeholder: 'e.g. Next Tuesday at 11:59 PM',
    },
    {
      key: 'truthfulReason' as const,
      label: 'Truthful Reason',
      icon: Sparkles,
      value: facts.truthfulReason,
      description: 'Genuine technical or design roadblock',
      placeholder: 'e.g. Constraint solver bugs in geometry prototype',
    },
  ];

  const filledCount = requiredSlots.filter((slot) => slot.value && slot.value.trim() !== '').length;
  const isComplete = filledCount === requiredSlots.length;

  const handleSaveManualEdit = () => {
    onUpdateFacts(tempFacts);
    setIsEditing(false);
  };

  return (
    <div className="bg-[#FAF8F5] rounded-2xl border border-stone-300 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-stone-200 bg-[#F4F1EA] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-mono font-bold text-xs shadow-xs">
            FP
          </div>
          <div>
            <h3 className="font-serif font-bold text-stone-900 text-base leading-tight">
              Fact Matrix & State
            </h3>
            <p className="text-[11px] text-stone-600 font-mono">
              Grounded memory retention
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold flex items-center gap-1 border ${
              isComplete
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}
          >
            {isComplete ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                5/5 Ready
              </>
            ) : (
              <>
                <Clock className="w-3 h-3 text-amber-700 animate-pulse" />
                {filledCount}/5 Slots
              </>
            )}
          </span>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-stone-600 hover:text-stone-900 p-1.5 hover:bg-stone-200/60 rounded-lg text-xs flex items-center gap-1 transition-colors"
            title="Directly edit or override fact slots"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px] font-medium">
              {isEditing ? 'Cancel' : 'Edit'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
        {/* Anti-Hallucination Status Banner */}
        {facts.fabricationDetected ? (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Fabrication Request Refused</span>
              <p className="text-red-700 mt-0.5">
                {facts.fabricationNotes ||
                  'The agent refused to invent a false excuse or emergency and re-grounded the draft in actual coursework progress.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-[11px] text-emerald-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="font-medium">Aims to use only supplied facts; users must review</span>
            </div>
            <span className="font-mono text-[10px] text-emerald-700 bg-white/80 px-1.5 py-0.5 rounded border border-emerald-200">
              User Review Required
            </span>
          </div>
        )}

        {/* Required 5 Slots List */}
        <div className="space-y-2.5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-stone-500 font-semibold flex items-center justify-between">
            <span>Mandatory Core Slots</span>
            <span className="text-[10px] font-normal text-stone-600">
              Max 2 questions asked for missing
            </span>
          </div>

          {requiredSlots.map((slot) => {
            const Icon = slot.icon;
            const hasValue = slot.value && slot.value.trim() !== '';

            return (
              <div
                key={slot.key}
                className={`p-3 rounded-xl border transition-all ${
                  hasValue
                    ? 'bg-white border-stone-200 shadow-2xs'
                    : 'bg-amber-50/40 border-amber-200/70 border-dashed'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon
                      className={`w-3.5 h-3.5 ${
                        hasValue ? 'text-emerald-700' : 'text-amber-600'
                      }`}
                    />
                    <span className="text-xs font-semibold text-stone-800">
                      {slot.label}
                    </span>
                  </div>

                  {hasValue ? (
                    <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Extracted
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-amber-800 bg-amber-100/60 px-1.5 py-0.5 rounded border border-amber-300 flex items-center gap-1">
                      <HelpCircle className="w-2.5 h-2.5" />
                      Pending
                    </span>
                  )}
                </div>

                {isEditing ? (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={tempFacts[slot.key] || ''}
                      onChange={(e) =>
                        setTempFacts({
                          ...tempFacts,
                          [slot.key]: e.target.value,
                        })
                      }
                      placeholder={slot.placeholder}
                      className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                ) : (
                  <div className="mt-1.5">
                    {hasValue ? (
                      <p className="text-xs text-stone-900 font-medium">
                        {slot.value}
                      </p>
                    ) : (
                      <p className="text-xs text-stone-600 italic">
                        Not yet provided — agent will ask targeted question
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Save button if editing */}
        {isEditing && (
          <button
            onClick={handleSaveManualEdit}
            className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-xs rounded-xl transition-colors shadow-xs"
          >
            Save Overrides
          </button>
        )}

        {/* Secondary Parameters (Word Limit & Policy Status) */}
        <div className="pt-2 border-t border-stone-200 space-y-2.5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-stone-500 font-semibold">
            Constraints & Stance
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Word Limit Indicator */}
            <div className="p-2.5 bg-white rounded-xl border border-stone-200">
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-600 block">
                Target Word Limit
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-mono font-bold text-sm text-stone-900">
                  {facts.wordLimit || 150}
                </span>
                <span className="text-[10px] text-stone-600">words max</span>
              </div>
              {activeWordCount > 0 && (
                <div className="mt-1 text-[10px] font-mono text-stone-600">
                  Current Draft: {activeWordCount} words
                </div>
              )}
            </div>

            {/* Course Policy Grounding Status */}
            <div className="p-2.5 bg-white rounded-xl border border-stone-200">
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-600 block">
                Course Policy Grounding
              </span>
              <div className="mt-0.5">
                <span
                  className={`text-[11px] font-medium leading-tight block ${
                    facts.coursePolicy && !facts.coursePolicy.toLowerCase().includes('unknown')
                      ? 'text-emerald-800'
                      : 'text-amber-800'
                  }`}
                >
                  {facts.coursePolicy || 'Unknown (Policy not provided)'}
                </span>
              </div>
              <p className="text-[10px] text-stone-600 mt-0.5">
                Agent will not invent syllabus rules
              </p>
            </div>
          </div>
        </div>

        {/* Expandable Optional Reference Knowledge Box */}
        <div className="pt-2 border-t border-stone-200">
          <button
            onClick={() => setShowReferenceDetails(!showReferenceDetails)}
            className="w-full flex items-center justify-between text-left p-2.5 rounded-xl bg-[#F5F2EB] hover:bg-[#EFECE4] transition-colors border border-stone-300"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-emerald-800" />
              <span className="text-xs font-serif font-bold text-stone-900">
                Optional Reference Knowledge
              </span>
            </div>
            {showReferenceDetails ? (
              <ChevronUp className="w-4 h-4 text-stone-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-stone-500" />
            )}
          </button>

          {showReferenceDetails && (
            <div className="mt-2 p-3 bg-white rounded-xl border border-stone-200 space-y-2">
              <p className="text-[11px] text-stone-600">
                Knowledge provided here is kept separate from agent behavior. If omitted, the agent explicitly treats all course policies as unknown.
              </p>
              <textarea
                value={referenceFacts}
                onChange={(e) => onUpdateReferenceFacts(e.target.value)}
                placeholder="Optional: paste your actual reference facts. Leave empty when course policy is unknown."
                rows={3}
                className="w-full text-xs p-2 bg-[#FAF8F5] border border-stone-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
              />
              <div className="flex justify-between items-center text-[10px] text-stone-600">
                <span>Separate from agent behavior</span>
                <span className="font-mono">
                  {referenceFacts.trim() ? 'Policy Loaded' : 'Status: Unknown'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
