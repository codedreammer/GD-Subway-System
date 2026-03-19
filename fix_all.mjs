import { createClient } from '@supabase/supabase-js'
import { loadEnvConfig } from '@next/env'

loadEnvConfig(process.cwd())

const supabaseUrl =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey =
  process.env.SUPABASE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase environment variables. Set SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL and SUPABASE_KEY/SUPABASE_SERVICE_ROLE_KEY.'
  )
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixAll() {
    const oldId = '97b274ab-9d4c-4d8c-ace0-fe7961ecd6ed'
    const newId = '6b47bce0-394c-4aa1-83f2-efa801ed37d5'

    // 1. Update vendors
    const { error: err1 } = await supabase.from('vendors').update({ user_id: newId }).eq('user_id', oldId)
    if (err1) console.error('Error updating vendors:', err1)
    else console.log('Updated vendors user_id')

    // 2. Update role
    const { error: err2 } = await supabase.from('users').update({ role: 'vendor' }).eq('id', newId)
    if (err2) console.error('Error updating new user role:', err2)
    else console.log('Updated new user role to vendor')

    // 3. Delete old user
    const { error: err3 } = await supabase.from('users').delete().eq('id', oldId)
    if (err3) console.error('Error deleting old user:', err3)
    else console.log('Deleted old user')
}

fixAll()
