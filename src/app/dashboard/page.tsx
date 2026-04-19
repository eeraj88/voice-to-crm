'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import AudioRecorder from '@/components/AudioRecorder'
import ExportButton from '@/components/ExportButton'
import { supabase, type Report } from '@/lib/supabase'

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [loadingReports, setLoadingReports] = useState(true)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadReports()
    }
  }, [user])

  const loadReports = async () => {
    try {
      const response = await fetch('/api/save-report')
      const data = await response.json()
      if (data.success) {
        setReports(data.reports || [])
      }
    } catch (error) {
      console.error('Error loading reports:', error)
    } finally {
      setLoadingReports(false)
    }
  }

  const handleReportSaved = () => {
    loadReports()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50/50 dark:from-zinc-950">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-emerald-500 border-t-transparent"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-teal-50/50 to-green-50/50 dark:from-zinc-950 dark:via-slate-950 dark:to-zinc-950 relative transition-colors duration-300">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-600/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 dark:bg-teal-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="glass-strong border-b border-emerald-200/50 dark:border-white/5 sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-zinc-950/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-20 h-20 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
                <img
                  src="/logo.webp"
                  alt="VoyC Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-semibold bg-gradient-to-br from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent tracking-tight">
                VoyC
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all"
              >
                {showHistory ? 'Aufnahme' : 'Historie'}
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                {user.email}
              </span>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl glass-card hover:bg-emerald-50 dark:hover:bg-white/10 transition-all duration-300"
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

              <button
                onClick={signOut}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all"
              >
                Abmelden
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 relative z-10">
        <div className="max-w-4xl mx-auto">
          {!showHistory ? (
            <>
              {/* Welcome Section */}
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
                  Willkommen zurück
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Bereit für deinen nächsten Besuchstermin?
                </p>
              </div>

              {/* Audio Recorder */}
              <div className="glass-card rounded-3xl p-6 sm:p-8 mb-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                    Sprachnachricht aufnehmen
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Drücke den Mikrofon-Button und sprich. Die KI macht den Rest.
                  </p>
                </div>

                <AudioRecorder onReportSaved={handleReportSaved} />
              </div>

              {/* Tips */}
              <div className="glass rounded-2xl p-6 border border-emerald-200/50 dark:border-emerald-900/30">
                <h3 className="font-semibold text-emerald-700 dark:text-emerald-300 mb-4">
                  Tipps für gute Aufnahmen
                </h3>
                <ul className="text-sm text-gray-700 dark:text-gray-400 space-y-2">
                  <li>Sprich clearly und deutlich</li>
                  <li>Nenne den Kundennamen</li>
                  <li>Erwähne Aufgaben oder Deadlines</li>
                  <li>Halte es kurz (unter 2 Minuten)</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              {/* History Section */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Deine Berichte ({reports.length})
                  </h2>
                  <ExportButton reports={reports} />
                </div>

                {loadingReports ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-emerald-500 border-t-transparent"></div>
                  </div>
                ) : reports.length === 0 ? (
                  <div className="text-center py-16 glass-card rounded-3xl">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-200/50 dark:bg-zinc-800/50 rounded-2xl flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Noch keine Berichte
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Nimm deine erste Sprachnachricht auf
                    </p>
                    <button
                      onClick={() => setShowHistory(false)}
                      className="px-6 py-2.5 gradient-bg text-white rounded-xl hover:shadow-xl hover:shadow-emerald-500/30 transition-all"
                    >
                      Zur Aufnahme
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <div
                        key={report.id}
                        className="glass-card rounded-2xl p-6 hover:bg-white/90 dark:hover:bg-white/10 transition-all"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-3 py-1 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                                {report.structured_data.report_type}
                              </span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(report.created_at).toLocaleDateString('de-DE', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {report.structured_data.company_name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {report.structured_data.contact_person}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full ${
                              report.status === 'synced'
                                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                                : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                            }`}
                          >
                            {report.status === 'synced' ? 'Synced' : 'Draft'}
                          </span>
                        </div>

                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                          {report.structured_data.summary}
                        </p>

                        {report.structured_data.transactions.length > 0 && (
                          <div className="border-t border-gray-200 dark:border-white/10 pt-4">
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                              Vorgänge:
                            </p>
                            <ul className="space-y-1">
                              {report.structured_data.transactions.map((tx, index) => (
                                <li key={index} className="flex items-center gap-2 text-sm">
                                  <span
                                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                                      tx.type === 'bestellung'
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                        : tx.type === 'angebot'
                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                        : tx.type === 'anfrage'
                                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                        : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                    }`}
                                  >
                                    {tx.type}
                                  </span>
                                  <span className="text-gray-700 dark:text-gray-300">{tx.item}</span>
                                  {tx.quantity && (
                                    <span className="text-xs text-gray-500">
                                      ({tx.quantity} {tx.unit})
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
