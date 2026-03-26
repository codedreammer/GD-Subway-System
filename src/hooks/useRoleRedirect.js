'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function useRoleRedirect(role) {
  const router = useRouter()

  useEffect(() => {
    if (role === 'admin') router.replace('/admin')
    else if (role === 'vendor') router.replace('/vendor')
    else if (role === 'student') router.replace('/student')
  }, [role, router])
}
