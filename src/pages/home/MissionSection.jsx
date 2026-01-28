import img01 from "../../assets/mission_01.jpg";
import img02 from "../../assets/mission_02.jpg";

export default function MissionSection() {
  return (
    <>
     <section className="py-5 bg-white">
      <div className="container">
        <div className="row align-items-center">

          {/* LEFT CONTENT */}
          <div className="col-lg-6 pe-lg-5">
            <h2 className="fw-bold mb-4">Our Mission</h2>

            <p className="text-muted mb-5" style={{ lineHeight: "1.8" }}>
              We are driving environmental sustainability through deep community
              involvement and innovative waste management solutions. Our goal
              is to transform the way urban centers handle circular economy
              challenges.
            </p>

            <div className="d-flex align-items-start mb-4">
              <span className="badge bg-success rounded-circle p-3 me-3">
                ✓
              </span>
              <div>
                <h6 className="fw-semibold mb-1">
                  Environmental Sustainability
                </h6>
                <p className="text-muted mb-0">
                  Promoting a circular economy by reducing landfill waste and
                  increasing recycling rates.
                </p>
              </div>
            </div>

            <div className="d-flex align-items-start">
              <span className="badge bg-success rounded-circle p-3 me-3">
                ✓
              </span>
              <div>
                <h6 className="fw-semibold mb-1">
                  Community Empowerment
                </h6>
                <p className="text-muted mb-0">
                  Connecting residents with authorities for a transparent,
                  collaborative approach.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT IMAGES */}
          <div className="col-lg-6">
            <div className="d-flex justify-content-center align-items-start gap-4">

              {/* BIG IMAGE */}
              <img
                src={img01}
                alt="Waste management"
                className="rounded-4 shadow"
                style={{
                  width: "320px",
                  height: "420px",
                  objectFit: "cover",
                }}
              />

              {/* SMALL IMAGE */}
              <img
                src={img02}
                alt="Community"
                className="rounded-4 shadow"
                style={{
                  width: "320px",
                  height: "420px",
                  objectFit: "cover",
                  marginTop: "60px",
                }}
              />

            </div>
          </div>

        </div>
      </div>
    </section>
    </>
  );
}
