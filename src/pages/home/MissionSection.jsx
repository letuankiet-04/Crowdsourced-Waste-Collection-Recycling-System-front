import img01 from "../../assets/mission_01.jpg";
import img02 from "../../assets/mission_02.jpg";
import { Check } from "lucide-react";
import Container from "../../components/ui/Container";

export default function MissionSection() {
  return (
    <>
      <section className="bg-white py-16">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">

          {/* LEFT CONTENT */}
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Our Mission
              </h2>

              <p className="mt-5 text-slate-600" style={{ lineHeight: "1.8" }}>
              We are driving environmental sustainability through deep community
              involvement and innovative waste management solutions. Our goal
              is to transform the way urban centers handle circular economy
              challenges.
            </p>

              <div className="mt-8 grid gap-6">
                <div className="flex items-start gap-4">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <Check className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                  Environmental Sustainability
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                  Promoting a circular economy by reducing landfill waste and
                  increasing recycling rates.
                </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <Check className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                  Community Empowerment
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                  Connecting residents with authorities for a transparent,
                  collaborative approach.
                </p>
                  </div>
                </div>
              </div>
            </div>

          {/* RIGHT IMAGES */}
            <div className="flex justify-center gap-6">

              {/* BIG IMAGE */}
              <img
                src={img01}
                alt="Waste management"
                className="h-[420px] w-[320px] rounded-2xl object-cover shadow-lg shadow-slate-900/10"
              />

              {/* SMALL IMAGE */}
              <img
                src={img02}
                alt="Community"
                className="mt-14 hidden h-[420px] w-[320px] rounded-2xl object-cover shadow-lg shadow-slate-900/10 sm:block"
              />

            </div>

          </div>
        </Container>
      </section>
    </>
  );
}
