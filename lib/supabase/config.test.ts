import assert from 'node:assert/strict';
import test from 'node:test';
import { parseSupabaseConfig } from './config';

test('normalizes a valid Supabase project URL', () => {
  assert.deepEqual(parseSupabaseConfig({
    NODE_ENV: 'production',
    NEXT_PUBLIC_SUPABASE_URL: 'https://project.supabase.co/',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'publishable-key',
    NEXT_PUBLIC_APP_URL: 'https://app.example.com',
  }), { url: 'https://project.supabase.co', publishableKey: 'publishable-key' });
});

test('rejects an application URL configured as the Supabase endpoint', () => {
  assert.throws(() => parseSupabaseConfig({
    NODE_ENV: 'production',
    NEXT_PUBLIC_SUPABASE_URL: 'https://app.example.com',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'publishable-key',
    NEXT_PUBLIC_APP_URL: 'https://app.example.com',
  }), /points to the application domain/);
});

test('rejects invalid and insecure production Supabase URLs', () => {
  assert.throws(() => parseSupabaseConfig({ NEXT_PUBLIC_SUPABASE_URL: 'not-a-url', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'key' }), /absolute Supabase project URL/);
  assert.throws(() => parseSupabaseConfig({ NODE_ENV: 'production', NEXT_PUBLIC_SUPABASE_URL: 'http://project.supabase.co', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'key' }), /use HTTPS/);
});
