import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import client from '../../api/client'

const BACKEND = 'http://localhost:8000'

const STATUS_COLORS = {
  pending:          { bg: '#FEF3C7', text: '#92400E' },
  confirmed:        { bg: '#DBEAFE', text: '#1E40AF' },
  driver_assigned:  { bg: '#EEF2FF', text: '#3730A3' },
  en_route_pickup:  { bg: '#F5F3FF', text: '#6D28D9' },
  at_customer:      { bg: '#FEF3C7', text: '#B45309' },
  en_route_branch:  { bg: '#ECFDF5', text: '#047857' },
  received:         { bg: '#E0E7FF', text: '#3730A3' },
  washing:          { bg: '#CFFAFE', text: '#155E75' },
  rinsing:          { bg: '#EDE9FE', text: '#7C3AED' },
  drying:           { bg: '#FEF9C3', text: '#B45309' },
  done:             { bg: '#D1FAE5', text: '#065F46' },
  out_for_delivery: { bg: '#FEF9C3', text: '#92400E' },
  delivered:        { bg: '#D1FAE5', text: '#065F46' },
  collected:        { bg: '#D1FAE5', text: '#065F46' },
  cancelled:        { bg: '#FEE2E2', text: '#991B1B' },
}

const PAYMENT_COLORS = {
  unpaid: { bg: '#FEE2E2', text: '#991B1B' },
  deposit_paid: { bg: '#FEF3C7', text: '#92400E' },
  fully_paid: { bg: '#D1FAE5', text: '#065F46' },
  refunded: { bg: '#E0E7FF', text: '#3730A3' },
}

const ROLE_COLORS = {
  customer: { bg: '#DBEAFE', text: '#1E40AF' },
  worker: { bg: '#FEF3C7', text: '#92400E' },
  driver: { bg: '#E0E7FF', text: '#3730A3' },
  admin: { bg: '#FEE2E2', text: '#991B1B' },
}

const ALL_STATUSES = [
  'pending', 'confirmed',
  'driver_assigned', 'en_route_pickup', 'at_customer', 'en_route_branch',
  'received', 'washing', 'rinsing', 'drying', 'done',
  'out_for_delivery', 'delivered', 'collected', 'cancelled',
]
const ALL_PAYMENT_STATUSES = ['unpaid', 'deposit_paid', 'fully_paid', 'refunded']
const ALL_ROLES = ['customer', 'worker', 'driver', 'admin']

const FALLBACK_BRANCH_IMAGES = [
  'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=600&q=80',
]

const SERVICE_TEMPLATES = [
  { name: 'Exterior Wash',       category: 'traditional', duration_minutes: 30,  default_price: 3000,  description: 'Full exterior hand wash' },
  { name: 'Interior Cleaning',   category: 'traditional', duration_minutes: 45,  default_price: 4000,  description: 'Vacuum and interior wipe-down' },
  { name: 'Interior + Exterior', category: 'traditional', duration_minutes: 60,  default_price: 6000,  description: 'Full interior and exterior wash' },
  { name: 'Full Detailing',      category: 'traditional', duration_minutes: 120, default_price: 15000, description: 'Complete detail — inside and out' },
  { name: 'Quick Auto Wash',     category: 'automatic',   duration_minutes: 15,  default_price: 5000,  description: 'Automated exterior wash' },
  { name: 'Premium Auto Wash',   category: 'automatic',   duration_minutes: 25,  default_price: 8000,  description: 'Automated wash with wax coating' },
  { name: 'Engine Cleaning',     category: 'traditional', duration_minutes: 45,  default_price: 5000,  description: 'Engine bay cleaning' },
  { name: 'Waxing & Polish',     category: 'traditional', duration_minutes: 60,  default_price: 8000,  description: 'Hand wax and machine polish' },
  { name: 'Mobile Wash',         category: 'mobile',      duration_minutes: 60,  default_price: 7000,  description: 'We come to your location' },
]

const CATEGORY_COLORS = {
  traditional: { bg: '#DBEAFE', text: '#1D4ED8' },
  automatic:   { bg: '#D1FAE5', text: '#065F46' },
  mobile:      { bg: '#EDE9FE', text: '#6D28D9' },
}

const initSvcState = () =>
  Object.fromEntries(SERVICE_TEMPLATES.map(t => [t.name, { checked: false, price: String(t.default_price), id: null }]))

function branchImage(b, idx) {
  if (b.image) return b.image.startsWith('http') ? b.image : `${BACKEND}${b.image}`
  return FALLBACK_BRANCH_IMAGES[idx % FALLBACK_BRANCH_IMAGES.length]
}

/* ─── SVG Icons ─── */

function IconBranch() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function IconBooking() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

function IconRevenue() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}

function IconUsers() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function IconClock() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function IconCapacity() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
    </svg>
  )
}

function IconUpload() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function IconEdit() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function IconTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

/* ─── Shared Components ─── */

