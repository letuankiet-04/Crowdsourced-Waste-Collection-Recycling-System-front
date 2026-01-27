import { Link } from "react-router-dom";
import logo from "../../assets/app-logo.jpg";

export default function HomeHeader() {
  return (
    <>
       <nav className="navbar bg-dark border-bottom border-secondary">
      <div className="container py-2">

        {/* LOGO */}
        <Link
          to="/home"
          className="navbar-brand d-flex align-items-center gap-2 text-light fw-semibold"
        >
          <img
            src={logo}
            alt="Citizen Portal"
            width="32"
            height="32"
          />
          Citizen Portal
        </Link>

        {/* MENU – LUÔN HIỆN */}
        <div className="d-flex align-items-center gap-4">
          <Link className="text-light text-decoration-none" to="/home">
            Home
          </Link>
          <Link className="text-light text-decoration-none" to="/home#about">
            About
          </Link>
          <Link className="text-light text-decoration-none" to="/home#contact">
            Contact
          </Link>

          <Link to="/auth/login" className="btn btn-success px-4">
            Login
          </Link>
        </div>

      </div>
    </nav>
    </>
  );
}
