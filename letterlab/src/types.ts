export interface FactState {
  recipient: string | null;
  purpose: string | null;
  originalDeadline: string | null;
  requestedDeadline: string | null;
  truthfulReason: string | null;
  coursePolicy: string | null;
  wordLimit: number;
  tone: string;
  fabricationDetected: boolean;
  fabricationNotes: string | null;
}

export interface EmailDraft {
  subject: string;
  salutation: string;
  body: string;
  signoff: string;
  wordCount: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  status?: 'needs_clarification' | 'draft_ready' | 'refusal_and_guidance';
  questions?: string[];
  factsSnapshot?: Partial<FactState>;
  draftSnapshot?: EmailDraft | null;
}

export interface AgentApiResponse {
  agentMessage: string;
  status: 'needs_clarification' | 'draft_ready' | 'refusal_and_guidance';
  questions: string[];
  facts: FactState;
  emailDraft?: EmailDraft | null;
  error?: string;
}

/** Count only the email body. Subject, greeting and sign-off are excluded. */
export function countWords(body: string): number {
  return body.trim() ? body.trim().split(/\s+/u).length : 0;
}

/** Never trust the model's count or change its wording to meet a limit. */
export function normalizeDraft(draft: EmailDraft): EmailDraft {
  return { ...draft, wordCount: countWords(draft.body || '') };
}
