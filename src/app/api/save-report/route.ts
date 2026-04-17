import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Berichte aus der Datenbank laden
    const { data: reports, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading reports:', error)
      return NextResponse.json({
        success: true,
        reports: [] // Return empty array on error for now
      })
    }

    // Füge transcript Feld hinzu (Alias für raw_transcript)
    const reportsWithTranscript = reports?.map(report => ({
      ...report,
      transcript: report.raw_transcript
    })) || []

    return NextResponse.json({
      success: true,
      reports: reportsWithTranscript
    })
  } catch (error) {
    console.error('Error in GET /api/save-report:', error)
    return NextResponse.json({
      success: true,
      reports: []
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { transcript, structured_data } = body

    // Demo-Bericht speichern (später in echte Datenbank)
    const report = {
      id: 'demo-' + Date.now(),
      created_at: new Date().toISOString(),
      status: 'draft',
      transcript: transcript, // transcript direkt für Kompatibilität
      raw_transcript: transcript,
      structured_data: structured_data,
      user_id: 'demo-user',
      audio_url: null
    }

    // In echte Datenbank speichern (wenn Supabase konfiguriert)
    try {
      const { data, error } = await supabase
        .from('reports')
        .insert({
          user_id: 'demo-user', // Später durch echte User-ID ersetzen
          raw_transcript: transcript,
          structured_data: structured_data,
          status: 'draft'
        })
        .select()
        .single()

      if (!error && data) {
        return NextResponse.json({
          success: true,
          report: {
            ...data,
            transcript: data.raw_transcript // Füge transcript hinzu
          }
        })
      }
    } catch (dbError) {
      console.log('Database save failed, returning demo report:', dbError)
    }

    return NextResponse.json({
      success: true,
      report
    })
  } catch (error: any) {
    console.error('Error in POST /api/save-report:', error)
    return NextResponse.json({
      success: true,
      report: { id: 'demo-' + Date.now() }
    })
  }
}
