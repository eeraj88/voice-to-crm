import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reportId, transcript, structuredData } = body

    console.log('🔗 Sende an Make.com...')

    // Make.com Webhook URL
    const webhookUrl = process.env.MAKE_WEBHOOK_URL

    if (!webhookUrl) {
      return NextResponse.json({
        success: false,
        error: 'Keine Webhook URL konfiguriert'
      })
    }

    console.log('Webhook URL:', webhookUrl)

    // Transformiere in mehrere Rows (eine pro Transaktion)
    const rows = []

    // Basis-Daten für alle Rows
    const baseData = {
      report_id: reportId,
      report_type: structuredData.report_type,
      company_name: structuredData.company_name,
      contact_person: structuredData.contact_person,
      meeting_date: structuredData.meeting_date,
      meeting_time: structuredData.meeting_time,
      summary: structuredData.summary,
      satisfaction_score: structuredData.satisfaction_score,
      satisfaction_notes: structuredData.satisfaction_notes,
      next_meeting_date: structuredData.next_meeting_date,
      next_meeting_purpose: structuredData.next_meeting_purpose,
      transcript: transcript,
      timestamp: new Date().toISOString(),
    }

    // Wenn keine Transaktionen vorhanden, erstelle mindestens eine leere Row
    if (!structuredData.transactions || structuredData.transactions.length === 0) {
      rows.push({
        ...baseData,
        row_type: 'header',
        transaction_type: '',
        item: '',
        quantity: '',
        unit: '',
        delivery: '',
        delivery_date: '',
        deadline: '',
        status: '',
        notes: '',
      })
    } else {
      // Eine Row pro Transaktion
      for (let i = 0; i < structuredData.transactions.length; i++) {
        const tx = structuredData.transactions[i]
        rows.push({
          ...baseData,
          row_type: i === 0 ? 'header' : 'transaction', // Erste Row enthält alle Infos
          transaction_type: tx.type,
          item: tx.item,
          quantity: tx.quantity,
          unit: tx.unit,
          delivery: tx.delivery,
          delivery_date: tx.delivery_date,
          deadline: tx.deadline,
          status: tx.status,
          notes: tx.notes,
        })
      }
    }

    console.log('Rows für Google Sheets:', JSON.stringify(rows, null, 2))

    // Sende jede Row einzeln an Make.com
    const results = []
    for (const row of rows) {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(row),
      })

      const responseText = await response.text()
      results.push({
        status: response.status,
        response: responseText,
      })

      console.log('Make.com Response Status:', response.status)
      console.log('Make.com Response:', responseText)
    }

    return NextResponse.json({
      success: true,
      message: `${rows.length} Row(s) an Make.com gesendet`,
      rows_sent: rows.length,
      results: results,
    })
  } catch (error: any) {
    console.error('❌ Webhook Fehler:', error)
    return NextResponse.json(
      {
        error: 'Fehler beim Senden an Make.com',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
