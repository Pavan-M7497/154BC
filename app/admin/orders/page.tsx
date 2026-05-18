'use client'

import { useEffect, useState } from 'react'
import { RoleGuard } from '@/components/auth/role-guard'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { useAuth } from '@/components/auth/auth-context'
import { 
  createOrder, 
  completeOrder, 
  cancelOrder, 
  subscribeOrders, 
  parseOrder, 
  type Order, 
  type OrderItem, 
  type OrderStatus,
  getPointsRatio
} from '@/lib/orders'
import { 
  adjustPoints, 
  awardBonus, 
  redeemPoints 
} from '@/lib/loyalty'
import { subscribeUsers, listUsers } from '@/lib/auth/users'
import { updateSettings, getSettings } from '@/lib/firestore'
import type { UserProfile } from '@/lib/auth/user-profile'
import { locations, formatPrice } from '@/lib/data'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { 
  ShoppingBag, 
  Plus, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Award, 
  ShieldAlert, 
  Users, 
  Coins, 
  Settings2, 
  TrendingUp, 
  Search, 
  ChevronRight, 
  Sparkles,
  Loader2
} from 'lucide-react'

export default function AdminOrdersPage() {
  const { user: currentUser, role } = useAuth()
  const isAdmin = role === 'admin'

  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [loadingUsers, setLoadingUsers] = useState(true)
  
  // Settings & Ratio
  const [pointsRatio, setPointsRatio] = useState(10)
  const [updatingRatio, setUpdatingRatio] = useState(false)

  // Modals & Forms State
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [showAdjustModal, setShowAdjustModal] = useState(false)

  // Create Order Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [selectedLocationId, setSelectedLocationId] = useState(locations[0]?.id || '')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash')
  const [orderItems, setOrderItems] = useState<OrderItem[]>([{ name: '', quantity: 1, price: 0 }])
  const [creatingOrder, setCreatingOrder] = useState(false)

  // Adjust Points Form State
  const [adjustCustomerId, setAdjustCustomerId] = useState('')
  const [adjustDelta, setAdjustDelta] = useState(0)
  const [adjustNote, setAdjustNote] = useState('')
  const [adjustType, setAdjustType] = useState<'adjust' | 'bonus' | 'redeem'>('adjust')
  const [submittingAdjustment, setSubmittingAdjustment] = useState(false)

  // Search/Filters
  const [userSearch, setUserSearch] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all')

  useEffect(() => {
    // 1. Subscribe to orders (unbounded prevents via limit(100))
    const unsubOrders = subscribeOrders(
      {},
      (ordersList) => {
        setOrders(ordersList)
        setLoadingOrders(false)
      },
      (error) => {
        toast.error('Error loading orders feed')
        setLoadingOrders(false)
      }
    )

    // 2. Subscribe to user profiles for points adjustments
    const unsubUsers = subscribeUsers(
      (usersList) => {
        setUsers(usersList)
        setLoadingUsers(false)
      },
      (error) => {
        toast.error('Error loading customers list')
        setLoadingUsers(false)
      }
    )

    // 3. Load general points ratio settings
    async function loadSettings() {
      const ratio = await getPointsRatio()
      setPointsRatio(ratio)
    }
    loadSettings()

    return () => {
      unsubOrders()
      unsubUsers()
    }
  }, [])

  // Calculated Stats
  const topSpentCustomers = [...users]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5)

  const totalPointsInCirculation = users.reduce((sum, u) => sum + u.loyaltyPoints, 0)
  const totalLifetimeSpent = users.reduce((sum, u) => sum + u.totalSpent, 0)
  const totalCompletedOrders = orders.filter(o => o.status === 'completed').length

  // Handlers
  const handleUpdateRatio = async () => {
    if (!isAdmin) {
      toast.error('Only administrators can modify the conversion ratio')
      return
    }
    setUpdatingRatio(true)
    try {
      await updateSettings({ pointsRatio })
      toast.success(`Conversion ratio updated to ₹100 = ${pointsRatio} points!`)
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setUpdatingRatio(false)
    }
  }

  const handleCreateOrderItem = () => {
    setOrderItems([...orderItems, { name: '', quantity: 1, price: 0 }])
  }

  const handleRemoveOrderItem = (index: number) => {
    if (orderItems.length === 1) return
    setOrderItems(orderItems.filter((_, idx) => idx !== index))
  }

  const handleItemChange = (index: number, field: keyof OrderItem, val: string | number) => {
    const updated = [...orderItems]
    updated[index] = {
      ...updated[index],
      [field]: val
    }
    setOrderItems(updated)
  }

  const calculateTotalOrderAmount = () => {
    return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const handleCreateOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCustomerId) {
      toast.error('Please select a customer')
      return
    }
    const customer = users.find(u => u.uid === selectedCustomerId)
    if (!customer) return

    // Filter out blank items
    const finalItems = orderItems.filter(item => item.name.trim() !== '')
    if (finalItems.length === 0) {
      toast.error('Please add at least one item')
      return
    }

    setCreatingOrder(true)
    try {
      const amount = calculateTotalOrderAmount()
      await createOrder({
        uid: selectedCustomerId,
        customerName: customer.name,
        customerEmail: customer.email,
        amount,
        items: finalItems,
        paymentMethod,
        status: 'pending',
        locationId: selectedLocationId,
        createdBy: currentUser?.uid || 'staff'
      })

      toast.success('Order created successfully')
      setShowOrderModal(false)
      // Reset form
      setOrderItems([{ name: '', quantity: 1, price: 0 }])
      setSelectedCustomerId('')
    } catch (error) {
      toast.error('Failed to create order')
    } finally {
      setCreatingOrder(false)
    }
  }

  const handleCompleteOrder = async (orderId: string) => {
    try {
      toast.loading('Processing payment and updating loyalty tiers...', { id: orderId })
      await completeOrder(orderId, currentUser?.uid || 'staff')
      toast.success('Order completed and loyalty points processed!', { id: orderId })
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete order', { id: orderId })
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return
    try {
      await cancelOrder(orderId, currentUser?.uid || 'staff')
      toast.success('Order cancelled successfully')
    } catch (error) {
      toast.error('Failed to cancel order')
    }
  }

  const handleAdjustPointsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adjustCustomerId || !adjustDelta || !adjustNote.trim()) {
      toast.error('Please fill all fields')
      return
    }

    setSubmittingAdjustment(true)
    try {
      if (adjustType === 'adjust') {
        await adjustPoints({
          uid: adjustCustomerId,
          pointsDelta: adjustDelta,
          note: adjustNote,
          staffUid: currentUser?.uid || 'staff'
        })
        toast.success('Points adjusted successfully')
      } else if (adjustType === 'bonus') {
        await awardBonus({
          uid: adjustCustomerId,
          points: Math.abs(adjustDelta),
          note: adjustNote,
          staffUid: currentUser?.uid || 'staff'
        })
        toast.success('Bonus points awarded successfully')
      } else {
        await redeemPoints({
          uid: adjustCustomerId,
          pointsToRedeem: Math.abs(adjustDelta),
          note: adjustNote,
          staffUid: currentUser?.uid || 'staff'
        })
        toast.success('Points redeemed successfully')
      }
      setShowAdjustModal(false)
      setAdjustNote('')
      setAdjustDelta(0)
    } catch (error: any) {
      toast.error(error.message || 'Failed to process adjustment')
    } finally {
      setSubmittingAdjustment(false)
    }
  }

  const filteredOrders = orders.filter(order => {
    if (orderStatusFilter === 'all') return true
    return order.status === orderStatusFilter
  })

  const searchedUsers = users.filter(user => {
    const q = userSearch.toLowerCase()
    return user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q)
  })

  return (
    <RoleGuard permission="dashboard">
      <div className="space-y-8 max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <AdminPageHeader
            title="Orders & Loyalty Feed"
            description="Manage live customer orders, view spending ledgers, and adjust loyalty point balances."
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowAdjustModal(true)}
              className="bg-card hover:bg-zinc-800 text-foreground border border-border px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all"
            >
              <Coins size={16} className="text-accent" />
              Adjust Points
            </button>
            <button
              onClick={() => setShowOrderModal(true)}
              className="bg-accent hover:bg-caramel-hover text-accent-foreground px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all"
            >
              <Plus size={16} />
              Manual Order
            </button>
          </div>
        </div>

        {/* Analytics row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-xs mb-1">Conversion Ratio</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-foreground text-lg font-bold">₹100 =</span>
                <input
                  type="number"
                  value={pointsRatio}
                  disabled={!isAdmin}
                  onChange={(e) => setPointsRatio(Number(e.target.value))}
                  className="w-14 bg-background border border-border rounded px-1.5 py-0.5 text-center text-foreground font-bold text-lg disabled:opacity-75 focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <span className="text-foreground text-sm font-semibold text-muted-foreground">pts</span>
              </div>
              {isAdmin && (
                <button
                  onClick={handleUpdateRatio}
                  disabled={updatingRatio}
                  className="text-xs text-accent hover:underline flex items-center gap-1 mt-1 font-semibold"
                >
                  {updatingRatio ? 'Saving...' : 'Save Ratio'}
                </button>
              )}
            </div>
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
              <Settings2 size={18} />
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-xs mb-1">Points in Circulation</p>
              <p className="text-foreground text-2xl font-bold mt-1">{totalPointsInCirculation.toLocaleString()}</p>
              <p className="text-muted-foreground text-[10px] mt-1">Distributed to customers</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
              <Award size={18} />
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-xs mb-1">Total Customer Spending</p>
              <p className="text-foreground text-2xl font-bold mt-1">₹{totalLifetimeSpent.toLocaleString()}</p>
              <p className="text-muted-foreground text-[10px] mt-1">Sum of all completed orders</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <TrendingUp size={18} />
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-xs mb-1">Completed Orders</p>
              <p className="text-foreground text-2xl font-bold mt-1">{totalCompletedOrders}</p>
              <p className="text-muted-foreground text-[10px] mt-1">Points successfully awarded</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <ShoppingBag size={18} />
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Orders Feed */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <ShoppingBag size={18} />
                  Live Orders Feed
                </h3>
                <div className="flex gap-1 bg-background border border-border rounded-lg p-0.5">
                  {['all', 'pending', 'completed', 'cancelled'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setOrderStatusFilter(st)}
                      className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all ${
                        orderStatusFilter === st 
                          ? 'bg-accent text-accent-foreground shadow-sm' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {loadingOrders ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="w-8 h-8 text-accent animate-spin" />
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No orders match this filter.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="border border-border/60 rounded-xl p-4 bg-background/40 hover:bg-background/80 transition-all">
                      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border/40 pb-3 mb-3">
                        <div>
                          <span className="text-[10px] text-muted-foreground">Order ID: #{order.id.slice(-6).toUpperCase()}</span>
                          <h4 className="text-sm font-semibold text-foreground mt-0.5">{order.customerName}</h4>
                          <span className="text-xs text-muted-foreground">{order.customerEmail}</span>
                        </div>
                        <div className="text-right">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            order.status === 'completed'
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                              : order.status === 'cancelled'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          }`}>
                            {order.status}
                          </span>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {format(order.createdAt, 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-1.5 mb-3">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs text-muted-foreground">
                            <span>{it.name} <span className="text-accent/80 font-bold">x{it.quantity}</span></span>
                            <span>₹{(it.price * it.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/40 pt-3">
                        <div>
                          <p className="text-[10px] text-muted-foreground">Payment Method: <span className="font-semibold capitalize text-foreground">{order.paymentMethod}</span></p>
                          <p className="text-[10px] text-muted-foreground">Total Paid: <span className="font-bold text-sm text-foreground">₹{order.amount.toLocaleString()}</span></p>
                        </div>
                        
                        {order.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                            >
                              <XCircle size={13} />
                              Cancel
                            </button>
                            <button
                              onClick={() => handleCompleteOrder(order.id)}
                              className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                            >
                              <CheckCircle size={13} />
                              Complete & Award Points
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top Spending Customers & Adjustments list */}
          <div className="space-y-6">
            
            {/* Top Spending Customers */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                <TrendingUp size={18} className="text-accent" />
                Top Spent Customers
              </h3>
              {loadingUsers ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-accent" />
                </div>
              ) : (
                <div className="space-y-3">
                  {topSpentCustomers.map((c, idx) => (
                    <div key={c.uid} className="flex items-center justify-between p-3 border border-border/40 bg-background/20 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center font-bold text-accent">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{c.name}</p>
                          <p className="text-[10px] text-muted-foreground capitalize">{c.loyaltyTier} Tier</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">₹{c.totalSpent.toLocaleString()}</p>
                        <p className="text-[10px] text-accent font-semibold">{c.loyaltyPoints} points</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick point adjustment widget */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                <Coins size={18} className="text-accent" />
                Quick Customer Lookup
              </h3>
              <div className="relative mb-3">
                <Search size={14} className="absolute left-3 top-3 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              {userSearch.trim() !== '' && (
                <div className="max-h-60 overflow-y-auto space-y-2 border border-border/60 rounded-xl p-2 bg-background/40">
                  {searchedUsers.slice(0, 5).map(u => (
                    <button
                      key={u.uid}
                      onClick={() => {
                        setAdjustCustomerId(u.uid)
                        setAdjustType('adjust')
                        setShowAdjustModal(true)
                      }}
                      className="w-full text-left p-2.5 hover:bg-card border border-transparent hover:border-border rounded-lg flex items-center justify-between transition-all group"
                    >
                      <div>
                        <p className="text-xs font-semibold text-foreground group-hover:text-accent">{u.name}</p>
                        <p className="text-[10px] text-muted-foreground">{u.email}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] bg-accent/15 text-accent px-2 py-0.5 rounded-full font-bold uppercase">{u.loyaltyTier}</span>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{u.loyaltyPoints} points</p>
                      </div>
                    </button>
                  ))}
                  {searchedUsers.length === 0 && (
                    <p className="text-center text-xs text-muted-foreground py-2">No customers found.</p>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* MODAL: Manual Order creation */}
        {showOrderModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-950 border border-border/80 w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h3 className="text-foreground font-serif text-lg flex items-center gap-2">
                  <ShoppingBag size={18} className="text-accent" />
                  Create Manual Counter Order
                </h3>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateOrderSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                {/* Select Customer */}
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5 font-semibold">Select Customer</label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    required
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    <option value="">-- Choose Customer --</option>
                    {users.map(u => (
                      <option key={u.uid} value={u.uid}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location & Payment */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1.5 font-semibold">Location</label>
                    <select
                      value={selectedLocationId}
                      onChange={(e) => setSelectedLocationId(e.target.value)}
                      required
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                    >
                      {locations.map(l => (
                        <option key={l.id} value={l.id}>
                          {l.shortName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1.5 font-semibold">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      required
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Credit/Debit Card</option>
                      <option value="upi">UPI / Online</option>
                    </select>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-border/40 pb-1">
                    <span className="text-xs text-muted-foreground font-semibold">Order Items</span>
                    <button
                      type="button"
                      onClick={handleCreateOrderItem}
                      className="text-xs text-accent hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Plus size={12} /> Add Item
                    </button>
                  </div>

                  {orderItems.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Item Name (e.g. Latte)"
                        value={item.name}
                        onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                        required
                        className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        min={1}
                        onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                        required
                        className="w-16 bg-background border border-border rounded-xl px-2 py-2 text-xs text-center text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={item.price || ''}
                        min={0}
                        onChange={(e) => handleItemChange(idx, 'price', Number(e.target.value))}
                        required
                        className="w-24 bg-background border border-border rounded-xl px-2 py-2 text-xs text-right text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveOrderItem(idx)}
                        disabled={orderItems.length === 1}
                        className="text-red-400 hover:text-red-600 disabled:opacity-50 p-1 shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center border-t border-border pt-4 mt-4">
                  <span className="text-sm font-semibold text-foreground">Total Order Value:</span>
                  <span className="text-xl font-bold text-accent">₹{calculateTotalOrderAmount().toLocaleString()}</span>
                </div>

                <div className="flex justify-end gap-2 border-t border-border/40 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowOrderModal(false)}
                    className="bg-card hover:bg-zinc-800 text-foreground border border-border px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingOrder}
                    className="bg-accent hover:bg-caramel-hover text-accent-foreground px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all"
                  >
                    {creatingOrder ? <Loader2 size={14} className="animate-spin" /> : 'Create Order'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Adjust Points */}
        {showAdjustModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-950 border border-border/80 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h3 className="text-foreground font-serif text-lg flex items-center gap-2">
                  <Coins size={18} className="text-accent" />
                  Adjust Customer Points
                </h3>
                <button
                  onClick={() => setShowAdjustModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <form onSubmit={handleAdjustPointsSubmit} className="p-6 space-y-4">
                {/* Select Customer */}
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5 font-semibold">Select Customer</label>
                  <select
                    value={adjustCustomerId}
                    onChange={(e) => setAdjustCustomerId(e.target.value)}
                    required
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    <option value="">-- Choose Customer --</option>
                    {users.map(u => (
                      <option key={u.uid} value={u.uid}>
                        {u.name} ({u.loyaltyPoints} pts)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Adjustment Type */}
                <div className="grid grid-cols-3 gap-2 bg-background p-1 border border-border rounded-xl">
                  {[
                    { id: 'adjust', label: 'Adjust' },
                    { id: 'bonus', label: 'Bonus' },
                    { id: 'redeem', label: 'Redeem' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setAdjustType(t.id as any)}
                      className={`py-1.5 rounded-lg text-xs font-semibold text-center transition-all ${
                        adjustType === t.id 
                          ? 'bg-accent text-accent-foreground font-bold' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Points delta */}
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5 font-semibold">
                    Points {adjustType === 'redeem' ? 'to Deduct' : 'to Award'}
                  </label>
                  <input
                    type="number"
                    placeholder={adjustType === 'adjust' ? 'e.g. 50 or -50' : 'e.g. 100'}
                    value={adjustDelta || ''}
                    onChange={(e) => setAdjustDelta(Number(e.target.value))}
                    required
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {adjustType === 'adjust' && '💡 Enter positive numbers to add, or negative to deduct.'}
                    {adjustType === 'bonus' && '💡 Enter positive numbers to reward bonus points.'}
                    {adjustType === 'redeem' && '💡 Enter points value to redeem.'}
                  </p>
                </div>

                {/* Note */}
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5 font-semibold">Audit Explanation (Note)</label>
                  <textarea
                    placeholder="Provide reason (e.g. System correction, Birthday reward, UPI confirmation)..."
                    value={adjustNote}
                    onChange={(e) => setAdjustNote(e.target.value)}
                    required
                    rows={3}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 border-t border-border/40 pt-4 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowAdjustModal(false)}
                    className="bg-card hover:bg-zinc-800 text-foreground border border-border px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAdjustment}
                    className="bg-accent hover:bg-caramel-hover text-accent-foreground px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all"
                  >
                    {submittingAdjustment ? <Loader2 size={14} className="animate-spin" /> : 'Confirm Adjustment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </RoleGuard>
  )
}
