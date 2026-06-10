'use client'

import { useState, useRef, useEffect } from 'react'

interface Transaction {
  type: 'bestellung' | 'angebot' | 'anfrage' | 'aufgabe'
  item: string
  quantity: string
  unit: string
  delivery: string
  delivery_date: string
  deadline: string
  status: string
  notes: string
}

interface StructuredData {
  report_type: 'besuchsbericht' | 'spesen' | 'aufgabe' | 'messbericht'
  company_name: string
  contact_person: string
  meeting_date: string
  meeting_time: string
  summary: string
  satisfaction_score: number
  satisfaction_notes: string
  transactions: Transaction[]
  next_meeting_date: string
  next_meeting_purpose: string
}

interface ProcessingResult {
  transcript: string
  structured_data: StructuredData
}

interface AudioRecorderProps {
  onReportSaved?: () => void
}

const WAVE_COUNT = 14
const REPORT_TYPES = ['besuchsbericht', 'messbericht', 'spesen', 'aufgabe'] as const

export default function AudioRecorder({ onReportSaved }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<ProcessingResult | null>(null)
  const [editedData, setEditedData] = useState<StructuredData | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [transcriptOpen, setTranscriptOpen] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const waveRef = useRef<HTMLDivElement>(null)
  const waveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setRecordingTime(p => p + 1), 1000)
      // Animate wave bars
      waveIntervalRef.current = setInterval(() => {
        if (waveRef.current) {
          waveRef.current.querySelectorAll<HTMLElement>('i').forEach(b => {
            b.style.height = (14 + Math.random() * 72) + '%'
          })
        }
      }, 100)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
      if (waveIntervalRef.current) clearInterval(waveIntervalRef.current)
      // Reset wave bars
      if (waveRef.current) {
        waveRef.current.querySelectorAll<HTMLElement>('i').forEach(b => { b.style.height = '20%' })
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (waveIntervalRef.current) clearInterval(waveIntervalRef.current)
    }
  }, [isRecording])

  // Populate editedData when result arrives
  useEffect(() => {
    if (result) {
      const data = result.structured_data
      const today = new Date().toISOString().split('T')[0]
      setEditedData({
        ...data,
        meeting_date: data.meeting_date || today,
        transactions: data.transactions?.map((t: Transaction) => ({
          ...t,
          delivery_date: t.delivery_date || '',
          deadline: t.deadline || '',
        })) || [],
      })
    }
  }, [result])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const startRecording = async () => {
    setError('')
    audioChunksRef.current = []
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data) }
      mediaRecorder.onstop = () => {
        setAudioBlob(new Blob(audioChunksRef.current, { type: 'audio/webm' }))
        stream.getTracks().forEach(t => t.stop())
      }
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
    } catch {
      setError('Zugriff auf Mikrofon nicht möglich. Bitte Berechtigung erteilen.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const discardRecording = () => {
    setAudioBlob(null)
    setRecordingTime(0)
    setError('')
    setResult(null)
    setEditedData(null)
    setSaveSuccess(false)
    setTranscriptOpen(false)
  }

  const sendToAI = async () => {
    if (!audioBlob) return
    setProcessing(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      const response = await fetch('/api/process-audio', { method: 'POST', body: formData })
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Fehler bei der API-Anfrage')
      }
      setResult(await response.json())
    } catch (err: any) {
      if (err.message?.includes('Groq API Key nicht konfiguriert')) {
        setError('Kein Groq API Key konfiguriert. Verwende Demo-Daten.')
        setResult({
          transcript: 'War bei Kunde Müller, braucht 10 Tonnen bis Oktober 2026. Angebot muss bis Freitag raus.',
          structured_data: {
            report_type: 'besuchsbericht',
            company_name: 'Müller GmbH',
            contact_person: 'Herr Müller',
            meeting_date: '2026-04-16',
            meeting_time: '',
            summary: 'Kundenbesuch bei Müller GmbH. Kunde benötigt 10 Tonnen Material bis Oktober 2026.',
            satisfaction_score: 8,
            satisfaction_notes: 'Kunde zufrieden mit Service',
            transactions: [{
              type: 'bestellung', item: 'Material', quantity: '10', unit: 'Tonnen',
              delivery: 'Müller GmbH', delivery_date: '2026-10-17', deadline: '', status: 'neu', notes: '10 Tonnen bis Oktober'
            }],
            next_meeting_date: '',
            next_meeting_purpose: '',
          },
        })
      } else {
        setError(err.message)
      }
    } finally {
      setProcessing(false)
    }
  }

  const saveToDatabase = async () => {
    if (!result || !editedData) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/save-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: result.transcript, structured_data: editedData }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Fehler beim Speichern')
      setSaveSuccess(true)
      onReportSaved?.()
    } catch (err: any) {
      setError(`Fehler beim Speichern: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const saveAndSend = async () => {
    if (!result || !editedData) return
    setSaving(true)
    setError('')
    try {
      const saveRes = await fetch('/api/save-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: result.transcript, structured_data: editedData }),
      })
      const saveData = await saveRes.json()
      if (!saveRes.ok) throw new Error(saveData.error || 'Fehler beim Speichern')

      const webhookRes = await fetch('/api/send-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: saveData.report?.id || 'demo', transcript: result.transcript, structuredData: editedData }),
      })
      const webhookData = await webhookRes.json()
      if (!webhookRes.ok) throw new Error(webhookData.error || 'Fehler beim Senden an Make.com')

      setSaveSuccess(true)
      onReportSaved?.()
      if (webhookData.message?.includes('Demo-Modus')) {
        setError('Bericht gespeichert! (Webhook nicht konfiguriert)')
      }
    } catch (err: any) {
      setError(`Fehler: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const addTransaction = () => {
    if (!editedData) return
    setEditedData({
      ...editedData,
      transactions: [...editedData.transactions, {
        type: 'bestellung', item: '', quantity: '', unit: '', delivery: '',
        delivery_date: '', deadline: '', status: 'neu', notes: '',
      }],
    })
  }

  const updateTransaction = (idx: number, field: keyof Transaction, value: string) => {
    if (!editedData) return
    const next = [...editedData.transactions]
    next[idx] = { ...next[idx], [field]: value }
    setEditedData({ ...editedData, transactions: next })
  }

  const removeTransaction = (idx: number) => {
    if (!editedData) return
    setEditedData({ ...editedData, transactions: editedData.transactions.filter((_, i) => i !== idx) })
  }

  // ─── Render ─────────────────────────────────────────────
  return (
    <div>
      {error && <div className="verror">{error}</div>}
      {saveSuccess && <div className="vsuccess">Bericht erfolgreich gespeichert ✓</div>}

      {/* ── PROCESSING ── */}
      {processing && (
        <div className="vprocessing">
          <div className="vspinner" />
          <div className="proc-steps">
            {['Audio transkribieren …', 'Daten extrahieren …', 'Bericht strukturieren …'].map((label, i) => (
              <div key={i} className="proc-step active">
                <span className="pic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                {label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── REPORT ── */}
      {result && editedData && !processing && (
        <div className="vreport">

          {/* Test-UI notice */}
          <div className="report-test-notice">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" style={{ width: 15, height: 15, flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
            </svg>
            <span><b>Test-Ansicht</b> — Diese Berichtsmaske kann kundenspezifisch angepasst werden (Felder, Layout, Logik).</span>
          </div>

          {/* Status bar */}
          <div className="report-status-bar">
            <div className="rsb-left">
              <span className="rsb-dot" />
              <span className="rsb-label">Bericht generiert</span>
            </div>
            <button
              className={`transcript-toggle${transcriptOpen ? ' open' : ''}`}
              onClick={() => setTranscriptOpen(!transcriptOpen)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" style={{ width: 14, height: 14 }}>
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3" />
              </svg>
              Transkript
              <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" style={{ width: 14, height: 14 }}>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          </div>
          <div className="transcript-body" style={{ maxHeight: transcriptOpen ? 300 : 0 }}>
            <div className="inner">{result.transcript}</div>
          </div>

          {/* ── SECTION: Basisinformationen ── */}
          <div className="report-section">
            <div className="report-section-head">
              <span className="report-section-label">Basisinformationen</span>
              <div className="type-row">
                {REPORT_TYPES.map(t => (
                  <button
                    key={t}
                    className={`type-chip${editedData.report_type === t ? ' active' : ''}`}
                    onClick={() => setEditedData({ ...editedData, report_type: t })}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="r-row">
              <div className="rfield">
                <label>Unternehmen</label>
                <input className="rinput" value={editedData.company_name} onChange={e => setEditedData({ ...editedData, company_name: e.target.value })} placeholder="z.B. Müller GmbH" />
              </div>
              <div className="rfield">
                <label>Ansprechpartner</label>
                <input className="rinput" value={editedData.contact_person} onChange={e => setEditedData({ ...editedData, contact_person: e.target.value })} placeholder="z.B. Herr Müller" />
              </div>
            </div>
            <div className="rfield">
              <label>Gesprächszusammenfassung</label>
              <textarea className="rinput" rows={3} value={editedData.summary} onChange={e => setEditedData({ ...editedData, summary: e.target.value })} style={{ resize: 'vertical' }} />
            </div>
          </div>

          {/* ── SECTION: Vorgänge ── */}
          <div className="report-section">
            <div className="report-section-head">
              <span className="report-section-label">Vorgänge</span>
              <button className="btn-add" onClick={addTransaction}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" style={{ width: 13, height: 13 }}><path d="M12 5v14M5 12h14" /></svg>
                Vorgang hinzufügen
              </button>
            </div>

            {editedData.transactions.length === 0 && (
              <div className="vorgang-empty">Keine Vorgänge erfasst</div>
            )}

            {editedData.transactions.map((trans, idx) => (
              <div key={idx} className="vorgang">
                <div className="vorgang-top">
                  <div className="vorgang-meta">
                    <select className="vorgang-sel" value={trans.type} onChange={e => updateTransaction(idx, 'type', e.target.value)}>
                      <option value="bestellung">Bestellung</option>
                      <option value="angebot">Angebot</option>
                      <option value="anfrage">Anfrage</option>
                      <option value="aufgabe">Aufgabe</option>
                    </select>
                    <select className="status-sel" value={trans.status} onChange={e => updateTransaction(idx, 'status', e.target.value)}>
                      <option value="neu">Neu</option>
                      <option value="in Bearbeitung">In Bearbeitung</option>
                      <option value="abgeschlossen">Abgeschlossen</option>
                    </select>
                  </div>
                  <button className="btn-del" onClick={() => removeTransaction(idx)} aria-label="Vorgang entfernen">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" style={{ width: 15, height: 15 }}>
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="rfield">
                  <label>Artikel / Produkt</label>
                  <input className="rinput" value={trans.item} onChange={e => updateTransaction(idx, 'item', e.target.value)} placeholder="z.B. Ersatzteile Typ X" />
                </div>
                <div className="r-row">
                  <div className="rfield">
                    <label>Menge</label>
                    <input className="rinput" type="number" value={trans.quantity} onChange={e => updateTransaction(idx, 'quantity', e.target.value)} placeholder="0" />
                  </div>
                  <div className="rfield">
                    <label>Einheit</label>
                    <input className="rinput" value={trans.unit} onChange={e => updateTransaction(idx, 'unit', e.target.value)} placeholder="Stück / kg / …" />
                  </div>
                </div>
                <div className="r-row">
                  <div className="rfield">
                    <label>Lieferort</label>
                    <input className="rinput" value={trans.delivery} onChange={e => updateTransaction(idx, 'delivery', e.target.value)} placeholder="z.B. Hauptlager Berlin" />
                  </div>
                  <div className="rfield">
                    <label>Lieferdatum</label>
                    <input className="rinput" type="date" value={trans.delivery_date} onChange={e => updateTransaction(idx, 'delivery_date', e.target.value)} />
                  </div>
                </div>
                <div className="r-row">
                  <div className="rfield">
                    <label>Frist</label>
                    <input className="rinput" type="date" value={trans.deadline} onChange={e => updateTransaction(idx, 'deadline', e.target.value)} />
                  </div>
                  <div className="rfield">
                    <label>Notizen</label>
                    <input className="rinput" value={trans.notes} onChange={e => updateTransaction(idx, 'notes', e.target.value)} placeholder="Zusatzinfos" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── SECTION: Analyse ── */}
          <div className="report-section">
            <div className="report-section-head">
              <span className="report-section-label">Analyse & Folgeaktionen</span>
            </div>
            <div className="r-row">
              <div className="rfield">
                <label>Kundenzufriedenheit <span className="field-badge">{editedData.satisfaction_score}/10</span></label>
                <div className="satis">
                  <input
                    type="range" min="1" max="10"
                    value={editedData.satisfaction_score}
                    onChange={e => setEditedData({ ...editedData, satisfaction_score: parseInt(e.target.value) || 5 })}
                  />
                  <div className="satis-track">
                    {[...Array(10)].map((_, i) => (
                      <span key={i} className={i < editedData.satisfaction_score ? 'filled' : ''} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="rfield">
                <label>Nächster Termin</label>
                <input className="rinput" type="date" value={editedData.next_meeting_date} onChange={e => setEditedData({ ...editedData, next_meeting_date: e.target.value })} style={{ marginBottom: 8 }} />
                <input className="rinput" value={editedData.next_meeting_purpose} onChange={e => setEditedData({ ...editedData, next_meeting_purpose: e.target.value })} placeholder="Ziel des Termins" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="report-actions">
            <button className="btn btn-ghost" onClick={saveToDatabase} disabled={saving}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" style={{ width: 16, height: 16 }}>
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
              </svg>
              {saving ? 'Speichern…' : 'Speichern'}
            </button>
            <button className="btn btn-primary" onClick={saveAndSend} disabled={saving}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" style={{ width: 16, height: 16 }}>
                <path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7z" />
              </svg>
              {saving ? 'Senden…' : 'Speichern & an CRM senden'}
            </button>
          </div>
          <div className="report-restart">
            <button onClick={discardRecording} disabled={saving}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" style={{ width: 14, height: 14 }}>
                <path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.4 2.6L3 8" /><path d="M3 3v5h5" />
              </svg>
              Neue Aufnahme starten
            </button>
          </div>
        </div>
      )}

      {/* ── RECORDER (idle / recording / review) ── */}
      {!processing && !result && (
        <>
          {!audioBlob ? (
            <div className="rec-stage">
              <button
                className={`rec-btn${isRecording ? ' recording' : ''}`}
                onClick={isRecording ? stopRecording : startRecording}
                aria-label={isRecording ? 'Aufnahme stoppen' : 'Aufnahme starten'}
              >
                {isRecording ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 44, height: 44 }}>
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" style={{ width: 50, height: 50 }}>
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3" />
                  </svg>
                )}
              </button>

              {isRecording && (
                <>
                  <div className="rec-timer">{formatTime(recordingTime)}</div>
                  <div className="rec-wave" ref={waveRef}>
                    {Array.from({ length: WAVE_COUNT }, (_, i) => (
                      <i key={i} style={{ height: '20%' }} />
                    ))}
                  </div>
                </>
              )}

              <div className="rec-hint">
                {isRecording ? '• Zum Stoppen klicken' : 'Tippe zum Aufnehmen'}
              </div>
            </div>
          ) : (
            <div className="audio-review">
              <h3>Aufnahme fertig</h3>
              <p>Dauer: {formatTime(recordingTime)}</p>
              <audio src={URL.createObjectURL(audioBlob)} controls />
              <div className="rec-actions">
                <button className="btn btn-ghost" onClick={discardRecording} disabled={processing}>Verwerfen</button>
                <button className="btn btn-primary" onClick={sendToAI} disabled={processing}>
                  {processing ? 'Verarbeite…' : 'An KI senden →'}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
