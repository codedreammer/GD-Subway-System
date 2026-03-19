import { createClient } from '@supabase/supabase-js'
import { loadEnvConfig } from '@next/env'
import fs from 'fs'

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

async function check() {
    const { data, error } = await supabase.from('users').select('*')
    fs.writeFileSync('users.json', JSON.stringify(data, null, 2))
    if (error) console.error('Error:', error)
}

check()
