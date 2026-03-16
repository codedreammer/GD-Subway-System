import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req) {
  try {
    const { students } = await req.json()

    const results = []

    for (const student of students) {
      const email = `${student.roll_no}@gla.ac.in`

      // 1️⃣ Create auth user
      const { data: authData, error: authError } =
        await supabaseAdmin.auth.admin.createUser({
          email,
          password: 'GLA@123',
          email_confirm: true,
        })

      if (authError) {
        results.push({
          roll_no: student.roll_no,
          status: 'failed',
          reason: authError.message,
        })
        continue
      }

      // 2️⃣ Insert into public.users
      const { error: insertError } =
        await supabaseAdmin.from('users').insert({
          id: authData.user.id,
          email,
          role: 'student',
          roll_no: student.roll_no,
          is_first_login: true,
        })

      if (insertError) {
        results.push({
          roll_no: student.roll_no,
          status: 'failed',
          reason: insertError.message,
        })
        continue
      }

      results.push({
        roll_no: student.roll_no,
        status: 'success',
      })
    }

    return NextResponse.json({ results })

  } catch (err) {
    return NextResponse.json(
      { error: 'Bulk creation failed' },
      { status: 500 }
    )
  }
}