function Badge({ colors, children }) {
  return (
    <span style={{
      display: 'inline-block', fontSize: 11, fontWeight: 700, padding: '3px 10px',
      borderRadius: 9999, background: colors.bg, color: colors.text, textTransform: 'capitalize',
    }}>
      {children}
    </span>
  )
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 20,
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)' }}
        onClick={onClose} />
      <div style={{
        position: 'relative', background: 'white', borderRadius: 20, width: '100%', maxWidth: 520,
        maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.2)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid #F3F4F6',
        }}>
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{
            background: '#F3F4F6', border: 'none', borderRadius: 10, width: 32, height: 32,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, color: '#6B7280',
          }}>&times;</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{
      background: 'white', borderRadius: 16, padding: '20px 20px 18px',
      boxShadow: '0 4px 24px rgba(0,0,0,.09)',
      border: '1px solid #E2E8F0',
      borderTop: `3px solid ${color}`,
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <div style={{
        width: 50, height: 50, borderRadius: 14, flexShrink: 0,
        background: color, color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 4px 14px ${color}55`,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#1E293B', lineHeight: 1.1 }}>{value}</div>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%', background: 'white', border: '1.5px solid #E9ECEF', borderRadius: 10,
  padding: '10px 14px', fontSize: 14, fontFamily: "'DM Sans',sans-serif", color: '#1a1a2e',
  outline: 'none', boxSizing: 'border-box',
}
const labelStyle = { fontSize: 13, fontWeight: 600, color: '#1a1a2e', display: 'block', marginBottom: 6 }
const primaryBtn = (disabled) => ({
  width: '100%', background: disabled ? '#CBD5E1' : '#1A5276', color: 'white',
  fontSize: 14, fontWeight: 700, padding: '12px', borderRadius: 12, border: 'none',
  cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans',sans-serif",
})
const dangerBtn = {
  background: '#FEE2E2', color: '#991B1B', fontSize: 13, fontWeight: 600,
  padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
  fontFamily: "'DM Sans',sans-serif",
}
const secondaryBtn = {
  background: '#F3F4F6', color: '#374151', fontSize: 13, fontWeight: 600,
  padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
  fontFamily: "'DM Sans',sans-serif",
}

/* ═══════════════════════════════════════════════════════════════════════════ */

export default function AdminDashboard() {
  const location = useLocation()

  const currentTab = (() => {
    const p = location.pathname
    if (p === '/admin' || p === '/admin/') return 'overview'
    if (p.startsWith('/admin/branches')) return 'branches'
    if (p.startsWith('/admin/bookings')) return 'bookings'
    if (p.startsWith('/admin/users')) return 'users'
    return 'overview'
  })()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [branches, setBranches] = useState([])
  const [bookings, setBookings] = useState([])
  const [payments, setPayments] = useState([])
  const [users, setUsers] = useState([])

  const loadData = useCallback(async () => {
    try {
      const [b1, b2, b3, b4] = await Promise.all([
        client.get('branches/'),
        client.get('bookings/'),
        client.get('payments/'),
        client.get('accounts/users/'),
      ])
      setBranches(b1.data.results ?? b1.data)
      setBookings(b2.data.results ?? b2.data)
      setPayments(b3.data.results ?? b3.data)
      setUsers(b4.data.results ?? b4.data)
    } catch {
      setError('Failed to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const stats = useMemo(() => {
    const active = bookings.filter(b => !['done', 'cancelled'].includes(b.status)).length
    const completed = bookings.filter(b => b.status === 'done').length
    const revenue = payments.filter(p => p.status === 'completed').reduce((s, p) => s + Number(p.amount || 0), 0)
    return { active, completed, revenue, totalUsers: users.length }
  }, [bookings, payments, users])

  if (loading) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
          {[1, 2, 3, 4].map(i => <div key={i} style={{ height: 100, borderRadius: 16, background: '#F3F4F6', animation: 'pulse 1.5s infinite' }} />)}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9' }}>
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px 60px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 800, color: '#1a1a2e', margin: 0 }}>
          Admin Dashboard
        </h1>
        <p style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>Manage branches, bookings, and users</p>
      </div>

      {error && (
        <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', color: '#B91C1C', fontSize: 13, borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>{error}</div>
      )}

      {currentTab === 'overview' && <OverviewTab stats={stats} bookings={bookings} branches={branches} />}
      {currentTab === 'branches' && <BranchesTab branches={branches} setBranches={setBranches} />}
      {currentTab === 'bookings' && <BookingsTab bookings={bookings} setBookings={setBookings} users={users} />}
      {currentTab === 'users' && <UsersTab users={users} setUsers={setUsers} />}
    </div>
    </div>
  )
}

/* ─────────────────────── OVERVIEW ─────────────────────── */

function OverviewTab({ stats, bookings, branches }) {
  const statCards = [
    { label: 'Total Branches', value: branches.length, color: '#1A5276', icon: <IconBranch /> },
    { label: 'Active Bookings', value: stats.active, color: '#F39C12', icon: <IconBooking /> },
    { label: 'Completed', value: stats.completed, color: '#15803D', icon: <IconCheck /> },
    { label: 'Revenue', value: `RWF ${stats.revenue.toLocaleString()}`, color: '#1a1a2e', icon: <IconRevenue /> },
    { label: 'Total Users', value: stats.totalUsers, color: '#6D28D9', icon: <IconUsers /> },
  ]
  const recent = bookings.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5)

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14, marginBottom: 28 }}>
        {statCards.map(s => (
          <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} color={s.color} />
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,.09)', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #E9EEF4', background: '#FAFBFD' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Recent Bookings</h3>
        </div>
        {recent.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#aaa', fontSize: 14 }}>No bookings yet</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead><tr style={{ background: '#FAFAFA' }}>
                {['Ref', 'Customer', 'Branch', 'Service', 'Date', 'Status', 'Payment'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {recent.map(b => (
                  <tr key={b.id} style={{ borderTop: '1px solid #E9EEF4' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, fontFamily: 'monospace', fontSize: 12, color: '#1a1a2e' }}>{b.booking_ref}</td>
                    <td style={{ padding: '12px 16px', color: '#555' }}>{b.customer_name || b.customer_phone}</td>
                    <td style={{ padding: '12px 16px', color: '#555' }}>{b.branch_name}</td>
                    <td style={{ padding: '12px 16px', color: '#555' }}>{b.service_name}</td>
                    <td style={{ padding: '12px 16px', color: '#555' }}>{b.date}</td>
                    <td style={{ padding: '12px 16px' }}><Badge colors={STATUS_COLORS[b.status] || STATUS_COLORS.pending}>{(b.status || '').replace('_', ' ')}</Badge></td>
                    <td style={{ padding: '12px 16px' }}><Badge colors={PAYMENT_COLORS[b.payment_status] || PAYMENT_COLORS.unpaid}>{(b.payment_status || '').replace('_', ' ')}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────── BRANCHES ─────────────────────── */

const EMPTY_BRANCH = { name: '', address: '', latitude: '', longitude: '', capacity: 10, opening_time: '07:00', closing_time: '19:00', is_active: true, image_url: '' }

function BranchesTab({ branches, setBranches }) {
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY_BRANCH)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [formError, setFormError] = useState('')
  const [search, setSearch] = useState('')
  const [svcState, setSvcState] = useState(initSvcState)
  const [loadingSvcs, setLoadingSvcs] = useState(false)
  const fileRef = useRef(null)

  const filtered = branches.filter(b =>
    (b.name + b.address).toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setForm(EMPTY_BRANCH); setEditId(null); setFormError('')
    setImageFile(null); setImagePreview(null)
    setSvcState(initSvcState())
    setModal('create')
  }

  const openEdit = async (b) => {
    setForm({
      name: b.name, address: b.address,
      latitude: b.latitude, longitude: b.longitude,
      capacity: b.capacity,
      opening_time: b.opening_time?.slice(0, 5) || '07:00',
      closing_time: b.closing_time?.slice(0, 5) || '19:00',
      is_active: b.is_active,
      image_url: b.image_url || '',
    })
    setEditId(b.id); setFormError('')
    setImageFile(null)
    setImagePreview(b.image ? branchImage(b, 0) : null)
    setModal('edit')

    // Load existing services for this branch
    setLoadingSvcs(true)
    const fresh = initSvcState()
    try {
      const { data } = await client.get(`services/?branch=${b.id}`)
      const svcs = data.results ?? data
      svcs.forEach(s => {
        if (fresh[s.name]) {
          fresh[s.name] = { checked: true, price: String(s.price), id: s.id }
        }
      })
    } catch {}
    setSvcState(fresh)
    setLoadingSvcs(false)
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!form.name || !form.address || !form.latitude || !form.longitude) {
      setFormError('Please fill in all required fields.'); return
    }
    setSaving(true); setFormError('')

    const fd = new FormData()
    fd.append('name', form.name)
    fd.append('address', form.address)
    fd.append('latitude', form.latitude)
    fd.append('longitude', form.longitude)
    fd.append('capacity', form.capacity)
    fd.append('opening_time', form.opening_time)
    fd.append('closing_time', form.closing_time)
    fd.append('is_active', form.is_active)
    if (imageFile) fd.append('image', imageFile)
    if (form.image_url) fd.append('image_url', form.image_url)

    try {
      let branchId = editId
      if (modal === 'create') {
        const { data } = await client.post('branches/', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        setBranches(prev => [...prev, data])
        branchId = data.id
      } else {
        const { data } = await client.patch(`branches/${editId}/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        setBranches(prev => prev.map(b => b.id === editId ? data : b))
      }

      // Sync services
      const svcOps = []
      for (const t of SERVICE_TEMPLATES) {
        const svc = svcState[t.name]
        if (svc.checked && svc.id === null) {
          svcOps.push(client.post('services/', {
            branch: branchId, name: t.name, description: t.description,
            price: svc.price || t.default_price,
            duration_minutes: t.duration_minutes,
            category: t.category, is_available: true,
          }))
        } else if (svc.checked && svc.id !== null) {
          svcOps.push(client.patch(`services/${svc.id}/`, { price: svc.price || t.default_price }))
        } else if (!svc.checked && svc.id !== null) {
          svcOps.push(client.delete(`services/${svc.id}/`))
        }
      }
      if (svcOps.length) await Promise.all(svcOps)

      setModal(null)
    } catch (err) {
      const d = err.response?.data
      if (typeof d === 'object' && d !== null) {
        const messages = Object.entries(d).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
        setFormError(messages.join(' | '))
      } else {
        setFormError(d || 'Failed to save.')
      }
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      await client.delete(`branches/${deleteId}/`)
      setBranches(prev => prev.filter(b => b.id !== deleteId))
      setDeleteId(null)
    } catch {
      alert('Failed to delete branch.')
    }
  }

  const updateField = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <input placeholder="Search branches..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, maxWidth: 260 }} />
        <button onClick={openCreate} style={{
          background: '#1A5276', color: 'white', fontSize: 13, fontWeight: 700,
          padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
          fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add Branch
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 20 }}>
        {filtered.map((b, i) => (
          <div key={b.id} style={{
            background: 'white', borderRadius: 16, overflow: 'hidden',
            boxShadow: '0 4px 24px rgba(0,0,0,.09)', border: '1px solid #E2E8F0',
            transition: 'transform .15s, box-shadow .15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,.13)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,.09)' }}
          >
            <div style={{ height: 160, position: 'relative', overflow: 'hidden' }}>
              <img
                src={branchImage(b, i)}
                alt={b.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => { e.target.src = FALLBACK_BRANCH_IMAGES[i % FALLBACK_BRANCH_IMAGES.length] }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.4) 0%, transparent 60%)' }} />
              <div style={{ position: 'absolute', top: 10, right: 10 }}>
                <Badge colors={b.is_active ? { bg: '#D1FAE5', text: '#065F46' } : { bg: '#F3F4F6', text: '#6B7280' }}>
                  {b.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div style={{ position: 'absolute', bottom: 12, left: 14 }}>
                <h4 style={{ fontSize: 18, fontWeight: 700, color: 'white', margin: 0, textShadow: '0 1px 4px rgba(0,0,0,.4)' }}>{b.name}</h4>
              </div>
            </div>
            <div style={{ padding: '16px 18px 18px' }}>
              <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 12px', lineHeight: 1.4 }}>{b.address}</p>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#94A3B8', marginBottom: 14 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IconClock /> {b.opening_time?.slice(0, 5)} - {b.closing_time?.slice(0, 5)}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IconCapacity /> Capacity: {b.capacity}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => openEdit(b)} style={{ ...secondaryBtn, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                  <IconEdit /> Edit &amp; Services
                </button>
                <button onClick={() => setDeleteId(b.id)} style={dangerBtn}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 48, color: '#aaa', fontSize: 14 }}>
          {search ? 'No branches match your search.' : 'No branches yet. Add your first branch!'}
        </div>
      )}

      <Modal open={modal === 'create' || modal === 'edit'} onClose={() => setModal(null)}
        title={modal === 'create' ? 'Add New Branch' : 'Edit Branch'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {formError && <div style={{ background: '#FEE2E2', color: '#B91C1C', fontSize: 13, borderRadius: 10, padding: '10px 14px' }}>{formError}</div>}
          <div>
            <label style={labelStyle}>Branch Image</label>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                width: '100%', height: 140, borderRadius: 12, overflow: 'hidden',
                border: '2px dashed #D1D5DB', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: imagePreview ? 'none' : '#FAFAFA', position: 'relative',
              }}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center', color: '#aaa' }}>
                  <IconUpload />
                  <div style={{ fontSize: 13, marginTop: 6 }}>Click to upload image</div>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
          </div>
          <div>
            <label style={labelStyle}>Image URL (optional)</label>
            <input style={inputStyle} value={form.image_url} onChange={e => updateField('image_url', e.target.value)} placeholder="https://example.com/branch-photo.jpg" />
            <p style={{ fontSize: 11, color: '#aaa', margin: '4px 0 0', fontFamily: "'DM Sans',sans-serif" }}>Enter an external URL instead of uploading a file</p>
          </div>
          <div>
            <label style={labelStyle}>Branch Name *</label>
            <input style={inputStyle} value={form.name} onChange={e => updateField('name', e.target.value)} placeholder="e.g. Kigali City Center" />
          </div>
          <div>
            <label style={labelStyle}>Address *</label>
            <input style={inputStyle} value={form.address} onChange={e => updateField('address', e.target.value)} placeholder="e.g. KG 123 St, Kigali" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Latitude *</label>
              <input style={inputStyle} type="number" step="any" value={form.latitude} onChange={e => updateField('latitude', e.target.value)} placeholder="-1.9441" />
            </div>
            <div>
              <label style={labelStyle}>Longitude *</label>
              <input style={inputStyle} type="number" step="any" value={form.longitude} onChange={e => updateField('longitude', e.target.value)} placeholder="30.0619" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Capacity</label>
            <input style={inputStyle} type="number" value={form.capacity} onChange={e => updateField('capacity', parseInt(e.target.value) || 0)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Opening Time</label>
              <input style={inputStyle} type="time" value={form.opening_time} onChange={e => updateField('opening_time', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Closing Time</label>
              <input style={inputStyle} type="time" value={form.closing_time} onChange={e => updateField('closing_time', e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" id="isActive" checked={form.is_active} onChange={e => updateField('is_active', e.target.checked)} style={{ width: 16, height: 16, cursor: 'pointer' }} />
            <label htmlFor="isActive" style={{ fontSize: 13, fontWeight: 500, color: '#1a1a2e', cursor: 'pointer' }}>Branch is active (visible to customers)</label>
          </div>

          {/* ── Services ── */}
          <div style={{ borderTop: '1.5px solid #E9ECEF', paddingTop: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', marginBottom: 2 }}>Services Offered</div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 14 }}>
              Select which services this branch offers and set branch-specific prices. Default prices are pre-filled.
            </div>

            {loadingSvcs ? (
              <div style={{ textAlign: 'center', padding: '16px 0', fontSize: 13, color: '#aaa' }}>Loading services...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {SERVICE_TEMPLATES.map(t => {
                  const svc = svcState[t.name]
                  const catColor = CATEGORY_COLORS[t.category] || CATEGORY_COLORS.traditional
                  return (
                    <div key={t.name} style={{
                      border: `1.5px solid ${svc.checked ? '#1A5276' : '#E2E8F0'}`,
                      borderRadius: 10, padding: '10px 14px',
                      background: svc.checked ? '#EEF5FC' : '#FAFBFC',
                      transition: 'all 150ms',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <input
                          type="checkbox"
                          id={`svc-${t.name}`}
                          checked={svc.checked}
                          onChange={e => setSvcState(prev => ({ ...prev, [t.name]: { ...prev[t.name], checked: e.target.checked } }))}
                          style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#1A5276', flexShrink: 0 }}
                        />
                        <label htmlFor={`svc-${t.name}`} style={{ flex: 1, cursor: 'pointer', minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{t.name}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 9999, background: catColor.bg, color: catColor.text, textTransform: 'capitalize' }}>
                              {t.category}
                            </span>
                            <span style={{ fontSize: 11, color: '#94A3B8' }}>{t.duration_minutes} min</span>
                          </div>
                          <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{t.description}</div>
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                          {svc.checked ? (
                            <>
                              <input
                                type="number"
                                value={svc.price}
                                onChange={e => setSvcState(prev => ({ ...prev, [t.name]: { ...prev[t.name], price: e.target.value } }))}
                                style={{ ...inputStyle, width: 100, padding: '5px 10px', fontSize: 13 }}
                                min="0"
                              />
                              <span style={{ fontSize: 12, color: '#555', fontWeight: 600 }}>RWF</span>
                            </>
                          ) : (
                            <span style={{ fontSize: 12, color: '#aaa' }}>Default: {t.default_price.toLocaleString()} RWF</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {Object.values(svcState).filter(s => s.checked).length === 0 && !loadingSvcs && (
              <div style={{ fontSize: 12, color: '#F59E0B', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '8px 12px', marginTop: 10 }}>
                No services selected — customers won't be able to book this branch.
              </div>
            )}
          </div>

          <button onClick={handleSave} disabled={saving} style={primaryBtn(saving)}>
            {saving ? 'Saving...' : modal === 'create' ? 'Create Branch' : 'Save Changes'}
          </button>
        </div>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Branch">
        <p style={{ fontSize: 14, color: '#555', marginBottom: 20 }}>
          Are you sure you want to delete this branch? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setDeleteId(null)} style={{ ...secondaryBtn, flex: 1 }}>Cancel</button>
          <button onClick={handleDelete} style={{ ...dangerBtn, flex: 1 }}>Yes, Delete</button>
        </div>
      </Modal>
    </div>
  )
}

/* ─────────────────────── BOOKINGS ─────────────────────── */

function BookingsTab({ bookings, setBookings, users }) {
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState(null)
  const [detailBooking, setDetailBooking] = useState(null)

  const workers = users.filter(u => u.role === 'worker')
  const drivers = users.filter(u => u.role === 'driver')

  const filtered = bookings.filter(b => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false
    const q = search.toLowerCase()
    if (q && !(
      (b.booking_ref || '').toLowerCase().includes(q) ||
      (b.customer_phone || '').toLowerCase().includes(q) ||
      (b.customer_name || '').toLowerCase().includes(q) ||
      (b.branch_name || '').toLowerCase().includes(q) ||
      (b.service_name || '').toLowerCase().includes(q) ||
      (b.vehicle_plate || '').toLowerCase().includes(q)
    )) return false
    return true
  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  const handleStatusChange = async (bookingId, newStatus) => {
    setUpdating(bookingId)
    try {
      const { data } = await client.patch(`bookings/${bookingId}/status/`, { status: newStatus })
      setBookings(prev => prev.map(b => b.id === bookingId ? data : b))
      if (detailBooking?.id === bookingId) setDetailBooking(data)
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update status.')
    } finally { setUpdating(null) }
  }

  const handlePaymentChange = async (bookingId, newPayment) => {
    setUpdating(bookingId)
    try {
      const { data } = await client.patch(`bookings/${bookingId}/payment/`, { payment_status: newPayment })
      setBookings(prev => prev.map(b => b.id === bookingId ? data : b))
      if (detailBooking?.id === bookingId) setDetailBooking(data)
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update payment.')
    } finally { setUpdating(null) }
  }

  const handleAssign = async (bookingId, field, userId) => {
    setUpdating(bookingId)
    try {
      const { data } = await client.patch(`bookings/${bookingId}/assign/`, { [field]: userId || null })
      setBookings(prev => prev.map(b => b.id === bookingId ? data : b))
      if (detailBooking?.id === bookingId) setDetailBooking(data)
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to assign staff.')
    } finally { setUpdating(null) }
  }

  const statusCounts = useMemo(() => {
    const counts = { all: bookings.length }
    ALL_STATUSES.forEach(s => { counts[s] = bookings.filter(b => b.status === s).length })
    return counts
  }, [bookings])

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {['all', ...ALL_STATUSES].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{
            padding: '6px 14px', borderRadius: 20, border: 'none', fontSize: 12, fontWeight: 600,
            cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", textTransform: 'capitalize',
            background: statusFilter === s ? '#1A5276' : '#F3F4F6',
            color: statusFilter === s ? 'white' : '#555',
          }}>
            {s.replace('_', ' ')} ({statusCounts[s] || 0})
          </button>
        ))}
      </div>

      <input placeholder="Search by ref, phone, name, branch, plate..." value={search}
        onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, maxWidth: 360, marginBottom: 16 }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 16 }}>
        {filtered.map(b => {
          const accentColor = STATUS_COLORS[b.status]?.text || '#94A3B8'
          return (
          <div key={b.id} onClick={() => setDetailBooking(b)} style={{
            background: 'white', borderRadius: 16, padding: '18px 20px 18px 16px', cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,0,0,.08)', border: '1px solid #E2E8F0',
            borderLeft: `4px solid ${accentColor}`,
            transition: 'transform .15s, box-shadow .15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,.12)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,.08)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#1a1a2e', marginBottom: 2 }}>{b.booking_ref}</div>
                <div style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{b.customer_name || b.customer_phone}</div>
              </div>
              <Badge colors={STATUS_COLORS[b.status] || STATUS_COLORS.pending}>{(b.status || '').replace('_', ' ')}</Badge>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              <Badge colors={PAYMENT_COLORS[b.payment_status] || PAYMENT_COLORS.unpaid}>{(b.payment_status || '').replace('_', ' ')}</Badge>
            </div>
            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 10, fontSize: 12, color: '#64748B', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 12px' }}>
              <span><strong style={{ color: '#475569' }}>Branch:</strong> {b.branch_name}</span>
              <span><strong style={{ color: '#475569' }}>Service:</strong> {b.service_name}</span>
              <span><strong style={{ color: '#475569' }}>Date:</strong> {b.date}</span>
              <span><strong style={{ color: '#475569' }}>Time:</strong> {b.time_slot?.slice(0, 5)}</span>
              <span><strong style={{ color: '#475569' }}>Plate:</strong> {b.vehicle_plate}</span>
              {b.assigned_worker_name && <span><strong style={{ color: '#475569' }}>Worker:</strong> {b.assigned_worker_name}</span>}
              {b.assigned_driver_name && <span><strong style={{ color: '#475569' }}>Driver:</strong> {b.assigned_driver_name}</span>}
            </div>
          </div>
        )})}

      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 48, color: '#aaa', fontSize: 14 }}>No bookings found</div>
      )}
      <p style={{ fontSize: 12, color: '#aaa', marginTop: 10 }}>Showing {filtered.length} of {bookings.length} bookings</p>

      {/* Booking Detail Modal */}
      <Modal open={!!detailBooking} onClose={() => setDetailBooking(null)} title={`Booking ${detailBooking?.booking_ref || ''}`}>
        {detailBooking && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px', fontSize: 13 }}>
              <div><span style={{ color: '#888' }}>Customer:</span><br /><strong>{detailBooking.customer_name || detailBooking.customer_phone}</strong></div>
              <div><span style={{ color: '#888' }}>Phone:</span><br /><strong>{detailBooking.customer_phone}</strong></div>
              <div><span style={{ color: '#888' }}>Branch:</span><br /><strong>{detailBooking.branch_name}</strong></div>
              <div><span style={{ color: '#888' }}>Service:</span><br /><strong>{detailBooking.service_name}</strong> ({detailBooking.service_price && `RWF ${Number(detailBooking.service_price).toLocaleString()}`})</div>
              <div><span style={{ color: '#888' }}>Date:</span><br /><strong>{detailBooking.date}</strong></div>
              <div><span style={{ color: '#888' }}>Time:</span><br /><strong>{detailBooking.time_slot?.slice(0, 5)}</strong></div>
              <div><span style={{ color: '#888' }}>Plate:</span><br /><strong style={{ fontFamily: 'monospace' }}>{detailBooking.vehicle_plate}</strong></div>
              <div><span style={{ color: '#888' }}>Created:</span><br /><strong>{new Date(detailBooking.created_at).toLocaleString()}</strong></div>
            </div>

            {detailBooking.notes && (
              <div style={{ fontSize: 13, background: '#F9FAFB', borderRadius: 10, padding: 12 }}>
                <span style={{ color: '#888' }}>Notes:</span> {detailBooking.notes}
              </div>
            )}

            <div style={{ borderTop: '1px solid #E9EEF4', paddingTop: 16 }}>
              <label style={labelStyle}>Status</label>
              <select
                value={detailBooking.status}
                disabled={updating === detailBooking.id}
                onChange={e => handleStatusChange(detailBooking.id, e.target.value)}
                style={{ ...inputStyle, maxWidth: 200 }}
              >
                {ALL_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Payment Status</label>
              <select
                value={detailBooking.payment_status}
                disabled={updating === detailBooking.id}
                onChange={e => handlePaymentChange(detailBooking.id, e.target.value)}
                style={{ ...inputStyle, maxWidth: 200 }}
              >
                {ALL_PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Assigned Worker</label>
                <select
                  value={detailBooking.assigned_worker || ''}
                  disabled={updating === detailBooking.id}
                  onChange={e => handleAssign(detailBooking.id, 'assigned_worker', e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Unassigned</option>
                  {workers.map(w => <option key={w.id} value={w.id}>{w.full_name || w.phone}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Assigned Driver</label>
                <select
                  value={detailBooking.assigned_driver || ''}
                  disabled={updating === detailBooking.id}
                  onChange={e => handleAssign(detailBooking.id, 'assigned_driver', e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Unassigned</option>
                  {drivers.map(d => <option key={d.id} value={d.id}>{d.full_name || d.phone}</option>)}
                </select>
              </div>
            </div>

            {(detailBooking.assigned_worker_name || detailBooking.assigned_driver_name) && (
              <div style={{ fontSize: 12, color: '#888', background: '#F9FAFB', borderRadius: 10, padding: 12 }}>
                {detailBooking.assigned_worker_name && <div>Worker: <strong>{detailBooking.assigned_worker_name}</strong> ({detailBooking.assigned_worker_phone})</div>}
                {detailBooking.assigned_driver_name && <div>Driver: <strong>{detailBooking.assigned_driver_name}</strong> ({detailBooking.assigned_driver_phone})</div>}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

/* ─────────────────────── USERS ─────────────────────── */

function UsersTab({ users, setUsers }) {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [updating, setUpdating] = useState(null)
  const [editUser, setEditUser] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [deleteUser, setDeleteUser] = useState(null)
  const [saving, setSaving] = useState(false)

  const filtered = users.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false
    const q = search.toLowerCase()
    if (q && !(
      (u.phone || '').toLowerCase().includes(q) ||
      (u.full_name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    )) return false
    return true
  })

  const roleCounts = useMemo(() => {
    const counts = { all: users.length }
    ALL_ROLES.forEach(r => { counts[r] = users.filter(u => u.role === r).length })
    return counts
  }, [users])

  const handleRoleChange = async (userId, newRole) => {
    setUpdating(userId)
    try {
      const { data } = await client.patch(`accounts/users/${userId}/`, { role: newRole })
      setUsers(prev => prev.map(u => u.id === userId ? data : u))
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to change role.')
    } finally { setUpdating(null) }
  }

  const openEditUser = (u) => {
    setEditForm({ full_name: u.full_name || '', email: u.email || '', role: u.role, is_active: u.is_active })
    setEditUser(u)
  }

  const handleSaveUser = async () => {
    if (!editUser) return
    setSaving(true)
    try {
      const { data } = await client.patch(`accounts/users/${editUser.id}/`, editForm)
      setUsers(prev => prev.map(u => u.id === editUser.id ? data : u))
      setEditUser(null)
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update user.')
    } finally { setSaving(false) }
  }

  const handleDeleteUser = async () => {
    if (!deleteUser) return
    try {
      await client.delete(`accounts/users/${deleteUser.id}/`)
      setUsers(prev => prev.filter(u => u.id !== deleteUser.id))
      setDeleteUser(null)
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete user.')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {['all', ...ALL_ROLES].map(r => (
          <button key={r} onClick={() => setRoleFilter(r)} style={{
            padding: '6px 14px', borderRadius: 20, border: 'none', fontSize: 12, fontWeight: 600,
            cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", textTransform: 'capitalize',
            background: roleFilter === r ? '#1A5276' : '#F3F4F6',
            color: roleFilter === r ? 'white' : '#555',
          }}>
            {r} ({roleCounts[r] || 0})
          </button>
        ))}
      </div>

      <input placeholder="Search by name, phone, or email..." value={search}
        onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, maxWidth: 360, marginBottom: 16 }} />

      <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,.09)', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#aaa', fontSize: 14 }}>No users found</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead><tr style={{ background: '#FAFAFA' }}>
                {['User', 'Phone', 'Email', 'Role', 'Verified', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} style={{ borderTop: '1px solid #E9EEF4' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FAFBFC'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: 'linear-gradient(135deg,#1A5276,#2E86C1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontWeight: 700, fontSize: 13, flexShrink: 0,
                        }}>
                          {(u.full_name || u.phone || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#1a1a2e', fontSize: 13 }}>{u.full_name || '--'}</div>
                          <div style={{ fontSize: 11, color: '#aaa' }}>ID: {u.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#555', whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: 12 }}>{u.phone}</td>
                    <td style={{ padding: '12px 14px', color: '#555', fontSize: 12 }}>{u.email || '--'}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <select value={u.role} disabled={updating === u.id}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        style={{
                          padding: '6px 10px', borderRadius: 8, border: '1.5px solid #E9ECEF',
                          fontSize: 12, fontFamily: "'DM Sans',sans-serif", cursor: 'pointer',
                          color: '#1a1a2e', background: updating === u.id ? '#F3F4F6' : 'white', outline: 'none', minWidth: 100,
                        }}>
                        {ALL_ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {u.is_verified
                        ? <span style={{ color: '#15803D', fontWeight: 600, fontSize: 12 }}>Yes</span>
                        : <span style={{ color: '#DC2626', fontWeight: 600, fontSize: 12 }}>No</span>}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#888', fontSize: 12, whiteSpace: 'nowrap' }}>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : '--'}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openEditUser(u)} style={{
                          ...secondaryBtn, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 4,
                        }}><IconEdit /> Edit</button>
                        <button onClick={() => setDeleteUser(u)} style={{
                          ...dangerBtn, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 4,
                        }}><IconTrash /> Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p style={{ fontSize: 12, color: '#aaa', marginTop: 10 }}>Showing {filtered.length} of {users.length} users</p>

      {/* Edit User Modal */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title={`Edit User: ${editUser?.full_name || editUser?.phone || ''}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Full Name</label>
            <input style={inputStyle} value={editForm.full_name || ''} onChange={e => setEditForm(p => ({ ...p, full_name: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} type="email" value={editForm.email || ''} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>Role</label>
            <select style={inputStyle} value={editForm.role || 'customer'} onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}>
              {ALL_ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" id="userActive" checked={editForm.is_active ?? true} onChange={e => setEditForm(p => ({ ...p, is_active: e.target.checked }))} style={{ width: 16, height: 16, cursor: 'pointer' }} />
            <label htmlFor="userActive" style={{ fontSize: 13, fontWeight: 500, color: '#1a1a2e', cursor: 'pointer' }}>Account is active</label>
          </div>
          <button onClick={handleSaveUser} disabled={saving} style={primaryBtn(saving)}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </Modal>

      {/* Delete User Modal */}
      <Modal open={!!deleteUser} onClose={() => setDeleteUser(null)} title="Delete User">
        <p style={{ fontSize: 14, color: '#555', marginBottom: 8 }}>
          Are you sure you want to delete this user?
        </p>
        <div style={{ background: '#F9FAFB', borderRadius: 10, padding: 12, marginBottom: 20, fontSize: 13 }}>
          <div><strong>{deleteUser?.full_name || deleteUser?.phone}</strong></div>
          <div style={{ color: '#888' }}>{deleteUser?.email} | {deleteUser?.role}</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setDeleteUser(null)} style={{ ...secondaryBtn, flex: 1 }}>Cancel</button>
          <button onClick={handleDeleteUser} style={{ ...dangerBtn, flex: 1 }}>Yes, Delete</button>
        </div>
      </Modal>
    </div>
  )
}
