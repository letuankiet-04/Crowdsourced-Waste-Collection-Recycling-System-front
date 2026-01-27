import { Link } from "react-router-dom";
import banner from "../../assets/banner2.png";

export default function HeroSection() {
  return (
    <>
      <section className="py-5 text-white d-flex align-items-end"
      style={{
        backgroundImage: `linear-gradient(
          rgba(0,0,0,0.65),
          rgba(0,0,0,0.65)
        ), url(${banner})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "50vh",
      }}>
        <div className="container text-center" >
          <h1 className="display-5 fw-bold">
            Connecting Citizens for a Greener Tomorrow
          </h1>
          <p className="lead mt-3">
            Empowering communities to manage waste effectively and build a
            sustainable future.
          </p>
          <div className="mt-4">
            <Link to="/auth/signup" className="btn btn-success me-3">
            Get Started
          </Link>
            
          </div>
        </div>
      </section>
    </>
  );
}
