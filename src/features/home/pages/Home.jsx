import { ArrowUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PATHS } from '../../../app/routes/paths.js'
import HomeHeader from '../components/HomeHeader.jsx'
import HeroSection from '../components/HeroSection.jsx'
import StatsSection from '../components/StatsSection.jsx'
import AboutSection from '../components/AboutSection.jsx'
import MissionSection from '../components/MissionSection.jsx'
import EnterpriseSection from '../components/EnterpriseSection.jsx'
import CTASection from '../components/CTASection.jsx'
import HomeFooter from '../components/HomeFooter.jsx'

export default function Home() {
  const location = useLocation()
  const navigate = useNavigate()
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    if (!location.hash) return
    const id = decodeURIComponent(location.hash.replace('#', ''))
    const el = document.getElementById(id)
    if (!el) return
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [location.hash])

  useEffect(() => {
    function handleScroll() {
      const doc = document.documentElement
      const maxScrollTop = doc.scrollHeight - doc.clientHeight
      const threshold = maxScrollTop / 2
      setShowBackToTop(doc.scrollTop > threshold)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <HomeHeader />
      <HeroSection />
      <StatsSection />
      <AboutSection />
      <MissionSection />
      <EnterpriseSection />
      <CTASection />
      <HomeFooter />
      {showBackToTop ? (
        <button
          type="button"
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-50 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2 focus:ring-offset-white"
          onClick={() => {
            if (location.hash) navigate(PATHS.home, { replace: true })
            requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
          }}
        >
          <ArrowUp className="h-5 w-5" aria-hidden="true" />
        </button>
      ) : null}
    </>
  )
}

