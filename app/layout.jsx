import '../styles/globals.css'

export const metadata = {
  title: 'GD Subway System',
  description: 'Subway management portal'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-screen bg-slate-50 text-slate-800 antialiased">
        {children}
      </body>
    </html>
  )
}
