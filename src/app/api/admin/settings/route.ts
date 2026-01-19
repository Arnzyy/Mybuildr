import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateCompany, getCompanyForUser } from '@/lib/supabase/queries'

export async function PUT(request: NextRequest) {
  try {
    // Verify auth
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { companyId, updates } = await request.json()

    // Verify user owns this company
    const company = await getCompanyForUser(user.email!)
    if (!company || company.id !== companyId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update company
    const { error } = await updateCompany(companyId, updates)

    if (error) {
      console.error('Failed to update company:', error)
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
