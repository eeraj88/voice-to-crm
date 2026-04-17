'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import Link from 'next/link'

export default function LoginPage() {
  const { signIn, signUp } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        await signUp(email, password)
      } else {
        await signIn(email, password)
      }
    } catch (err: any) {
      let errorMessage = 'Ein Fehler ist aufgetreten'

      if (err.message?.includes('Invalid login credentials')) {
        errorMessage = 'Falsche E-Mail oder Passwort'
      } else if (err.message?.includes('User already registered')) {
        errorMessage = 'Diese E-Mail ist bereits registriert'
      } else if (err.message?.includes('Email not confirmed')) {
        errorMessage = 'Bitte bestätige zuerst deine E-Mail'
      } else {
        errorMessage = err.message || 'Unbekannter Fehler'
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50/50 via-teal-50/50 to-green-50/50 dark:from-zinc-950 dark:via-slate-950 dark:to-zinc-950 relative overflow-hidden p-4 transition-colors duration-300">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-600/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 dark:bg-teal-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Theme Toggle */}
        <div className="flex justify-end mb-6">
          <button
            onClick={toggleTheme}
            className="p-3 rounded-xl glass-card hover:bg-emerald-50 dark:hover:bg-white/10 transition-all duration-300"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>
        </div>

        <div className="glass-card rounded-3xl p-10">
          {/* Logo */}
          <Link href="/" className="flex justify-center mb-6">
            <img
              src="/logo.webp"
              alt="VoyC Logo"
              className="w-20 h-20 object-contain"
            />
          </Link>

          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
            {isSignUp ? 'Jetzt registrieren' : 'Willkommen zurück'}
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            {isSignUp
              ? 'Starte jetzt mit VoyC und spare Zeit bei deinen Kundengesprächen'
              : 'Melde dich an, um fortzufahren'}
          </p>

          {/* Info Box */}
          {isSignUp && (
            <div className="mb-6 p-4 glass rounded-xl border border-emerald-200/50 dark:border-emerald-900/30">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kostenlos testen</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Keine Kreditkarte erforderlich. 20 Berichte kostenlos pro Monat.</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                E-Mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 glass-input rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 transition-all"
                placeholder="deine@email.de"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Passwort
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 glass-input rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 transition-all"
                placeholder="Mindestens 6 Zeichen"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 gradient-bg text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-emerald-500/30 focus:ring-4 focus:ring-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02]"
            >
              {loading ? 'Lade...' : isSignUp ? 'Registrieren' : 'Anmelden'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {isSignUp ? 'Bereits einen Account?' : 'Neu bei VoyC?'}
            </p>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
              }}
              className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
            >
              {isSignUp ? 'Jetzt anmelden' : 'Kostenlos registrieren →'}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-8">
          Enterprise Voice CRM for Field Sales Professionals
        </p>
      </div>
    </div>
  )
}
