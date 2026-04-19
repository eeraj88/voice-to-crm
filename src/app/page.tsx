'use client'

import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'
import { useState, useRef, useEffect } from 'react'

export default function HomePage() {
  const { theme, toggleTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', nachricht: '' })
  const [istGesendet, setIstGesendet] = useState(false)
  const [istAmSenden, setIstAmSenden] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const heroRef = useRef<HTMLElement>(null)

  // Video Intersection Observer - play when in view, pause at end
  useEffect(() => {
    const video = videoRef.current
    const heroSection = heroRef.current

    if (!video || !heroSection) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {})
          } else {
            video.pause()
          }
        })
      },
      { threshold: 0.5 }
    )

    observer.observe(heroSection)

    // Remove loop - video stays at end
    video.loop = false

    return () => {
      observer.disconnect()
    }
  }, [])

  // EmailJS Konfiguration
  const EMAILJS_SERVICE_ID = 'service_tvlk6dj'
  const EMAILJS_TEMPLATE_ID = 'template_ygcl039'
  const EMAILJS_PUBLIC_KEY = 'Mk2_ZRMHb-UvIL-5M'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIstAmSenden(true)

    try {
      const emailjs = (await import('@emailjs/browser')).default
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        message: formData.nachricht,
        to_name: 'VoyC Team',
      }

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      )

      setIstGesendet(true)
      setFormData({ name: '', email: '', nachricht: '' })
    } catch (error) {
      console.error('EmailJS Error:', error)
      alert('Fehler beim Senden. Bitte versuche es später erneut.')
    } finally {
      setIstAmSenden(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 dark:from-zinc-950 dark:via-slate-950 dark:to-zinc-950 relative overflow-hidden">
      {/* ========== ANIMATED BACKGROUND ========== */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Primary gradient orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-emerald-400/20 via-teal-400/15 to-green-400/20 dark:from-emerald-600/15 dark:via-teal-600/10 dark:to-green-600/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-tl from-teal-400/20 via-emerald-400/15 to-cyan-400/20 dark:from-teal-600/10 dark:via-emerald-600/8 dark:to-cyan-600/10 rounded-full blur-[120px]" />
      </div>

      {/* ========== NAVIGATION ========== */}
      <nav className="relative z-50 sticky top-0 backdrop-blur-xl bg-white/70 dark:bg-zinc-950/70 border-b border-emerald-200/30 dark:border-white/5">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-20 h-20 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
                <img
                  src="/logo.webp"
                  alt="VoyC Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-3xl font-black bg-gradient-to-br from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent tracking-tight" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                VOYC
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-4">
              <a href="#features" className="px-5 py-2.5 rounded-xl border-2 border-emerald-200/30 dark:border-emerald-500/30 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300">
                Features
              </a>
              <a href="#wie-es-funktioniert" className="px-5 py-2.5 rounded-xl border-2 border-emerald-200/30 dark:border-emerald-500/30 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300">
                Wie es funktioniert
              </a>
              <a href="#preise" className="px-5 py-2.5 rounded-xl border-2 border-emerald-200/30 dark:border-emerald-500/30 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300">
                Preise
              </a>
              <a href="#kontakt" className="px-5 py-2.5 rounded-xl border-2 border-emerald-200/30 dark:border-emerald-500/30 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300">
                Kontakt
              </a>
              <Link
                href="/login"
                className="px-6 py-2.5 gradient-bg text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300 transform hover:scale-105"
              >
                Starten
              </Link>

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
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl glass-card"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 space-y-3 animate-fade-in">
              <a href="#features" className="block px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl hover:bg-emerald-50 dark:hover:bg-white/5 transition-all">
                Features
              </a>
              <a href="#wie-es-funktioniert" className="block px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl hover:bg-emerald-50 dark:hover:bg-white/5 transition-all">
                Wie es funktioniert
              </a>
              <a href="#preise" className="block px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl hover:bg-emerald-50 dark:hover:bg-white/5 transition-all">
                Preise
              </a>
              <a href="#kontakt" className="block px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl hover:bg-emerald-50 dark:hover:bg-white/5 transition-all">
                Kontakt
              </a>
              <Link href="/login" className="block px-4 py-3 gradient-bg text-white text-sm font-semibold rounded-xl text-center">
                Starten
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* ========== HERO SECTION WITH VIDEO ========== */}
      <section ref={heroRef} className="relative z-10 min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Large top-left orb */}
          <div className="hero-orb-1 absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-emerald-950/40 via-teal-950/30 to-emerald-900/20 blur-[120px]" />
          {/* Medium bottom-right orb */}
          <div className="hero-orb-2 absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-teal-950/40 via-emerald-950/30 to-teal-900/20 blur-[100px]" />
          {/* Small center-right orb with pulse */}
          <div className="hero-orb-3 hero-orb-pulse absolute top-[30%] right-[10%] w-[300px] h-[300px] rounded-full bg-gradient-to-br from-emerald-900/30 via-teal-900/20 to-emerald-950/10 blur-[80px]" />
          {/* Extra dark contrast orb */}
          <div className="hero-orb-1 absolute bottom-[20%] left-[15%] w-[400px] h-[400px] rounded-full bg-black/30 blur-[150px] hero-orb-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.25)" }}
          >
            <source src="/videos/hero-video.mp4" type="video/mp4" />
          </video>
          {/* Gradient Overlay - lighter for light mode */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/60 dark:from-black/10 dark:via-transparent dark:to-black/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card mb-12 animate-fade-in-up">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-medium text-white/90">
                KI-gestützt
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-12 leading-tight animate-fade-in-up animation-delay-100">
              <span className="block text-white">
                Mit deiner Stimme zum Bericht in einem Klick
              </span>
            </h1>

            {/* CTA Button */}
            <div className="animate-fade-in-up animation-delay-300 mt-8">
              <Link
                href="/login"
                className="inline-flex group relative px-10 py-4 gradient-bg text-white font-bold rounded-2xl text-lg overflow-hidden transform hover:scale-105 transition-all duration-300 shadow-2xl shadow-emerald-500/40 hover:shadow-emerald-500/60"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Jetzt kostenlos testen
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    {/* ========== HOW IT WORKS ========== */}
    <section id="wie-es-funktioniert" className="relative z-10 py-24 lg:py-32 bg-gradient-to-b from-stone-950 via-zinc-950 to-stone-950 overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="hero-orb-1 absolute top-[-10%] left-[5%] w-[400px] h-[400px] rounded-full bg-emerald-500/8 blur-[120px]" />
          <div className="hero-orb-2 absolute bottom-[-10%] right-[5%] w-[350px] h-[350px] rounded-full bg-teal-500/6 blur-[100px]" />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              So einfach funktioniert's
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              In 3 einfachen Schritten von deinem Kundenbesuch zum strukturierten Bericht
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="relative group">
              <div className="absolute -top-4 -left-4 w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                1
              </div>
              <div className="glass-card rounded-2xl p-8 pt-12 h-full transform group-hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/20">
                <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Sprich auf</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Nach dem Kundenbesuch sprichst du deine Notizen einfach in die App. Kein Tippen mehr.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="absolute -top-4 -left-4 w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                2
              </div>
              <div className="glass-card rounded-2xl p-8 pt-12 h-full transform group-hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/20">
                <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">AI analysiert</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Unsere KI extrahiert automatisch alle relevanten Daten: Produkte, Mengen, Termine, Aufgaben.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="absolute -top-4 -left-4 w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                3
              </div>
              <div className="glass-card rounded-2xl p-8 pt-12 h-full transform group-hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/20">
                <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Exportieren</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Ein Klick genügt und deine Daten sind in Google Sheets, Excel oder deinem ERP-System.
                </p>
              </div>
            </div>
          </div>
        </div>
    </section>

      {/* ========== FEATURES SECTION ========== */}
      <section id="features" className="relative z-10 py-24 lg:py-32 bg-gradient-to-b from-stone-50 via-neutral-50 to-stone-50 dark:from-zinc-950 dark:via-stone-950 dark:to-zinc-950 overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="hero-orb-1 absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/8 blur-[150px]" />
          <div className="hero-orb-2 absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-teal-500/6 blur-[120px]" />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16 bg-gradient-to-b from-emerald-100/30 to-teal-100/20 dark:from-zinc-900/60 dark:to-stone-900/50 -mx-6 px-6 py-8 rounded-3xl border border-emerald-200/30 dark:border-emerald-900/30">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Warum VoyC?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Funktionen, die deine Kundengespräche revolutionieren
            </p>
          </div>

          {/* Simple Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                ),
                gradient: 'from-emerald-500 to-teal-500',
                title: 'Sprachaufnahme',
                description: 'Einfach nach dem Gespräch sprechen. Kein Tippen mehr.'
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                gradient: 'from-blue-500 to-purple-500',
                title: 'Blitzschnell',
                description: 'Echtzeit-Transkription während du sprichst. Sofortige Ergebnisse.'
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                gradient: 'from-purple-500 to-pink-500',
                title: 'CRM-Integration',
                description: 'Export zu Google Sheets, Excel, Salesforce, HubSpot und mehr.'
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                gradient: 'from-amber-500 to-orange-500',
                title: 'Anpassbar',
                description: 'Definiere selbst, was extrahiert wird. Flexibel für jede Branche.'
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                gradient: 'from-green-500 to-emerald-500',
                title: 'DSGVO Konform',
                description: 'Server in Frankfurt. Höchste Sicherheitsstandards und volle Datenhoheit.'
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                gradient: 'from-red-500 to-rose-500',
                title: 'Persönlicher Support',
                description: 'Dedizierter Berater für Onboarding und kontinuierliche Optimierung.'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative glass-card rounded-2xl p-8 hover:bg-white/90 dark:hover:bg-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/20 hover:-translate-y-1"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== TESTIMONIALS SECTION ========== */}
      <section className="relative z-10 py-24 lg:py-32 bg-gradient-to-b from-stone-50 via-neutral-50 to-stone-50 dark:from-stone-950 dark:via-zinc-950 dark:to-stone-950 overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="hero-orb-3 absolute top-[10%] right-[10%] w-[380px] h-[380px] rounded-full bg-emerald-500/7 blur-[110px]" />
          <div className="hero-orb-1 absolute bottom-[5%] left-[15%] w-[420px] h-[420px] rounded-full bg-teal-500/6 blur-[130px]" />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16 bg-gradient-to-b from-stone-100/50 to-neutral-100/50 dark:from-stone-900/50 dark:to-zinc-900/50 -mx-6 px-6 py-8 rounded-3xl">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Was unsere Kunden sagen
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Erfahre, wie VoyC das Arbeitsleben von Vertriebsprofis revolutioniert
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                quote: 'VoyC hat mir mindestens 2 Stunden pro Tag gespart. Ich kann mich jetzt auf das Verkaufsgespräch konzentrieren, nicht auf die Dokumentation.',
                name: 'Michael Schneider',
                role: 'Außendienst / Pharma',
                company: 'Bayer Vital'
              },
              {
                quote: 'Endlich keine Notizen mehr im Auto verloren! Die KI erkennt sogar Produktnamen und Mengen korrekt. Absolut beeindruckend.',
                name: 'Sarah Wagner',
                role: 'Key Account Manager',
                company: 'Beiersdorf AG'
              },
              {
                quote: 'Die Integration in unser Salesforce war kinderleicht. Unser whole Team nutzt VoyC jetzt täglich. Die Produktivität ist messbar gestiegen.',
                name: 'Thomas Klein',
                role: 'Sales Director DACH',
                company: 'SAP'
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                className="glass-card rounded-2xl p-8 hover:bg-white/90 dark:hover:bg-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/20"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                  "{testimonial.quote}"
                </p>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400">{testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== PRICING SECTION ========== */}
      <section id="preise" className="relative z-10 py-24 lg:py-32 bg-gradient-to-b from-stone-50 via-neutral-50 to-stone-50 dark:from-zinc-950 dark:via-stone-950 dark:to-zinc-950 overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="hero-orb-3 absolute top-[-10%] left-[20%] w-[450px] h-[450px] rounded-full bg-emerald-500/8 blur-[140px]" />
          <div className="hero-orb-1 absolute bottom-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full bg-teal-500/6 blur-[160px]" />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16 bg-gradient-to-b from-emerald-100/30 to-teal-100/20 dark:from-zinc-900/60 dark:to-stone-900/50 -mx-6 px-6 py-8 rounded-3xl border border-emerald-200/30 dark:border-emerald-900/30">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Transparente Preise
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Wähle den Plan, der zu dir passt. Jederzeit flexibel anpassbar.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="glass-card rounded-2xl p-8 transform hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Starter</h3>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Kostenlos</div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Perfect zum Kennenlernen</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  20 Berichte pro Monat
                </li>
                <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Standard AI-Extraktion
                </li>
                <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Google Sheets Export
                </li>
                <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Community Support
                </li>
              </ul>
              <Link href="/login" className="block w-full py-3 text-center font-semibold rounded-xl border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all">
                Kostenlos testen
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="relative gradient-bg rounded-2xl p-8 transform hover:scale-105 transition-all duration-300 shadow-2xl shadow-emerald-500/30">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-white text-emerald-600 text-sm font-bold rounded-full">
                Empfohlen
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Professional</h3>
              <div className="text-4xl font-bold text-white mb-4">€79<span className="text-lg font-normal">/Monat</span></div>
              <p className="text-emerald-100 mb-6">Für professionelle Teams</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-white">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Unbegrenzte Berichte
                </li>
                <li className="flex items-start gap-2 text-white">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Anpassbare Felder & Exporte
                </li>
                <li className="flex items-start gap-2 text-white">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Excel + CRM Integration
                </li>
                <li className="flex items-start gap-2 text-white">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Persönlicher Berater
                </li>
              </ul>
              <Link href="/login" className="block w-full py-3 text-center font-bold rounded-xl bg-white text-emerald-600 hover:bg-emerald-50 transition-all">
                Jetzt starten
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="glass-card rounded-2xl p-8 transform hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Enterprise</h3>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Individuell</div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Für große Organisationen</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Alles aus Professional
                </li>
                <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Self-Hosted Option
                </li>
                <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Custom AI Training
                </li>
                <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Dedicated Success Manager
                </li>
              </ul>
              <a href="#kontakt" className="block w-full py-3 text-center font-semibold rounded-xl border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all">
                Anfragen
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CONTACT SECTION ========== */}
      <section id="kontakt" className="relative z-10 py-24 lg:py-32 bg-gradient-to-b from-stone-50 via-neutral-50 to-stone-50 dark:from-stone-950 dark:via-zinc-950 dark:to-stone-950 overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="hero-orb-2 absolute top-[15%] left-[8%] w-[350px] h-[350px] rounded-full bg-teal-500/6 blur-[115px]" />
          <div className="hero-orb-3 absolute bottom-[10%] right-[12%] w-[400px] h-[400px] rounded-full bg-emerald-500/7 blur-[125px]" />
        </div>
        <div className="container mx-auto px-6 relative z-10">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Sprich mit uns
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Du hast Fragen? Wir freuen uns auf deine Nachricht.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-8 md:p-12">
              {istGesendet ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full gradient-bg flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Nachricht gesendet!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Wir melden uns so schnell wie möglich bei dir.
                  </p>
                  <button
                    onClick={() => setIstGesendet(false)}
                    className="mt-6 px-6 py-2 gradient-bg text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                  >
                    Weitere Nachricht senden
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        placeholder="Dein Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        placeholder="deine@email.de"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nachricht
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.nachricht}
                      onChange={(e) => setFormData({ ...formData, nachricht: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                      placeholder="Wie können wir dir helfen?"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={istAmSenden}
                    className="w-full py-4 gradient-bg text-white font-bold rounded-xl hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {istAmSenden ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Senden...
                      </>
                    ) : (
                      <>
                        Nachricht senden
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>

      {/* ========== FOOTER ========== */}
      <footer className="relative z-10 border-t border-emerald-300/50 dark:border-emerald-500/20 bg-gradient-to-b from-stone-100 to-stone-50 dark:from-stone-950 dark:to-zinc-950 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.webp" alt="VoyC Logo" className="w-12 h-12 object-contain" />
                <span className="text-xl font-black bg-gradient-to-br from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                  VOYC
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Die Voice-to-CRM App für professionelle Kundengespräche.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Produkt</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Features</a></li>
                <li><a href="#preise" className="text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Preise</a></li>
                <li><Link href="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Login</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Rechtliches</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Impressum</a></li>
                <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Datenschutz</a></li>
                <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">AGB</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Kontakt</h4>
              <ul className="space-y-3">
                <li className="text-sm text-gray-600 dark:text-gray-400">Eeraj</li>
                <li>
                  <a href="mailto:info@voc-app.de" className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    info@voc-app.de
                  </a>
                </li>
                <li className="text-sm text-gray-600 dark:text-gray-400">Deutschland</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-emerald-200/30 dark:border-white/5 pt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © 2026 VoyC. Alle Rechte vorbehalten. Mit Leidenschaft gemacht in Deutschland.
            </p>
          </div>
        </div>
      </footer>

      {/* ========== FLOATING CTA ========== */}
      <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
        <a
          href="/login"
          className="flex items-center gap-3 px-8 py-4 gradient-bg text-white font-bold rounded-2xl shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 transform hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Kostenlos testen
        </a>
      </div>
    </div>
  )
}
