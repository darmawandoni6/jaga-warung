function parseDate(input: string | number | Date): Date {
  if (input instanceof Date) {
    return input;
  }
  if (typeof input === 'number') {
    return new Date(input);
  }
  // Normalize SQLite format 'YYYY-MM-DD HH:MM:SS' to ISO 'YYYY-MM-DDTHH:MM:SS'
  const normalized = input.includes(' ') && !input.includes('T') ? input.replace(' ', 'T') : input;
  const parsed = new Date(normalized);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

/**
 * Formats a date value into an Indonesian date string (e.g. "20 Sep 2026").
 */
export function formatDate(input: string | number | Date): string {
  const date = parseDate(input);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Formats a date value into an Indonesian date & time string (e.g. "20 Sep 2026, 10:15").
 */
export function formatDateTime(input: string | number | Date): string {
  const date = parseDate(input);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Formats a date relative to now in Indonesian (e.g. "Baru saja", "15 menit lalu", "Kemarin").
 */
export function formatRelative(input: string | number | Date): string {
  const date = parseDate(input);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) {
    return 'Baru saja';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} menit lalu`;
  }
  if (diffHours < 24) {
    return `${diffHours} jam lalu`;
  }
  if (diffDays === 1) {
    return 'Kemarin';
  }
  if (diffDays < 7) {
    return `${diffDays} hari lalu`;
  }

  return formatDate(date);
}
