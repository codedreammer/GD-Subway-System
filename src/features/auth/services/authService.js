import { supabase } from '@/lib/supabase/supabaseClient'

const COLLEGE_EMAIL_DOMAIN = '@gla.ac.in'

export const extractRollNo = (email) => email.split('@')[0]

export const validateCollegeEmail = (email) => {
  const normalizedEmail = email?.trim().toLowerCase()

  if (!normalizedEmail || !normalizedEmail.endsWith(COLLEGE_EMAIL_DOMAIN)) {
    throw new Error('Invalid college email')
  }

  return normalizedEmail
}

const hasRollNo = (rollNo) =>
  typeof rollNo === 'string' ? rollNo.trim().length > 0 : Boolean(rollNo)

export const syncUserRollNoFromEmail = async ({ user, role, existingRollNo }) => {
  if (role !== 'student') {
    return existingRollNo ?? null
  }

  const normalizedEmail = validateCollegeEmail(user?.email || '')

  if (hasRollNo(existingRollNo)) {
    return existingRollNo.trim()
  }

  const rollNo = extractRollNo(normalizedEmail)
  const { error } = await supabase
    .from('users')
    .update({ roll_no: rollNo })
    .eq('id', user.id)

  if (error) throw error

  return rollNo
}

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return { data, error }
}

export async function signOut() {
  return supabase.auth.signOut()
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  return { user: data?.user ?? null, error }
}
