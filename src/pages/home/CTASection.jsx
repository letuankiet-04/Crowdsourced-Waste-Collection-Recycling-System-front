
import { Link } from "react-router-dom";
export default function CTASection(){

    return(
        <>
        
          <section className="py-5 bg-success bg-opacity-10 text-center">
      <div className="container">
        <h2 className="fw-bold">Ready to make a difference?</h2>
        <p className="text-muted">
          Join citizens contributing to a cleaner community.
        </p>
        <div className="mt-3">
         
          <Link to="/auth/signup" className="btn btn-success me-3">
            Sign Up Now
          </Link>
          <Link to="/contact" className="btn btn-outline-success">
            Contact Sales
          </Link>
        </div>
      </div>
    </section>
    </>
    )
}