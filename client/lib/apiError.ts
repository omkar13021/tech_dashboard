/** Extracts a human-readable message from an axios/HTTP error. */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && error !== null) {
    const e = error as { response?: { data?: { message?: string } }; message?: string };
    const msg = e.response?.data?.message;
    if (Array.isArray(msg)) return msg.join(', ');
    return msg || e.message || fallback;
  }
  return fallback;
}
