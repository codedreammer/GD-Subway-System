'use client'

import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  CheckCircle2,
  ChefHat,
  Clock3,
  LogOut,
  PackageOpen,
  Search,
  X,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/supabaseClient'
import {
  getVendorOrders,
  searchVendorOrdersByCode,
  updateOrderStatus,
} from '@/features/orders/services/orderService'
import { formatDate } from '@/utils/formatDate'
import formatCurrency from '@/utils/formatCurrency'

const statusThemes = {
  pending: {
    badge: 'bg-amber-100 text-amber-700',
    card: 'border-amber-200 bg-amber-50/60',
  },
  accepted: {
    badge: 'bg-sky-100 text-sky-700',
    card: 'border-sky-200 bg-sky-50/60',
  },
  ready: {
    badge: 'bg-green-100 text-green-700',
    card: 'border-green-200 bg-green-50/70',
  },
  completed: {
    badge: 'bg-emerald-100 text-emerald-700',
    card: 'border-emerald-200 bg-emerald-50/60',
  },
  rejected: {
    badge: 'bg-red-100 text-red-700',
    card: 'border-red-200 bg-red-50/60',
  }
}

function filterOrdersByCode(orders, searchTerm) {
  if (!searchTerm) return orders

  return orders.filter((order) =>
    order.order_code?.toLowerCase().includes(searchTerm)
  )
}

function isAbortError(error) {
  const message = error?.message?.toLowerCase() || ''

  return error?.name === 'AbortError' || message.includes('aborted')
}

function VendorDashboardSkeleton() {
  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] bg-gradient-to-r from-[#0f3d22] via-[#166534] to-[#22c55e] p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="space-y-3">
            <div className="skeleton h-6 w-52 rounded-full" />
            <div className="skeleton h-4 w-32 rounded-full" />
          </div>
          <div className="skeleton h-12 w-32 rounded-2xl" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="skeleton h-24 rounded-[1.6rem]" />
          ))}
        </div>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="premium-card p-5">
            <div className="space-y-4">
              <div className="skeleton h-5 w-40 rounded-full" />
              <div className="skeleton h-28 rounded-[1.5rem]" />
              <div className="skeleton h-28 rounded-[1.5rem]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ActionButton({ disabled, onClick, className, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
      type="button"
    >
      {children}
    </button>
  )
}

