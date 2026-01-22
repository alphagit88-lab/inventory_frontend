const fallback = 'N/A';

/**
 * Format a date string or Date object in a deterministic, timezone-stable way for SSR/CSR.
 * Uses manual formatting to avoid hydration mismatches between server and client.
 */
export function formatDate(value?: string | Date, withTime = false): string {
  if (!value) return fallback;
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return fallback;

  // Use UTC methods to ensure consistent formatting across server and client
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');

  if (withTime) {
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  return `${year}-${month}-${day}`;
}

