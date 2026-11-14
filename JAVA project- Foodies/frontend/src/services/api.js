/**
 * Shared fetch wrapper for all backend REST calls.
 * Always sends session cookies via credentials: 'include' through the Vite /api proxy.
 */
export class ApiError extends Error {
  constructor(status, code, message, fieldErrors = null) {
    super(message);
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

export async function apiRequest(path, options = {}) {
  const { headers, body, ...rest } = options;

  const response = await fetch(path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...rest,
  });

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.code || 'REQUEST_FAILED',
      data?.message || 'Unable to complete request. Please try again.',
      data?.fieldErrors || null
    );
  }

  return data;
}

