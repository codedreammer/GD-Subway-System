export default function HomePage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      <div className="floating-orb left-[-4rem] top-[-4rem] h-40 w-40 bg-green-200" />
      <div className="floating-orb bottom-[-3rem] right-[-3rem] h-48 w-48 bg-emerald-300" />

      <section className="premium-card relative z-10 w-full max-w-4xl overflow-hidden p-8 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-green-800">
              Campus food ordering
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
                GD Subway System
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Premium ordering flows for students, live kitchen operations for vendors, and a polished command center for admin teams.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="/auth/login" className="premium-button px-5 py-3 text-sm font-semibold">
                Open Login
              </a>
              <a href="/student" className="premium-button-secondary px-5 py-3 text-sm font-semibold">
                Preview Student App
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] bg-slate-900 p-5 text-white shadow-2xl">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-emerald-200">Today</p>
                  <p className="mt-2 text-3xl font-bold">326 Orders</p>
                </div>
                <div className="rounded-2xl bg-emerald-400/20 px-3 py-2 text-sm font-semibold text-emerald-100">
                  Live
                </div>
              </div>
              <div className="space-y-3">
                <div className="rounded-2xl bg-white/8 p-4">
                  <p className="text-sm text-slate-300">Student experience</p>
                  <p className="mt-1 text-lg font-semibold">Fast menus, polished cart, smooth tracking</p>
                </div>
                <div className="rounded-2xl bg-white/8 p-4">
                  <p className="text-sm text-slate-300">Operations</p>
                  <p className="mt-1 text-lg font-semibold">Realtime vendor queue and admin oversight</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
