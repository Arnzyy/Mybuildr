/**
 * Create Full Package accounts
 * Run with: node scripts/create-full-accounts.js
 */

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://qzvcawubaoagjitkvlix.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dmNhd3ViYW9hZ2ppdGt2bGl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODc5MDU0OCwiZXhwIjoyMDg0MzY2NTQ4fQ.5enpf8QVrxDJMI-ZiDr4AjIwh56PSmLOmzJJ6uRVniA'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const PASSWORD = 'Password'

const ACCOUNTS = [
  {
    email: 'topmarks.plumbingheating@gmail.com',
    name: 'Top Marks Plumbing',
    slug: 'top-marks-plumbing',
    phone: '07852 510113',
    trade_type: 'plumber',
    template: 'tradesman',
  },
  {
    email: 'awelectrical500@gmail.com',
    name: 'A&W Electrical LTD',
    slug: 'aw-electrical',
    phone: '07789852453',
    trade_type: 'electrician',
    template: 'tradesman',
  },
  {
    email: 'info@prselectrical.net',
    name: 'PRS Electrical Ltd',
    slug: 'prs-electrical',
    phone: '07702259424',
    trade_type: 'electrician',
    template: 'tradesman',
  },
  {
    email: 'chewvalleycarpentry@gmail.com',
    name: 'Chew Valley Carpentry',
    slug: 'chew-valley-carpentry',
    phone: '07917802037',
    trade_type: 'carpenter',
    template: 'tradesman',
  },
]

async function createAccount(account) {
  const label = `${account.name} (${account.email})`
  console.log(`\n--- ${label} ---`)

  // 1. Create or update auth user with password
  console.log('  Creating auth user...')

  const { data: { users } } = await supabase.auth.admin.listUsers()
  const existingUser = users.find(u => u.email === account.email)

  if (existingUser) {
    console.log('  Auth user exists, updating password...')
    const { error } = await supabase.auth.admin.updateUserById(existingUser.id, {
      password: PASSWORD,
      email_confirm: true,
    })
    if (error) {
      console.error(`  ERROR: ${error.message}`)
      return false
    }
    console.log('  Password updated.')
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: account.email,
      password: PASSWORD,
      email_confirm: true,
    })
    if (error) {
      console.error(`  ERROR: ${error.message}`)
      return false
    }
    console.log(`  Auth user created (id: ${data.user.id})`)
  }

  // 2. Check if company already exists
  const { data: existing } = await supabase
    .from('companies')
    .select('id')
    .eq('email', account.email)
    .single()

  if (existing) {
    console.log('  Company already exists, updating to full tier...')
    const { error } = await supabase
      .from('companies')
      .update({ tier: 'full', tier_updated_at: new Date().toISOString() })
      .eq('email', account.email)
    if (error) {
      console.error(`  ERROR: ${error.message}`)
      return false
    }
    console.log('  Tier updated to full.')
    return true
  }

  // 3. Insert company record
  console.log('  Creating company record...')
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .insert({
      slug: account.slug,
      name: account.name,
      email: account.email,
      phone: account.phone,
      trade_type: account.trade_type,
      template: account.template,
      primary_color: '#1E3A5F',
      secondary_color: '#F59E0B',
      tier: 'full',
      tier_updated_at: new Date().toISOString(),
      is_active: true,
      is_published: false,
      posting_enabled: false,
      posts_per_week: 5,
      posting_times: [9],
      caption_signoff_enabled: false,
      review_posting_enabled: false,
      review_min_rating: 4,
      review_post_frequency: 3,
    })
    .select('id, slug')
    .single()

  if (companyError) {
    console.error(`  ERROR: ${companyError.message}`)
    return false
  }

  console.log(`  Company created (id: ${company.id})`)
  return true
}

async function main() {
  console.log(`Creating ${ACCOUNTS.length} full-package accounts...`)
  console.log(`Password for all: ${PASSWORD}`)

  let success = 0
  let failed = 0

  for (const account of ACCOUNTS) {
    const ok = await createAccount(account)
    if (ok) success++
    else failed++
  }

  console.log('\n========================================')
  console.log(`  Done! ${success} created, ${failed} failed`)
  console.log('========================================')
  console.log('\nAll accounts can log in at:')
  console.log('  https://mybuildr.vercel.app/login')
  console.log(`  Password: ${PASSWORD}`)
}

main().catch(console.error)
