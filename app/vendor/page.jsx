'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { getVendorOrders, updateOrderStatus } from '@/services/orderService'
import { getStatusColor } from '@/utils/getStatusColor'
import { formatOrderDate } from '@/utils/formatDate'

export default function VendorPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [orders, setOrders] = useState([])
    const [errorMsg, setErrorMsg] = useState('')
    const [updatingOrderId, setUpdatingOrderId] = useState(null)
    const [vendor, setVendor] = useState(null)

    const fetchVendorOrders = async (vendorId) => {
        const data = await getVendorOrders(vendorId)
        setOrders(data || [])
    }

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const { data: { user }, error: userError } = await supabase.auth.getUser()
                console.log("AUTH ID:", user?.id)

                if (userError || !user) {
                    router.push('/auth/login')
                    return
                }

                // Fetch vendor record tied to this user
                const { data: vendorData, error: vendorError } = await supabase
                    .from('vendors')
                    .select('*')
                    .eq('user_id', user.id)
                    .single()

                if (vendorError || !vendorData) {
                    setErrorMsg('Vendor account not found.')
                    setLoading(false)
                    return
                }

                setVendor(vendorData)
                await fetchVendorOrders(vendorData.id)
            } catch (err) {
                console.error('Failed to load dashboard:', err)
                setErrorMsg('Error loading dashboard.')
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [router])

    useEffect(() => {
        if (!vendor) return

        const channel = supabase
            .channel('vendor-orders')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'orders',
                    filter: `vendor_id=eq.${vendor.id}`
                },
                async () => {
                    await fetchVendorOrders(vendor.id)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [vendor])

    const handleUpdateStatus = async (orderId, newStatus) => {
        const previousOrders = orders
        setUpdatingOrderId(orderId)
        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            )
        )

        try {
            const updatedOrder = await updateOrderStatus(orderId, newStatus)
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId ? { ...order, ...updatedOrder } : order
                )
            )
        } catch (err) {
            console.error('Failed to update status:', err)
            setOrders(previousOrders)
            alert('Failed to update order status.')
        } finally {
            setUpdatingOrderId(null)
        }
    }

    if (loading) return <div>Loading dashboard...</div>

    if (errorMsg) return <div><h1>Vendor Dashboard</h1><p style={{ color: 'red' }}>{errorMsg}</p></div>

    return (
        <div style={{ padding: '20px' }}>
            <h1>Vendor Dashboard</h1>
            <h2>Incoming Orders</h2>

            {orders.length === 0 ? (
                <p>No orders yet.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
                    {orders.map(order => (
                        <div key={order.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
                            <p><strong>Order Code:</strong> {order.order_code}</p>
                            <p>Placed: {formatOrderDate(order.created_at)}</p>
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

                            <p className="font-semibold">
                                Student: {order.users?.name}
                            </p>

                            <div>
                                <h4>Items:</h4>
                                <ul>
                                    {order.order_items?.map((item, index) => (
                                        <li key={index}>
                                            {item.quantity}x {item.items?.name || 'Unknown Item'} (Rs. {item.price_at_time})
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div style={{ marginTop: '15px' }}>
                                {order.status === 'pending' && (
                                    <button
                                        onClick={() => handleUpdateStatus(order.id, 'accepted')}
                                        disabled={updatingOrderId === order.id}
                                        style={{ background: '#4CAF50', color: 'white', padding: '8px 12px', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                                    >
                                        Accept Order
                                    </button>
                                )}
                                {order.status === 'accepted' && (
                                    <button
                                        onClick={() => handleUpdateStatus(order.id, 'ready')}
                                        disabled={updatingOrderId === order.id}
                                        style={{ background: '#2196F3', color: 'white', padding: '8px 12px', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                                    >
                                        Mark Ready
                                    </button>
                                )}
                                {order.status === 'ready' && (
                                    <button
                                        onClick={() => handleUpdateStatus(order.id, 'completed')}
                                        disabled={updatingOrderId === order.id}
                                        style={{ background: '#555', color: 'white', padding: '8px 12px', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                                    >
                                        Mark Completed
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
