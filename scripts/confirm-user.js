/**
 * Confirm user and set password
 * Run with: node scripts/confirm-user.js
 */

const { createClient } = require('@supabase/supabase-js')

// Hardcoded for this one-time script (delete after use)
const SUPABASE_URL = 'https://qzvcawubaoagjitkvlix.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dmNhd3ViYW9hZ2ppdGt2bGl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODc5MDU0OCwiZXhwIjoyMDg0MzY2NTQ4fQ.5enpf8QVrxDJMI-ZiDr4AjIwh56PSmLOmzJJ6uRVniA'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const EMAIL = 'daxabuilding@gmail.com'
const PASSWORD = 'Password'

async function confirmUser() {
  console.log(`\n🔐 Setting up user: ${EMAIL}\n`)

  // First, try to get existing user
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

  if (listError) {
    console.error('Error listing users:', listError.message)
    return
  }

  const existingUser = users.find(u => u.email === EMAIL)

  if (existingUser) {
    console.log('Found existing user, updating...')

    // Update user: confirm email and set password
    const { data, error } = await supabase.auth.admin.updateUserById(existingUser.id, {
      email_confirm: true,
      password: PASSWORD,
    })

    if (error) {
      console.error('Error updating user:', error.message)
      return
    }

    console.log('✅ User updated successfully!')
    console.log(`   Email: ${EMAIL}`)
    console.log(`   Password: ${PASSWORD}`)
    console.log(`   Email confirmed: true`)
  } else {
    console.log('User not found, creating new user...')

    // Create new user with confirmed email
    const { data, error } = await supabase.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
    })

    if (error) {
      console.error('Error creating user:', error.message)
      return
    }

    console.log('✅ User created successfully!')
    console.log(`   Email: ${EMAIL}`)
    console.log(`   Password: ${PASSWORD}`)
  }

  console.log('\n🎉 Done! You can now log in at:')
  console.log('   https://mybuildr.vercel.app/admin')
  console.log(`   Email: ${EMAIL}`)
  console.log(`   Password: ${PASSWORD}`)
}

confirmUser().catch(console.error)
