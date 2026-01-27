import { Check, Leaf, Recycle, Sparkles } from 'lucide-react'

const HERO_IMAGE_SRC = `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
  'modern minimalist illustration, recycling and sustainability theme, friendly people sorting waste into color bins, clean vector-like flat design, soft gradients, indigo and emerald accents, white background, high quality, crisp shapes',
)}&image_size=landscape_16_9`

export default function LoginVisual({ appName = 'CrowdRecycle' }) {
  return (
    <section className="relative hidden overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-600 via-indigo-600 to-emerald-500 p-8 shadow-sm lg:flex">
      <div className="relative z-10 flex w-full flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
              <Recycle className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-wide">{appName}</div>
              <div className="text-xs text-white/80">Waste collection & recycling</div>
            </div>
          </div>

          <h1 className="mt-8 text-3xl font-semibold tracking-tight text-white">Welcome back</h1>
          <p className="mt-2 max-w-md text-sm leading-6 text-white/85">
            Sign in to manage pickups, track recycling contributions, and coordinate with your
            community.
          </p>

          <div className="mt-8 grid gap-3">
            <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                <Leaf className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">Cleaner neighborhoods</div>
                <div className="text-xs text-white/80">Coordinate pickups in minutes</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                <Sparkles className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">Reward-ready</div>
                <div className="text-xs text-white/80">Track your impact over time</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                <Check className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">Fast and secure</div>
                <div className="text-xs text-white/80">Clear feedback and accessible UI</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <div className="overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/15">
            <img
              src={HERO_IMAGE_SRC}
              alt="Recycling illustration"
              className="h-44 w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute -left-32 -top-24 h-80 w-80 rounded-full bg-white/30 blur-3xl" />
        <div className="absolute -bottom-40 -right-36 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl" />
      </div>
    </section>
  )
}

