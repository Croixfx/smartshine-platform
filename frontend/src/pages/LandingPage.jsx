import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

/* ─── scroll-reveal hook ─── */
function useReveal(threshold = 0.15) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('visible'); obs.unobserve(el) } },
      { threshold },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return ref
}

function Reveal({ className = 'reveal', delay = 0, children, as: Tag = 'div', ...rest }) {
  const ref = useReveal()
  const stagger = delay ? `stagger-${delay}` : ''
  return <Tag ref={ref} className={`${className} ${stagger}`} {...rest}>{children}</Tag>
}

/* ─── icons (inline SVGs) ─── */
const Sun = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
)
const Moon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
)

const ChevronDown = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg>
)

/* ─── stock images ─── */
const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=1400&q=80',
  about: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=800&q=80',
  service1: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=600&q=80',
  service2: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80',
  service3: 'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&w=600&q=80',
  gallery1: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=600&q=80',
  gallery2: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=600&q=80',
  gallery3: 'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=600&q=80',
  gallery4: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
  cta: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
}

/* ─── data ─── */
const SERVICES = [
  { title: 'Exterior Wash', desc: 'Full hand wash, foam, rinse & air dry. Your car gleams like new.', price: 'From 3,000 RWF', img: IMAGES.service1, icon: '🚿' },
  { title: 'Interior Detailing', desc: 'Deep vacuum, dashboard polish, leather conditioning & fragrance.', price: 'From 5,000 RWF', img: IMAGES.service2, icon: '✨' },
  { title: 'Full Premium', desc: 'Complete interior + exterior treatment with ceramic coating finish.', price: 'From 10,000 RWF', img: IMAGES.service3, icon: '💎' },
]

const STEPS = [
  { num: '01', title: 'Choose a Branch', desc: 'Browse our 5 locations across Kigali. See real-time availability and queue status.' },
  { num: '02', title: 'Pick Your Service', desc: 'Select from exterior wash, interior detailing, or our premium full package.' },
  { num: '03', title: 'Book & Pay', desc: 'Confirm your slot and pay instantly via MTN MoMo. No cash needed.' },
  { num: '04', title: 'Enjoy the Shine', desc: 'Drop off your car or request pickup. We handle the rest.' },
]

const STATS = [
  { value: '2,500+', label: 'Cars Washed' },
  { value: '4.9', label: 'Star Rating' },
  { value: '5', label: 'Locations' },
  { value: '98%', label: 'Happy Clients' },
]

const TESTIMONIALS = [
  { name: 'Jean Pierre M.', role: 'Business Owner', text: 'SmartShine is incredibly convenient. I book from my phone while at the office and my car is spotless by the time I leave. Best service in Kigali!', avatar: 'JP' },
  { name: 'Grace U.', role: 'Software Engineer', text: 'The MoMo payment integration is seamless. No more carrying cash. The premium package is worth every franc - my car has never looked better.', avatar: 'GU' },
  { name: 'Eric N.', role: 'Teacher', text: 'I love that I can track when my car will be ready. The workers are professional and thorough. Highly recommend the interior detailing!', avatar: 'EN' },
]

