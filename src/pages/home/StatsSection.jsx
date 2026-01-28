export default function StatsSection() {
  const stats = [
    { value: "5K+", label: "TONS COLLECTED" },
    { value: "1K+", label: "ACTIVE USERS" },
    { value: "570+", label: "ACIVE COLLECTORS" },
  ];

  return (
    <>
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row text-center">
            {stats.map((item, index) => (
              <div className="col-md-4 mb-3" key={index}>
                <h2 className="fw-bold text-success">{item.value}</h2>
                <p className="text-muted">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
