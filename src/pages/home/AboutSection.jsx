export default function AboutSection() {
  return (
    <>
       <section className="py-5">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="fw-bold">About the Project</h2>
          <p className="text-secondary">
            Our platform streamlines waste reporting and rewards citizens for
            their environmental contributions, making sustainability accessible
            for everyone.
          </p>
        </div>

        <div className="row g-4">

          <div className="col-md-4">
            <div className="p-4 h-100 rounded-4  border border-secondary text-start">
              <div className="mb-3">
                <i className="bi bi-map fs-2 text-success"></i>
              </div>
              <h5 className="fw-bold">Report Waste</h5>
              <p className="text-secondary">
                Easily report waste issues in your neighborhood with intuitive
                mobile tools and geo-tagging features.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="p-4 h-100 rounded-4 border border-secondary text-start">
              <div className="mb-3">
                <i className="bi bi-gift fs-2 text-success"></i>
              </div>
              <h5 className="fw-bold">Earn Rewards</h5>
              <p className="text-secondary">
                Get points for every verified report and redeem them for local
                benefits, discounts, and green perks.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="p-4 h-100 rounded-4 border border-secondary text-start">
              <div className="mb-3">
                <i className="bi bi-graph-up-arrow fs-2 text-success"></i>
              </div>
              <h5 className="fw-bold">Track Progress</h5>
              <p className="text-secondary">
                Monitor your personal impact and see how your city becomes
                cleaner with real-time analytics dashboards.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
