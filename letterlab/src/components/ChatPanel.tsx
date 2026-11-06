import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  HelpCircle,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  Bot,
  User,
  ArrowRight,
  RefreshCw,
  CornerDownLeft,
  X,
  RotateCw,
} from 'lucide-react';
import { ChatMessage, countWords } from '../types';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onCancelRequest: () => void;
  apiError: string | null;
  onClearError: () => void;
  onRetryLast: () => void;
  canRetry: boolean;
  preservedInput: string;
  onTriggerJourneyA: () => void;
  onTriggerClarify: () => void;
  onTriggerJourneyB: () => void;
  onTriggerRefusalTest: () => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onCancelRequest,
  apiError,
  onClearError,
  onRetryLast,
  canRetry,
  preservedInput,
  onTriggerJourneyA,
  onTriggerClarify,
  onTriggerJourneyB,
  onTriggerRefusalTest,
}) => {
  const [inputText, setInputText] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Restore preserved input if error occurred or request was cancelled
  useEffect(() => {
    if (preservedInput && !inputText) {
      setInputText(preservedInput);
    }
  }, [preservedInput]);

  // Neutral elapsed time counter while loading
  useEffect(() => {
    if (!isLoading) {
      setElapsedSeconds(0);
      return;
    }
    setElapsedSeconds(0);
    const interval = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const textToSend = inputText;
    // Don't wipe input prematurely; App will manage preservation
    setInputText('');
    onSendMessage(textToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="bg-[#FAF8F5] rounded-2xl border border-stone-300 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Panel Header */}
      <div className="p-4 sm:p-5 border-b border-stone-200 bg-[#F4F1EA] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-mono font-bold text-xs shadow-xs">
            <Bot className="w-4 h-4 text-emerald-100" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-stone-900 text-base leading-tight">
              Grounded Assistant Dialogue
            </h3>
            <p className="text-[11px] text-stone-600 font-mono">
              Role: Grounded Letter Writing Assistant
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            Gemini Flash (Multi-turn)
          </span>
        </div>
      </div>

      {/* Actionable API / Timeout Error Notification Banner */}
      {apiError && (
        <div className="m-4 p-4 bg-amber-50/90 border-2 border-amber-300 rounded-xl text-xs text-amber-950 shadow-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold text-sm text-stone-900 flex items-center justify-between">
              <span>Request Notice</span>
              <span className="text-[10px] font-mono font-normal text-stone-600">
                Input preserved below
              </span>
            </div>
            <p className="text-stone-700 mt-1 leading-relaxed font-sans">{apiError}</p>
            <div className="mt-2 text-[11px] text-stone-600 bg-white/80 p-2.5 rounded-lg border border-amber-200 font-mono space-y-1">
              <div>&bull; Your input notes and existing draft were kept intact.</div>
              <div>&bull; If the model hit high demand or timed out, you can retry or cancel.</div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              {canRetry && (
                <button
                  type="button"
                  onClick={onRetryLast}
                  className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Retry Request</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClearError}
                className="px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-700 rounded-lg text-xs font-medium border border-stone-300 transition-colors cursor-pointer"
              >
                Dismiss Notice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Timeline */}
      <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="p-6 text-center bg-white rounded-xl border border-stone-200 max-w-lg mx-auto my-6">
            <div className="w-10 h-10 rounded-full bg-[#F5F2EB] flex items-center justify-center mx-auto mb-3 border border-stone-300">
              <Sparkles className="w-5 h-5 text-emerald-800" />
            </div>
            <h4 className="font-serif font-bold text-stone-900 text-base mb-1">
              Start with Fragmented Notes
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed mb-4">
              Share your unedited thoughts, anxious feelings, or prototype roadblock. The assistant aims to use only supplied facts; users must review before sending.
            </p>
            <div className="text-[11px] font-mono text-stone-500 mb-3">
              Try a pre-configured journey:
            </div>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() =>
                  onSendMessage(
                    'Help me write an email to my professor asking for more time for a design project. My notes: prototype unfinished; deadline Friday; worried about sounding irresponsible. What should we do next?'
                  )
                }
                className="w-full text-left p-2.5 rounded-lg border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-950 text-xs transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-bold block">P1 Prompt: Design Project Extension</span>
                  <span className="text-[11px] text-emerald-800">
                    Prototype unfinished, Friday deadline, worried tone
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-700 shrink-0" />
              </button>
              <button
                onClick={onTriggerJourneyA}
                className="w-full text-left p-2.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-900 text-xs transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-bold block">Journey A: Spatial Geometry Physics Glitch</span>
                  <span className="text-[11px] text-stone-600">
                    Unfinished prototype notes, Friday deadline
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-500 shrink-0" />
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-900 text-white flex items-center justify-center shrink-0 text-xs font-mono shadow-2xs mt-1">
                    LL
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 shadow-2xs ${
                    isUser
                      ? 'bg-emerald-800 text-white'
                      : 'bg-white border border-stone-200 text-stone-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 text-[10px] font-mono opacity-70">
                    <span>{isUser ? 'You (Student)' : 'Grounded Assistant'}</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Message Body */}
                  <div
                    className={`text-xs leading-relaxed whitespace-pre-line ${
                      isUser ? 'text-emerald-50' : 'text-stone-800'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* If questions asked (Missing fields) */}
                  {msg.questions && msg.questions.length > 0 && (
                    <div className="mt-3 p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1.5">
                      <div className="text-[11px] font-mono font-semibold text-amber-900 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                        Targeted Clarification ({msg.questions.length} question
                        {msg.questions.length > 1 ? 's' : ''} max):
                      </div>
                      <ul className="space-y-1 pl-4 list-decimal text-xs text-amber-950 font-medium">
                        {msg.questions.map((q, idx) => (
                          <li key={idx}>{q}</li>
                        ))}
                      </ul>
                      <div className="text-[10px] text-amber-700 pt-1">
                        Please provide these missing fields so the assistant can draft based strictly on your facts.
                      </div>
                    </div>
                  )}

                  {/* If status is refusal */}
                  {msg.status === 'refusal_and_guidance' && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900">
                      <div className="flex items-center gap-1.5 font-bold mb-1">
                        <ShieldAlert className="w-4 h-4 text-red-600" />
                        Grounded Refusal Enforced
                      </div>
                      <p className="text-red-800 text-[11px]">
                        The assistant refused the suggested excuse to protect your academic standing, while continuing to help with a truthful, professional draft.
                      </p>
                    </div>
                  )}

                  {/* If draft ready */}
                  {msg.status === 'draft_ready' && msg.draftSnapshot && (
                    <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-700" />
                        <span className="font-semibold text-[11px]">
                          Draft generated ({countWords(msg.draftSnapshot.body)} body words)
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-800 underline">
                        Review in Letter Station &rarr;
                      </span>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-stone-300 text-stone-700 flex items-center justify-center shrink-0 text-xs font-mono shadow-2xs mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Neutral Observability: Waiting for model response + elapsed timer + Cancel Button */}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-lg bg-emerald-900 text-white flex items-center justify-center shrink-0 text-xs font-mono shadow-2xs mt-1">
              LL
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs max-w-sm">
              <div className="flex items-center gap-2 text-xs font-medium text-stone-800">
                <RefreshCw className="w-4 h-4 text-emerald-700 animate-spin" />
                <span>Waiting for model response ({elapsedSeconds}s elapsed)...</span>
              </div>
              <p className="mt-1 text-[11px] text-stone-500">
                Calling model backend. You may cancel at any time without losing notes.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={onCancelRequest}
                  className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded-lg border border-stone-300 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <X className="w-3.5 h-3.5 text-stone-600" />
                  <span>Cancel request</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Suggestion Chips */}
      <div className="px-4 py-2 border-t border-stone-200 bg-[#FAF8F5] overflow-x-auto">
        <div className="flex items-center gap-1.5 whitespace-nowrap text-xs">
          <span className="text-[10px] font-mono text-stone-500 uppercase font-semibold mr-1">
            Test Journeys:
          </span>
          <button
            onClick={() =>
              onSendMessage(
                'Help me write an email to my professor asking for more time for a design project. My notes: prototype unfinished; deadline Friday; worried about sounding irresponsible. What should we do next?'
              )
            }
            disabled={isLoading}
            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 text-emerald-950 font-medium rounded-lg border border-emerald-300 text-[11px] transition-colors cursor-pointer"
          >
            P1 Test: Design Project Notes
          </button>
          <button
            onClick={onTriggerJourneyA}
            disabled={isLoading}
            className="px-2.5 py-1 bg-white hover:bg-stone-100 disabled:opacity-50 text-stone-800 rounded-lg border border-stone-300 text-[11px] transition-colors cursor-pointer"
          >
            Journey A: Physics Glitch Notes
          </button>
          <button
            onClick={onTriggerClarify}
            disabled={isLoading}
            className="px-2.5 py-1 bg-white hover:bg-stone-100 disabled:opacity-50 text-stone-800 rounded-lg border border-stone-300 text-[11px] transition-colors cursor-pointer"
          >
            Clarify: Prof & Monday 5pm
          </button>
          <button
            onClick={onTriggerJourneyB}
            disabled={isLoading}
            className="px-2.5 py-1 bg-white hover:bg-stone-100 disabled:opacity-50 text-stone-800 rounded-lg border border-stone-300 text-[11px] transition-colors cursor-pointer"
          >
            Journey B: Tuesday + 80w/90w limit
          </button>
          <button
            onClick={onTriggerRefusalTest}
            disabled={isLoading}
            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 disabled:opacity-50 text-amber-900 rounded-lg border border-amber-300 text-[11px] transition-colors cursor-pointer"
          >
            Refusal Test: Fake excuse
          </button>
        </div>
      </div>

      {/* Input Form with Duplicate-Send Prevention */}
      <div className="p-3 sm:p-4 bg-white border-t border-stone-200">
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            rows={2}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={
              isLoading
                ? 'Waiting for model response... Input is locked to prevent duplicate sends.'
                : 'Type your notes, clarification, or requested changes... (Enter to send, Shift+Enter for newline)'
            }
            className="flex-1 text-xs sm:text-sm p-2.5 bg-[#FAF8F5] border border-stone-300 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-700 resize-none font-sans disabled:opacity-60"
          />

          {isLoading ? (
            <button
              type="button"
              onClick={onCancelRequest}
              className="px-3.5 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl font-medium text-xs sm:text-sm transition-colors flex items-center gap-1.5 shadow-2xs h-[42px] cursor-pointer"
              title="Cancel the ongoing request"
            >
              <X className="w-4 h-4 text-stone-600" />
              <span>Cancel</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white rounded-xl font-medium text-xs sm:text-sm transition-colors flex items-center gap-1.5 shadow-2xs h-[42px] cursor-pointer"
            >
              <span>Send</span>
              <CornerDownLeft className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
