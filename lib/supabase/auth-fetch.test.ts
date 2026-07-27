import assert from 'node:assert/strict';
import test from 'node:test';
import { AuthClient } from '@supabase/auth-js';
import { createDiagnosticAuthFetch, UnexpectedAuthResponseError } from './auth-fetch';

test('Supabase signUp posts JSON to the configured Auth endpoint', async () => {
  let observedUrl = '';
  let observedMethod = '';
  let observedContentType = '';
  const diagnosticFetch = createDiagnosticAuthFetch(async (input, init) => {
    observedUrl = input instanceof Request ? input.url : String(input);
    observedMethod = init?.method ?? (input instanceof Request ? input.method : 'GET');
    observedContentType = new Headers(init?.headers).get('content-type') ?? '';
    return new Response(JSON.stringify({ id: '00000000-0000-0000-0000-000000000001', email: 'qa@example.com', identities: [{}] }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });
  const client = new AuthClient({
    url: 'https://project.supabase.co/auth/v1',
    headers: { apikey: 'publishable-key' },
    autoRefreshToken: false,
    persistSession: false,
    fetch: diagnosticFetch,
  });

  const { error } = await client.signUp({ email: 'qa@example.com', password: 'Valid-password-42!' });

  assert.ifError(error);
  assert.equal(observedUrl, 'https://project.supabase.co/auth/v1/signup');
  assert.equal(observedMethod, 'POST');
  assert.match(observedContentType, /application\/json/);
});

test('passes JSON Supabase Auth responses through unchanged', async () => {
  const diagnosticFetch = createDiagnosticAuthFetch(async () => new Response('{"user":null}', {
    status: 200,
    headers: { 'content-type': 'application/json' },
  }));
  const response = await diagnosticFetch('https://project.supabase.co/auth/v1/signup', { method: 'POST' });
  assert.equal(await response.json().then((body) => body.user), null);
});

test('rejects HTML before the Auth client can parse it as JSON', async () => {
  const html = `<!DOCTYPE html><html><body>${'hosting error '.repeat(60)}</body></html>`;
  const diagnosticFetch = createDiagnosticAuthFetch(async () => new Response(html, {
    status: 404,
    headers: { 'content-type': 'text/html; charset=utf-8', 'x-vercel-error': 'NOT_FOUND' },
  }));

  await assert.rejects(
    () => diagnosticFetch('https://app.example.com/auth/v1/signup', { method: 'POST' }),
    (error: unknown) => {
      assert.ok(error instanceof UnexpectedAuthResponseError);
      assert.equal(error.details.requestMethod, 'POST');
      assert.equal(error.details.requestUrl, 'https://app.example.com/auth/v1/signup');
      assert.equal(error.details.responseStatus, 404);
      assert.equal(error.details.responseHeaders['x-vercel-error'], 'NOT_FOUND');
      assert.equal(error.details.responseContentType, 'text/html; charset=utf-8');
      assert.equal(error.details.responseBodyPreview.length, 500);
      assert.match(error.details.responseBodyPreview, /^<!DOCTYPE html>/);
      return true;
    },
  );
});
