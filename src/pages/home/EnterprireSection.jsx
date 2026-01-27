import etp_img from "../../assets/enterprise.png";

export default function EnterpriseSection(){

    return(

        <>
    <section className="py-5">
  <div className="container">
    <div
      className="card border-0 shadow-sm rounded-4 p-4"
      style={{ backgroundColor: "#f9fbf9" }}
    >
      <div className="row align-items-center g-5">

        {/* LEFT IMAGE */}
        <div className="col-lg-5">
          <img
            src={etp_img}
            alt="Green building"
            className="img-fluid rounded-4 shadow-sm"
          />
        </div>

        {/* RIGHT CONTENT */}
        <div className="col-lg-7">
          <small
            className="fw-semibold"
            style={{
              color: "#22c55e",
              letterSpacing: "2px",
            }}
          >
            THE ENTERPRISE
          </small>

          <h2 className="fw-bold mt-3 mb-4">
            Leading Urban Sustainability
          </h2>

          <p
            className="text-muted mb-5"
            style={{ lineHeight: "1.8", maxWidth: "520px" }}
          >
            The organization behind the Citizen Portal is a global leader
            in waste management and urban greening. Since 2010, we’ve
            pioneered technologies that integrate ESG goals into the
            fabric of city living.
          </p>

          {/* STATS */}
          <div className="d-flex gap-5 mb-4">
            <div>
              <h4 className="fw-bold mb-0">100+</h4>
              <span className="text-muted">Corporate Partners</span>
            </div>
            <div>
              <h4 className="fw-bold mb-0">25</h4>
              <span className="text-muted">ESG Awards</span>
            </div>
          </div>

          {/* LINK */}
          <a
            href="#"
            className="fw-semibold text-dark text-decoration-none d-inline-flex align-items-center gap-2"
          >
            Read our 2023 ESG Report
            <span style={{ fontSize: "1.2rem" }}>→</span>
          </a>
        </div>

      </div>
    </div>
  </div>
</section>

        
        </>
    )
}