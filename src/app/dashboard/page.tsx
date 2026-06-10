'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import AudioRecorder from '@/components/AudioRecorder'
import ExportButton from '@/components/ExportButton'
import { type Report } from '@/lib/supabase'

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const { toggleTheme } = useTheme()
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [loadingReports, setLoadingReports] = useState(true)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (user) loadReports()
  }, [user])

  const loadReports = async () => {
    try {
      const response = await fetch('/api/save-report')
      const data = await response.json()
      if (data.success) setReports(data.reports || [])
    } catch (error) {
      console.error('Error loading reports:', error)
    } finally {
      setLoadingReports(false)
    }
  }

  const handleReportSaved = () => { loadReports() }

  if (loading) {
    return (
      <div className="voyc-root" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <div className="vspinner" />
      </div>
    )
  }

  if (!user) return null

  const userInitials = user.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'VY'

  return (
    <div className="voyc-root">
      {/* App navbar */}
      <header className="app-nav">
        <div className="app-nav-inner">
          <Link href="/" className="brand">
            <Image src="/assets/voyc-logo.png" alt="VOYC" width={30} height={30} />
            <span className="word">VOYC</span>
          </Link>
          <div className="right">
            <button
              className="ghost-link"
              onClick={() => setShowHistory(!showHistory)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              {showHistory ? 'Aufnahme' : 'Historie'}
            </button>
            <div className="user-pill">
              <span className="av">{userInitials}</span>
              <span className="v-hidden-mobile">{user.email}</span>
            </div>
            <button className="icon-btn" onClick={toggleTheme} aria-label="Theme wechseln">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" style={{ width: 18, height: 18 }}>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            </button>
            <button className="btn-logout" onClick={signOut}>Abmelden</button>
          </div>
        </div>
      </header>

      <div className="app-body">
        {!showHistory ? (
          <>
            <div className="app-hello">
              <h1>Willkommen zurück</h1>
              <p>Bereit für deinen nächsten Besuchstermin?</p>
            </div>

            <div className="vpanel">
              <div className="panel-head">
                <h2>Sprachnachricht aufnehmen</h2>
                <p>Drücke den Mikrofon-Button und sprich. Die KI macht den Rest.</p>
              </div>
              <AudioRecorder onReportSaved={handleReportSaved} />
            </div>

            <div className="vtips">
              <h4>Tipps für gute Aufnahmen</h4>
              <ul>
                {[
                  'Sprich klar und deutlich',
                  'Nenne den Kundennamen',
                  'Erwähne Aufgaben oder Deadlines',
                  'Halte es kurz (unter 2 Minuten)',
                ].map(tip => (
                  <li key={tip}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <>
            <div className="app-hello">
              <h1>Deine Berichte</h1>
              <p>{reports.length} {reports.length === 1 ? 'Eintrag' : 'Einträge'} gespeichert</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
              <ExportButton reports={reports} />
            </div>

            {loadingReports ? (
              <div style={{ display: 'grid', placeItems: 'center', padding: 48 }}>
                <div className="vspinner" />
              </div>
            ) : reports.length === 0 ? (
              <div className="vpanel" style={{ textAlign: 'center', padding: 48 }}>
                <div style={{ width: 56, height: 56, margin: '0 auto 16px', borderRadius: 14, background: 'var(--surface-2)', display: 'grid', placeItems: 'center' }}>
                  <svg style={{ width: 28, height: 28, color: 'var(--ink-3)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p style={{ color: 'var(--ink-2)', marginBottom: 20 }}>Noch keine Berichte vorhanden</p>
                <button className="btn btn-primary" onClick={() => setShowHistory(false)}>Zur Aufnahme</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {reports.map(report => (
                  <div key={report.id} className="vpanel" style={{ padding: '22px 26px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                          <span className="type-chip active" style={{ fontSize: 12 }}>{report.structured_data.report_type}</span>
                          <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>
                            {new Date(report.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--ink)' }}>{report.structured_data.company_name}</div>
                        <div style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 2 }}>{report.structured_data.contact_person}</div>
                      </div>
                      <span
                        className="type-chip"
                        style={{
                          background: report.status === 'synced' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                          color: report.status === 'synced' ? 'var(--accent-a)' : '#f59e0b',
                          borderColor: report.status === 'synced' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)',
                        }}
                      >
                        {report.status === 'synced' ? 'Synced' : 'Draft'}
                      </span>
                    </div>

                    <p style={{ fontSize: 14, color: 'var(--ink-2)', marginBottom: 12 }}>{report.structured_data.summary}</p>

                    {report.structured_data.transactions.length > 0 && (
                      <div style={{ borderTop: '1px solid var(--vborder)', paddingTop: 12 }}>
                        <p style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Vorgänge</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {report.structured_data.transactions.map((tx, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                              <span className="type-chip" style={{ fontSize: 12, padding: '4px 10px' }}>{tx.type}</span>
                              <span style={{ color: 'var(--ink)' }}>{tx.item}</span>
                              {tx.quantity && <span style={{ color: 'var(--ink-3)', fontSize: 13 }}>({tx.quantity} {tx.unit})</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
