import Container from "../../components/ui/Container";

export default function StatsSection() {
  const stats = [
    { value: "5K+", label: "TONS COLLECTED" },
    { value: "1K+", label: "ACTIVE USERS" },
    { value: "570+", label: "ACIVE COLLECTORS" },
  ];

  return (
    <>
      <section className="bg-slate-50 py-16">
        <Container>
          <div className="grid grid-cols-1 gap-10 text-center md:grid-cols-3">
            {stats.map((item, index) => (
              <div key={index}>
                <h2 className="text-4xl font-extrabold text-emerald-700">{item.value}</h2>
                <p className="mt-2 text-sm font-semibold tracking-widest text-slate-500">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
