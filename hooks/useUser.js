'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function useUser() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadUser() {
      const { data } = await supabase.auth.getUser()
      if (isMounted) {
        setUser(data?.user ?? null)
        setLoading(false)
      }
    }

    loadUser()

    return () => {
      isMounted = false
    }
  }, [])

  return { user, loading }
}
