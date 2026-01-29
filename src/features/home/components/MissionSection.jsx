import img01 from '../../../assets/mission_01.jpg'
import img02 from '../../../assets/mission_02.jpg'
import { Check } from 'lucide-react'
import Section from '../../../components/ui/Section.jsx'
import IconListItem from '../../../components/ui/IconListItem.jsx'

const MISSION_ITEMS = [
  {
    title: 'Environmental Sustainability',
    description: 'Promoting a circular economy by reducing landfill waste and increasing recycling rates.',
  },
  {
    title: 'Community Empowerment',
    description: 'Connecting residents with authorities for a transparent, collaborative approach.',
  },
]

export default function MissionSection() {
  return (
    <Section className="bg-white">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Our Mission</h2>

          <p className="mt-5 text-slate-600" style={{ lineHeight: '1.8' }}>
            We are driving environmental sustainability through deep community involvement and innovative waste management
            solutions. Our goal is to transform the way urban centers handle circular economy challenges.
          </p>

          <div className="mt-8 grid gap-6">
            {MISSION_ITEMS.map((item) => (
              <IconListItem key={item.title} icon={Check} title={item.title} description={item.description} />
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-6">
          <img
            src={img01}
            alt="Waste management"
            className="h-[420px] w-[320px] rounded-2xl object-cover shadow-lg shadow-slate-900/10"
          />
          <img
            src={img02}
            alt="Community"
            className="mt-14 hidden h-[420px] w-[320px] rounded-2xl object-cover shadow-lg shadow-slate-900/10 sm:block"
          />
        </div>
      </div>
    </Section>
  )
}

