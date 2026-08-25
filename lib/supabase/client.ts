import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase Data Layer (선택)
 * — 환경변수(NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)가 있으면
 *   Supabase Mode로 동작할 수 있고, 없으면 Demo Mode(로컬 시드 데이터)로 동작한다.
 *   Demo Mode에서도 모든 핵심 기능이 정상 동작한다.
 */

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

let cached: SupabaseClient | null = null;

export async function getSupabaseClient(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured()) return null;
  if (cached) return cached;
  const { createClient } = await import("@supabase/supabase-js");
  cached = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );
  return cached;
}
