import { useState, useEffect } from 'react'

export default function BrandPanel() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  if (isMobile) return null

  return (
    <div style={{ width: '45%', background: 'linear-gradient(160deg,#0B2740 0%,#1A5276 55%,#2E86C1 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px 40px', flexShrink: 0 }}>
      <div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>
          Smart<span style={{ color: '#F39C12' }}>Shine</span>
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', marginTop: 4, letterSpacing: '.08em', textTransform: 'uppercase' }}>Premium Car Wash · Kigali</div>
      </div>
      <div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: 'white', lineHeight: 1.25, marginBottom: 32, maxWidth: 280 }}>
          Your car,<br />always spotless.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>
          {[['Convenient booking', 'Book from your phone in under 2 minutes'], ['MoMo payments', 'Pay with MTN Mobile Money — no cash needed'], ['Multiple locations', '5 branches across Kigali, open 7 days']].map(([title, desc]) => (
            <div key={title} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(243,156,18,.25)', border: '1.5px solid #F39C12', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#F39C12" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{title}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.55)', marginTop: 1 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {[['500+', 'Cars washed'], ['4.8★', 'Rating'], ['5', 'Locations']].map(([val, label]) => (
            <div key={label}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: '#F39C12' }}>{val}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 1 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)' }}>© 2025 SmartShine · Kigali, Rwanda</div>
    </div>
  )
}
