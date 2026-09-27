type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_KEYS = 4000;

export type LimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
  limit: number;
};

function prune(now: number) {
  if (buckets.size < MAX_KEYS) return;
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) buckets.delete(key);
  }
  if (buckets.size >= MAX_KEYS) {
    const first = buckets.keys().next().value;
    if (first) buckets.delete(first);
  }
}

export function checkLimit(key: string, limit: number, windowMs: number): LimitResult {
  const now = Date.now();
  prune(now);
  const current = buckets.get(key);
  if (!current || now >= current.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSec: Math.ceil(windowMs / 1000), limit };
  }
  current.count += 1;
  const retryAfterSec = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
  if (current.count <= limit) {
    return { allowed: true, remaining: limit - current.count, retryAfterSec, limit };
  }
  return { allowed: false, remaining: 0, retryAfterSec, limit };
}

export function limitHeaders(result: LimitResult): HeadersInit {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
  };
  if (!result.allowed) headers["Retry-After"] = String(result.retryAfterSec);
  return headers;
}

export function clientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  return ip.slice(0, 64);
}
