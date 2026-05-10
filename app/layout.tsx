import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'Запись на консультацию',
  description: 'Онлайн-запись на консультацию',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <header className="border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <span className="font-semibold text-blue-500 text-lg">Консультации</span>
            <a
              href="/admin"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Администратор
            </a>
          </div>
        </header>
        <main className="min-h-screen py-10 px-4">
          {children}
        </main>
      </body>
    </html>
  )
}
