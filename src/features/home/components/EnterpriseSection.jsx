import enterpriseImage from '../../../assets/enterprise.png'
import Container from '../../../components/ui/Container.jsx'

export default function EnterpriseSection() {
  return (
    <section className="py-16">
      <Container>
        <div className="rounded-2xl bg-emerald-50/40 p-6 shadow-sm ring-1 ring-slate-200 sm:p-10">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <img
                src={enterpriseImage}
                alt="Green building"
                className="w-full rounded-2xl shadow-lg shadow-slate-900/10"
              />
            </div>

            <div className="lg:col-span-7">
              <p className="text-xs font-semibold tracking-[0.2em] text-emerald-600">THE ENTERPRISE</p>

              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Leading Urban Sustainability
              </h2>

              <p className="mt-5 max-w-xl text-slate-600" style={{ lineHeight: '1.8' }}>
                The organization behind the Citizen Portal is a global leader in waste management and urban greening.
                Since 2010, we’ve pioneered technologies that integrate ESG goals into the fabric of city living.
              </p>

              <div className="mt-8 flex flex-wrap gap-10">
                <div>
                  <div className="text-2xl font-bold text-slate-900">100+</div>
                  <div className="mt-1 text-sm text-slate-600">Corporate Partners</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">25</div>
                  <div className="mt-1 text-sm text-slate-600">ESG Awards</div>
                </div>
              </div>

              <a
                href="#"
                className="mt-8 inline-flex items-center gap-2 font-semibold text-slate-900 transition hover:text-emerald-700"
              >
                Read our 2023 ESG Report
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

