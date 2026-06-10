import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Tally Webhook Types
interface TallyField {
  id: string
  type: string
  key: string
  label: string
  value: any
}

interface TallySubmission {
  submissionId: string
  formId: string
  formName: string
  data: TallyField[]
  createdAt: string
}

// Supabase Setup für Server-Side (mit Service Role Key für User-Erstellung)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Hilfsfunktion: Wert aus Tally-Feldern extrahieren
function getFieldValue(fields: TallyField[], key: string): any {
  const field = fields.find(f => f.key === key)
  return field?.value ?? null
}

// Tally API: Bestätigung senden (optional)
async function notifyTallySubmission(submissionId: string) {
  try {
    // Tally API Aufruf um Bestätigung zu senden
    await fetch(`https://api.tally.so/submissions/${submissionId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.TALLY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'processed' })
    })
  } catch (error) {
    console.error('Tally notification failed:', error)
  }
}

// Make Webhook: Neuer Lead-Benachrichtigung
async function notifyMakeWebhook(userData: any) {
  try {
    const webhookUrl = process.env.MAKE_WEBHOOK_URL
    if (!webhookUrl) return

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'new_lead',
        source: 'tally_form',
        timestamp: new Date().toISOString(),
        data: userData
      })
    })
  } catch (error) {
    console.error('Make webhook notification failed:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: TallySubmission = await request.json()

    console.log('Tally Webhook received:', body.submissionId)

    // Daten aus dem Formular extrahieren
    const { data } = body

    const email = getFieldValue(data, 'email')
    const firstName = getFieldValue(data, 'firstName') || getFieldValue(data, 'vorname')
    const lastName = getFieldValue(data, 'lastName') || getFieldValue(data, 'nachname')
    const company = getFieldValue(data, 'company') || getFieldValue(data, 'firma')
    const phone = getFieldValue(data, 'phone') || getFieldValue(data, 'telefon')
    const message = getFieldValue(data, 'message') || getFieldValue(data, 'nachricht')
    const consent = getFieldValue(data, 'consent') || getFieldValue(data, 'datenschutz')

    // Validierung
    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email is required'
      }, { status: 400 })
    }

    // Prüfen, ob User bereits existiert
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    let userId: string

    if (existingUser) {
      userId = existingUser.id
      console.log('User already exists:', userId)
    } else {
      // Neuen User in Supabase Auth erstellen
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          company,
          phone
        }
      })

      if (authError || !authData.user) {
        console.error('Auth user creation failed:', authError)
        return NextResponse.json({
          success: false,
          error: 'Failed to create user'
        }, { status: 500 })
      }

      userId = authData.user.id

      // User-Metadaten in users-Tabelle speichern (falls vorhanden)
      try {
        await supabaseAdmin
          .from('users')
          .insert({
            id: userId,
            email,
            first_name: firstName,
            last_name: lastName,
            company,
            phone,
            created_at: new Date().toISOString()
          })
      } catch (dbError) {
        console.log('Users table insert failed (might not exist yet):', dbError)
      }

      console.log('New user created:', userId)
    }

    // Lead-Informationen für Make.com
    const leadData = {
      userId,
      email,
      firstName,
      lastName,
      company,
      phone,
      message,
      submissionId: body.submissionId,
      formId: body.formId,
      consent
    }

    // An Make.com senden
    await notifyMakeWebhook(leadData)

    // Optional: Tally Bestätigung senden
    if (process.env.TALLY_API_KEY) {
      await notifyTallySubmission(body.submissionId)
    }

    return NextResponse.json({
      success: true,
      userId,
      message: 'User created/updated successfully'
    })

  } catch (error: any) {
    console.error('Tally webhook error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// GET für Health Check
export async function GET() {
  return NextResponse.json({
    status: 'online',
    endpoint: 'tally-webhook',
    version: '1.0'
  })
}
