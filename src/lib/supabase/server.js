import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient(accessToken = null) {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: accessToken
        ? {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        : undefined,

      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },

        set(name, value, options) {
          try {
            cookieStore.set({
              name,
              value,
              ...options,
            });
          } catch (error) {
            console.error(
              "Cookie set failed in Server Component:",
              error
            );
          }
        },

        remove(name, options) {
          try {
            cookieStore.set({
              name,
              value: "",
              ...options,
            });
          } catch (error) {
            console.error(
              "Cookie remove failed in Server Component:",
              error
            );
          }
        },
      },
    }
  );
}