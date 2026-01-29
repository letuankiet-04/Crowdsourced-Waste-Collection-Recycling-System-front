import { Link } from 'react-router-dom'
import logo from '../../../assets/app-logo.jpg'
import Button from '../../../components/ui/Button.jsx'
import Container from '../../../components/ui/Container.jsx'
import { PATHS } from '../../../routes/paths.js'

export default function HomeHeader() {
  return (
    <nav className="border-b border-slate-800 bg-slate-950">
      <Container className="flex items-center justify-between py-3">
        <Link to={PATHS.home} className="inline-flex items-center gap-2 font-semibold text-white">
          <img src={logo} alt="Citizen Portal" width="32" height="32" className="rounded" />
          Citizen Portal
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
          <Link className="text-sm font-medium text-white/90 transition hover:text-white" to={PATHS.home}>
            Home
          </Link>
          <Link className="text-sm font-medium text-white/90 transition hover:text-white" to={`${PATHS.home}#about`}>
            About
          </Link>
          <Link className="text-sm font-medium text-white/90 transition hover:text-white" to={`${PATHS.home}#contact`}>
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

