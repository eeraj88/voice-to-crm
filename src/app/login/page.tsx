'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  const { signIn, signUp } = useAuth()
  const { toggleTheme } = useTheme()
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
    <div className="voyc-root">
      {/* Back link */}
      <div className="auth-back">
        <Link href="/">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" style={{ width: 16, height: 16 }}>
            <path d="m15 18-6-6 6-6" />
          </svg>
          Zurück zur Startseite
        </Link>
      </div>

      {/* Theme toggle */}
      <div className="auth-theme">
        <button className="icon-btn" onClick={toggleTheme} aria-label="Theme wechseln">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" style={{ width: 18, height: 18 }}>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
        </button>
      </div>

      <div className="auth-wrap">
        <div className="auth-card">
          <div className="auth-logo">
            <Image src="/assets/voyc-logo.png" alt="VOYC" width={58} height={58} />
          </div>

          {/* Tabs */}
          <div className="auth-tabs">
            <button
              className={!isSignUp ? 'active' : ''}
              onClick={() => { setIsSignUp(false); setError('') }}
            >
              Anmelden
            </button>
            <button
              className={isSignUp ? 'active' : ''}
              onClick={() => { setIsSignUp(true); setError('') }}
            >
              Registrieren
            </button>
          </div>

          <h1>{isSignUp ? 'Jetzt registrieren' : 'Willkommen zurück'}</h1>
          <p className="sub">
            {isSignUp
              ? 'Starte kostenlos — keine Kreditkarte nötig.'
              : 'Melde dich an, um fortzufahren.'}
          </p>

          {error && <div className="verror">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="afield">
              <label htmlFor="a-mail">E-Mail</label>
              <input
                className="ainput"
                id="a-mail"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="deine@email.de"
              />
            </div>
            <div className="afield">
              <label htmlFor="a-pass">Passwort</label>
              <input
                className="ainput"
                id="a-pass"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Mindestens 6 Zeichen"
              />
            </div>
            <button
              className="btn btn-primary btn-block btn-lg"
              type="submit"
              disabled={loading}
              style={{ marginTop: 6 }}
            >
              {loading ? 'Lade…' : isSignUp ? 'Registrieren' : 'Anmelden'}
            </button>
          </form>

          <p className="auth-switch">
            {isSignUp ? 'Bereits einen Account?' : 'Neu bei VOYC?'}{' '}
            <button onClick={() => { setIsSignUp(!isSignUp); setError('') }}>
              {isSignUp ? 'Jetzt anmelden' : 'Kostenlos registrieren →'}
            </button>
          </p>

          <p className="auth-foot">Enterprise Voice CRM für Field Sales Professionals</p>
        </div>
      </div>
    </div>
  )
}
