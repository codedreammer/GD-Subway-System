import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"

export async function middleware(req) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => {
          req.cookies.set(name, value)
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          res.cookies.set(name, value, options)
        },
        remove: (name, options) => {
          req.cookies.set(name, "")
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          res.cookies.set(name, "", { ...options, maxAge: 0 })
        },
      },
    }
  )

  await supabase.auth.getUser()

  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
