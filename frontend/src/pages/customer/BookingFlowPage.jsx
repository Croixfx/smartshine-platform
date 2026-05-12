import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import client from '../../api/client'

// Fix default marker icons broken by bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function MapClickHandler({ onMapClick }) {
  useMapEvents({ click: e => onMapClick(e.latlng) })
  return null
}

function ChangeView({ lat, lng }) {
  const map = useMap()
  useEffect(() => {
    if (lat != null && lng != null) map.setView([lat, lng], 16)
  }, [lat, lng, map])
  return null
}

const cardS = { background: 'white', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,.04)', padding: 20, marginBottom: 16 }
const inp = { width: '100%', background: '#fafbfc', border: '1.5px solid #E9ECEF', borderRadius: 10, padding: '10px 14px', fontSize: 14, fontFamily: "'DM Sans',sans-serif", color: '#1a1a2e', outline: 'none', boxSizing: 'border-box' }
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function StepIndicator({ step }) {
  const steps = ['Service', 'Vehicle', 'Date & Time', 'Review']
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
      {steps.map((label, i) => {
        const num = i + 1
        const done = num < step
        const active = num === step
        return (
          <div key={label} style={{ display: 'contents' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flexShrink: 0 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
                background: done ? '#1A5276' : active ? '#F39C12' : '#E9ECEF',
                color: done || active ? 'white' : '#AAA', transition: 'all 200ms',
              }}>
                {done
                  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
                  : num}
              </div>
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 400, color: active ? '#1A5276' : '#AAA', whiteSpace: 'nowrap' }}>{label}</span>
            </div>
            {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: done ? '#1A5276' : '#E9ECEF', margin: '0 6px', marginBottom: 18, transition: 'background 200ms' }} />}
          </div>
        )
      })}
    </div>
  )
}

