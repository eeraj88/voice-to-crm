import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Typen für unsere Datenbank-Tabellen
export interface Database {
  public: {
    Tables: {
      reports: {
        Row: {
          id: string
          user_id: string
          audio_url: string | null
          raw_transcript: string
          structured_data: StructuredData
          status: 'draft' | 'synced' | 'error'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          audio_url?: string | null
          raw_transcript: string
          structured_data: StructuredData
          status?: 'draft' | 'synced' | 'error'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          audio_url?: string | null
          raw_transcript?: string
          structured_data?: StructuredData
          status?: 'draft' | 'synced' | 'error'
          created_at?: string
        }
      }
    }
  }
}

// Ein einzelner Vorgang (Transaktion) innerhalb eines Berichts
export interface Transaction {
  type: 'bestellung' | 'angebot' | 'anfrage' | 'aufgabe'
  item: string                    // Produktname oder Aufgabenbeschreibung
  quantity: string                // Menge (z.B. "5", "10-20", "ca. 100")
  unit: string                    // Einheit (Stk, Tonnen, Palette, etc.)
  delivery: string                // Lieferoption (z.B. "ab Werk", "frei Haus")
  delivery_date: string           // Lieferdatum (YYYY-MM-DD)
  deadline: string                // Frist (YYYY-MM-DD) - für Angebote/Aufgaben
  status: string                  // Status (offen, in Bearbeitung, erledigt)
  notes: string                   // Zusätzliche Notizen
}

// Das erwartete JSON-Format vom LLM
export interface StructuredData {
  report_type: 'besuchsbericht' | 'spesen' | 'aufgabe' | 'messbericht'
  company_name: string
  contact_person: string
  meeting_date: string
  meeting_time: string
  summary: string

  satisfaction_score: number
  satisfaction_notes: string

  // Vereinheitlichte Transaktionen - ersetzt orders und action_items
  transactions: Transaction[]

  next_meeting_date: string
  next_meeting_purpose: string
}

export type Report = Database['public']['Tables']['reports']['Row'] & {
  transcript: string // Alias für raw_transcript für Kompatibilität mit Komponenten
}
export type ReportInsert = Database['public']['Tables']['reports']['Insert']
