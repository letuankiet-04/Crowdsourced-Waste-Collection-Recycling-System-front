import { Link } from "react-router-dom";
import logo from "../../assets/app-logo.jpg";
import Button from "../../components/ui/Button";
import Container from "../../components/ui/Container";

export default function HomeHeader() {
  return (
    <>
      <nav className="border-b border-slate-800 bg-slate-950">
        <Container className="flex items-center justify-between py-3">

        {/* LOGO */}
        <Link
          to="/home"
          className="inline-flex items-center gap-2 font-semibold text-white"
        >
          <img
            src={logo}
            alt="Citizen Portal"
            width="32"
            height="32"
            className="rounded"
          />
          Citizen Portal
        </Link>

        {/* MENU – LUÔN HIỆN */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link className="text-sm font-medium text-white/90 transition hover:text-white" to="/home">
            Home
          </Link>
          <Link className="text-sm font-medium text-white/90 transition hover:text-white" to="/home#about">
            About
          </Link>
          <Link className="text-sm font-medium text-white/90 transition hover:text-white" to="/home#contact">
            Contact
          </Link>

          <Button as={Link} to="/auth/login" className="px-5">
            Login
          </Button>
        </div>

        </Container>
      </nav>
    </>
  );
}
