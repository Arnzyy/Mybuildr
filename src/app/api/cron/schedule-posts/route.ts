import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { fillPostQueue } from '@/lib/posting/scheduler'
import { Company } from '@/lib/supabase/types'

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  try {
    // Get all companies with posting enabled (Full Package)
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .eq('tier', 'full')
      .eq('posting_enabled', true)
      .eq('is_active', true)

    if (error || !companies) {
      return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 })
    }

    const results: { companyId: string; scheduled: number }[] = []

    for (const company of companies as Company[]) {
      const scheduled = await fillPostQueue(company)
      results.push({ companyId: company.id, scheduled })
    }

    return NextResponse.json({
      success: true,
      companiesProcessed: companies.length,
      results,
    })
  } catch (error) {
    console.error('Cron schedule-posts error:', error)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}
