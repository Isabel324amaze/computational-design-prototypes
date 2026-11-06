import { test } from 'node:test';
import assert from 'node:assert/strict';
import { countWords, normalizeDraft } from '../src/types.ts';

test('counts body words across whitespace without counting empty segments', () => {
  assert.equal(countWords('  '), 0);
  assert.equal(countWords('One\n two\tthree\u00a0four'), 4);
});

test('replaces an incorrect model count and excludes other email fields', () => {
  const original = { subject: 'A long subject', salutation: 'Dear Dr. Lee,', body: 'Needs more testing.', signoff: 'Best regards, Student', wordCount: 999 };
  const result = normalizeDraft(original);
  assert.equal(result.wordCount, 3);
  assert.equal(original.wordCount, 999);
  assert.equal(result.body, original.body);
});

test('does not hide an over-limit draft by truncating it', () => {
  const body = Array.from({ length: 81 }, () => 'word').join(' ');
  const result = normalizeDraft({ subject: '', salutation: '', body, signoff: '', wordCount: 79 });
  assert.equal(result.wordCount, 81);
  assert.equal(result.body, body);
});
