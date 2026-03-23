import { Link, useLocation, useNavigate } from 'react-router-dom'
import Button from '../../../shared/ui/Button.jsx'
import Container from '../../../shared/ui/Container.jsx'
import { PATHS } from '../../../app/routes/paths.js'

export default function HomeHeader() {
  const navigate = useNavigate()
  const location = useLocation()

  function scrollToSection(id) {
    if (location.pathname !== PATHS.home) {
      navigate(`${PATHS.home}#${id}`)
      return
    }

    navigate(`${PATHS.home}#${id}`)
    requestAnimationFrame(() => {
      const el = document.getElementById(id)
      if (!el) return
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  return (
    <nav className="border-b border-slate-800 bg-slate-950">
      <Container className="flex items-center justify-end py-3">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link className="text-sm font-medium text-white/90 transition hover:text-white" to={PATHS.home}>
            Home
          </Link>
          <Link
            className="text-sm font-medium text-white/90 transition hover:text-white"
            to={`${PATHS.home}#about`}
            onClick={(e) => {
              if (location.pathname === PATHS.home) {
                e.preventDefault()
                scrollToSection('about')
              }
            }}
          >
            About
          </Link>
          <Link
            className="text-sm font-medium text-white/90 transition hover:text-white"
            to={`${PATHS.home}#contact`}
            onClick={(e) => {
              if (location.pathname === PATHS.home) {
                e.preventDefault()
                scrollToSection('contact')
              }
            }}
          >
            Contact
          </Link>

          <Button as={Link} to={PATHS.auth.login} className="px-5">
            Login
          </Button>
        </div>
      </Container>
    </nav>
  )
}

