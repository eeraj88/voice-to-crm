'use client'

import { useState, useRef, useEffect } from 'react'

// Typen für die API-Antwort
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

  // NEU: Vorgänge statt separate Arrays
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

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Timer für Aufnahmezeit
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRecording])

  // Wenn Ergebnis da, initialisiere bearbeitbare Daten
  useEffect(() => {
    if (result) {
      const data = result.structured_data
      const today = new Date().toISOString().split('T')[0]

      const enrichedData: StructuredData = {
        ...data,
        meeting_date: data.meeting_date || today,
        transactions: data.transactions?.map((t: Transaction) => ({
          ...t,
          delivery_date: t.delivery_date || '',
          deadline: t.deadline || ''
        })) || []
      }
      setEditedData(enrichedData)
    }
  }, [result])

  // Formatierung der Zeit (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Aufnahme starten
  const startRecording = async () => {
    setError('')
    audioChunksRef.current = []

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      })

      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(audioBlob)

        // Stoppe alle Tracks
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
    } catch (err) {
      console.error('Fehler beim Starten der Aufnahme:', err)
      setError('Zugriff auf Mikrofon nicht möglich. Bitte Berechtigung erteilen.')
    }
  }

  // Aufnahme stoppen
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  // Aufnahme verwerfen
  const discardRecording = () => {
    setAudioBlob(null)
    setRecordingTime(0)
    setError('')
    setResult(null)
    setEditedData(null)
    setSaveSuccess(false)
  }

  // Audio an KI senden
  const sendToAI = async () => {
    if (!audioBlob) return

    setProcessing(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      const response = await fetch('/api/process-audio', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Fehler bei der API-Anfrage')
      }

      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      console.error('Fehler bei der KI-Verarbeitung:', err)

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
            summary: 'Kundenbesuch bei Müller GmbH. Kunde benötigt 10 Tonnen Material bis Oktober 2026. Angebotsofferte bis Freitag.',
            satisfaction_score: 8,
            satisfaction_notes: 'Kunde zufrieden mit Service',
            transactions: [
              {
                type: 'bestellung',
                item: 'Material',
                quantity: '10',
                unit: 'Tonnen',
                delivery: 'Müller GmbH',
                delivery_date: '2026-10-17',
                deadline: '',
                status: 'neu',
                notes: '10 Tonnen bis Oktober'
              }
            ],
            next_meeting_date: '',
            next_meeting_purpose: ''
          }
        })
      } else {
        setError(`${err.message}`)
      }
    } finally {
      setProcessing(false)
    }
  }

  // Speichern in Datenbank
  const saveToDatabase = async () => {
    if (!result || !editedData) return

    setSaving(true)
    setError('')

    try {
      const response = await fetch('/api/save-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: result.transcript,
          structured_data: editedData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Speichern')
      }

      setSaveSuccess(true)

      if (onReportSaved) {
        onReportSaved()
      }
    } catch (err: any) {
      console.error('Fehler beim Speichern:', err)
      setError(`Fehler beim Speichern: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  // Speichern & an Make.com senden
  const saveAndSend = async () => {
    if (!result || !editedData) return

    setSaving(true)
    setError('')

    try {
      // Erst speichern
      const saveResponse = await fetch('/api/save-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: result.transcript,
          structured_data: editedData,
        }),
      })

      const saveData = await saveResponse.json()

      if (!saveResponse.ok) {
        throw new Error(saveData.error || 'Fehler beim Speichern')
      }

      const reportId = saveData.report?.id || 'demo'

      // Dann an Make.com senden
      const webhookResponse = await fetch('/api/send-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportId,
          transcript: result.transcript,
          structuredData: editedData,
        }),
      })

      const webhookData = await webhookResponse.json()

      if (!webhookResponse.ok) {
        throw new Error(webhookData.error || 'Fehler beim Senden an Make.com')
      }

      setSaveSuccess(true)

      if (onReportSaved) {
        onReportSaved()
      }

      if (webhookData.message?.includes('Demo-Modus')) {
        setError('Bericht gespeichert! (Webhook nicht konfiguriert)')
      } else {
        setError('Bericht gespeichert und gesendet!')
      }
    } catch (err: any) {
      console.error('Fehler:', err)
      setError(`Fehler: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  // Transaction hinzufügen
  const addTransaction = () => {
    if (!editedData) return

    const newTransaction: Transaction = {
      type: 'bestellung',
      item: '',
      quantity: '',
      unit: '',
      delivery: '',
      delivery_date: '',
      deadline: '',
      status: 'neu',
      notes: ''
    }

    setEditedData({
      ...editedData,
      transactions: [...editedData.transactions, newTransaction]
    })
  }

  // Transaction bearbeiten
  const updateTransaction = (index: number, field: keyof Transaction, value: string) => {
    if (!editedData) return

    const newTransactions = [...editedData.transactions]
    newTransactions[index] = { ...newTransactions[index], [field]: value }
    setEditedData({ ...editedData, transactions: newTransactions })
  }

  // Transaction löschen
  const removeTransaction = (index: number) => {
    if (!editedData) return

    const newTransactions = editedData.transactions.filter((_, i) => i !== index)
    setEditedData({ ...editedData, transactions: newTransactions })
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Fehlermeldung */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-sm text-red-600 dark:text-red-400 text-center whitespace-pre-line">{error}</p>
        </div>
      )}

      {/* Erfolgsmeldung */}
      {saveSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
          <p className="text-sm text-emerald-600 dark:text-emerald-400 text-center">
            Bericht erfolgreich gespeichert
          </p>
        </div>
      )}

      {/* Ergebnis-Card */}
      {result && editedData && (
        <div className="mb-6 p-6 glass-card rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">KI hat verarbeitet</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Du kannst die Daten noch bearbeiten</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Transkript */}
            <div>
              <label className="text-sm font-medium text-zinc-300 mb-1 block">
                Transkript
              </label>
              <p className="text-sm text-zinc-400 glass-input p-3 rounded-xl">
                {result.transcript}
              </p>
            </div>

            {/* Bearbeitbare Felder */}
            <div className="glass p-4 rounded-xl space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1 block">
                    Typ
                  </label>
                  <select
                    value={editedData.report_type}
                    onChange={(e) => setEditedData({ ...editedData, report_type: e.target.value as any })}
                    className="w-full px-3 py-2 glass-input rounded-xl text-white placeholder:text-zinc-500"
                  >
                    <option value="besuchsbericht">Besuchsbericht</option>
                    <option value="messbericht">Messebericht</option>
                    <option value="spesen">Spesen</option>
                    <option value="aufgabe">Aufgabe</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1 block">
                    Firmenname
                  </label>
                  <input
                    type="text"
                    value={editedData.company_name}
                    onChange={(e) => setEditedData({ ...editedData, company_name: e.target.value })}
                    className="w-full px-3 py-2 glass-input rounded-xl text-white placeholder:text-zinc-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1 block">
                    Kontaktperson
                  </label>
                  <input
                    type="text"
                    value={editedData.contact_person}
                    onChange={(e) => setEditedData({ ...editedData, contact_person: e.target.value })}
                    className="w-full px-3 py-2 glass-input rounded-xl text-white placeholder:text-zinc-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400 mb-1 block">
                  Zusammenfassung
                </label>
                <textarea
                  value={editedData.summary}
                  onChange={(e) => setEditedData({ ...editedData, summary: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 glass-input rounded-xl text-white placeholder:text-zinc-500 resize-none"
                />
              </div>

              {/* Vorgänge (Transactions) */}
              <div className="border-t border-white/10 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-semibold text-zinc-300 mb-0 block">
                    Vorgänge ({editedData.transactions.length})
                  </label>
                  <button
                    onClick={addTransaction}
                    className="px-3 py-1.5 gradient-bg text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Hinzufügen
                  </button>
                </div>

                {editedData.transactions.map((trans, idx) => (
                  <div key={idx} className="bg-zinc-800/50 dark:bg-zinc-900/50 p-3 rounded-xl mb-2 border border-emerald-500/20">
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <label className="text-xs text-zinc-400 mb-1 block">Typ</label>
                        <select
                          value={trans.type}
                          onChange={(e) => updateTransaction(idx, 'type', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs glass-input rounded-lg text-white"
                        >
                          <option value="bestellung">Bestellung</option>
                          <option value="angebot">Angebot</option>
                          <option value="anfrage">Anfrage</option>
                          <option value="aufgabe">Aufgabe</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-zinc-400 mb-1 block">Status</label>
                        <select
                          value={trans.status}
                          onChange={(e) => updateTransaction(idx, 'status', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs glass-input rounded-lg text-white"
                        >
                          <option value="neu">Neu</option>
                          <option value="in Bearbeitung">In Bearbeitung</option>
                          <option value="abgeschlossen">Abgeschlossen</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <input
                        type="text"
                        value={trans.item}
                        onChange={(e) => updateTransaction(idx, 'item', e.target.value)}
                        placeholder="Artikel / Produkt"
                        className="px-2 py-1.5 text-xs glass-input rounded-lg text-white placeholder:text-zinc-500"
                      />
                      <input
                        type="number"
                        value={trans.quantity}
                        onChange={(e) => updateTransaction(idx, 'quantity', e.target.value)}
                        placeholder="Menge"
                        className="px-2 py-1.5 text-xs glass-input rounded-lg text-white placeholder:text-zinc-500"
                      />
                      <input
                        type="text"
                        value={trans.unit}
                        onChange={(e) => updateTransaction(idx, 'unit', e.target.value)}
                        placeholder="Einheit"
                        className="px-2 py-1.5 text-xs glass-input rounded-lg text-white placeholder:text-zinc-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <input
                        type="text"
                        value={trans.delivery}
                        onChange={(e) => updateTransaction(idx, 'delivery', e.target.value)}
                        placeholder="Lieferort / Adresse"
                        className="px-2 py-1.5 text-xs glass-input rounded-lg text-white placeholder:text-zinc-500"
                      />
                      <input
                        type="date"
                        value={trans.delivery_date}
                        onChange={(e) => updateTransaction(idx, 'delivery_date', e.target.value)}
                        className="px-2 py-1.5 text-xs glass-input rounded-lg text-white placeholder:text-zinc-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <input
                        type="date"
                        value={trans.deadline}
                        onChange={(e) => updateTransaction(idx, 'deadline', e.target.value)}
                        placeholder="Frist"
                        className="px-2 py-1.5 text-xs glass-input rounded-lg text-white placeholder:text-zinc-500"
                      />
                      <input
                        type="text"
                        value={trans.notes}
                        onChange={(e) => updateTransaction(idx, 'notes', e.target.value)}
                        placeholder="Notizen"
                        className="px-2 py-1.5 text-xs glass-input rounded-lg text-white placeholder:text-zinc-500"
                      />
                    </div>

                    <button
                      onClick={() => removeTransaction(idx)}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Entfernen
                    </button>
                  </div>
                ))}
              </div>

              {/* Zufriedenheit */}
              <div className="border-t border-white/10 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-400 mb-1 block">
                      Score (1-10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={editedData.satisfaction_score}
                      onChange={(e) => setEditedData({ ...editedData, satisfaction_score: parseInt(e.target.value) || 5 })}
                      className="w-full px-3 py-2 glass-input rounded-xl text-white placeholder:text-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 mb-1 block">
                      Notizen
                    </label>
                    <input
                      type="text"
                      value={editedData.satisfaction_notes}
                      onChange={(e) => setEditedData({ ...editedData, satisfaction_notes: e.target.value })}
                      placeholder="Zufriedenheit Details"
                      className="w-full px-3 py-2 glass-input rounded-xl text-white placeholder:text-zinc-500"
                    />
                  </div>
                </div>
              </div>

              {/* Nächstes Meeting */}
              <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">
                    Nächstes Meeting
                  </label>
                  <input
                    type="date"
                    value={editedData.next_meeting_date}
                    onChange={(e) => setEditedData({ ...editedData, next_meeting_date: e.target.value })}
                    className="w-full px-3 py-2 glass-input rounded-xl text-white placeholder:text-zinc-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">
                    Ziel
                  </label>
                  <input
                    type="text"
                    value={editedData.next_meeting_purpose}
                    onChange={(e) => setEditedData({ ...editedData, next_meeting_purpose: e.target.value })}
                    placeholder="Ziel des Treffens"
                    className="w-full px-3 py-2 glass-input rounded-xl text-white placeholder:text-zinc-500"
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={saveToDatabase}
                disabled={saving}
                className="py-3 px-4 gradient-bg text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {saving ? 'Speichern...' : 'Speichern'}
              </button>
              <button
                onClick={saveAndSend}
                disabled={saving}
                className="py-3 px-4 gradient-bg text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {saving ? 'Senden...' : 'Speichern & Senden'}
              </button>
              <button
                onClick={discardRecording}
                disabled={saving}
                className="py-3 px-4 glass text-zinc-300 font-semibold rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Neu
              </button>
            </div>

            <p className="text-xs text-zinc-500 text-center mt-3">
              Speichern = lokal | Speichern & Senden = an Make.com
            </p>
          </div>
        </div>
      )}

      {/* Aufnahme-Button */}
      <div className="flex flex-col items-center gap-6">
        {!audioBlob ? (
          <>
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`relative flex items-center justify-center rounded-full transition-all duration-300 ${
                isRecording
                  ? 'w-36 h-36 bg-gradient-to-br from-red-500 to-red-600 shadow-2xl shadow-red-500/40 hover:shadow-red-500/60 scale-105'
                  : 'w-40 h-40 bg-gradient-to-br from-emerald-500 via-teal-500 to-green-600 shadow-2xl shadow-emerald-500/40 hover:shadow-emerald-500/60 hover:scale-105'
              }`}
            >
              {isRecording && (
                <>
                  <span className="absolute inset-0 rounded-full bg-red-400 opacity-20 animate-ping"></span>
                  <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-40 animate-pulse"></span>
                </>
              )}

              {/* Mikrofon-Icon - korrigiert */}
              <div className={`relative z-10 flex items-center justify-center ${isRecording ? 'scale-110' : ''}`}>
                {/* Mikrofon-Körper */}
                <div className="relative">
                  {/* Äußerer Rahmen */}
                  <div className="w-20 h-20 rounded-full border-4 border-white/30" />

                  {/* Mikrofon-Gitter */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <svg
                      className="w-12 h-12 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {/* Hauptkörper */}
                      <rect x="9" y="3" width="6" height="11" rx="3" />
                      {/* Linien oben */}
                      <path d="M12 14v7" />
                      {/* Unterer Teil */}
                      <path d="M8 14h8" />
                      {/* Fuß */}
                      <path d="M12 21h0" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Glow Effect */}
              <div className={`absolute inset-0 rounded-full blur-2xl transition-opacity duration-300 ${
                isRecording
                  ? 'bg-red-500/40'
                  : 'bg-emerald-500/0 hover:bg-emerald-500/20'
              }`} />
            </button>

            {isRecording && (
              <div className="text-center animate-fade-in">
                <div className="text-5xl font-bold text-red-600 dark:text-red-400 font-mono mb-2 tabular-nums">
                  {formatTime(recordingTime)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  • Aufnahme läuft
                </p>
              </div>
            )}

            <p className="text-center text-gray-700 dark:text-gray-300 font-medium">
              {isRecording ? '• Zum Stoppen klicken' : '• Zum Aufnehmen klicken'}
            </p>
          </>
        ) : (
          <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Aufnahme fertig
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Dauer: {formatTime(recordingTime)}
              </p>
            </div>

            <audio
              src={URL.createObjectURL(audioBlob)}
              controls
              className="w-full mb-6"
            />

            <div className="flex gap-4">
              <button
                onClick={discardRecording}
                disabled={processing}
                className="flex-1 py-3 px-4 glass text-zinc-300 font-semibold rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Verwerfen
              </button>
              <button
                onClick={sendToAI}
                disabled={processing}
                className="flex-1 py-3 px-4 gradient-bg text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Verarbeite...' : 'An KI senden'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
