import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  Download,
  Mail,
  Edit2,
  Eye,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Sparkles,
} from 'lucide-react';
import { EmailDraft, FactState, countWords } from '../types';

interface DraftPanelProps {
  draft: EmailDraft | null;
  onUpdateDraft: (updated: EmailDraft) => void;
  facts: FactState;
  status: string;
}

export const DraftPanel: React.FC<DraftPanelProps> = ({
  draft,
  onUpdateDraft,
  facts,
  status,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editSubject, setEditSubject] = useState('');
  const [editSalutation, setEditSalutation] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editSignoff, setEditSignoff] = useState('');

  // Sync draft to local edit state
  useEffect(() => {
    if (draft) {
      setEditSubject(draft.subject || '');
      setEditSalutation(draft.salutation || 'Dear Professor,');
      setEditBody(draft.body || '');
      setEditSignoff(draft.signoff || 'Best regards,\n[Your Name]');
    } else {
      setEditSubject('');
      setEditSalutation('');
      setEditBody('');
      setEditSignoff('');
      setIsEditing(false);
    }
  }, [draft]);

  // Compute live word count
  const fullText = `${editSubject} ${editSalutation} ${editBody} ${editSignoff}`.trim();
  const currentWordCount = countWords(editBody);
  const wordLimit = facts.wordLimit || 150;
  const isOverLimit = currentWordCount > wordLimit;

  const handleCopy = () => {
    if (!draft && !fullText) return;
    const emailToCopy = `Subject: ${editSubject}\n\n${editSalutation}\n\n${editBody}\n\n${editSignoff}`;
    navigator.clipboard.writeText(emailToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const emailToSave = `Subject: ${editSubject}\n\n${editSalutation}\n\n${editBody}\n\n${editSignoff}`;
    const blob = new Blob([emailToSave], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `letterlab-draft-${facts.recipient?.replace(/[^a-zA-Z0-9]/g, '_') || 'email'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveEdits = () => {
    onUpdateDraft({
      subject: editSubject,
      salutation: editSalutation,
      body: editBody,
      signoff: editSignoff,
      wordCount: currentWordCount,
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-[#FAF8F5] rounded-2xl border border-stone-300 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-stone-200 bg-[#F4F1EA] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-900 text-white flex items-center justify-center font-mono font-bold text-xs shadow-xs">
            <FileText className="w-4 h-4 text-emerald-200" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-stone-900 text-base leading-tight">
              Draft & Letter Station
            </h3>
            <p className="text-[11px] text-stone-600 font-mono">
              Student-controlled review
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          {draft && (
            <>
              <button
                onClick={() => {
                  if (isEditing) {
                    handleSaveEdits();
                  } else {
                    setIsEditing(true);
                  }
                }}
                className="px-2.5 py-1 text-xs font-medium rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 flex items-center gap-1 transition-colors"
                title={isEditing ? 'Save and preview changes' : 'Edit draft text directly'}
              >
                {isEditing ? (
                  <>
                    <Eye className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Done</span>
                  </>
                ) : (
                  <>
                    <Edit2 className="w-3.5 h-3.5 text-stone-600" />
                    <span>Edit</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCopy}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white flex items-center gap-1 transition-colors shadow-2xs"
                title="Copy entire draft to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownload}
                className="p-1.5 text-xs rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-600 transition-colors"
                title="Download draft as text file"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
        {/* Word count & constraint indicator */}
        <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-stone-200 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-semibold">
              Body Word Count:
            </span>
            <span
              className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                isOverLimit
                  ? 'bg-red-100 text-red-800 border border-red-300'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              {currentWordCount} / {wordLimit} words
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px]">
            {isOverLimit ? (
              <span className="text-red-700 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" /> Exceeds {wordLimit}w
              </span>
            ) : (
              <span className="text-emerald-700 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Within limit
              </span>
            )}
          </div>
        </div>

        {/* Letter Stationery Sheet */}
        {draft ? (
          <div className="relative bg-[#FCFBF8] rounded-xl border border-stone-300 p-5 sm:p-6 shadow-xs font-serif">
            {/* Stationery watermarked corner badge */}
            <div className="absolute top-3 right-3 text-[10px] font-mono tracking-widest uppercase text-stone-600 border border-stone-300 rounded px-1.5 py-0.5 bg-stone-50/80">
              LETTERLAB STATIONERY
            </div>

            {/* Subject Line Block */}
            <div className="mb-4 pb-3 border-b border-stone-200 font-sans">
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-600 block mb-0.5">
                Subject
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  className="w-full text-sm font-semibold text-stone-900 bg-white p-2 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-700 font-sans"
                  placeholder="Subject line..."
                />
              ) : (
                <h4 className="text-sm font-semibold text-stone-900 tracking-tight font-sans">
                  {editSubject || '[Subject Pending]'}
                </h4>
              )}
            </div>

            {/* Salutation */}
            <div className="mb-3">
              {isEditing ? (
                <input
                  type="text"
                  value={editSalutation}
                  onChange={(e) => setEditSalutation(e.target.value)}
                  className="w-full text-sm font-medium text-stone-900 bg-white p-1.5 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-700 font-serif"
                />
              ) : (
                <p className="text-sm text-stone-900 font-medium font-serif">
                  {editSalutation}
                </p>
              )}
            </div>

            {/* Letter Body */}
            <div className="mb-4">
              {isEditing ? (
                <textarea
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  rows={6}
                  className="w-full text-sm text-stone-800 bg-white p-3 border border-stone-300 rounded-lg leading-relaxed focus:outline-hidden focus:ring-1 focus:ring-emerald-700 font-serif resize-y"
                  placeholder="Email body text..."
                />
              ) : (
                <div className="text-sm text-stone-800 leading-relaxed font-serif whitespace-pre-line">
                  {editBody}
                </div>
              )}
            </div>

            {/* Sign-off */}
            <div className="pt-2 border-t border-stone-200/80">
              {isEditing ? (
                <textarea
                  value={editSignoff}
                  onChange={(e) => setEditSignoff(e.target.value)}
                  rows={2}
                  className="w-full text-sm text-stone-800 bg-white p-2 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-700 font-serif resize-none"
                />
              ) : (
                <p className="text-sm text-stone-700 font-serif whitespace-pre-line italic">
                  {editSignoff}
                </p>
              )}
            </div>
          </div>
        ) : (
          /* Empty / Waiting state */
          <div className="p-8 text-center bg-white rounded-xl border border-stone-200 border-dashed flex flex-col items-center justify-center min-h-[260px]">
            <div className="w-12 h-12 rounded-full bg-[#F5F2EB] flex items-center justify-center text-stone-500 mb-3 border border-stone-300">
              <FileText className="w-6 h-6 text-emerald-800" />
            </div>
            <h4 className="font-serif font-bold text-stone-800 text-base mb-1">
              Draft Pending Clarification
            </h4>
            <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
              {status === 'needs_clarification'
                ? 'The Grounded Assistant is currently clarifying missing details (recipient and requested deadline) before generating an unverified draft.'
                : 'Send your notes or select Journey A to start drafting your email.'}
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              Aims to use only supplied facts; users must review
            </div>
          </div>
        )}

        {/* Human Agency Notice & Checklist */}
        <div className="p-3.5 bg-[#F4F1EA] rounded-xl border border-stone-300 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-600 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
              User Review
            </span>
            <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded border border-emerald-300">
              Manual Send Only
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-stone-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked={Boolean(facts.recipient)}
                className="rounded text-emerald-800 focus:ring-emerald-700 border-stone-300"
              />
              <span>Recipient name and title verified</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked={Boolean(facts.truthfulReason)}
                className="rounded text-emerald-800 focus:ring-emerald-700 border-stone-300"
              />
              <span>Truthful technical roadblock stated without fabrication</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked={Boolean(facts.requestedDeadline)}
                className="rounded text-emerald-800 focus:ring-emerald-700 border-stone-300"
              />
              <span>Exact requested deadline stated clearly</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked={!isOverLimit && currentWordCount > 0}
                className="rounded text-emerald-800 focus:ring-emerald-700 border-stone-300"
              />
              <span>Strict adherence to target word limit ({wordLimit} words)</span>
            </label>
          </div>

          <p className="text-[10px] text-stone-600 italic pt-1 border-t border-stone-300/80">
            LetterLab has no email credentials or automatic send capabilities. Review your letter, then paste it into your university webmail or email app.
          </p>
        </div>
      </div>
    </div>
  );
};
