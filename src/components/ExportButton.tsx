'use client'

import { useState } from 'react'

interface Report {
  id: string
  created_at: string
  status: string
  transcript: string
  structured_data: any
}

interface ExportButtonProps {
  reports: Report[]
}

export default function ExportButton({ reports }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false)

  const exportToCSV = (format: 'sheets' | 'excel') => {
    setExporting(true)

    try {
      let csvData: any[] = []

      if (format === 'sheets') {
        // Kompakte Google Sheets Format
        csvData = reports.map((report) => {
          const data = report.structured_data || report
          const orders = data.orders || []
          const actions = data.action_items || []

          return {
            'ID': report.id,
            'Datum': new Date(report.created_at).toLocaleDateString('de-DE'),
            'Typ': data.report_type || '',
            'Firma': data.company_name || '',
            'Kontaktperson': data.contact_person || '',
            'Meeting Datum': data.meeting_date || '',
            'Zusammenfassung': data.summary || '',
            'Zufriedenheit (1-10)': data.satisfaction_score || '',
            'Zufriedenheit Details': data.satisfaction_notes || '',
            'Produkte': orders.map((o: any) => `${o.product} (${o.quantity}x)`).join('; '),
            'Lieferdaten': orders.map((o: any) => o.delivery_date).join('; '),
            'Aufgaben': actions.map((a: any) => a.task).join('; '),
            'Fristen': actions.map((a: any) => a.due_date).join('; '),
            'Dringlichkeit': actions.map((a: any) => a.urgency).join('; '),
            'Status': report.status || 'draft'
          }
        })
      } else {
        // Detailliertes Excel Format
        reports.forEach((report) => {
          const data = report.structured_data || report
          const orders = data.orders || []
          const actions = data.action_items || []

          if (orders.length > 0) {
            orders.forEach((order: any, idx: number) => {
              csvData.push({
                'ID': report.id,
                'Datum': new Date(report.created_at).toLocaleDateString('de-DE'),
                'Typ': data.report_type || '',
                'Firma': data.company_name || '',
                'Kontaktperson': data.contact_person || '',
                'Produkt': order.product || '',
                'Menge': order.quantity || '',
                'Lieferdatum': order.delivery_date || '',
                'Produkt-Notizen': order.notes || '',
                'Zusammenfassung': idx === 0 ? (data.summary || '') : '',
                'Aufgaben': idx === 0 ? (actions.map((a: any) => a.task).join('; ') || '') : '',
                'Fristen': idx === 0 ? (actions.map((a: any) => a.due_date).join('; ') || '') : '',
                'Zufriedenheit': data.satisfaction_score || '',
                'Status': report.status || 'draft'
              })
            })
          } else {
            csvData.push({
              'ID': report.id,
              'Datum': new Date(report.created_at).toLocaleDateString('de-DE'),
              'Typ': data.report_type || '',
              'Firma': data.company_name || '',
              'Kontaktperson': data.contact_person || '',
              'Produkt': '',
              'Menge': '',
              'Lieferdatum': '',
              'Zusammenfassung': data.summary || '',
              'Aufgaben': actions.map((a: any) => a.task).join('; ') || '',
              'Zufriedenheit': data.satisfaction_score || '',
              'Status': report.status || 'draft'
            })
          }
        })
      }

      // CSV erstellen
      if (csvData.length > 0) {
        const headers = Object.keys(csvData[0])
        const csvContent = [
          headers.join(';'),
          ...csvData.map((row) => headers.map((header) => {
            const value = row[header]
            // Strings mit Anführungszeichen umschließen, wenn sie Semikolons enthalten
            if (typeof value === 'string' && (value.includes(';') || value.includes('\n') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value || ''
          }).join(';'))
        ].join('\n')

        // Download
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)

        link.setAttribute('href', url)
        link.setAttribute('download', `voyc-export-${format}-${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error('Export Error:', error)
      alert('Export fehlgeschlagen')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => exportToCSV('sheets')}
        disabled={exporting || reports.length === 0}
        className="px-4 py-2 glass-card text-emerald-700 dark:text-emerald-300 font-medium rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm flex items-center gap-2"
      >
        {exporting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-500 border-t-transparent"></div>
            Exportiere...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Google Sheets
          </>
        )}
      </button>

      <button
        onClick={() => exportToCSV('excel')}
        disabled={exporting || reports.length === 0}
        className="px-4 py-2 glass-card text-emerald-700 dark:text-emerald-300 font-medium rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm flex items-center gap-2"
      >
        {exporting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-500 border-t-transparent"></div>
            Exportiere...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Excel
          </>
        )}
      </button>
    </div>
  )
}
