import { Gift, MapPin, TrendingUp } from 'lucide-react'
import Section from '../../../components/ui/Section.jsx'
import IconFeatureCard from '../../../components/ui/IconFeatureCard.jsx'

const FEATURES = [
  {
    title: 'Report Waste',
    description: 'Easily report waste issues in your neighborhood with intuitive mobile tools and geo-tagging features.',
    icon: MapPin,
  },
  {
    title: 'Earn Rewards',
    description: 'Get points for every verified report and redeem them for local benefits, discounts, and green perks.',
    icon: Gift,
  },
  {
    title: 'Track Progress',
    description: 'Monitor your personal impact and see how your city becomes cleaner with real-time analytics dashboards.',
    icon: TrendingUp,
  },
]

export default function AboutSection() {
  return (
    <Section
      id="about"
      title="About the Project"
      description="Our platform streamlines waste reporting and rewards citizens for their environmental contributions, making sustainability accessible for everyone."
    >
      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        {FEATURES.map((feature) => (
          <IconFeatureCard
            key={feature.title}
            title={feature.title}
            description={feature.description}
            icon={feature.icon}
          />
        ))}
      </div>
    </Section>
  )
}