function OrderCard({ order, updatingOrderId, onUpdate }) {
  const theme = statusThemes[order.status] || statusThemes.pending
  const studentLabel = order.student?.name
    ? `${order.student.name} (${order.student.roll_no || 'N/A'})`
    : 'Unknown'

  return (
    <article className={`rounded-[1.6rem] border p-5 shadow-sm transition-all duration-300 hover:shadow-md ${theme.card}`}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-white">
              {order.order_code}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] ${theme.badge}`}>
              {order.status}
            </span>
          </div>

          <div className="grid gap-2 text-sm text-slate-600">
            <p className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-slate-400" />
              {formatDate(order.created_at)}
            </p>
            <p className="font-semibold text-slate-900">Student: {studentLabel}</p>
            <p className="font-semibold text-green-700">{formatCurrency(order.total_amount)}</p>
          </div>

          <div className="rounded-[1.3rem] bg-white/85 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Items</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {order.order_items?.map((item, index) => (
                <li key={index} className="flex items-center justify-between gap-4">
                  <span>{item.quantity} x {item.items?.name || 'Unknown Item'}</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(item.price_at_time * item.quantity)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex min-w-[220px] flex-col gap-3">
          {order.status === 'pending' && (
            <>
              <ActionButton
                disabled={updatingOrderId === order.id}
                onClick={() => onUpdate(order.id, 'accepted')}
                className="premium-button text-white"
              >
                {updatingOrderId === order.id ? 'Accepting...' : 'Accept order'}
              </ActionButton>
              <ActionButton
                disabled={updatingOrderId === order.id}
                onClick={() => onUpdate(order.id, 'rejected')}
                className="bg-red-50 text-red-600 hover:-translate-y-0.5 hover:bg-red-100"
              >
                {updatingOrderId === order.id ? 'Rejecting...' : 'Reject order'}
              </ActionButton>
            </>
          )}

          {order.status === 'accepted' && (
            <ActionButton
              disabled={updatingOrderId === order.id}
              onClick={() => onUpdate(order.id, 'ready')}
              className="premium-button text-white"
            >
              {updatingOrderId === order.id ? 'Working...' : 'Mark ready'}
            </ActionButton>
          )}

          {order.status === 'ready' && (
            <ActionButton
              disabled={updatingOrderId === order.id}
              onClick={() => onUpdate(order.id, 'completed')}
              className="premium-button text-white"
            >
              {updatingOrderId === order.id ? 'Completing...' : 'Mark completed'}
            </ActionButton>
          )}
        </div>
      </div>
    </article>
  )
}

export default function VendorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [errorMsg, setErrorMsg] = useState('')
  const [updatingOrderId, setUpdatingOrderId] = useState(null)
  const [vendor, setVendor] = useState(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const deferredSearchTerm = useDeferredValue(searchTerm)
  const normalizedSearchTerm = deferredSearchTerm.trim().toLowerCase()
  const hasInitializedDebouncedSearch = useRef(false)
  const latestFetchRequestRef = useRef(0)
  const activeOrdersAbortControllerRef = useRef(null)

  const fetchVendorOrders = async (vendorId, searchValue = '') => {
    if (activeOrdersAbortControllerRef.current) {
      activeOrdersAbortControllerRef.current.abort()
    }

    const abortController = new AbortController()
    activeOrdersAbortControllerRef.current = abortController
    const requestId = ++latestFetchRequestRef.current
    const normalizedBackendSearch = searchValue.trim()

    try {
      const data = normalizedBackendSearch
        ? await searchVendorOrdersByCode(vendorId, normalizedBackendSearch, abortController.signal)
        : await getVendorOrders(vendorId, abortController.signal)

      if (
        requestId === latestFetchRequestRef.current &&
        activeOrdersAbortControllerRef.current === abortController
      ) {
        setOrders(data || [])
      }
    } catch (err) {
      if (isAbortError(err)) {
        return
      }

      throw err
    } finally {
      if (activeOrdersAbortControllerRef.current === abortController) {
        activeOrdersAbortControllerRef.current = null
      }
    }
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
          router.push('/auth/login')
          return
        }

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

        await supabase
          .from('vendors')
          .update({ is_online: true })
          .eq('id', vendorData.id)

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
      .channel('orders-live')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `vendor_id=eq.${vendor.id}`
        },
        async () => {
          await fetchVendorOrders(vendor.id, debouncedSearchTerm)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [vendor, debouncedSearchTerm])

  useEffect(() => {
    return () => {
      activeOrdersAbortControllerRef.current?.abort()
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim())
    }, 400)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [searchTerm])

  useEffect(() => {
    if (!vendor) return

    if (!hasInitializedDebouncedSearch.current) {
      hasInitializedDebouncedSearch.current = true
      if (!debouncedSearchTerm) return
    }

    let isActive = true

    const syncOrdersWithSearch = async () => {
      try {
        await fetchVendorOrders(vendor.id, debouncedSearchTerm)
      } catch (err) {
        if (isActive && !isAbortError(err)) {
          console.error('Failed to sync debounced order search:', err)
        }
      }
    }

    syncOrdersWithSearch()

    return () => {
      isActive = false
    }
  }, [vendor, debouncedSearchTerm])

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        if (vendor) {
          const { error } = await supabase
            .from('vendors')
            .update({ is_online: true })
            .eq('id', vendor.id)
          if (error) console.error('Heartbeat update failed:', error)
        }
      } catch (err) {
        console.error('Heartbeat error:', err)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [vendor])

  const handleUpdateStatus = async (orderId, newStatus) => {
    const previousOrders = orders
    setUpdatingOrderId(orderId)
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    )

    try {
      const updatedOrder = await updateOrderStatus(orderId, newStatus)
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
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

  const handleLogout = async () => {
    if (isLoggingOut) return
    if (!confirm('Are you sure you want to go offline?')) return

    setIsLoggingOut(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { error } = await supabase
          .from('vendors')
          .update({ is_online: false })
          .eq('user_id', user.id)
        if (error) console.error('Logout status update failed:', error)
      }

      await supabase.auth.signOut()
      router.push('/auth/login')
    } catch (err) {
      console.error('Logout error:', err)
      setIsLoggingOut(false)
    }
  }

  const incomingOrders = useMemo(
    () => orders.filter((order) => order.status === 'pending' || order.status === 'accepted'),
    [orders]
  )
  const readyOrders = useMemo(
    () => orders.filter((order) => order.status === 'ready'),
    [orders]
  )
  const filteredIncomingOrders = useMemo(
    () => filterOrdersByCode(incomingOrders, normalizedSearchTerm),
    [incomingOrders, normalizedSearchTerm]
  )
  const filteredReadyOrders = useMemo(
    () => filterOrdersByCode(readyOrders, normalizedSearchTerm),
    [readyOrders, normalizedSearchTerm]
  )
  const hasSearchTerm = normalizedSearchTerm.length > 0
  const hasActiveOrders = incomingOrders.length > 0 || readyOrders.length > 0
  const hasMatchingOrders = filteredIncomingOrders.length > 0 || filteredReadyOrders.length > 0

  if (loading) return <VendorDashboardSkeleton />

  if (errorMsg) {
    return (
      <div className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-4">
        <div className="premium-card w-full p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-900">Vendor Dashboard</h1>
          <p className="mt-3 text-sm text-red-600">{errorMsg}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#0f3d22] via-[#166534] to-[#22c55e] p-6 text-white shadow-[0_24px_60px_-34px_rgba(22,101,52,0.9)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="glass-panel flex h-16 w-16 items-center justify-center rounded-[1.5rem]">
              <ChefHat className="h-8 w-8" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-100">Vendor workspace</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight">{vendor?.shop_name || 'Vendor Dashboard'}</h1>
              <div className="mt-3 inline-flex rounded-full bg-white/14 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100">
                {vendor?.is_online && !isLoggingOut ? 'Online' : 'Offline'}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="glass-panel inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition hover:scale-[1.02] disabled:opacity-70"
            type="button"
          >
            <LogOut className="h-4 w-4" />
            {isLoggingOut ? 'Logging out...' : 'Go offline'}
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="glass-panel rounded-[1.6rem] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-100">Incoming</p>
            <p className="mt-2 text-3xl font-black">{filteredIncomingOrders.length}</p>
            {hasSearchTerm && (
              <p className="mt-1 text-xs text-emerald-100/80">
                {incomingOrders.length} total incoming
              </p>
            )}
          </div>
          <div className="glass-panel rounded-[1.6rem] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-100">Ready for pickup</p>
            <p className="mt-2 text-3xl font-black">{filteredReadyOrders.length}</p>
            {hasSearchTerm && (
              <p className="mt-1 text-xs text-emerald-100/80">
                {readyOrders.length} total ready
              </p>
            )}
          </div>
          <div className="glass-panel rounded-[1.6rem] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-100">All active</p>
            <p className="mt-2 text-3xl font-black">{filteredIncomingOrders.length + filteredReadyOrders.length}</p>
            {hasSearchTerm && (
              <p className="mt-1 text-xs text-emerald-100/80">
                {incomingOrders.length + readyOrders.length} total active
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-[1.6rem] border border-white/15 bg-white/10 p-4 backdrop-blur">
          <label
            htmlFor="order-search"
            className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-50"
          >
            Search orders
          </label>
          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="order-search"
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by Order ID (e.g. GD2803)"
              className="w-full rounded-2xl border border-white/20 bg-white/95 py-3 pl-11 pr-12 text-sm font-medium text-slate-900 outline-none transition focus:border-white focus:bg-white"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                aria-label="Clear order search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {!hasActiveOrders ? (
        <section className="premium-card mt-6 px-8 py-12 text-center">
          <PackageOpen className="mx-auto h-12 w-12 text-slate-400" />
          <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-900">No active orders</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            New orders will appear here in real time as students place them.
          </p>
        </section>
      ) : hasSearchTerm && !hasMatchingOrders ? (
        <section className="premium-card mt-6 px-8 py-12 text-center">
          <Search className="mx-auto h-12 w-12 text-slate-400" />
          <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-900">No matching orders found</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Try another order code or clear the search to view all active orders.
          </p>
        </section>
      ) : (
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <section className="premium-card p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100">
                <Clock3 className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-green-700">Queue</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Incoming orders</h2>
              </div>
            </div>

            <div className="space-y-4">
              {filteredIncomingOrders.length > 0 ? (
                filteredIncomingOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    updatingOrderId={updatingOrderId}
                    onUpdate={handleUpdateStatus}
                  />
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center text-slate-500">
                  {hasSearchTerm ? 'No matching incoming orders.' : 'No incoming orders right now.'}
                </div>
              )}
            </div>
          </section>

          <section className="premium-card p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-green-700">Pickup zone</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Ready orders</h2>
              </div>
            </div>

            <div className="space-y-4">
              {filteredReadyOrders.length > 0 ? (
                filteredReadyOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    updatingOrderId={updatingOrderId}
                    onUpdate={handleUpdateStatus}
                  />
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center text-slate-500">
                  {hasSearchTerm ? 'No matching ready orders.' : 'No ready orders waiting for pickup.'}
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
