import { config } from './config';

export enum RequestMethodEnum {
  Get = 'get',
  Post = 'post',
  Put = 'put',
  Delete = 'delete',
  Patch = 'patch',
  Options = 'options',
}

export class ResponseError extends Error {
  public response: Response | ServerErrorResponse;

  constructor(response: Response) {
    super(response.statusText);
    this.response = response;
  }
}

interface ServerErrorResponse {
  message?: string | string[];
  error?: string;
  code?: string;
  description?: string;
  details?: string;
  statusCode?: number;
}

/**
 * Parses the JSON returned by a network request
 * @param  {object} response A response from a network request
 * @return {object}          The parsed JSON from the request
 */
function parseJSON(response: Response) {
  if (response.status === 204 || response.status === 205) {
    return null;
  }
  return response.text().then((text) => {
    if (!text) return null;
    return JSON.parse(text);
  });
}

/**
 * Checks if a network request came back fine and throws an error if not
 * @param  {object} response   A response from a network request
 * @return {object|undefined} Returns either the response or throws an error
 */
async function checkStatus(response: Response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const error = new ResponseError(response);
  try {
    error.response = await response.json();
  } catch {
    error.response = response;
  }

  throw error;
}

/**
 * Requests a URL, returning a promise.
 *
 * This site is public: no token is attached, and a 401/403 is surfaced as a
 * plain error instead of redirecting to a login screen.
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           The response data
 */
export default async function request(url: string, options: RequestInit = {}): Promise<any> {
  const fullUrl = url.startsWith('/') ? `${config.apiRootUrl}${url}` : url;

  const isFormData = options.body instanceof FormData;
  const hasBody = options.body != null;

  const fetchResponse = await fetch(fullUrl, {
    ...options,
    headers: {
      ...(!isFormData && hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  });

  const response = await checkStatus(fetchResponse);

  return parseJSON(response);
}

//Turns anything thrown by `request` into a message safe to render.
export function getErrorMessage(error: unknown): string {
  const fallback = 'We encountered an unexpected error. Please try again later.';

  if (error instanceof ResponseError && !(error.response instanceof Response)) {
    const serverError = error.response;
    return (
      extractMessage(serverError.message) ||
      serverError.description ||
      serverError.error ||
      serverError.details ||
      `Error ${serverError.statusCode || '- server'}`
    );
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}

const extractMessage = (msg: string | string[] | undefined): string | undefined => {
  if (Array.isArray(msg)) {
    return msg.length > 0 ? String(msg[0]) : undefined;
  }
  return msg;
};
