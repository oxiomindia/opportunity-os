import assert from 'node:assert/strict';
import test from 'node:test';
import { matchesInvoiceSignature, sanitizeInvoiceFilename } from './validation';

test('recognizes supported invoice signatures', () => {
  assert.equal(matchesInvoiceSignature(new Uint8Array([0x25, 0x50, 0x44, 0x46]), 'application/pdf'), true);
  assert.equal(matchesInvoiceSignature(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), 'image/png'), true);
  assert.equal(matchesInvoiceSignature(new Uint8Array([0xff, 0xd8, 0xff]), 'image/jpeg'), true);
});

test('rejects spoofed and unsupported files', () => {
  assert.equal(matchesInvoiceSignature(new TextEncoder().encode('not a pdf'), 'application/pdf'), false);
  assert.equal(matchesInvoiceSignature(new Uint8Array([0xff, 0xd8, 0xff]), 'text/plain'), false);
});

test('sanitizes storage filenames', () => {
  assert.equal(sanitizeInvoiceFilename('../../invoice 01.pdf'), '..-..-invoice-01.pdf');
  assert.ok(sanitizeInvoiceFilename('x'.repeat(200)).length <= 120);
});
