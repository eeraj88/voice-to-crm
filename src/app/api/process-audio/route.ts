import { NextRequest, NextResponse } from 'next/server'

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

export async function POST(request: NextRequest) {
  try {
    console.log('🎤 API aufgerufen')

    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json({ error: 'Keine Audio' }, { status: 400 })
    }

    const groqApiKey = process.env.GROQ_API_KEY

    // Demo-Modus wenn kein Key
    if (!groqApiKey || groqApiKey === 'your-groq-api-key') {
      return NextResponse.json({
        success: true,
        transcript: 'Demo-Transkription',
        structured_data: {
          report_type: 'besuchsbericht',
          company_name: 'Demo GmbH',
          contact_person: 'Herr Mustermann',
          meeting_date: '2026-04-16',
          meeting_time: '10:00',
          summary: 'Demo-KI läuft noch nicht',
          satisfaction_score: 5,
          satisfaction_notes: '',
          transactions: [
            { type: 'bestellung', item: 'Demo Produkt', quantity: '1', unit: 'Stk', delivery: 'ab Werk', delivery_date: '', deadline: '', status: 'offen', notes: '' }
          ],
          next_meeting_date: '',
          next_meeting_purpose: ''
        }
      })
    }

    // Echte KI
    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Whisper
    const whisperFormData = new FormData()
    whisperFormData.append('file', new Blob([buffer], { type: audioFile.type || 'audio/webm' }), 'recording.webm')
    whisperFormData.append('model', 'whisper-large-v3')

    const whisperResponse = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${groqApiKey}` },
      body: whisperFormData,
    })

    if (!whisperResponse.ok) {
      throw new Error('Whisper API Error')
    }

    const whisperData = await whisperResponse.json()
    const transcript = whisperData.text

    console.log('Whisper Transcript:', transcript)

    // LLM
    const llmResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `Du bist ein professioneller Assistent für Außendienstmitarbeiter. Extrahiere alle Informationen aus dem Transkript in folgendes JSON-Format:

{
  "report_type": "besuchsbericht | spesen | aufgabe | messbericht",
  "company_name": "Firmenname der Kundenfirma (wichtig: nur wenn explizit genannt mit Rechtsform wie GmbH, AG, KG, etc. Falls nicht genannt: 'Nicht genannt')",
  "contact_person": "Vor- und Nachname der Kontaktperson beim Kunden",
  "meeting_date": "YYYY-MM-DD (Datum des Treffens, im Format YYYY-MM-DD, oder heute wenn nicht erwähnt)",
  "meeting_time": "HH:MM (Uhrzeit wenn erwähnt, sonst leerer String '')",
  "summary": "Zusammenfassung des Gesprächs in 2-3 professionellen Sätzen, die wichtigsten Punkte herausgefiltert",

  "satisfaction_score": Zahl von 1-10 (1 = sehr unzufrieden, 10 = sehr zufrieden),
  "satisfaction_notes": "Details zur Zufriedenheit - was lief gut, was nicht, spezifische Erwähnungen von Mitarbeitern oder Problemen",

  "transactions": [
    {
      "type": "bestellung | angebot | anfrage | aufgabe",
      "item": "Produktname, Dienstleistung oder Aufgabenbeschreibung",
      "quantity": "Menge als String (z.B. '5', '10-20', 'ca. 100', leer '' wenn nicht zutreffend)",
      "unit": "Einheit (z.B. 'Stk', 'Tonnen', 'Palette', 'Meter', leer '' wenn nicht zutreffend)",
      "delivery": "Lieferoption (z.B. 'ab Werk', 'frei Haus', 'ab Lager', leer '' wenn nicht zutreffend)",
      "delivery_date": "YYYY-MM-DD (Lieferdatum für Bestellungen, Format YYYY-MM-DD, leer '' wenn nicht erwähnt)",
      "deadline": "YYYY-MM-DD (Frist für Angebote/Aufgaben, Format YYYY-MM-DD, leer '' wenn nicht zutreffend)",
      "status": "Status (z.B. 'offen', 'in Bearbeitung', 'erledigt', leer '' wenn nicht zutreffend)",
      "notes": "Zusätzliche Notizen oder Anforderungen (leerer String '' wenn keine)"
    }
  ],

  "next_meeting_date": "YYYY-MM-DD (Datum für Folgegespräch, falls erwähnt, sonst leerer String '')",
  "next_meeting_purpose": "Ziel des nächsten Treffens (falls erwähnt, sonst leerer String '')"
}

WICHTIGE REGELN FÜR DEN FIRMENNAMEN:
- Als Firmenname erkennen:
  1. Unternehmen mit Rechtsform (GmbH, AG, KG, OHG, e.K., e.V., Ltd., Inc., LLC, etc.)
  2. Wenn "Firma [Name]" gesagt wird -> [Name] ist der Firmenname
  3. Wenn "bei [Name]" im Kontext eines Firmenbesuchs -> [Name] könnte Firmenname sein
  4. Marken- oder Produktnamen wenn klar als Firma identifiziert
- Beispiele: "Müller GmbH", "Firma Jackson 5" -> "Jackson 5", "bei Schmidt" -> "Schmidt" (wenn Firmenkontext)
- NICHT als Firmenname erkennen: Reine Ortsnamen ("in Neustadt", "in Hamburg"), Straßen, PLZ
- Wenn der Firmenname nicht klar genannt wird -> "Nicht genannt"

WICHTIGE REGELN FÜR TRANSAKTIONEN:
- Jede Erwähnung eines Produkts, Angebots, einer Anfrage oder Aufgabe wird als eigener Transaction-Objekt im transactions-Array erfasst
- Typen bestimmen:
  * "bestellung" - Kunde bestellt konkret Produkte/Mengen ("Ich möchte 10 Tonnen bestellen")
  * "angebot" - Kunde möchte ein Angebot ("Könnten Sie mir ein Angebot machen für...")
  * "anfrage" - Kunde fragt nach Infos/Preisen/Verfügbarkeit ("Was kostet...", "Haben Sie...")
  * "aufgabe" - Interne Aufgabe für den Vertriebler ("Bitte erstellen Sie...", "Folgender Termin...")
- Bei mehreren Erwähnungen mehrere Transaction-Objekte erstellen
- quantity und unit nur bei bestellungen ausfüllen
- delivery_date nur bei bestellungen relevant
- deadline nur bei angebot/aufgabe relevant

WICHTIGE REGELN FÜR DATEN:
- Alle Daten müssen im korrekten Format sein (YYYY-MM-DD für Daten, Zahlen für Quantitäten)
- Transkripte wie "in Neustadt-Hambach" sind Ortsangaben, keine Firmennamen
- Bei "fünf weitere Kataloge" -> quantity: 5
- Bei "14. Oktober" oder "14.10." -> delivery_date: "2026-10-14"
- Bei "nächste Woche Mitte" -> berechne das tatsächliche Datum (z.B. Mitte nächste Woche = ca. +10 Tage)
- Bei "Dezember Woche 2" -> berechne das Datum (z.B. 2026-12-08 bis 2026-12-14)
- Bei "Freitag" -> berechne das tatsächliche Datum basierend auf dem aktuellen Datum
- Datumsfelder dürfen NIE Placeholder wie "tt.mm.jjjj" enthalten - immer echte YYYY-MM-DD Daten oder leere Strings
- Wenn kein Datum erwähnt -> leere String "" verwenden
- Aktuelles Datum: 2026-04-16 (nimm dieses als Referenz für relative Zeitangaben)
- satisfaction_score basierend auf Kontext (Worte wie "zufrieden" = hoher Score, "unglücklich" = niedriger Score)

Transkript: ${transcript}`
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      }),
    })

    if (!llmResponse.ok) {
      const errorText = await llmResponse.text()
      console.error('LLM API Error Response:', errorText)
      throw new Error(`LLM API Error: ${llmResponse.status} - ${errorText}`)
    }

    const llmData = await llmResponse.json()

    console.log('LLM Response:', JSON.stringify(llmData, null, 2))

    const content = llmData.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('LLM returned no content')
    }

    const structuredData = JSON.parse(content)

    return NextResponse.json({
      success: true,
      transcript,
      structured_data: structuredData
    })

  } catch (error: any) {
    console.error('❌ KI Fehler:', error)

    // Fallback zu Demo-Daten
    return NextResponse.json({
      success: true,
      transcript: 'Transkription fehlgeschlagen',
      structured_data: {
        report_type: 'besuchsbericht',
        company_name: 'Firma',
        contact_person: 'Kontakt',
        meeting_date: '2026-04-16',
        meeting_time: '',
        summary: 'Fehler bei KI-Verarbeitung',
        satisfaction_score: 5,
        satisfaction_notes: '',
        transactions: [],
        next_meeting_date: '',
        next_meeting_purpose: ''
      }
    })
  }
}
