import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const company = await getCompanyForUser(user.email!)
    if (!company) {
      return NextResponse.json({ error: 'No company found' }, { status: 404 })
    }

    const { platform } = await request.json()

    const admin = createAdminClient()

    // Update token to disconnected
    await admin
      .from('social_tokens')
      .update({
        is_connected: false,
        access_token: null,
        refresh_token: null,
        updated_at: new Date().toISOString(),
      })
      .eq('company_id', company.id)
      .eq('platform', platform)

    // Check if any platforms are still connected
    const { data: remaining } = await admin
      .from('social_tokens')
      .select('id')
      .eq('company_id', company.id)
      .eq('is_connected', true)

    // If no platforms connected, disable posting
    if (!remaining || remaining.length === 0) {
      await admin
        .from('companies')
        .update({ posting_enabled: false })
        .eq('id', company.id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Disconnect error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
