import { GoogleGenAI, Type } from '@google/genai';
import { normalizeDraft } from '../src/types.ts';

// Grounded Letter Writing Assistant System Instruction
const SYSTEM_INSTRUCTION = `
You are the Grounded Letter Writing Assistant for LetterLab, a specialized agent helping university students turn fragmented, anxious notes into truthful, concise, and respectful professor emails for a Computational Design course (and similar academic courses).

ROLE CARD:
- Role name: Grounded Letter Writing Assistant
- Purpose: Accurate, reviewable academic email drafts while retaining complete truthfulness and student oversight.
- Required inputs:
  1. Recipient (Professor/Instructor name or title, e.g., "Professor Chen")
  2. Purpose (Specific academic need, e.g., extension request for computational design prototype)
  3. Original deadline (e.g., "this Friday at 5:00 PM")
  4. Requested deadline (e.g., "next Monday at 5:00 PM" or "Tuesday 11:59 PM")
  5. Truthful reason (Actual technical, personal, or conceptual roadblock, e.g., "physics constraint solver glitches in the interactive geometry prototype")

CORE RULES & CONSTRAINTS:
1. STRICT GROUNDING & ANTI-HALLUCINATION:
   - Do NOT invent any research, progress, fake illnesses or emergencies, fabricated family issues, promises, policies, approvals, or course identifiers that the user or explicit reference facts did not supply. An unfinished prototype does not establish completed research, technical complexity, or a commitment to work over the weekend.
   - If course policy or syllabus rules are not provided in the Reference Facts, explicitly say the policy is "unknown".
   - If the user asks or attempts to fabricate an excuse (e.g. "tell them my computer exploded", "say I was in the ER", "say you approved this already"), REFUSE the fabricated excuse politely and firmly, explain why truthfulness protects their academic standing, and provide a grounded, truthful draft based only on the real technical or scheduling roadblock.
2. MISSING FIELDS WORKFLOW (JOURNEY A):
   - Check the accumulated fact state against the 5 required fields: recipient, purpose, original deadline, requested deadline, truthful reason.
   - If ANY required fields are missing (commonly the recipient and requested deadline in the first turn):
     - Set status to "needs_clarification".
     - Ask AT MOST TWO concise, direct questions asking ONLY for the missing fields.
     - Do NOT output an ungrounded email draft when essential facts like recipient or requested deadline are unknown. Instead, explain what was understood so far and ask the 1 or 2 targeted questions.
3. DRAFTING WORKFLOW (JOURNEY B & POST-CLARIFICATION):
   - Once all required fields exist (or user provided them):
     - Set status to "draft_ready".
     - Generate a descriptive, professional subject. Include a course code only if explicitly supplied; otherwise omit it. Use [Your Name] for an unknown sender.
     - Generate an email body that is under the word limit (default 150 words maximum; if the user specified a tighter limit like 90 words or 80 words, strictly stay below that limit).
     - State the truthful reason transparently without defensive melodrama.
     - Include a specific, reasonable requested deadline.
     - Include an action plan or milestone only when the user explicitly supplied that commitment. Do not add office hours, weekend work, progress or deliverables on the user's behalf.
4. PARAMETER REVISIONS & WORD LIMITS:
   - When the user changes dates (e.g., "change date to next Tuesday") or word limits (e.g., "keep it under 90 words"):
     - Immediately update the extracted facts.
     - Revise the draft strictly respecting the new word limit and date.
     - Do not invent any new facts in the revision.
5. USER REVIEW:
   - The user always reviews and sends manually; LetterLab never sends emails automatically.
6. DRAFT SCHEMA POPULATION:
   - If status is 'needs_clarification', set emailDraft to { subject: "", salutation: "", body: "", signoff: "", wordCount: 0 }.
   - If status is 'draft_ready', populate complete subject, salutation, body, signoff, and exact word count adhering strictly to the word limit.

Always output response conforming to the JSON schema.
`;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    agentMessage: {
      type: Type.STRING,
      description: 'Conversational response to the student, explaining what facts were gathered, asking missing questions, or summarizing the draft.',
    },
    status: {
      type: Type.STRING,
      description: 'Current status: needs_clarification, draft_ready, or refusal_and_guidance',
    },
    questions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'At most two targeted questions about missing required fields. Empty if draft is ready.',
    },
    facts: {
      type: Type.OBJECT,
      properties: {
        recipient: { type: Type.STRING, description: 'Instructor name/title, or null if missing.' },
        purpose: { type: Type.STRING, description: 'Purpose of email, or null if missing.' },
        originalDeadline: { type: Type.STRING, description: 'Original deadline, or null if missing.' },
        requestedDeadline: { type: Type.STRING, description: 'Requested new deadline, or null if missing.' },
        truthfulReason: { type: Type.STRING, description: 'Verifiable reason for the request, or null if missing.' },
        coursePolicy: { type: Type.STRING, description: 'Applicable course policy or "Unknown (no syllabus policy provided)".' },
        wordLimit: { type: Type.INTEGER, description: 'Active word limit, defaults to 150 or user-specified value.' },
        tone: { type: Type.STRING, description: 'Detected or selected tone (e.g., respectful, concise, urgent).' },
        fabricationDetected: { type: Type.BOOLEAN, description: 'True if user requested a fabricated excuse or invented fact.' },
        fabricationNotes: { type: Type.STRING, description: 'Explanation if fabrication was detected and rejected.' },
      },
      required: ['wordLimit', 'fabricationDetected'],
    },
    emailDraft: {
      type: Type.OBJECT,
      properties: {
        subject: { type: Type.STRING, description: 'Subject line for email.' },
        salutation: { type: Type.STRING, description: 'Salutation, e.g. "Dear Professor Chen,"' },
        body: { type: Type.STRING, description: 'Body text of the email draft without salutation or signoff.' },
        signoff: { type: Type.STRING, description: 'Sign-off phrase, e.g. "Best regards,\n[Your Name]"' },
        wordCount: { type: Type.INTEGER, description: 'Estimated body word count; application recomputes deterministically. Exclude subject, salutation and signoff.' },
      },
      required: ['subject', 'salutation', 'body', 'signoff', 'wordCount'],
    },
  },
  required: ['agentMessage', 'status', 'questions', 'facts', 'emailDraft'],
};

