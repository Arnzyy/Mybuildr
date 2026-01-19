import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PUT(request: NextRequest) {
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

    const { projectIds } = await request.json()

    if (!Array.isArray(projectIds)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Update each project's display_order
    for (let i = 0; i < projectIds.length; i++) {
      await admin
        .from('projects')
        .update({ display_order: i })
        .eq('id', projectIds[i])
        .eq('company_id', company.id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
