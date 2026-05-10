import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata = {
  title: 'MedIQ — Understand Your Medicines',
  description: 'Search medicines, check drug interactions, decode blood reports',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
          <a href="/" className="text-xl font-bold text-blue-600">MedIQ 💊</a>
          <div className="flex gap-6 text-sm font-medium">
            <a href="/search" className="text-gray-600 hover:text-blue-600">Search</a>
            <a href="/interactions" className="text-gray-600 hover:text-blue-600">Interactions</a>
            <a href="/report" className="text-gray-600 hover:text-blue-600">Reports</a>
            <a href="/vault" className="text-gray-600 hover:text-blue-600">My Vault</a>
            <a href="/auth" className="bg-blue-600 text-white px-4 py-1.5 rounded-full hover:bg-blue-700">Login</a>
          </div>
        </nav>
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
        <footer className="bg-white border-t border-gray-200 px-6 py-4 text-center text-xs text-gray-400">
          ⚠️ MedIQ is for informational purposes only. Always consult a qualified doctor before making medical decisions.
        </footer>
      </body>
    </html>
  )
}