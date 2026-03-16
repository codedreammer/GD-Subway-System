'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { getStatusColor } from '@/utils/getStatusColor'
import { formatOrderDate } from '@/utils/formatDate'

export default function StudentOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [user, setUser] = useState(null)

  const fetchOrders = async () => {
    try {
      const {
        data: { user: currentUser },
        error: userError
      } = await supabase.auth.getUser()

      if (userError) throw userError
      if (!currentUser) {
        setErrorMsg('You must be logged in to view orders.')
        return
      }

      setUser(currentUser)

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            price_at_time,
            items ( name )
          )
        `)
        .eq('student_id', currentUser.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (err) {
      console.error('Failed to load student orders:', err)
      setErrorMsg('Failed to load your orders.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('student-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `student_id=eq.${user.id}`
        },
        async () => {
          await fetchOrders()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  if (loading) return <div style={{ padding: '20px' }}>Loading your orders...</div>

  if (errorMsg) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>My Orders</h1>
        <p style={{ color: 'red' }}>{errorMsg}</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>My Orders</h1>

      {orders.length === 0 ? (
        <p>No orders found yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          {orders.map(order => (
            <div key={order.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '14px' }}>
              <p><strong>Order Code:</strong> {order.order_code}</p>
              <p><strong>Total Amount:</strong> Rs. {order.total_amount}</p>
              <p>
                <strong>Status:</strong>{' '}
                <span
                  style={{
                    textTransform: 'uppercase',
                    fontWeight: 'bold',
                    color: 'white',
                    backgroundColor: getStatusColor(order.status),
                    borderRadius: '999px',
                    padding: '2px 10px',
                    display: 'inline-block'
                  }}
                >
                  {order.status}
                </span>
              </p>
              <p>
                <strong>Created At:</strong>{' '}
                {formatOrderDate(order.created_at)}
              </p>

              <div style={{ marginTop: '10px' }}>
                <h4 style={{ margin: '0 0 8px' }}>Items</h4>
                {order.order_items?.length ? (
                  <ul style={{ margin: 0 }}>
                    {order.order_items.map((item, index) => (
                      <li key={`${order.id}-${index}`}>
                        {item.quantity}x {item.items?.name || 'Unknown Item'}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No items found for this order.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
