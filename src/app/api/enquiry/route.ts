import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { companyId, name, email, phone, message } = await request.json()

    if (!companyId || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('enquiries')
      .insert({
        company_id: companyId,
        name,
        email,
        phone,
        message,
        source: 'website',
      })

    if (error) {
      console.error('Failed to save enquiry:', error)
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
    }

    // TODO: Send notification email to company

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Enquiry error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
