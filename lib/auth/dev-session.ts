import { canUseDemoLogin, type DemoEnvironment } from './demo-policy';

const COOKIE_NAME = 'oxiom-dev-demo';
const DEV_SIGNING_KEY = 'oxiom-development-demo-session-v1';

export const demoIdentity = {
  user: { id: '00000000-0000-4000-8000-000000000001', email: 'admin@demo.oxiom.local' },
  organization: { id: '00000000-0000-4000-8000-000000000002', name: 'Demo Organization', slug: 'demo-organization', edition: 'finance_suite' as const },
  role: 'owner' as const,
};

function encode(value: Uint8Array | string) {
  const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : value;
  return btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function decode(value: string) {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
}

async function signingKey() {
  return crypto.subtle.importKey('raw', new TextEncoder().encode(DEV_SIGNING_KEY), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

async function signature(payload: string) {
  return encode(new Uint8Array(await crypto.subtle.sign('HMAC', await signingKey(), new TextEncoder().encode(payload))));
}

export async function createLocalDemoToken() {
  const payload = encode(JSON.stringify({ version: 1, userId: demoIdentity.user.id }));
  return `${payload}.${await signature(payload)}`;
}

export async function verifyLocalDemoToken(token?: string) {
  if (!token) return false;
  const [payload, supplied, extra] = token.split('.');
  if (!payload || !supplied || extra) return false;
  try {
    const validSignature = await crypto.subtle.verify('HMAC', await signingKey(), decode(supplied), new TextEncoder().encode(payload));
    if (!validSignature) return false;
    const tokenPayload = JSON.parse(new TextDecoder().decode(decode(payload))) as { version?: unknown; userId?: unknown };
    return tokenPayload.version === 1 && tokenPayload.userId === demoIdentity.user.id;
  } catch {
    return false;
  }
}

export const localDemoCookie = { name: COOKIE_NAME };

export function getLocalDemoCookieOptions(environment: DemoEnvironment) {
  return { httpOnly: true, sameSite: 'lax' as const, secure: environment.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 12 };
}

export const isLocalDemoEnabled = canUseDemoLogin;
