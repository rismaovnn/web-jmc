import assert from 'node:assert/strict';
import test from 'node:test';
import { validateInquiry } from './validation.ts';

const valid = {
  name: 'Jane Doe', email: 'jane@example.com',
  projectType: 'Virtual Tour / 360', details: 'We need a virtual tour of our education campus.',
};
test('accepts and trims a valid inquiry', () => {
  const result = validateInquiry({ ...valid, name: ' Jane Doe ', email: ' jane@example.com ' });
  assert.equal(result?.name, 'Jane Doe');
  assert.equal(result?.email, 'jane@example.com');
});
test('rejects incomplete and malformed data', () => {
  assert.equal(validateInquiry(null), null);
  assert.equal(validateInquiry({ ...valid, email: 'not-an-email' }), null);
  assert.equal(validateInquiry({ ...valid, name: 'X' }), null);
  assert.equal(validateInquiry({ ...valid, details: 'Short' }), null);
  assert.equal(validateInquiry({ ...valid, projectType: 'Surprise\r\nBCC: someone@example.com' }), null);
  assert.equal(validateInquiry({ ...valid, name: 'Jane\nBcc: bad@example.com' }), null);
  assert.equal(validateInquiry({ ...valid, details: 'z'.repeat(5001) }), null);
});
