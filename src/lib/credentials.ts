const CONTROL_CHARS = /[\u0000-\u001F\u007F]/;
const EMAIL_PATTERN = /^[a-z0-9._%+\-]+@[a-z0-9.-]+\.[a-z]{2,24}$/;

export function normalizeEmail(raw: string) {
  const value = raw.trim().toLowerCase();
  if (value.length < 6 || value.length > 254) return null;
  if (CONTROL_CHARS.test(value) || value.includes("..") || /[<>\s]/.test(value)) return null;
  if (!EMAIL_PATTERN.test(value)) return null;
  return value;
}

export function passwordIssue(password: string, mode: "create" | "signin") {
  if (CONTROL_CHARS.test(password)) return "Password cannot include control characters.";
  if (password.length > 128) return "Password is too long.";
  if (mode === "create" && password.length < 8) return "Password must be at least 8 characters.";
  if (mode === "signin" && password.length < 6) return "Password must be at least 6 characters.";
  return null;
}