const FAQS = [
  { q: 'How long does a car wash take?', a: 'Exterior wash takes about 20-30 minutes. Interior detailing takes 45-60 minutes. Premium full service takes about 1.5 hours.' },
  { q: 'What payment methods do you accept?', a: 'We accept MTN Mobile Money (MoMo) for cashless, instant payment. Cash payments are also available on-site.' },
  { q: 'Can I schedule a pickup?', a: 'Yes! Select the pickup option during booking and our driver will collect and return your vehicle at your chosen location.' },
  { q: 'Are your products eco-friendly?', a: 'Absolutely. We use biodegradable, pH-neutral cleaning products that are safe for your car\'s finish and the environment.' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('smartshine-theme')
      if (saved) return saved === 'dark'
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  })
  const [mobileMenu, setMobileMenu] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const [scrollY, setScrollY] = useState(0)
  const [navSolid, setNavSolid] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('smartshine-theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    const onScroll = () => {
      setScrollY(window.scrollY)
      setNavSolid(window.scrollY > 50)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileMenu(false)
  }, [])

  const NAV_ITEMS = [
    { label: 'Services', id: 'services' },
    { label: 'How It Works', id: 'how-it-works' },
    { label: 'Gallery', id: 'gallery' },
    { label: 'Testimonials', id: 'testimonials' },
    { label: 'FAQ', id: 'faq' },
  ]

  return (
    <div className={`min-h-screen font-body transition-colors duration-300 ${dark ? 'bg-gray-950 text-gray-100' : 'bg-white text-gray-900'}`}>

      {/* ═══════ NAVBAR ═══════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        navSolid
          ? dark ? 'bg-gray-950/95 backdrop-blur-lg shadow-lg shadow-black/20' : 'bg-white/95 backdrop-blur-lg shadow-lg shadow-black/5'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 sm:h-20 flex items-center justify-between">
          <button onClick={() => scrollTo('hero')} className="font-display text-2xl font-bold tracking-tight">
            Smart<span className="text-amber-500">Shine</span>
          </button>

          <div className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map(item => (
              <button key={item.id} onClick={() => scrollTo(item.id)}
                className={`text-sm font-medium transition-colors hover:text-amber-500 ${
                  dark ? 'text-gray-300' : navSolid ? 'text-gray-600' : 'text-white/80'
                }`}>
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setDark(d => !d)}
              className={`p-2 rounded-xl transition-all duration-200 ${
                dark ? 'bg-gray-800 text-amber-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {dark ? <Sun /> : <Moon />}
            </button>

            <button onClick={() => navigate('/login')}
              className={`hidden sm:block text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 ${
                dark ? 'text-white hover:text-amber-400' : navSolid ? 'text-gray-700 hover:text-amber-600' : 'text-white/90 hover:text-white'
              }`}>
              Sign In
            </button>
            <button onClick={() => navigate('/register')}
              className="hidden sm:block text-sm font-bold px-5 py-2.5 rounded-xl bg-amber-500 text-gray-900 hover:bg-amber-400 transition-all duration-200 shadow-lg shadow-amber-500/25">
              Get Started
            </button>

            <button onClick={() => setMobileMenu(m => !m)} className="md:hidden p-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {mobileMenu
                  ? <path d="M6 18L18 6M6 6l12 12"/>
                  : <><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/></>}
              </svg>
            </button>
          </div>
        </div>

        {mobileMenu && (
          <div className={`md:hidden border-t px-5 pb-5 pt-3 space-y-1 ${
            dark ? 'bg-gray-950/98 border-gray-800' : 'bg-white/98 border-gray-100'
          }`}>
            {NAV_ITEMS.map(item => (
              <button key={item.id} onClick={() => scrollTo(item.id)}
                className={`block w-full text-left py-3 text-sm font-medium ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
                {item.label}
              </button>
            ))}
            <div className="flex gap-3 pt-3">
              <button onClick={() => navigate('/login')} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border ${dark ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-700'}`}>
                Sign In
              </button>
              <button onClick={() => navigate('/register')} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-amber-500 text-gray-900">
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ═══════ HERO ═══════ */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={IMAGES.hero} alt="" className="w-full h-full object-cover" />
          <div className={`absolute inset-0 ${dark ? 'bg-gray-950/80' : 'bg-gray-900/60'}`} />
        </div>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl" style={{ animation: 'float 6s ease-in-out infinite' }} />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl" style={{ animation: 'float 8s ease-in-out infinite 1s' }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 text-center" style={{ transform: `translateY(${scrollY * 0.15}px)`, opacity: Math.max(0, 1 - scrollY / 600) }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-amber-400 text-xs sm:text-sm font-semibold tracking-wide uppercase mb-6 sm:mb-8"
               style={{ animation: 'fade-in 1s ease-out' }}>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Kigali's Premium Car Wash
          </div>

          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight mb-6"
              style={{ animation: 'fade-up 1s ease-out 0.2s both' }}>
            Your Car Deserves<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-300">
              a Brilliant Shine
            </span>
          </h1>

          <p className="text-base sm:text-lg text-white/70 max-w-xl mx-auto mb-10 leading-relaxed"
             style={{ animation: 'fade-up 1s ease-out 0.4s both' }}>
            Book a premium car wash in 2 minutes. Pay with MoMo. Track your car in real-time.
            5 locations across Kigali, open 7 days a week.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center"
               style={{ animation: 'fade-up 1s ease-out 0.6s both' }}>
            <button onClick={() => navigate('/register')}
              className="group px-8 py-4 rounded-2xl bg-amber-500 text-gray-900 font-bold text-base hover:bg-amber-400 transition-all duration-300 shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:-translate-y-0.5">
              Book Your Wash Now
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
            </button>
            <button onClick={() => scrollTo('services')}
              className="px-8 py-4 rounded-2xl text-white font-semibold text-base border border-white/20 hover:bg-white/10 backdrop-blur-sm transition-all duration-300">
              Explore Services
            </button>
          </div>

          <div className="flex justify-center gap-8 sm:gap-12 mt-14 sm:mt-16"
               style={{ animation: 'fade-up 1s ease-out 0.8s both' }}>
            {STATS.map(s => (
              <div key={s.label} className="text-center">
                <div className="font-display text-2xl sm:text-3xl font-bold text-white">{s.value}</div>
                <div className="text-xs sm:text-sm text-white/50 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => scrollTo('services')}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 hover:text-white transition-colors"
          style={{ animation: 'float 2s ease-in-out infinite' }}>
          <ChevronDown />
        </button>
      </section>

      {/* ═══════ SERVICES ═══════ */}
      <section id="services" className={`py-20 sm:py-28 ${dark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <Reveal className="reveal text-center mb-16">
            <span className="text-amber-500 text-sm font-bold tracking-widest uppercase">What We Offer</span>
            <h2 className={`font-display text-3xl sm:text-5xl font-extrabold mt-3 ${dark ? 'text-white' : 'text-gray-900'}`}>
              Premium Services
            </h2>
            <p className={`text-base mt-4 max-w-xl mx-auto ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
              From a quick exterior rinse to a full detailing experience, we have the perfect package for your car.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {SERVICES.map((s, i) => (
              <Reveal key={s.title} className="reveal" delay={i + 1}>
                <div className={`group rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2 ${
                  dark ? 'bg-gray-800 hover:shadow-2xl hover:shadow-amber-500/10' : 'bg-white hover:shadow-2xl hover:shadow-gray-200/60'
                }`}>
                  <div className="relative h-52 overflow-hidden">
                    <img src={s.img} alt={s.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute top-4 right-4 text-3xl w-12 h-12 flex items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">{s.icon}</div>
                  </div>
                  <div className="p-6 sm:p-7">
                    <h3 className={`font-display text-xl font-bold mb-2 ${dark ? 'text-white' : 'text-gray-900'}`}>{s.title}</h3>
                    <p className={`text-sm leading-relaxed mb-4 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{s.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-amber-500 font-bold text-sm">{s.price}</span>
                      <button onClick={() => navigate('/register')}
                        className="text-sm font-semibold text-amber-500 hover:text-amber-400 transition-colors">
                        Book Now &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ ABOUT / SPLIT ═══════ */}
      <section className={`py-20 sm:py-28 ${dark ? 'bg-gray-950' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <Reveal className="reveal-left">
              <div className="relative">
                <img src={IMAGES.about} alt="Car being washed" className="rounded-3xl w-full object-cover shadow-2xl" style={{ maxHeight: 480 }} />
                <div className="absolute -bottom-6 -right-6 sm:-bottom-8 sm:-right-8 bg-amber-500 text-gray-900 rounded-2xl p-5 sm:p-6 shadow-xl" style={{ animation: 'pulse-glow 3s ease-in-out infinite' }}>
                  <div className="font-display text-3xl sm:text-4xl font-extrabold">5+</div>
                  <div className="text-xs sm:text-sm font-semibold">Years of Service</div>
                </div>
              </div>
            </Reveal>

            <Reveal className="reveal-right">
              <span className="text-amber-500 text-sm font-bold tracking-widest uppercase">About SmartShine</span>
              <h2 className={`font-display text-3xl sm:text-4xl font-extrabold mt-3 leading-tight ${dark ? 'text-white' : 'text-gray-900'}`}>
                We Don't Just Wash Cars,<br />
                <span className="text-amber-500">We Restore Them</span>
              </h2>
              <p className={`text-base mt-5 leading-relaxed ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                Founded in Kigali, SmartShine combines expert craftsmanship with modern technology. Our trained teams use premium, eco-friendly products to give your vehicle the treatment it deserves.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-8">
                {[
                  ['Eco-Friendly', 'Biodegradable products safe for your car and the planet.'],
                  ['Expert Teams', 'Trained professionals who care about every detail.'],
                  ['MoMo Payments', 'Cashless, instant payment via MTN Mobile Money.'],
                  ['Real-Time Tracking', 'Know exactly when your car will be ready.'],
                ].map(([title, desc]) => (
                  <div key={title} className={`p-4 rounded-2xl ${dark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    <div className={`font-bold text-sm ${dark ? 'text-white' : 'text-gray-900'}`}>{title}</div>
                    <div className={`text-xs mt-1 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{desc}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section id="how-it-works" className={`py-20 sm:py-28 ${dark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <Reveal className="reveal text-center mb-16">
            <span className="text-amber-500 text-sm font-bold tracking-widest uppercase">Simple Process</span>
            <h2 className={`font-display text-3xl sm:text-5xl font-extrabold mt-3 ${dark ? 'text-white' : 'text-gray-900'}`}>
              How It Works
            </h2>
            <p className={`text-base mt-4 max-w-xl mx-auto ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
              Book a car wash in four easy steps. It's that simple.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {STEPS.map((step, i) => (
              <Reveal key={step.num} className="reveal" delay={i + 1}>
                <div className={`relative p-7 rounded-3xl h-full transition-all duration-300 group hover:-translate-y-1 ${
                  dark ? 'bg-gray-800 hover:bg-gray-800/80' : 'bg-white hover:shadow-xl'
                }`}>
                  <div className="text-amber-500/20 font-display text-6xl font-extrabold absolute top-4 right-6 select-none group-hover:text-amber-500/30 transition-colors">{step.num}</div>
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-5">
                      <span className="text-amber-500 font-display text-lg font-bold">{step.num}</span>
                    </div>
                    <h3 className={`font-bold text-lg mb-2 ${dark ? 'text-white' : 'text-gray-900'}`}>{step.title}</h3>
                    <p className={`text-sm leading-relaxed ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{step.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ GALLERY ═══════ */}
      <section id="gallery" className={`py-20 sm:py-28 ${dark ? 'bg-gray-950' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <Reveal className="reveal text-center mb-16">
            <span className="text-amber-500 text-sm font-bold tracking-widest uppercase">Our Work</span>
            <h2 className={`font-display text-3xl sm:text-5xl font-extrabold mt-3 ${dark ? 'text-white' : 'text-gray-900'}`}>
              Gallery
            </h2>
            <p className={`text-base mt-4 max-w-xl mx-auto ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
              See the results for yourself. Every car gets the SmartShine treatment.
            </p>
          </Reveal>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {[IMAGES.gallery1, IMAGES.gallery2, IMAGES.gallery3, IMAGES.gallery4].map((img, i) => (
              <Reveal key={i} className="reveal-scale" delay={i + 1}>
                <div className="group relative rounded-2xl overflow-hidden aspect-[4/3]">
                  <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <section id="testimonials" className={`py-20 sm:py-28 ${dark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <Reveal className="reveal text-center mb-16">
            <span className="text-amber-500 text-sm font-bold tracking-widest uppercase">What People Say</span>
            <h2 className={`font-display text-3xl sm:text-5xl font-extrabold mt-3 ${dark ? 'text-white' : 'text-gray-900'}`}>
              Testimonials
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} className="reveal" delay={i + 1}>
                <div className={`p-7 rounded-3xl h-full flex flex-col ${
                  dark ? 'bg-gray-800' : 'bg-white shadow-lg shadow-gray-100'
                }`}>
                  <div className="flex gap-1 mb-4">
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} width="18" height="18" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    ))}
                  </div>
                  <p className={`text-sm leading-relaxed flex-1 mb-6 ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
                    "{t.text}"
                  </p>
                  <div className="flex items-center gap-3 mt-auto">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm">{t.avatar}</div>
                    <div>
                      <div className={`font-semibold text-sm ${dark ? 'text-white' : 'text-gray-900'}`}>{t.name}</div>
                      <div className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{t.role}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FAQ ═══════ */}
      <section id="faq" className={`py-20 sm:py-28 ${dark ? 'bg-gray-950' : 'bg-white'}`}>
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <Reveal className="reveal text-center mb-16">
            <span className="text-amber-500 text-sm font-bold tracking-widest uppercase">Got Questions?</span>
            <h2 className={`font-display text-3xl sm:text-5xl font-extrabold mt-3 ${dark ? 'text-white' : 'text-gray-900'}`}>
              FAQ
            </h2>
          </Reveal>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <Reveal key={i} className="reveal" delay={Math.min(i + 1, 4)}>
                <div className={`rounded-2xl overflow-hidden transition-colors ${
                  dark ? 'bg-gray-900' : 'bg-gray-50'
                }`}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className={`w-full flex items-center justify-between p-5 text-left ${
                      dark ? 'text-white' : 'text-gray-900'
                    }`}>
                    <span className="font-semibold text-sm sm:text-base pr-4">{faq.q}</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                      className={`flex-shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`}>
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-40 pb-5' : 'max-h-0'}`}>
                    <p className={`px-5 text-sm leading-relaxed ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{faq.a}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img src={IMAGES.cta} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-900/70" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <Reveal className="reveal">
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white leading-tight">
              Ready for a <span className="text-amber-400">Spotless</span> Ride?
            </h2>
            <p className="text-base sm:text-lg text-white/60 mt-5 max-w-xl mx-auto">
              Join thousands of happy car owners in Kigali. Book your first wash today and experience the SmartShine difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <button onClick={() => navigate('/register')}
                className="group px-8 py-4 rounded-2xl bg-amber-500 text-gray-900 font-bold text-base hover:bg-amber-400 transition-all duration-300 shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:-translate-y-0.5">
                Get Started Free
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
              </button>
              <button onClick={() => navigate('/login')}
                className="px-8 py-4 rounded-2xl text-white font-semibold text-base border border-white/20 hover:bg-white/10 transition-all duration-300">
                I Have an Account
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className={`py-16 ${dark ? 'bg-gray-900 border-t border-gray-800' : 'bg-gray-50 border-t border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="font-display text-2xl font-bold mb-4">
                Smart<span className="text-amber-500">Shine</span>
              </div>
              <p className={`text-sm leading-relaxed ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                Kigali's premium car wash platform. Professional service, modern technology, brilliant results.
              </p>
            </div>
            <div>
              <h4 className={`font-bold text-sm mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>Quick Links</h4>
              <div className="space-y-2">
                {NAV_ITEMS.map(item => (
                  <button key={item.id} onClick={() => scrollTo(item.id)}
                    className={`block text-sm transition-colors hover:text-amber-500 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className={`font-bold text-sm mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>Locations</h4>
              <div className={`space-y-2 text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                <p>Kigali City Center</p>
                <p>Kimironko</p>
                <p>Remera</p>
                <p>Nyamirambo</p>
                <p>Kacyiru</p>
              </div>
            </div>
            <div>
              <h4 className={`font-bold text-sm mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>Contact</h4>
              <div className={`space-y-2 text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                <p>info@smartshine.rw</p>
                <p>+250 788 123 456</p>
                <p>Open 7 days, 7AM - 7PM</p>
              </div>
            </div>
          </div>

          <div className={`border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 ${
            dark ? 'border-gray-800' : 'border-gray-200'
          }`}>
            <p className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
              &copy; {new Date().getFullYear()} SmartShine Car Wash Platform. All rights reserved.
            </p>
            <div className="flex gap-5">
              {['Privacy Policy', 'Terms of Service'].map(t => (
                <button key={t} className={`text-xs transition-colors hover:text-amber-500 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{t}</button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
