'use client'

import { useRouter } from 'next/navigation'
import { createOrder } from '@/services/orderService'
import { getCurrentUser } from '@/services/authService'

export default function StudentPage() {
  const router = useRouter()

  const testOrder = async () => {
    try {
      const { user, error } = await getCurrentUser()

      if (error || !user) {
        alert('Please log in first')
        router.push('/auth/login')
        return
      }

      const dummyVendorId = '7cb823dc-03d0-488a-9c9e-91650ffab516'
      const dummyItemId = 'c8fb1ad2-026e-4ce0-be04-4aac90f27c74'

      await createOrder({
        studentId: user.id,
        vendorId: dummyVendorId,
        cartItems: [
          {
            id: dummyItemId,
            price: 50,
            quantity: 2
          }
        ]
      })

      alert('Order Created Successfully')
    } catch (err) {
      console.error('Test order failed:', err)
      alert(err.message || 'Failed to create order. See console.')
    }
  }

  return (
    <div>
      <h1 >Student Dashboard</h1>
      <button onClick={testOrder}>Test Order</button>
      
    </div>
  )
}