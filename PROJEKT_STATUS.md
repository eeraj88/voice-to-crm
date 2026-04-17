# VoyC - Projektstatus & Dokumentation

**Stand:** 2026-04-16
**Version:** 1.0
**Status:** Active Development

---

## Inhaltsverzeichnis

1. [Projektübersicht](#projektübersicht)
2. [Tech Stack](#tech-stack)
3. [Architektur](#architektur)
4. [Implementierte Features](#implementierte-features)
5. [Datenmodelle](#datenmodelle)
6. [API Endpoints](#api-endpoints)
7. [Frontend Komponenten](#frontend-komponenten)
8. [Externe Integrationen](#externe-integrationen)
9. [Konfiguration](#konfiguration)
10. [TODO & Offene Punkte](#todo--offene-punkte)

---

## Projektübersicht

**VoyC** ist eine Voice-to-CRM Anwendung für Außendienstmitarbeiter.

### Funktionsweise
1. Außendienstmitarbeiter nimmt nach Kundenbesuch eine Sprachnachricht auf
2. AI (Groq Whisper) transkribiert die Audioaufnahme
3. AI (Groq Llama 3.3-70b) extrahiert strukturierte Daten
4. Daten werden im Dashboard zur Bearbeitung angezeigt
5. Über Make.com Webhook werden die Daten in Google Sheets exportiert

### Zielsetzung
- Zeitersparnis bei der Berichterstattung
- Standardisierte Kundendaten für ERP-Systeme
- Flexible Erfassung von Bestellungen, Angeboten, Anfragen und Aufgaben

---

## Tech Stack

### Frontend
- **Framework:** Next.js 16.2.4 (App Router)
- **UI:** React 19
- **Styling:** Tailwind CSS
- **TypeScript:** Ja
- **Font:** Plus Jakarta Sans (Google Fonts)
- **Design:** Glassmorphism mit Emerald/Teal Gradients

### Backend
- **API:** Next.js API Routes
- **Database:** Supabase (PostgreSQL mit RLS)
- **Auth:** Supabase Auth (Email/Password)

### AI Services
- **Transcription:** Groq Whisper API (whisper-large-v3)
- **Extraction:** Groq Llama 3.3-70b-versatile (JSON mode)

### Integrationen
- **Google Sheets:** Über Make.com Webhook
- **Automation:** Make.com Scenario

---

## Architektur

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Landing Page │  │   Login      │  │  Dashboard   │      │
│  │  (/)         │  │   (/login)   │  │(/dashboard)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                            │                                 │
│                     ┌──────▼──────┐                         │
│                     │AudioRecorder│                         │
│                     │  Component  │                         │
│                     └──────┬──────┘                         │
└────────────────────────────┼────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     API LAYER                                │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ /api/process-audio│  │ /api/save-report │                │
│  │  (Whisper + LLM) │  │ (DB Speichern)   │                │
│  └─────────┬─────────┘  └────────┬─────────┘                │
│            │                     │                           │
│            ▼                     ▼                           │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ /api/send-webhook│  │  /api/export    │                │
│  │ (→ Make.com)    │  │ (Excel/Sheets)   │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐              │
│  │   Groq   │  │ Supabase │  │  Make.com    │              │
│  │   AI     │  │   DB     │  │  → Sheets    │              │
│  └──────────┘  └──────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementierte Features

### ✅ Authentication
- [x] Login mit Email/Passwort
- [x] Supabase Auth Integration
- [x] Geschützte Routes
- [x] Auth Context Provider

### ✅ Audio Recording
- [x] Browser-native MediaRecorder API
- [x] Visual feedback during recording
- [x] Timer (MM:SS format)
- [x] Audio playback after recording
- [x] Blob upload to API

### ✅ AI Processing
- [x] Groq Whisper Transcription (whisper-large-v3)
- [x] Groq Llama 3.3-70b Data Extraction
- [x] JSON Structured Output
- [x] Company Name Recognition (mit Rechtsformen)
- [x] Date Parsing (relative + absolute)
- [x] Satisfaction Score Analysis

### ✅ Transaction System (NEU!)
- [x] Flexibles Transaktions-Modell
- [x] 4 Typen: bestellung, angebot, anfrage, aufgabe
- [x] Unbegrenzte Transaktionen pro Bericht
- [x] Typ-Mixing (z.B. 2 Bestellungen + 1 Angebot)
- [x] Formular zum Editieren/Hinzufügen/Löschen

### ✅ Dashboard
- [x] Aufnahme-Interface
- [x] Editierbare Vorschau
- [x] Historie-Ansicht
- [x] Export Buttons (Excel/Sheets)
- [x] Theme Toggle (Dark/Light)

### ✅ Export
- [x] Google Sheets Format (kompakt)
- [x] Excel Format (detailliert, 1 Row pro Transaktion)
- [x] JSON Export möglich

### ✅ Google Sheets Integration
- [x] Webhook Endpoint für Make.com
- [x] Multiple Rows pro Bericht (1 pro Transaktion)
- [x] Template für korrekte Spaltenstruktur

### ✅ UI/UX
- [x] Premium Glassmorphism Design
- [x] Plus Jakarta Sans Font
- [x] Emerald/Teal Color Scheme
- [x] Dark/Light Mode
- [x] Responsive Design
- [x] Gradient Background Orbs
- [x] Loading States
- [x] Error Handling

---

## Datenmodelle

### StructuredData
```typescript
interface StructuredData {
  // Basis-Daten
  report_type: 'besuchsbericht' | 'spesen' | 'aufgabe' | 'messbericht'
  company_name: string        // Firmenname mit Rechtsform
  contact_person: string      // Vor- und Nachname
  meeting_date: string        // YYYY-MM-DD
  meeting_time: string        // HH:MM oder ''
  summary: string            // 2-3 Sätze Zusammenfassung

  // Zufriedenheit
  satisfaction_score: number // 1-10
  satisfaction_notes: string // Details zur Zufriedenheit

  // Transaktionen (NEU!)
  transactions: Transaction[]

  // Folgegespräch
  next_meeting_date: string   // YYYY-MM-DD oder ''
  next_meeting_purpose: string // Ziel oder ''
}
```

### Transaction (NEU!)
```typescript
interface Transaction {
  type: 'bestellung' | 'angebot' | 'anfrage' | 'aufgabe'
  item: string              // Produktname oder Aufgabenbeschreibung
  quantity: string          // "5", "10-20", "ca. 100"
  unit: string              // "Stk", "Tonnen", "Palette"
  delivery: string          // "ab Werk", "frei Haus", "ab Lager"
  delivery_date: string     // YYYY-MM-DD (für Bestellungen)
  deadline: string          // YYYY-MM-DD (für Angebote/Aufgaben)
  status: string            // "offen", "in Bearbeitung", "erledigt"
  notes: string             // Zusätzliche Notizen
}
```

---

## API Endpoints

### POST /api/process-audio
Audio aufnehmen und von AI verarbeiten lassen.

**Request:**
```typescript
FormData {
  audio: File  // Audio Blob (webm, wav, mp4, etc.)
}
```

**Response:**
```json
{
  "success": true,
  "transcript": "...",
  "structured_data": {
    "report_type": "besuchsbericht",
    "company_name": "Müller GmbH",
    "transactions": [...],
    ...
  }
}
```

**Funktionsweise:**
1. Empfängt Audio-File
2. Sendet an Groq Whisper für Transkription
3. Sendet Transkript an Groq LLM für Extraktion
4. Returned strukturierte Daten

### GET /api/save-report
Alle Berichte aus der Datenbank laden.

**Response:**
```json
{
  "success": true,
  "reports": [
    {
      "id": "...",
      "created_at": "...",
      "transcript": "...",
      "structured_data": {...},
      "status": "draft"
    }
  ]
}
```

### POST /api/save-report
Neuen Bericht in der Datenbank speichern.

**Request:**
```json
{
  "transcript": "...",
  "structured_data": {...}
}
```

**Response:**
```json
{
  "success": true,
  "report": {
    "id": "demo-...",
    "transcript": "...",
    ...
  }
}
```

### POST /api/send-webhook
Bericht an Make.com Webhook senden.

**Request:**
```json
{
  "reportId": "...",
  "transcript": "...",
  "structuredData": {...}
}
```

**Funktionsweise:**
- Erstellt **eine Row pro Transaktion**
- Sendet jede Row einzeln an Make.com
- `row_type = "header"` bei erster Transaktion
- `row_type = "transaction"` bei folgenden

**Pro Bericht mit 2 Transaktionen → 2 Webhook Calls:**
```json
// Row 1
{
  "report_id": "xxx",
  "row_type": "header",
  "company_name": "Müller GmbH",
  "transaction_type": "bestellung",
  "item": "Katzenfutter",
  "quantity": "5",
  ...
}

// Row 2
{
  "report_id": "xxx",
  "row_type": "transaction",
  "company_name": "Müller GmbH",
  "transaction_type": "angebot",
  "item": "Produkt 4",
  ...
}
```

### POST /api/export
Export für Excel/Google Sheets.

**Request:**
```json
{
  "reports": [...],
  "format": "sheets" | "excel"
}
```

**Response:**
```json
{
  "success": true,
  "format": "excel",
  "data": [...],
  "headers": [...],
  "rowCount": 5
}
```

---

## Frontend Komponenten

### AudioRecorder.tsx
Hauptkomponente für Aufnahme und Bearbeitung.

**Props:**
```typescript
interface AudioRecorderProps {
  onReportSaved?: () => void
}
```

**Features:**
- Aufnahme mit Visual Feedback
- Timer Anzeige
- Audio Playback
- Editierbare Formularfelder
- Transaktions-Management (Add/Remove/Edit)
- Speichern & Senden Buttons

### ExportButton.tsx
Export Komponente für Reports.

**Features:**
- Export als CSV (Excel kompatibel)
- Export für Google Sheets (kompakt)

### ThemeContext.tsx
Dark/Light Mode Toggle.

### AuthContext.tsx
Authentication Provider.

---

## Externe Integrationen

### Groq AI
**API Key:** `.env.local` → `GROQ_API_KEY`

**Used Models:**
- Whisper: `whisper-large-v3`
- LLM: `llama-3.3-70b-versatile`

**Rate Limits:**
- Free Tier: 30 requests/min
- Paid: Mehr requests

### Supabase
**Config:** `.env.local`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Tables:**
```sql
reports (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  audio_url TEXT,
  raw_transcript TEXT NOT NULL,
  structured_data JSONB NOT NULL,
  status TEXT CHECK (status IN ('draft', 'synced', 'error')),
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

### Make.com
**Webhook URL:** `.env.local` → `MAKE_WEBHOOK_URL`

**Scenario:**
1. Webhook receives data
2. Parse JSON
3. Google Sheets → Add a Row

**Google Sheets Structure (NEU):**
| Spalte | Mapping |
|--------|---------|
| A | Report ID → `report_id` |
| B | Datum → `timestamp` |
| C | Typ → `report_type` |
| D | Firma → `company_name` |
| E | Kontaktperson → `contact_person` |
| F | Meeting Datum → `meeting_date` |
| G | Meeting Uhrzeit → `meeting_time` |
| H | Zusammenfassung → `summary` |
| I | Zufriedenheit → `satisfaction_score` |
| J | Zufriedenheit Details → `satisfaction_notes` |
| K | Vorgang Typ → `transaction_type` ⬅️ NEU |
| L | Artikel/Produkt → `item` ⬅️ NEU |
| M | Menge → `quantity` ⬅️ NEU |
| N | Einheit → `unit` ⬅️ NEU |
| O | Lieferoption → `delivery` ⬅️ NEU |
| P | Lieferdatum → `delivery_date` ⬅️ NEU |
| Q | Frist → `deadline` ⬅️ NEU |
| R | Status → `status` ⬅️ NEU |
| S | Notizen → `notes` ⬅️ NEU |
| T | Nächstes Meeting → `next_meeting_date` |
| U | Ziel → `next_meeting_purpose` |
| V | Report Status → `status` |
| W | Transkript → `transcript` |

---

## Konfiguration

### .env.local
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Groq AI
GROQ_API_KEY=your-groq-api-key

# Make.com
MAKE_WEBHOOK_URL=your-make-webhook-url
```

### Datenbank Schema
```sql
-- Tabelle: reports
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  audio_url TEXT,
  raw_transcript TEXT NOT NULL,
  structured_data JSONB NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'synced', 'error')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports"
  ON reports FOR UPDATE
  USING (auth.uid() = user_id);
```

---

## File Structure

```
voice-to-crm/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Landing Page
│   │   ├── login/
│   │   │   └── page.tsx            # Login Page
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Dashboard
│   │   └── api/
│   │       ├── process-audio/
│   │       │   └── route.ts        # AI Processing
│   │       ├── save-report/
│   │       │   └── route.ts        # DB Save/Load
│   │       ├── send-webhook/
│   │       │   └── route.ts        # Make.com Integration
│   │       └── export/
│   │           └── route.ts        # Export Functions
│   ├── components/
│   │   ├── AudioRecorder.tsx       # Hauptkomponente
│   │   ├── ExportButton.tsx        # Export
│   │   └── ...
│   ├── contexts/
│   │   ├── AuthContext.tsx         # Authentication
│   │   └── ThemeContext.tsx        # Dark/Light Mode
│   ├── lib/
│   │   └── supabase.ts             # DB Client + Types
│   └── app/
│       └── globals.css             # Styles
├── templates/
│   ├── VoyC_Sheets_Import.csv      # Google Sheets Template
│   └── ...
├── PROJEKT_STATUS.md               # DIESE DATEI
└── package.json
```

---

## TODO & Offene Punkte

### 🔴 High Priority
- [ ] Supabase RLS Policies testen
- [ ] Make.com Scenario mit neuen Feldern testen
- [ ] Production Deployment vorbereiten

### 🟡 Medium Priority
- [ ] User Settings (API Keys verwalten)
- [ ] Berichte editieren nach dem Speichern
- [ ] Berichte löschen
- [ ] Audio files in Supabase Storage speichern

### 🟢 Low Priority
- [ ] Multi-language Support
- [ ] Mobile App (React Native)
- [ ] Offline Mode
- [ ] Analytics

---

## Bekannte Issues

### Fixed ✅
- [x] CSS Import Reihenfolge (Google Fonts)
- [x] Missing Link Import in Dashboard
- [x] Company Name Recognition (Jetzt mit Rechtsformen)
- [x] Date Fields empty (tt.mm.jjjj placeholders)
- [x] Transaction Data Structure (Jetzt flexibel mit Typen)

### Open 🔧
- [ ] Make.com Webhook URL muss manuell konfiguriert werden
- [ ] Demo-Mode läuft ohne API Key
- [ ] Database Save funktioniert nur mit echtem Supabase Setup

---

## Nützliche Commands

```bash
# Development
npm run dev

# Build
npm run build

# Production Start
npm start

# TypeScript Check
npx tsc --noEmit

# Lint
npm run lint
```

---

## Support & Kontakt

Bei Fragen oder Problemen:
1. Dieses Dokument lesen
2. API Logs in der Browser Console checken
3. Supabase Dashboard für DB Logs
4. Make.com Scenario History

---

**Letzte Aktualisierung:** 2026-04-16
**Nächstes Update:** Nach Make.com Testing