// Chat endpoint
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST for chat requests.' });
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      return res.status(400).json({
        error: 'GEMINI_API_KEY is not configured on the server. Set it as a server-side environment variable and redeploy (Vercel: Project Settings > Environment Variables).',
      });
    }

    const { messages, userMessage, referenceFacts, currentFacts } = req.body;

    if (!userMessage && (!messages || messages.length === 0)) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        timeout: 45000,
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // Helper for race with timeout
    function withTimeout<T>(promise: Promise<T>, ms: number, errorMsg: string): Promise<T> {
      return Promise.race([
        promise,
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error(errorMsg)), ms)),
      ]);
    }

    // Build context payload
    const contextPrompt = `
CURRENT STATE & CONTEXT:
- Optional Reference Facts / Syllabus Knowledge:
${referenceFacts ? referenceFacts : 'None provided (All specific course rules and extension policies must be treated as "Unknown").'}

- Currently Known Facts Tracker:
${JSON.stringify(currentFacts || {}, null, 2)}

- Prior Conversation History:
${
  messages && messages.length > 0
    ? messages
        .map((m: { role: string; content: string }) => `${m.role === 'user' ? 'Student' : 'Assistant'}: ${m.content}`)
        .join('\n')
    : '(Start of conversation)'
}

- Latest User Input:
"${userMessage}"

Analyze the latest student message, update the known facts, check for any requested fabrications, and respond strictly conforming to the JSON schema.
If required fields (recipient, purpose, original deadline, requested deadline, truthful reason) are incomplete, ask at most 2 targeted questions.
If facts are sufficient or updated, produce a refined subject and email draft under the active word limit.
The assistant aims to use only supplied facts; users must review before sending.
`;

    let clientAborted = false;
    res.on('close', () => {
      if (!res.writableEnded) {
        clientAborted = true;
      }
    });

    async function generateWithFallback() {
      // Prioritize flash models with bounded 18s per-model budget
      const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
      let lastErr: any = null;

      for (const modelName of candidateModels) {
        if (clientAborted) {
          throw new Error('Client aborted request');
        }

        try {
          console.log(`[LetterLab] Attempting model ${modelName}...`);
          const callPromise = ai.models.generateContent({
            model: modelName,
            contents: contextPrompt,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              responseMimeType: 'application/json',
              responseSchema: responseSchema,
            },
          });

          return await withTimeout(callPromise, 18000, `Model ${modelName} call exceeded 18s budget`);
        } catch (err: any) {
          lastErr = err;
          const msg = String(err?.message || '');
          console.warn(`[LetterLab] Model ${modelName} error: ${msg}. Attempting next fallback...`);
          // Continue to next candidate model
        }
      }
      throw lastErr || new Error('All candidate models failed to respond within time limits');
    }

    // Overall server-side timeout bound of 50s
    const response = await withTimeout(
      generateWithFallback(),
      50000,
      'Server-side timeout: Gemini took longer than 50 seconds to complete generation. Please retry.'
    );

    if (clientAborted || res.writableEnded) {
      console.log('[LetterLab] Client disconnected before response could be sent.');
      return;
    }

    const text = response.text;
    if (!text) {
      throw new Error('Empty response received from Gemini API.');
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error('Failed to parse structured JSON from model: ' + text.slice(0, 200));
    }

    if (parsed.emailDraft) parsed.emailDraft = normalizeDraft(parsed.emailDraft);
    if (!referenceFacts?.trim() && parsed.facts) {
      parsed.facts.coursePolicy = 'Unknown (no syllabus policy provided)';
    }
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    const errorMessage = error?.message || 'Internal server error while calling Gemini API';
    const isTimeout = errorMessage.includes('timeout') || errorMessage.includes('exceeded');
    return res.status(isTimeout ? 504 : 500).json({ error: errorMessage });
  }
}
