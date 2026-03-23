import { Link } from 'react-router-dom'
import Button from '../../../shared/ui/Button.jsx'
import Container from '../../../shared/ui/Container.jsx'
import { PATHS } from '../../../app/routes/paths.js'

export default function CTASection() {
  return (
    <section className="bg-emerald-50 py-16 text-center" id="cta">
      <Container>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Ready to make a difference?</h2>
        <p className="mx-auto mt-4 max-w-2xl text-slate-600">Join citizens contributing to a cleaner community.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button as={Link} to={PATHS.auth.signup} size="lg">
            Sign Up Now
          </Button>
        </div>
      </Container>
    </section>
  )
}

