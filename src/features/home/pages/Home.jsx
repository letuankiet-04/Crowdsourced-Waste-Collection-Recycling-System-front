import HomeHeader from '../components/HomeHeader.jsx'
import HeroSection from '../components/HeroSection.jsx'
import StatsSection from '../components/StatsSection.jsx'
import AboutSection from '../components/AboutSection.jsx'
import MissionSection from '../components/MissionSection.jsx'
import EnterpriseSection from '../components/EnterpriseSection.jsx'
import CTASection from '../components/CTASection.jsx'
import HomeFooter from '../components/HomeFooter.jsx'

export default function Home() {
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
    </>
  )
}

