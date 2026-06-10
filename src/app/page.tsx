'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from '@/contexts/ThemeContext'

function ThemeToggle() {
  const { toggleTheme } = useTheme()
  return (
    <button className="icon-btn" onClick={toggleTheme} title="Theme wechseln" aria-label="Theme wechseln">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    </button>
  )
}

const WAVE_COUNT = 14

export default function HomePage() {
  // Nav scroll
  useEffect(() => {
    const nav = document.getElementById('main-nav')
    if (!nav) return
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Scroll reveals
  useEffect(() => {
    const check = () => {
      const wh = window.innerHeight
      document.querySelectorAll<HTMLElement>('.reveal').forEach(el => {
        if (el.getBoundingClientRect().top < wh * 0.9) el.classList.add('in')
      })
    }
    check()
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check, { passive: true })
    return () => {
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [])

  // Stat counter animations
  useEffect(() => {
    const defs = [
      { id: 'stat-0', count: 2, suffix: '' },
      { id: 'stat-1', count: 4, suffix: 's' },
      { id: 'stat-2', count: 98, suffix: '%' },
      { id: 'stat-3', count: 500, suffix: '+' },
    ]
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        const def = defs.find(d => d.id === entry.target.id)
        if (!def) return
        observer.unobserve(entry.target)
        const el = entry.target as HTMLElement
        const start = performance.now()
        const duration = 1800
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration)
          const ease = 1 - Math.pow(1 - t, 3)
          el.textContent = Math.round(ease * def.count) + def.suffix
          if (t < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      })
    }, { threshold: 0.5 })
    defs.forEach(d => {
      const el = document.getElementById(d.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  // Hero demo loop
  useEffect(() => {
    let cancelled = false
    let waveInterval: ReturnType<typeof setInterval> | null = null

    const sleep = (ms: number) => new Promise<void>(res => setTimeout(res, ms))

    const typeText = async (el: HTMLElement, text: string) => {
      el.textContent = ''
      el.classList.add('typing')
      for (const char of text) {
        if (cancelled) return
        el.textContent += char
        await sleep(32)
      }
      el.classList.remove('typing')
    }

    const showScreen = (idx: number) => {
      const screens = document.querySelectorAll<HTMLElement>('.demo-screen')
      const dots = document.querySelectorAll<HTMLElement>('#demo-dots i')
      const titles = ['VOYC · Aufnahme', 'VOYC · Bericht', 'VOYC · Export']
      screens.forEach((s, i) => {
        s.classList.remove('active', 'exit')
        if (i === idx) s.classList.add('active')
        else if (i < idx) s.classList.add('exit')
      })
      dots.forEach((d, i) => d.classList.toggle('active', i === idx))
      const titleEl = document.getElementById('demo-title')
      if (titleEl) titleEl.textContent = titles[idx] ?? ''
    }

    const animateWave = () => {
      const bars = document.querySelectorAll<HTMLElement>('#demo-wave i')
      bars.forEach(b => {
        b.style.height = (18 + Math.random() * 62) + '%'
      })
    }

    const loop = async () => {
      await sleep(300)
      while (!cancelled) {
        // Stage 1: Record
        showScreen(0)
        waveInterval = setInterval(animateWave, 100)
        const timerEl = document.getElementById('demo-timer')
        for (let i = 0; i <= 3 && !cancelled; i++) {
          if (timerEl) timerEl.textContent = `00:0${i}`
          await sleep(800)
        }
        if (waveInterval) clearInterval(waveInterval)
        const bars = document.querySelectorAll<HTMLElement>('#demo-wave i')
        bars.forEach(b => { b.style.height = '25%' })
        if (cancelled) return
        await sleep(300)

        // Stage 2: Report
        showScreen(1)
        const fields = document.querySelectorAll<HTMLElement>('.demo-screen[data-screen="report"] .d-val')
        for (const field of Array.from(fields)) {
          if (cancelled) return
          await typeText(field, field.getAttribute('data-tw') ?? '')
          await sleep(100)
        }
        if (cancelled) return
        await sleep(700)

        // Stage 3: Export
        showScreen(2)
        const expBtn = document.getElementById('exp-btn')
        const expDone = document.getElementById('exp-done')
        const cursor = document.getElementById('demo-cursor') as HTMLElement | null
        if (expBtn) { expBtn.classList.remove('clicked', 'gone') }
        if (expDone) { expDone.classList.remove('show') }
        await sleep(500)
        if (cancelled) return

        if (cursor) {
          cursor.style.opacity = '1'
          cursor.style.left = '70%'
          cursor.style.top = '65%'
          await sleep(800)
          if (cancelled) return
          cursor.style.left = '50%'
          cursor.style.top = '50%'
          await sleep(700)
          if (cancelled) return
          cursor.classList.add('press')
          if (expBtn) expBtn.classList.add('clicked')
          await sleep(180)
          if (cancelled) return
          cursor.classList.remove('press')
          if (expBtn) expBtn.classList.add('gone')
          if (expDone) expDone.classList.add('show')
          cursor.style.opacity = '0'
          await sleep(2000)
          if (cancelled) return
        } else {
          await sleep(3000)
        }

        showScreen(0)
        const t = document.getElementById('demo-timer')
        if (t) t.textContent = '00:00'
        await sleep(500)
      }
    }

    loop()
    return () => {
      cancelled = true
      if (waveInterval) clearInterval(waveInterval)
    }
  }, [])

  return (
    <div className="voyc-root">
      {/* NAV */}
      <header className="nav" id="main-nav">
        <div className="nav-inner">
          <Link href="/" className="brand">
            <Image src="/assets/voyc-logo.png" alt="VOYC" width={34} height={34} />
            <span className="word">VOYC</span>
          </Link>
          <nav className="nav-links">
            <a href="#features">Features</a>
            <a href="#how">Wie es funktioniert</a>
            <a href="#pricing">Preise</a>
            <a href="#contact">Kontakt</a>
          </nav>
          <div className="nav-actions">
            <Link href="/login" className="ghost-link" style={{ padding: '9px 12px' }}>Anmelden</Link>
            <Link href="/login" className="btn btn-primary">Starten <span className="arrow">→</span></Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <span id="top" />

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="hero">
        <div className="v-container">
          <div className="hero-split">

            {/* LEFT: Text */}
            <div className="hero-text">
              <span className="badge reveal"><span className="dot" /> KI-gestützter Voice-to-CRM</span>
              <h1 className="reveal" data-d="1">
                Mit deiner Stimme zum{' '}
                <span className="grad">fertigen Bericht</span>
                {' '}— in einem Klick.
              </h1>
              <p className="sub reveal" data-d="2">
                Sprich nach dem Kundentermin einfach drauf los. VOYC transkribiert, strukturiert und exportiert alles automatisch in dein CRM. Kein Tippen mehr.
              </p>
              <div className="hero-cta reveal" data-d="3">
                <Link href="/login" className="btn btn-primary btn-lg">Jetzt kostenlos testen <span className="arrow">→</span></Link>
                <a href="#how" className="btn btn-ghost btn-lg">So funktioniert&apos;s</a>
              </div>
              <div className="hero-trust reveal" data-d="4">
                <div className="avatars"><span>MS</span><span>SW</span><span>TK</span><span>+</span></div>
                <div><span className="stars">★★★★★</span>&nbsp;<b style={{ color: 'var(--ink)' }}>4,9/5</b> von 500+ Außendienstlern</div>
              </div>
            </div>

            {/* RIGHT: Demo */}
            <div className="hero-demo-wrap reveal" data-d="1">
              <div className="demo-success-chip">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" style={{ width: 14, height: 14 }}>
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Bericht in 4 Sek.
              </div>
              <div className="demo" id="demo">
                <div className="demo-frame">
                  <div className="demo-head">
                    <div className="tl"><i /><i /><i /></div>
                    <div className="ttl" id="demo-title">VOYC · Aufnahme</div>
                  </div>
                  <div className="demo-stage">
                    {/* Screen 1: Record */}
                    <div className="demo-screen active" data-screen="record">
                      <div className="rec-orb">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3" />
                        </svg>
                      </div>
                      <div className="demo-wave" id="demo-wave">
                        {Array.from({ length: WAVE_COUNT }, (_, i) => (
                          <i key={i} style={{ height: '25%' }} />
                        ))}
                      </div>
                      <div className="demo-cap"><span className="rec-dot" /> Aufnahme läuft …</div>
                      <div className="demo-timer" id="demo-timer">00:00</div>
                    </div>
                    {/* Screen 2: Report */}
                    <div className="demo-screen" data-screen="report">
                      <div className="d-field"><span className="d-lbl">Firmenname</span><span className="d-val" data-tw="Pestalozzi GmbH" /></div>
                      <div className="d-field"><span className="d-lbl">Kontaktperson</span><span className="d-val" data-tw="Herr Keller" /></div>
                      <div className="d-field"><span className="d-lbl">Zusammenfassung</span><span className="d-val" data-tw="Sehr zufrieden – Nachbestellung gewünscht." /></div>
                      <div className="d-grid">
                        <div className="d-field"><span className="d-lbl">Vorgang</span><span className="d-val" data-tw="Bestellung · 500 Stk" /></div>
                        <div className="d-field"><span className="d-lbl">Frist</span><span className="d-val" data-tw="23.04.2026" /></div>
                      </div>
                    </div>
                    {/* Screen 3: Export */}
                    <div className="demo-screen" data-screen="export">
                      <div className="exp-inner">
                        <button className="exp-btn" id="exp-btn">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <path d="M7 10l5 5 5-5M12 15V3" />
                          </svg>
                          <span>An CRM exportieren</span>
                        </button>
                        <div className="exp-done" id="exp-done">
                          <span className="exp-check">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round"><path d="M20 6 9 17l-5-5" /></svg>
                          </span>
                          Erfolgreich exportiert
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Animated cursor */}
                  <div className="demo-cursor" id="demo-cursor" style={{ opacity: 0 }}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M5 2l14 7-6 2.5L10.5 18z" stroke="#04140f" strokeWidth="1.2" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                <div className="demo-dots" id="demo-dots">
                  <i className="active" /><i /><i />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── LOGOS ──────────────────────────────────────────── */}
      <section className="logos">
        <div className="v-container">
          <p className="lbl reveal">Vertraut von Vertriebsteams in der gesamten DACH-Region</p>
        </div>
        <div className="marquee reveal" data-d="1">
          <div className="marquee-track">
            {[0, 1, 2].flatMap(i => [
              <span key={`${i}-0`} className="lg">◇ Bayer Vital</span>,
              <span key={`${i}-1`} className="lg">◈ Beiersdorf</span>,
              <span key={`${i}-2`} className="lg">▲ SAP</span>,
              <span key={`${i}-3`} className="lg">● Continental</span>,
              <span key={`${i}-4`} className="lg">✦ Henkel</span>,
            ])}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────── */}
      <section className="sec sec-alt" id="how">
        <div className="v-container">
          <div className="sec-head reveal">
            <span className="eyebrow">In 3 Schritten</span>
            <h2>So einfach funktioniert&apos;s</h2>
            <p>Von deinem Kundenbesuch zum strukturierten Bericht — ohne ein einziges Wort zu tippen.</p>
          </div>
          <div className="steps">
            <div className="step reveal" data-d="1">
              <div className="num">01</div>
              <div className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3" />
                </svg>
              </div>
              <h3>Sprich auf</h3>
              <p>Nach dem Termin sprichst du deine Notizen einfach in die App: „War bei Pestalozzi, brauchen 500 Stück bis Freitag."</p>
            </div>
            <div className="step reveal" data-d="2">
              <div className="num">02</div>
              <div className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                  <path d="M12 3v3M5.6 5.6l2.1 2.1M3 12h3M5.6 18.4l2.1-2.1M12 18v3M18.4 18.4l-2.1-2.1M21 12h-3M18.4 5.6l-2.1 2.1" /><circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <h3>KI analysiert</h3>
              <p>Unsere KI extrahiert automatisch alle relevanten Daten: Firma, Produkte, Mengen, Termine und Aufgaben.</p>
            </div>
            <div className="step reveal" data-d="3">
              <div className="num">03</div>
              <div className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5M12 15V3" />
                </svg>
              </div>
              <h3>Exportieren</h3>
              <p>Ein Klick genügt und deine Daten landen in Google Sheets, Excel oder direkt in deinem CRM-System.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────── */}
      <section className="sec" id="features">
        <div className="v-container">
          <div className="sec-head reveal">
            <span className="eyebrow">Warum VOYC</span>
            <h2>Funktionen, die deine Kundengespräche revolutionieren</h2>
            <p>Gebaut für den Außendienst — schnell, sicher und auf jede Branche anpassbar.</p>
          </div>
          <div className="feat-grid">
            {[
              { bg: 'linear-gradient(135deg,#10b981,#22d3ee)', title: 'Sprachaufnahme', desc: 'Einfach nach dem Gespräch reinsprechen. Kein Tippen auf dem Handy mehr — egal ob im Auto oder unterwegs.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"/></svg> },
              { bg: 'linear-gradient(135deg,#8b5cf6,#6366f1)', title: 'Blitzschnell', desc: 'Echtzeit-Transkription mit Groq Whisper. Vom gesprochenen Wort zum fertigen Bericht in unter 5 Sekunden.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="m13 2-3 8h6l-4 12 9-14h-6l3-6z"/></svg> },
              { bg: 'linear-gradient(135deg,#ec4899,#d946ef)', title: 'CRM-Integration', desc: 'Nahtloser Export zu Google Sheets, Excel, Salesforce, HubSpot und mehr — über Make.com Webhooks.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/></svg> },
              { bg: 'linear-gradient(135deg,#f59e0b,#f97316)', title: 'Anpassbar', desc: 'Definiere selbst, was extrahiert wird. Bestellungen, Angebote, Anfragen, Aufgaben — flexibel für jede Branche.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg> },
              { bg: 'linear-gradient(135deg,#10b981,#059669)', title: 'DSGVO-konform', desc: 'Server in Frankfurt, höchste Sicherheitsstandards und volle Datenhoheit. Deine Kundendaten bleiben deine.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg> },
              { bg: 'linear-gradient(135deg,#06b6d4,#0ea5e9)', title: 'Persönlicher Support', desc: 'Dedizierter Berater für Onboarding und kontinuierliche Optimierung — damit du das Maximum rausholst.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/></svg> },
            ].map((f, i) => (
              <div key={f.title} className="feat reveal" data-d={String((i % 3) + 1)}>
                <div className="ic" style={{ background: f.bg }}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────────── */}
      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="v-container">
          <div className="stats">
            {[
              { id: 'stat-0', val: '2', label: 'Std. gespart pro Tag' },
              { id: 'stat-1', val: '4s', label: 'Sekunden pro Bericht' },
              { id: 'stat-2', val: '98%', label: 'Erkennungsgenauigkeit' },
              { id: 'stat-3', val: '500+', label: 'Aktive Außendienstler' },
            ].map((s, i) => (
              <div key={s.id} className="vstat reveal" data-d={String(i + 1)}>
                <div className="stat-ring"><span className="snum" id={s.id}>{s.val}</span></div>
                <div className="lbl">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────────── */}
      <section className="sec sec-alt" id="testimonials">
        <div className="v-container">
          <div className="sec-head reveal">
            <span className="eyebrow">Stimmen</span>
            <h2>Was unsere Kunden sagen</h2>
            <p>Erfahre, wie VOYC das Arbeitsleben von Vertriebsprofis verändert.</p>
          </div>
          <div className="testi-grid">
            {[
              { initials: 'MS', name: 'Michael Schneider', role: 'Außendienst Pharma', company: 'Bayer Vital', quote: '„VOYC hat mir mindestens 2 Stunden pro Tag gespart. Ich kann mich endlich aufs Verkaufsgespräch konzentrieren, nicht auf die Dokumentation."' },
              { initials: 'SW', name: 'Sarah Wagner', role: 'Key Account Manager', company: 'Beiersdorf AG', quote: '„Endlich keine Notizen mehr im Auto verloren! Die KI erkennt sogar Produktnamen und Mengen korrekt. Absolut beeindruckend."' },
              { initials: 'TK', name: 'Thomas Klein', role: 'Sales Director DACH', company: 'SAP', quote: '„Die Integration in unser Salesforce war kinderleicht. Unser ganzes Team nutzt VOYC jetzt täglich — die Produktivität ist messbar gestiegen."' },
            ].map((t, i) => (
              <div key={t.name} className="testi reveal" data-d={String(i + 1)}>
                <div className="stars">★★★★★</div>
                <blockquote>{t.quote}</blockquote>
                <div className="who">
                  <div className="av">{t.initials}</div>
                  <div>
                    <div className="nm">{t.name}</div>
                    <div className="rl">{t.role} · <span className="co">{t.company}</span></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────────── */}
      <section className="sec" id="pricing">
        <div className="v-container">
          <div className="sec-head reveal">
            <span className="eyebrow">Preise</span>
            <h2>Transparente Preise</h2>
            <p>Wähle den Plan, der zu dir passt. Jederzeit flexibel anpassbar.</p>
          </div>
          <div className="price-grid">
            <div className="plan reveal" data-d="1">
              <div className="tag">Starter</div>
              <div className="price">Kostenlos</div>
              <div className="desc">Perfekt zum Kennenlernen.</div>
              <ul>
                <li><CheckIcon />20 Berichte pro Monat</li>
                <li><CheckIcon />Standard KI-Extraktion</li>
                <li><CheckIcon />Google Sheets Export</li>
                <li><CheckIcon />Community Support</li>
              </ul>
              <Link href="/login" className="btn btn-ghost">Kostenlos testen</Link>
            </div>
            <div className="plan feature reveal" data-d="2">
              <div className="ribbon">Empfohlen</div>
              <div className="tag">Professional</div>
              <div className="price">€79<small>/Monat</small></div>
              <div className="desc">Für professionelle Teams.</div>
              <ul>
                <li><CheckIcon />Unbegrenzte Berichte</li>
                <li><CheckIcon />Anpassbare Felder &amp; Exporte</li>
                <li><CheckIcon />Excel + CRM-Integration</li>
                <li><CheckIcon />Persönlicher Berater</li>
              </ul>
              <Link href="/login" className="btn btn-primary">Jetzt starten <span className="arrow">→</span></Link>
            </div>
            <div className="plan reveal" data-d="3">
              <div className="tag">Enterprise</div>
              <div className="price">Individuell</div>
              <div className="desc">Für große Organisationen.</div>
              <ul>
                <li><CheckIcon />Alles aus Professional</li>
                <li><CheckIcon />Self-Hosted Option</li>
                <li><CheckIcon />Custom AI Training</li>
                <li><CheckIcon />Dedicated Success Manager</li>
              </ul>
              <a href="#contact" className="btn btn-ghost">Anfragen</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ────────────────────────────────────────── */}
      <section className="sec sec-alt" id="contact">
        <div className="v-container">
          <div className="sec-head reveal">
            <span className="eyebrow">Kontakt</span>
            <h2>Sprich mit uns</h2>
            <p>Du hast Fragen? Wir freuen uns auf deine Nachricht.</p>
          </div>
          <form className="contact-card reveal" data-d="1" onSubmit={e => e.preventDefault()}>
            <div className="field-row">
              <div className="vfield"><label htmlFor="c-name">Name</label><input className="vinput" id="c-name" placeholder="Dein Name" /></div>
              <div className="vfield"><label htmlFor="c-mail">E-Mail</label><input className="vinput" id="c-mail" type="email" placeholder="deine@email.de" /></div>
            </div>
            <div className="vfield"><label htmlFor="c-msg">Nachricht</label><textarea className="vinput" id="c-msg" placeholder="Wie können wir dir helfen?" /></div>
            <button className="btn btn-primary btn-block btn-lg" type="submit">Nachricht senden <span className="arrow">→</span></button>
          </form>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────── */}
      <section className="sec">
        <div className="v-container">
          <div className="reveal" style={{ textAlign: 'center', padding: '72px 40px', borderRadius: 'var(--r-xl)', background: 'var(--accent-grad)', color: '#04140f', position: 'relative', overflow: 'hidden', boxShadow: '0 30px 80px -30px rgba(16,185,129,0.8)' }}>
            <h2 style={{ fontSize: 'clamp(28px,3.6vw,44px)', fontWeight: 800, letterSpacing: '-0.03em' }}>Bereit, deine Berichte zu automatisieren?</h2>
            <p style={{ fontSize: 18, opacity: 0.78, margin: '12px 0 28px', maxWidth: '48ch', marginInline: 'auto' }}>Starte kostenlos und erlebe, wie viel Zeit du jeden Tag gewinnst. Keine Kreditkarte nötig.</p>
            <Link href="/login" className="btn btn-lg" style={{ background: '#04140f', color: 'var(--accent-a)' }}>Jetzt kostenlos loslegen <span className="arrow">→</span></Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="footer">
        <div className="v-container">
          <div className="footer-grid">
            <div>
              <Link href="/" className="brand" style={{ marginBottom: 14, display: 'inline-flex' }}>
                <Image src="/assets/voyc-logo.png" alt="VOYC" width={34} height={34} />
                <span className="word">VOYC</span>
              </Link>
              <p className="tagline">Die Voice-to-CRM App für professionelle Kundengespräche. Mit Leidenschaft gemacht in Deutschland.</p>
            </div>
            <div>
              <h4>Produkt</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Preise</a></li>
                <li><Link href="/login">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4>Rechtliches</h4>
              <ul>
                <li><a href="#">Impressum</a></li>
                <li><a href="#">Datenschutz</a></li>
                <li><a href="#">AGB</a></li>
              </ul>
            </div>
            <div>
              <h4>Kontakt</h4>
              <ul>
                <li><a href="mailto:info@voyc-app.de">info@voyc-app.de</a></li>
                <li><a href="#">Deutschland</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">© 2026 VOYC. Alle Rechte vorbehalten.</div>
        </div>
      </footer>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}
