import { supabase } from '@/lib/supabase/supabaseClient'
import { generateOrderCode } from '@/utils/generateOrderCode'

export const createOrder = async ({ studentId, vendorId, cartItems }) => {
  try {
    // Calculate total
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_code: generateOrderCode(),
        user_id: studentId,
        student_id: studentId,
        vendor_id: vendorId,
        total_amount: totalAmount,
        status: 'pending'
      })
      .select()
      .single()

    if (orderError) {
      console.error('Supabase insert order error:', orderError)
      throw new Error(orderError.message || 'Failed to insert order')
    }

    // Insert order items
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(
        cartItems.map(item => ({
          order_id: order.id,
          item_id: item.id,
          quantity: item.quantity,
          price_at_time: item.price
        }))
      )

    if (itemsError) {
      console.error('Supabase insert order_items error:', itemsError)
      throw new Error(itemsError.message || 'Failed to insert order items')
    }

    return order
  } catch (error) {
    console.error('createOrder caught error:', error)
    throw error
  }
}

export const getVendorOrders = async (vendorId, signal) => {
  try {
    let query = supabase
      .from('orders')
      .select(`
        *,
        student:users!orders_student_id_fkey(name, roll_no),
        order_items(
          quantity,
          price_at_time,
          items(name)
        )
      `)
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false })

    if (signal) {
      query = query.abortSignal(signal)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  } catch (err) {
    console.error("Vendor Orders Error:", err)
    throw err
  }
}

export const searchVendorOrdersByCode = async (vendorId, searchTerm = '', signal) => {
  try {
    let query = supabase
      .from('orders')
      .select(`
        *,
        student:users!orders_student_id_fkey(name, roll_no),
        order_items(
          quantity,
          price_at_time,
          items(name)
        )
      `)
      .eq('vendor_id', vendorId)

    const normalizedSearchTerm = searchTerm.trim()

    if (normalizedSearchTerm) {
      query = query.ilike('order_code', `%${normalizedSearchTerm}%`)
    }

    query = query.order('created_at', { ascending: false })

    if (signal) {
      query = query.abortSignal(signal)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  } catch (err) {
    console.error('Vendor Order Search Error:', err)
    throw err
  }
}

export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const validTransitions = {
      pending: ['accepted', 'rejected'],
      accepted: ['ready', 'rejected'],
      ready: ['completed']
    }

    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders'  )
      .select('id, status')
      .eq('id', orderId)
      .single()

    if (fetchError) throw fetchError
    if (!currentOrder) throw new Error('Order not found')

    const expectedNextStatuses = validTransitions[currentOrder.status] || []
    if (!expectedNextStatuses.includes(newStatus)) {
      throw new Error(
        `Invalid status transition: ${currentOrder.status} -> ${newStatus}`
      )
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)
      .select()
      .single()

    if (updateError) throw updateError
    if (!updatedOrder) throw new Error('Failed to update order status')

    return updatedOrder
  } catch (err) {
    console.error("Update Status Error:", err)
    throw err
  }
}
