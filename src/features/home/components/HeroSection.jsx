import { Link } from 'react-router-dom'
import banner from '../../../assets/home_banner.png'
import Button from '../../../shared/ui/Button.jsx'
import Container from '../../../shared/ui/Container.jsx'
import { PATHS } from '../../../app/routes/paths.js'

export default function HeroSection() {
  return (
    <section
      className="flex min-h-[50vh] items-end py-16 text-white"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url(${banner})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Container className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Connecting Citizens for a Greener Tomorrow</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
          Empowering communities to manage waste effectively and build a sustainable future.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button as={Link} to={PATHS.auth.signup} size="lg">
            Get Started
          </Button>
        </div>
      </Container>
    </section>
  )
}