export default function BookingFlowPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const branchId = searchParams.get('branch')
  const serviceId = searchParams.get('service')

  const [branch, setBranch] = useState(null)
  const [service, setService] = useState(null)
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1)
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [addingNew, setAddingNew] = useState(false)
  const [newVehicle, setNewVehicle] = useState({ plate_number: '', make: '', model: '', vehicle_type: 'Sedan', color: '' })

  const today = new Date()
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [slots, setSlots] = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [serviceType, setServiceType]     = useState('station')
  const [pickupAddress, setPickupAddress] = useState('')
  const [pickupLat, setPickupLat]         = useState(null)
  const [pickupLng, setPickupLng]         = useState(null)
  const [mapCenter, setMapCenter]         = useState([-1.9441, 30.0619])
  const [gettingLocation, setGettingLocation] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [branchRes, vehiclesRes] = await Promise.all([
          client.get(`branches/${branchId}/`),
          client.get('vehicles/'),
        ])
        setBranch(branchRes.data)
        const svc = (branchRes.data.service_types ?? []).find(s => String(s.id) === serviceId)
        setService(svc || null)
        const v = vehiclesRes.data.results ?? vehiclesRes.data
        setVehicles(v)
        if (v.length > 0) setSelectedVehicle(v[0])
      } catch { /* ignore */ }
      setLoading(false)
    }
    load()
  }, [branchId, serviceId])

  useEffect(() => {
    if (!selectedDate || !branchId) return
    setSlotsLoading(true)
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
    client.get(`bookings/available-slots/?branch=${branchId}&date=${dateStr}`)
      .then(({ data }) => setSlots(data))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false))
  }, [selectedDate, branchId])

  if (loading) {
    return (
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ height: 200, background: '#E9ECEF', borderRadius: 16 }} />
      </div>
    )
  }

  if (!branch || !service) {
    return (
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 20px', textAlign: 'center' }}>
        <p style={{ color: '#DC2626', fontSize: 14 }}>Service or branch not found.</p>
        <button onClick={() => navigate('/')} style={{ color: '#2E86C1', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, marginTop: 16 }}>
          &larr; Back to home
        </button>
      </div>
    )
  }

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const firstDay = new Date(calYear, calMonth, 1).getDay()
  const monthName = new Date(calYear, calMonth, 1).toLocaleString('en', { month: 'long' })

  const isPast = (d) => {
    const dt = new Date(calYear, calMonth, d); dt.setHours(0, 0, 0, 0)
    const t = new Date(); t.setHours(0, 0, 0, 0)
    return dt < t
  }
  const isSelected = (d) => selectedDate && selectedDate.getDate() === d && selectedDate.getMonth() === calMonth && selectedDate.getFullYear() === calYear
  const formattedDate = selectedDate ? selectedDate.toLocaleDateString('en-RW', { weekday: 'short', month: 'short', day: 'numeric' }) : '-'

  const deposit = Math.round(service.price * 0.3)
  const balance = service.price - deposit

  const addVehicle = async () => {
    if (!newVehicle.plate_number || !newVehicle.make || !newVehicle.model) return
    try {
      const { data } = await client.post('vehicles/', newVehicle)
      setVehicles(prev => [...prev, data])
      setSelectedVehicle(data)
      setAddingNew(false)
      setNewVehicle({ plate_number: '', make: '', model: '', vehicle_type: 'Sedan', color: '' })
    } catch { /* ignore */ }
  }

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`)
      const d = await res.json()
      return d.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`
    } catch {
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
    }
  }

  const useMyLocation = () => {
    if (!navigator.geolocation) { alert('Geolocation is not supported by your browser.'); return }
    setGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude, longitude } = pos.coords
        setPickupLat(latitude)
        setPickupLng(longitude)
        setMapCenter([latitude, longitude])
        const addr = await reverseGeocode(latitude, longitude)
        setPickupAddress(addr)
        setGettingLocation(false)
      },
      () => {
        setGettingLocation(false)
        alert('Could not get your location. Please click the map or type your address.')
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const handleMapClick = async latlng => {
    setPickupLat(latlng.lat)
    setPickupLng(latlng.lng)
    const addr = await reverseGeocode(latlng.lat, latlng.lng)
    setPickupAddress(addr)
  }

  const handleSubmit = async (payNow = true) => {
    if (!selectedVehicle || !selectedDate || !selectedTime) return
    setSubmitLoading(true)
    try {
      const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
      const { data: booking } = await client.post('bookings/', {
        branch: branch.id,
        service: service.id,
        vehicle: selectedVehicle.id,
        date: dateStr,
        time_slot: `${selectedTime}:00`,
        service_type: serviceType,
        pickup_requested: serviceType === 'pickup',
        pickup_address:   serviceType === 'pickup' ? pickupAddress : '',
        pickup_latitude:  serviceType === 'pickup' ? pickupLat : null,
        pickup_longitude: serviceType === 'pickup' ? pickupLng : null,
      })
      if (payNow) {
        const pendingPayment = {
          booking,
          service,
          branch,
          vehicle: selectedVehicle,
          date: formattedDate,
          time: selectedTime,
          dueNow: deposit,
        }
        localStorage.setItem('smartshine_pending_payment', JSON.stringify(pendingPayment))
        navigate('/payment', { state: pendingPayment })
      } else {
        navigate('/bookings')
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Could not create booking. Please try again.'
      window.alert(msg)
    } finally {
      setSubmitLoading(false)
    }
  }

  const canNext = () => {
    if (step === 1) return serviceType === 'station' || pickupAddress.trim().length > 3
    if (step === 2) return !!selectedVehicle
    if (step === 3) return !!selectedDate && !!selectedTime
    return true
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ maxWidth: 560, width: '100%', margin: '0 auto', padding: '32px 20px', flex: 1 }}>
        <button
          onClick={() => step === 1 ? navigate(`/branches/${branch.id}`) : setStep(s => s - 1)}
          style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#2E86C1', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans',sans-serif", marginBottom: 24, padding: 0 }}
        >
          &larr; {step === 1 ? 'Back to services' : 'Previous step'}
        </button>

        <StepIndicator step={step} />

        {/* Step 1: Service summary */}
        {step === 1 && (
          <>
            <div style={cardS}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#888', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 14 }}>Booking for</div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
                <div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 }}>{service.name}</div>
                  <div style={{ fontSize: 13, color: '#888' }}>{branch.name} - {branch.address}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: '#1A5276' }}>RWF {Number(service.price).toLocaleString()}</div>
                  <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{service.duration_minutes} min</div>
                </div>
              </div>
              {service.description && <div style={{ background: '#F8F9FA', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#555' }}>{service.description}</div>}
            </div>

            {/* Service type selector */}
            <div style={cardS}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#888', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>How would you like to drop off your car?</div>
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  { id: 'station', icon: '🏪', title: 'Drop off at Branch', desc: 'Bring your car to SmartShine' },
                  { id: 'pickup',  icon: '🚗', title: 'We Pick Up & Return', desc: 'Driver comes to your location' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setServiceType(opt.id)}
                    style={{
                      flex: 1, padding: '14px 12px', borderRadius: 12, textAlign: 'left', cursor: 'pointer',
                      border: `2px solid ${serviceType === opt.id ? '#1A5276' : '#E9ECEF'}`,
                      background: serviceType === opt.id ? '#EFF6FF' : 'white',
                      fontFamily: "'DM Sans',sans-serif", transition: 'all 150ms',
                    }}
                  >
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{opt.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: serviceType === opt.id ? '#1A5276' : '#1a1a2e', marginBottom: 3 }}>{opt.title}</div>
                    <div style={{ fontSize: 11, color: '#888' }}>{opt.desc}</div>
                  </button>
                ))}
              </div>
              {serviceType === 'pickup' && (
                <div style={{ marginTop: 16 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 8 }}>Your Pickup Location</label>
                  <button
                    onClick={useMyLocation}
                    disabled={gettingLocation}
                    style={{
                      width: '100%', padding: '11px 14px', borderRadius: 10, marginBottom: 10,
                      background: gettingLocation ? '#F3F4F6' : '#EFF6FF',
                      border: '1.5px solid #2E86C1', color: '#1A5276',
                      fontSize: 13, fontWeight: 600, cursor: gettingLocation ? 'not-allowed' : 'pointer',
                      fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                  >
                    <span>📍</span>
                    {gettingLocation ? 'Detecting location...' : 'Use My Current Location'}
                  </button>
                  <div style={{ height: 220, borderRadius: 12, overflow: 'hidden', border: '1.5px solid #E9ECEF', marginBottom: 10 }}>
                    <MapContainer center={mapCenter} zoom={14} style={{ height: '100%', width: '100%' }}>
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <ChangeView lat={pickupLat} lng={pickupLng} />
                      <MapClickHandler onMapClick={handleMapClick} />
                      {pickupLat !== null && <Marker position={[pickupLat, pickupLng]} />}
                    </MapContainer>
                  </div>
                  <input
                    value={pickupAddress}
                    onChange={e => setPickupAddress(e.target.value)}
                    style={{ ...inp }}
                    placeholder="Click map to set location, or type address here..."
                  />
                  <p style={{ fontSize: 11, color: '#aaa', margin: '6px 0 0' }}>
                    Click the map to pin your exact location, or use the button above. A driver will be dispatched to this address.
                  </p>
                </div>
              )}
            </div>

            <div style={cardS}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#888', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>Service Details</div>
              {[['Category', service.category_display || service.category], ['Duration', `${service.duration_minutes} minutes`], ['Branch', branch.name], ['Hours', `${branch.opening_time?.slice(0, 5)} - ${branch.closing_time?.slice(0, 5)}`]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px solid #F9FAFB' }}>
                  <span style={{ color: '#888' }}>{k}</span><span style={{ fontWeight: 500, color: '#1a1a2e' }}>{v}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Step 2: Vehicle */}
        {step === 2 && (
          <div style={cardS}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#888', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 14 }}>Your Vehicles</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
              {vehicles.map(v => (
                <button key={v.id} onClick={() => setSelectedVehicle(v)} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12,
                  border: `2px solid ${selectedVehicle?.id === v.id ? '#2E86C1' : '#E9ECEF'}`,
                  background: selectedVehicle?.id === v.id ? '#EFF6FF' : 'white',
                  cursor: 'pointer', textAlign: 'left', fontFamily: "'DM Sans',sans-serif", transition: 'all 150ms',
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: selectedVehicle?.id === v.id ? '#1A5276' : '#F3F4F6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={selectedVehicle?.id === v.id ? 'white' : '#888'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 17H5a2 2 0 01-2-2V9a2 2 0 012-2h14a2 2 0 012 2v6a2 2 0 01-2 2z" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" />
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', letterSpacing: '.03em' }}>{v.plate_number}</div>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 1 }}>{v.make} {v.model} - {v.color}</div>
                  </div>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%',
                    border: `2px solid ${selectedVehicle?.id === v.id ? '#2E86C1' : '#E9ECEF'}`,
                    background: selectedVehicle?.id === v.id ? '#2E86C1' : 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {selectedVehicle?.id === v.id && <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'white' }} />}
                  </div>
                </button>
              ))}
            </div>
            {!addingNew ? (
              <button onClick={() => setAddingNew(true)} style={{ width: '100%', background: 'none', border: '1.5px dashed #E9ECEF', borderRadius: 12, padding: 12, fontSize: 13, fontWeight: 600, color: '#2E86C1', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
                + Add New Vehicle
              </button>
            ) : (
              <div style={{ background: '#F8F9FA', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1a1a2e', marginBottom: 12 }}>New Vehicle</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[['Plate Number', 'plate_number', 'RAX 000 X'], ['Make', 'make', 'Toyota'], ['Model', 'model', 'Corolla'], ['Color', 'color', 'White']].map(([label, key, ph]) => (
                    <div key={key}>
                      <label style={{ fontSize: 12, fontWeight: 500, color: '#555', display: 'block', marginBottom: 4 }}>{label}</label>
                      <input value={newVehicle[key]} onChange={e => setNewVehicle(p => ({ ...p, [key]: e.target.value }))} placeholder={ph} style={{ ...inp, fontSize: 13, padding: '8px 12px' }} />
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <button onClick={() => setAddingNew(false)} style={{ flex: 1, background: 'white', border: '1.5px solid #E9ECEF', borderRadius: 10, padding: 10, fontSize: 13, fontWeight: 600, color: '#888', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Cancel</button>
                    <button onClick={addVehicle} style={{ flex: 2, background: '#1A5276', color: 'white', border: 'none', borderRadius: 10, padding: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Add Vehicle</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Date & Time */}
        {step === 3 && (
          <>
            <div style={cardS}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#888', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 14 }}>Select Date</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) } else setCalMonth(m => m - 1) }}
                  style={{ background: 'none', border: '1px solid #E9ECEF', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16, color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&lsaquo;</button>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>{monthName} {calYear}</span>
                <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) } else setCalMonth(m => m + 1) }}
                  style={{ background: 'none', border: '1px solid #E9ECEF', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16, color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&rsaquo;</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 4 }}>
                {DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 600, color: '#AAA', padding: '4px 0' }}>{d}</div>)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
                {Array(firstDay).fill(null).map((_, i) => <div key={'e' + i} />)}
                {Array(daysInMonth).fill(null).map((_, i) => {
                  const d = i + 1
                  const past = isPast(d)
                  const sel = isSelected(d)
                  return (
                    <button key={d} onClick={() => { if (!past) { setSelectedDate(new Date(calYear, calMonth, d)); setSelectedTime(null) } }} disabled={past}
                      style={{
                        aspectRatio: '1', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: sel ? 700 : 400,
                        background: sel ? '#1A5276' : 'transparent', color: sel ? 'white' : past ? '#DDD' : '#1a1a2e',
                        cursor: past ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans',sans-serif", transition: 'background 150ms',
                      }}>
                      {d}
                    </button>
                  )
                })}
              </div>
            </div>
            {selectedDate && (
              <div style={cardS}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#888', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 14 }}>
                  Available Times - {formattedDate}
                </div>
                {slotsLoading ? (
                  <div style={{ textAlign: 'center', padding: 20, color: '#888', fontSize: 13 }}>Loading slots...</div>
                ) : slots.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 20, color: '#aaa', fontSize: 13 }}>No slots available for this date.</div>
                ) : (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                      {slots.map(slot => {
                        const taken = !slot.available
                        const sel = selectedTime === slot.time
                        return (
                          <button key={slot.time} onClick={() => !taken && setSelectedTime(slot.time)} disabled={taken}
                            style={{
                              padding: '10px 0', borderRadius: 10,
                              border: sel ? 'none' : `1.5px solid ${taken ? '#F3F4F6' : '#E9ECEF'}`,
                              background: sel ? '#F39C12' : taken ? '#F9FAFB' : 'white',
                              color: sel ? '#1a1a2e' : taken ? '#CCC' : '#1a1a2e',
                              fontSize: 12, fontWeight: sel ? 700 : 400,
                              cursor: taken ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans',sans-serif",
                              textDecoration: taken ? 'line-through' : 'none', transition: 'all 150ms',
                            }}>
                            {slot.time}
                          </button>
                        )
                      })}
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 14, fontSize: 11, color: '#AAA' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 12, height: 12, borderRadius: 3, background: '#F39C12' }} /> Selected</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 12, height: 12, borderRadius: 3, background: '#F9FAFB', border: '1px solid #E9ECEF' }} /> Taken</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 12, height: 12, borderRadius: 3, background: 'white', border: '1px solid #E9ECEF' }} /> Available</div>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <>
            <div style={cardS}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#888', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 14 }}>Booking Summary</div>
              {[
                ['Service', service.name],
                ['Type', serviceType === 'pickup' ? '🚗 Pickup & Delivery' : '🏪 Station Drop-off'],
                ['Branch', branch.name],
                ['Vehicle', `${selectedVehicle?.plate_number} - ${selectedVehicle?.make} ${selectedVehicle?.model}`],
                ['Date', formattedDate],
                ['Time', selectedTime || '-'],
                ['Duration', `${service.duration_minutes} min`],
                ...(serviceType === 'pickup' && pickupAddress ? [['Pickup Address', pickupAddress]] : []),
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 0', borderBottom: '1px solid #F9FAFB' }}>
                  <span style={{ color: '#888' }}>{k}</span><span style={{ fontWeight: 500, color: '#1a1a2e', textAlign: 'right', maxWidth: '60%' }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={cardS}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#888', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 14 }}>Price Breakdown</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px solid #F9FAFB' }}>
                <span style={{ color: '#888' }}>Service price</span><span style={{ fontWeight: 500 }}>RWF {Number(service.price).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px solid #F9FAFB' }}>
                <span style={{ color: '#888' }}>Deposit (30%)</span><span style={{ fontWeight: 500, color: '#F39C12' }}>RWF {deposit.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px solid #F9FAFB' }}>
                <span style={{ color: '#888' }}>Balance on arrival</span><span style={{ fontWeight: 500, color: '#888' }}>RWF {balance.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, color: '#1A5276', paddingTop: 12, marginTop: 4 }}>
                <span>Due now</span><span>RWF {deposit.toLocaleString()}</span>
              </div>
              <div style={{ background: '#FEF9EE', borderRadius: 10, padding: '10px 12px', fontSize: 12, color: '#92400E', marginTop: 10 }}>
                You can pay the 30% deposit now, or book and pay later from My Bookings.
              </div>
            </div>
          </>
        )}

        {step < 4 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!canNext()}
            style={{
              width: '100%',
              background: canNext() ? '#1A5276' : '#E9ECEF',
              color: canNext() ? 'white' : '#AAA',
              fontSize: 15, fontWeight: 700, padding: 14, borderRadius: 12, border: 'none',
              cursor: canNext() ? 'pointer' : 'not-allowed', fontFamily: "'DM Sans',sans-serif",
              transition: 'all 150ms', marginTop: 8,
            }}
          >
            Continue →
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            {/* Primary: pay now */}
            <button
              onClick={() => handleSubmit(true)}
              disabled={submitLoading}
              style={{
                width: '100%', background: '#F39C12', color: '#1a1a2e',
                fontSize: 15, fontWeight: 700, padding: 14, borderRadius: 12, border: 'none',
                cursor: submitLoading ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans',sans-serif",
                boxShadow: '0 4px 16px rgba(243,156,18,.28)', opacity: submitLoading ? 0.7 : 1,
                transition: 'all 150ms',
              }}
            >
              {submitLoading ? 'Creating booking...' : `Pay Deposit Now — RWF ${deposit.toLocaleString()} →`}
            </button>

            {/* Secondary: pay later */}
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitLoading}
              style={{
                width: '100%', background: 'white', color: '#1A5276',
                fontSize: 14, fontWeight: 600, padding: '12px 14px', borderRadius: 12,
                border: '1.5px solid #CBD5E1',
                cursor: submitLoading ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans',sans-serif",
                opacity: submitLoading ? 0.6 : 1, transition: 'all 150ms',
              }}
            >
              Book Now, Pay Later
            </button>

            <p style={{ textAlign: 'center', fontSize: 11, color: '#aaa', margin: 0 }}>
              "Pay Later" saves your booking — you can pay the deposit from My Bookings anytime.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
