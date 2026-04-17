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
  report_type: string
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
    const body = await request.json()
    const { reports, format } = body

    if (format === 'sheets') {
      // Google Sheets Format - kompakt, eine Row pro Report
      const sheetsData = reports.map((report: any) => {
        const data = report.structured_data || report
        const transactions = data.transactions || []

        // Hauptzeile
        const row = {
          'ID': report.id || report.report_id || '',
          'Datum': report.created_at || new Date().toISOString(),
          'Typ': data.report_type || '',
          'Firma': data.company_name || '',
          'Kontaktperson': data.contact_person || '',
          'Meeting Datum': data.meeting_date || '',
          'Meeting Uhrzeit': data.meeting_time || '',
          'Zusammenfassung': data.summary || '',
          'Zufriedenheit (1-10)': data.satisfaction_score || '',
          'Zufriedenheit Details': data.satisfaction_notes || '',
          'Vorgänge': transactions.map((t: Transaction) =>
            `[${t.type}] ${t.item}${t.quantity ? ` (${t.quantity} ${t.unit || ''})` : ''}`
          ).join('; '),
          'Nächstes Meeting': data.next_meeting_date || '',
          'Ziel Folgetermin': data.next_meeting_purpose || '',
          'Status': report.status || 'draft',
          'Transkript': report.transcript || ''
        }
        return row
      })

      return NextResponse.json({
        success: true,
        format: 'sheets',
        data: sheetsData,
        headers: Object.keys(sheetsData[0] || {})
      })
    }

    if (format === 'excel') {
      // Excel Format mit detaillierten Rows - eine Row pro Transaktion
      const excelData: any[] = []

      reports.forEach((report: any) => {
        const data = report.structured_data || report
        const transactions = data.transactions || []

        // Basis-Daten für alle Rows
        const baseRow = {
          'ID': report.id || report.report_id || '',
          'Datum': report.created_at || new Date().toISOString(),
          'Typ': data.report_type || '',
          'Firma': data.company_name || '',
          'Kontaktperson': data.contact_person || '',
          'Meeting Datum': data.meeting_date || '',
          'Meeting Uhrzeit': data.meeting_time || '',
          'Zusammenfassung': data.summary || '',
          'Zufriedenheit (1-10)': data.satisfaction_score || '',
          'Zufriedenheit Details': data.satisfaction_notes || '',
          'Nächstes Meeting': data.next_meeting_date || '',
          'Ziel Folgetermin': data.next_meeting_purpose || '',
          'Status': report.status || 'draft',
          'Transkript': report.transcript || ''
        }

        // Wenn keine Transaktionen vorhanden, erstelle eine leere Row
        if (transactions.length === 0) {
          excelData.push({
            ...baseRow,
            'Vorgang Typ': '',
            'Artikel/Produkt/Aufgabe': '',
            'Menge': '',
            'Einheit': '',
            'Lieferoption': '',
            'Lieferdatum': '',
            'Frist': '',
            'Transaktions-Status': '',
            'Notizen': ''
          })
        } else {
          // Eine Row pro Transaktion
          transactions.forEach((tx: Transaction) => {
            excelData.push({
              ...baseRow,
              'Vorgang Typ': tx.type || '',
              'Artikel/Produkt/Aufgabe': tx.item || '',
              'Menge': tx.quantity || '',
              'Einheit': tx.unit || '',
              'Lieferoption': tx.delivery || '',
              'Lieferdatum': tx.delivery_date || '',
              'Frist': tx.deadline || '',
              'Transaktions-Status': tx.status || '',
              'Notizen': tx.notes || ''
            })
          })
        }
      })

      return NextResponse.json({
        success: true,
        format: 'excel',
        data: excelData,
        headers: Object.keys(excelData[0] || {}),
        rowCount: excelData.length
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Ungültiges Format. Verwende "sheets" oder "excel"'
    }, { status: 400 })

  } catch (error: any) {
    console.error('Export Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
