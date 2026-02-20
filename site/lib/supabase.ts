import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      return null;
    }
    _supabase = createClient(url, key);
  }
  return _supabase;
}

// Lazy proxy that returns a no-op stub when Supabase is not configured.
// This prevents crashes during SSR/build when env vars are missing.
// The no-op resolves awaits/then() with { data: null, error: null } so
// destructuring like `const { data, error } = await supabase.from(...)` works.
// data has `session: null` so `{ data: { session } }` destructuring works for auth calls
const NOOP_RESULT = { data: { session: null }, error: null, count: null, status: 200, statusText: "OK" };

// Creates a no-op proxy that is both callable and has properties.
// Supports: supabase.auth.getSession(), supabase.from("x").select().eq(), await ..., etc.
function makeNoopProxy(): object {
  // A callable function that returns another no-op proxy when invoked
  const fn = (..._args: unknown[]) => makeNoopProxy();

  const handler: ProxyHandler<typeof fn> = {
    get(_target, prop) {
      // When code does `await proxy` or `proxy.then(...)`, return a resolved promise
      if (prop === "then") {
        return (resolve?: (v: unknown) => unknown) => Promise.resolve(NOOP_RESULT).then(resolve);
      }
      if (prop === "catch" || prop === "finally") {
        return (..._args: unknown[]) => Promise.resolve(NOOP_RESULT);
      }
      // .data for direct property access — returns object so destructuring works
      // e.g. `const { data: { subscription } } = supabase.auth.onAuthStateChange(...)`
      if (prop === "data") return { session: null, subscription: { unsubscribe: () => {} } };
      if (prop === "error") return null;
      // .unsubscribe for auth subscription cleanup
      if (prop === "unsubscribe") return () => {};
      // Everything else returns another no-op proxy (both callable and property-accessible)
      return makeNoopProxy();
    },
    // Allow the proxy itself to be called as a function
    apply(_target, _thisArg, _args) {
      return makeNoopProxy();
    },
  };
  return new Proxy(fn, handler);
}

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getSupabase();
    if (!client) {
      if (prop === "then") return undefined; // top-level proxy should not be thenable
      return makeNoopProxy();
    }
    return Reflect.get(client, prop, receiver);
  },
});
