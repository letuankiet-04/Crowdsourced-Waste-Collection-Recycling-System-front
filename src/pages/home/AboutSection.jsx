import { Gift, MapPin, TrendingUp } from "lucide-react";
import Container from "../../components/ui/Container";

export default function AboutSection() {
  return (
    <>
      <section className="py-16" id="about">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              About the Project
            </h2>
            <p className="mt-4 text-slate-600">
            Our platform streamlines waste reporting and rewards citizens for
            their environmental contributions, making sustainability accessible
            for everyone.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">

            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <MapPin className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">Report Waste</h3>
              <p className="mt-2 text-slate-600">
                Easily report waste issues in your neighborhood with intuitive
                mobile tools and geo-tagging features.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Gift className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">Earn Rewards</h3>
              <p className="mt-2 text-slate-600">
                Get points for every verified report and redeem them for local
                benefits, discounts, and green perks.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <TrendingUp className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">Track Progress</h3>
              <p className="mt-2 text-slate-600">
                Monitor your personal impact and see how your city becomes
                cleaner with real-time analytics dashboards.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
