const responsePreviewLength = 500;

export interface UnexpectedAuthResponseDetails {
  requestMethod: string;
  requestUrl: string;
  responseStatus: number;
  responseHeaders: Record<string, string>;
  responseContentType: string | null;
  responseBodyPreview: string;
}

export class UnexpectedAuthResponseError extends Error {
  readonly details: UnexpectedAuthResponseDetails;

  constructor(details: UnexpectedAuthResponseDetails) {
    super(`The Supabase Auth endpoint returned ${details.responseContentType ?? 'an unknown content type'} instead of JSON (HTTP ${details.responseStatus}).`);
    this.name = 'UnexpectedAuthResponseError';
    this.details = details;
  }
}

function responseHeaders(headers: Headers) {
  return Object.fromEntries(
    [...headers.entries()].map(([name, value]) => [name, name === 'set-cookie' ? '[redacted]' : value]),
  );
}

function requestUrl(input: RequestInfo | URL) {
  return input instanceof Request ? input.url : String(input);
}

function requestMethod(input: RequestInfo | URL, init?: RequestInit) {
  return init?.method ?? (input instanceof Request ? input.method : 'GET');
}

/**
 * Supabase Auth responses are JSON (except successful empty 204 responses).
 * Detect proxy, application, and hosting error pages before the Auth client
 * attempts JSON parsing, and retain bounded diagnostics for server logs.
 */
export function createDiagnosticAuthFetch(fetchImplementation: typeof fetch = fetch): typeof fetch {
  return async (input, init) => {
    const response = await fetchImplementation(input, init);
    const url = requestUrl(input);
    const contentType = response.headers.get('content-type');
    const isAuthRequest = new URL(url).pathname.includes('/auth/v1/');
    const expectsJson = response.status !== 204;

    if (isAuthRequest && expectsJson && !contentType?.toLowerCase().includes('application/json')) {
      const details: UnexpectedAuthResponseDetails = {
        requestMethod: requestMethod(input, init),
        requestUrl: url,
        responseStatus: response.status,
        responseHeaders: responseHeaders(response.headers),
        responseContentType: contentType,
        responseBodyPreview: (await response.clone().text()).slice(0, responsePreviewLength),
      };
      console.error(JSON.stringify({ event: 'supabase.auth.unexpected_response', ...details }));
      throw new UnexpectedAuthResponseError(details);
    }

    return response;
  };
}
