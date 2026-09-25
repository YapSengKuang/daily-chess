const USERNAME_PATTERN = /^[^<>\n\r]{2,32}$/;

export function normalizeUsername(raw: string) {
  const value = raw.trim().replace(/\s+/g, " ");
  if (!USERNAME_PATTERN.test(value)) return null;
  return value;
}
