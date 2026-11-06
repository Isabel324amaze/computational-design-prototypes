import { ChatMessage, FactState, EmailDraft, countWords } from '../types';

export interface TranscriptData {
  messages: ChatMessage[];
  facts: FactState;
  draft: EmailDraft | null;
  referenceFacts: string;
  errorLogs: Array<{ timestamp: string; message: string }>;
}

export function generateTranscriptText(data: TranscriptData): string {
  const now = new Date().toISOString();
  const divider = '='.repeat(80);
  const subDivider = '-'.repeat(80);

  const lines: string[] = [];

  lines.push(divider);
  lines.push('LETTERLAB SESSION TRANSCRIPT');
  lines.push(`Generated: ${now}`);
  lines.push('Role: Grounded Letter Writing Assistant (Computational Design Prototype)');
  lines.push('Disclaimer: System aims to use only supplied facts; users must review.');
  lines.push('Note: This transcript excludes all credentials and API keys.');
  lines.push(divider);
  lines.push('');

  // Reference Facts
  lines.push(subDivider);
  lines.push('1. REFERENCE KNOWLEDGE & COURSE RULES (SUPPLIED BY USER)');
  lines.push(subDivider);
  lines.push(data.referenceFacts.trim() ? data.referenceFacts : '(No reference syllabus facts provided - policies treated as unknown)');
  lines.push('');

  // Fact Matrix
  lines.push(subDivider);
  lines.push('2. FINAL EXTRACTED FACT MATRIX');
  lines.push(subDivider);
  lines.push(`- Recipient:           ${data.facts.recipient || '[Pending / Unknown]'}`);
  lines.push(`- Purpose:             ${data.facts.purpose || '[Pending / Unknown]'}`);
  lines.push(`- Original Deadline:   ${data.facts.originalDeadline || '[Pending / Unknown]'}`);
  lines.push(`- Requested Deadline:  ${data.facts.requestedDeadline || '[Pending / Unknown]'}`);
  lines.push(`- Truthful Reason:     ${data.facts.truthfulReason || '[Pending / Unknown]'}`);
  lines.push(`- Course Policy:       ${data.facts.coursePolicy || '[Unknown]'}`);
  lines.push(`- Target Word Limit:   ${data.facts.wordLimit || 150} words`);
  lines.push(`- Stated Tone:         ${data.facts.tone || 'Respectful, transparent'}`);
  lines.push(`- Fabrication Flag:    ${data.facts.fabricationDetected ? 'YES (Fabrication requested and refused)' : 'NO'}`);
  if (data.facts.fabricationNotes) {
    lines.push(`- Fabrication Details: ${data.facts.fabricationNotes}`);
  }
  lines.push('');

  // Conversation Turns
  lines.push(subDivider);
  lines.push('3. CONVERSATION TURNS');
  lines.push(subDivider);

  if (data.messages.length === 0) {
    lines.push('(No messages recorded)');
  } else {
    data.messages.forEach((msg, idx) => {
      const senderLabel = msg.role === 'user' ? 'STUDENT' : 'GROUNDED ASSISTANT';
      lines.push(`[Turn ${idx + 1}] ${senderLabel} (${msg.timestamp}):`);
      lines.push(msg.content);

      if (msg.questions && msg.questions.length > 0) {
        lines.push('  Targeted Clarification Questions Asked:');
        msg.questions.forEach((q, qIdx) => {
          lines.push(`    ${qIdx + 1}. ${q}`);
        });
      }

      if (msg.status) {
        lines.push(`  Turn Status: ${msg.status}`);
      }
      lines.push('');
    });
  }

  // Active Draft
  lines.push(subDivider);
  lines.push('4. REVIEWABLE EMAIL DRAFT RECORD');
  lines.push(subDivider);

  if (data.draft && data.draft.body) {
    lines.push(`Subject: ${data.draft.subject}`);
    lines.push('');
    lines.push(data.draft.salutation);
    lines.push('');
    lines.push(data.draft.body);
    lines.push('');
    lines.push(data.draft.signoff);
    lines.push('');
    lines.push(`Body Word Count: ${countWords(data.draft.body)} words (Target Limit: ${data.facts.wordLimit || 150})`);
  } else {
    lines.push('(No complete draft generated in this session)');
  }
  lines.push('');

  // Recorded Errors or Cancellations
  lines.push(subDivider);
  lines.push('5. LOGGED ERRORS & TIMEOUTS');
  lines.push(subDivider);

  if (data.errorLogs.length === 0) {
    lines.push('No errors or timeouts logged during this session.');
  } else {
    data.errorLogs.forEach((err, idx) => {
      lines.push(`[${idx + 1}] ${err.timestamp}: ${err.message}`);
    });
  }
  lines.push('');
  lines.push(divider);
  lines.push('END OF TRANSCRIPT');
  lines.push(divider);

  return lines.join('\n');
}

export function downloadTranscriptFile(data: TranscriptData): void {
  const text = generateTranscriptText(data);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  link.href = url;
  link.download = `letterlab-session-transcript-${dateStr}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}
