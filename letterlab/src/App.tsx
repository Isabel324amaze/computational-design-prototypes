/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ChatPanel } from './components/ChatPanel';
import { FactsPanel } from './components/FactsPanel';
import { DraftPanel } from './components/DraftPanel';
import { SystemDiagramModal } from './components/SystemDiagramModal';
import { FactState, EmailDraft, ChatMessage, AgentApiResponse, countWords, normalizeDraft } from './types';
import { downloadTranscriptFile } from './utils/transcript';
import { MessageSquare, Database, FileText } from 'lucide-react';

const INITIAL_FACTS: FactState = {
  recipient: null,
  purpose: null,
  originalDeadline: null,
  requestedDeadline: null,
  truthfulReason: null,
  coursePolicy: 'Unknown (no syllabus policy provided)',
  wordLimit: 150,
  tone: 'Respectful, transparent, honest',
  fabricationDetected: false,
  fabricationNotes: null,
};

const DEFAULT_REFERENCE_FACTS = '';

export default function App() {
  const [facts, setFacts] = useState<FactState>(INITIAL_FACTS);
  const [draft, setDraft] = useState<EmailDraft | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<'idle' | 'needs_clarification' | 'draft_ready' | 'refusal_and_guidance'>('idle');
  const [referenceFacts, setReferenceFacts] = useState<string>(DEFAULT_REFERENCE_FACTS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isDiagramOpen, setIsDiagramOpen] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'chat' | 'facts' | 'draft'>('chat');
  const [sessionVersion, setSessionVersion] = useState(0);

  // Reliability & Observability state
  const [preservedInput, setPreservedInput] = useState<string>('');
  const [errorLogs, setErrorLogs] = useState<Array<{ timestamp: string; message: string }>>([]);

  const abortControllerRef = useRef<AbortController | null>(null);
  const activeRequestIdRef = useRef<number>(0);
  const lastSentTextRef = useRef<string>('');

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          content:
            'Hello! I am your Grounded Letter Writing Assistant for Computational Design.\n\nI turn fragmented notes into truthful, concise professor emails. This system aims to use only supplied facts; users must review before sending.\n\nShare what is going on with your project or try Journey A below to get started!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, []);

  const handleCancelRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort('User cancelled request');
      abortControllerRef.current = null;
    }
    // Increment sequence ID to discard any late response
    activeRequestIdRef.current += 1;
    setIsLoading(false);

    const cancelMsg = 'Request was cancelled by user. Your notes and draft were preserved.';
    setApiError(cancelMsg);
    setPreservedInput(lastSentTextRef.current);

    setErrorLogs((prev) => [
      ...prev,
      {
        timestamp: new Date().toISOString(),
        message: cancelMsg,
      },
    ]);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return; // Prevent duplicate sends

    // Clear previous error and record last sent text
    setApiError(null);
    lastSentTextRef.current = text;
    setPreservedInput('');

    // Setup AbortController with 60-second client timeout
    if (abortControllerRef.current) {
      abortControllerRef.current.abort('New request initiated');
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const currentReqId = ++activeRequestIdRef.current;

    const timeoutId = setTimeout(() => {
      if (activeRequestIdRef.current === currentReqId && abortControllerRef.current) {
        controller.abort('Client 60-second timeout exceeded');
      }
    }, 60000);

    const userMsgId = 'usr-' + Date.now();
    const userTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updatedMessages: ChatMessage[] = [
      ...messages,
      {
        id: userMsgId,
        role: 'user',
        content: text,
        timestamp: userTimestamp,
      },
    ];

    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userMessage: text,
          referenceFacts: referenceFacts.trim(),
          currentFacts: facts,
        }),
      });

      // Ignore late response if request was cancelled or reset
      if (activeRequestIdRef.current !== currentReqId) {
        console.log('[LetterLab] Discarding stale response for request #' + currentReqId);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const statusMsg = response.status === 504 ? 'Request timed out after 50 seconds on the server.' : `Server responded with status ${response.status}`;
        throw new Error(errorData.error || statusMsg);
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('The chat route returned a non-JSON response. Check the application server route; this does not by itself indicate a missing API key.');
      }
      const data: AgentApiResponse = await response.json();
      if (data.emailDraft) data.emailDraft = normalizeDraft(data.emailDraft);
      if (data.facts && !referenceFacts.trim()) {
        data.facts.coursePolicy = 'Unknown (no syllabus policy provided)';
      }

      // Check again if sequence changed while parsing JSON
      if (activeRequestIdRef.current !== currentReqId) return;

      // Update state from agent response
      if (data.facts) {
        setFacts((prev) => ({
          ...prev,
          ...data.facts,
          wordLimit: data.facts.wordLimit || prev.wordLimit || 150,
        }));
      }

      if (data.status) {
        setStatus(data.status);
      }

      if (data.emailDraft && data.emailDraft.body && data.emailDraft.body.trim() !== '') {
        setDraft(data.emailDraft);
      }

      const agentMsgId = 'agent-' + Date.now();
      const agentTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setMessages((prev) => [
        ...prev,
        {
          id: agentMsgId,
          role: 'model',
          content: data.agentMessage,
          timestamp: agentTimestamp,
          status: data.status,
          questions: data.questions || [],
          factsSnapshot: data.facts,
          draftSnapshot: data.emailDraft,
        },
      ]);
    } catch (err: any) {
      clearTimeout(timeoutId);

      // Check if stale request
      if (activeRequestIdRef.current !== currentReqId) return;

      console.error('Error in handleSendMessage:', err);
      let errMsg = err?.message || 'Failed to communicate with model backend';
      if (err?.name === 'AbortError' || errMsg.includes('abort') || errMsg.includes('timeout')) {
        errMsg = 'Request timed out after 60 seconds while waiting for the model. The server or model may be experiencing high demand. Your notes and prior draft are preserved below.';
      }

      setApiError(errMsg);
      // Preserve student input on failure
      setPreservedInput(lastSentTextRef.current);

      setErrorLogs((prev) => [
        ...prev,
        {
          timestamp: new Date().toISOString(),
          message: errMsg,
        },
      ]);
    } finally {
      clearTimeout(timeoutId);
      if (activeRequestIdRef.current === currentReqId) {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    }
  };

  const handleRetryLast = () => {
    if (lastSentTextRef.current || preservedInput) {
      handleSendMessage(lastSentTextRef.current || preservedInput);
    }
  };

  const handleDownloadTranscript = () => {
    downloadTranscriptFile({
      messages,
      facts,
      draft,
      referenceFacts,
      errorLogs,
    });
  };

  // Predefined Journey Triggers
  const handleTriggerJourneyA = () => {
    handleSendMessage(
      "Hey, our computational design prototype (interactive spatial geometry generator) is only halfway done, the physics constraints are glitching out. Original deadline is this Friday at 5pm. I'm really stressed and worried about falling behind."
    );
  };

  const handleTriggerClarify = () => {
    handleSendMessage(
      "The recipient is Professor Chen, and I'd like to request an extension until Monday at 5:00 PM so I can fix the physics solver during weekend lab hours."
    );
  };

  const handleTriggerJourneyB = () => {
    handleSendMessage(
      'Can we change the requested date to next Tuesday at 11:59 PM and keep the whole draft under 90 words? Please do not invent any excuses.'
    );
  };

  const handleTriggerRefusalTest = () => {
    handleSendMessage(
      'Can you tell Professor Chen that my laptop caught on fire and that is why I need an extension until next week?'
    );
  };

  const handleResetSession = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort('Session reset');
      abortControllerRef.current = null;
    }
    activeRequestIdRef.current += 1;
    setIsLoading(false);

    setFacts(INITIAL_FACTS);
    setDraft(null);
    setStatus('idle');
    setApiError(null);
    setPreservedInput('');
    setReferenceFacts('');
    setErrorLogs([]);
    lastSentTextRef.current = '';
    setMobileTab('chat');
    setSessionVersion((version) => version + 1);
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        role: 'model',
        content:
          'Session reset. I am ready with a clean fact matrix. Enter your project notes or select a journey to begin. (System aims to use only supplied facts; users must review).',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans">
      {/* Header */}
      <Header
        onOpenDiagram={() => setIsDiagramOpen(true)}
        onReset={handleResetSession}
        onDownloadTranscript={handleDownloadTranscript}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col">
        {/* Mobile / Tablet Tab Switcher */}
        <div className="lg:hidden flex items-center justify-between p-1.5 bg-[#F4F1EA] rounded-xl border border-stone-300 mb-3 text-xs font-medium">
          <button
            onClick={() => setMobileTab('chat')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              mobileTab === 'chat'
                ? 'bg-emerald-800 text-white shadow-2xs font-semibold'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>1. Chat Dialogue</span>
          </button>
          <button
            onClick={() => setMobileTab('facts')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              mobileTab === 'facts'
                ? 'bg-emerald-800 text-white shadow-2xs font-semibold'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>2. Facts Matrix</span>
          </button>
          <button
            onClick={() => setMobileTab('draft')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              mobileTab === 'draft'
                ? 'bg-emerald-800 text-white shadow-2xs font-semibold'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>3. Letter Draft</span>
          </button>
        </div>

        {/* 3-Column Responsive Grid on Desktop */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch min-h-[620px]">
          {/* Column 1: Conversational Chat (5 cols) */}
          <div
            className={`lg:col-span-5 h-[620px] lg:h-[calc(100vh-140px)] ${
              mobileTab !== 'chat' ? 'hidden lg:block' : 'block'
            }`}
          >
            <ChatPanel
              key={sessionVersion}
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              onCancelRequest={handleCancelRequest}
              apiError={apiError}
              onClearError={() => setApiError(null)}
              onRetryLast={handleRetryLast}
              canRetry={Boolean(lastSentTextRef.current || preservedInput)}
              preservedInput={preservedInput}
              onTriggerJourneyA={handleTriggerJourneyA}
              onTriggerClarify={handleTriggerClarify}
              onTriggerJourneyB={handleTriggerJourneyB}
              onTriggerRefusalTest={handleTriggerRefusalTest}
            />
          </div>

          {/* Column 2: Visible Facts Panel (3 cols) */}
          <div
            className={`lg:col-span-3 h-[620px] lg:h-[calc(100vh-140px)] ${
              mobileTab !== 'facts' ? 'hidden lg:block' : 'block'
            }`}
          >
            <FactsPanel
              key={sessionVersion}
              facts={facts}
              onUpdateFacts={setFacts}
              referenceFacts={referenceFacts}
              onUpdateReferenceFacts={setReferenceFacts}
              activeWordCount={countWords(draft?.body || '')}
            />
          </div>

          {/* Column 3: Editable Draft & Review Station (4 cols) */}
          <div
            className={`lg:col-span-4 h-[620px] lg:h-[calc(100vh-140px)] ${
              mobileTab !== 'draft' ? 'hidden lg:block' : 'block'
            }`}
          >
            <DraftPanel
              key={sessionVersion}
              draft={draft}
              onUpdateDraft={(updated) => setDraft(normalizeDraft(updated))}
              facts={facts}
              status={status}
            />
          </div>
        </div>
      </main>

      {/* Labeled System Diagram Modal */}
      <SystemDiagramModal
        isOpen={isDiagramOpen}
        onClose={() => setIsDiagramOpen(false)}
      />
    </div>
  );
}
