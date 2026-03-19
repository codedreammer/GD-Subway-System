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

async function fixDB() {
    // Update the active vendor user to 'vendor' role
    const { error: updateAuthErr } = await supabase
        .from('users')
        .update({ role: 'vendor' })
        .eq('id', '6b47bce0-394c-4aa1-83f2-efa801ed37d5')

    if (updateAuthErr) console.error('Update error:', updateAuthErr)
    else console.log('Successfully updated 6b47bce0... to vendor role.')

    // Delete the stale user record
    const { error: deleteStaleErr } = await supabase
        .from('users')
        .delete()
        .eq('id', '97b274ab-9d4c-4d8c-ace0-fe7961ecd6ed')

    if (deleteStaleErr) console.error('Delete error:', deleteStaleErr)
    else console.log('Successfully deleted the stale 97b274ab... user from public.users.')
}

fixDB()
