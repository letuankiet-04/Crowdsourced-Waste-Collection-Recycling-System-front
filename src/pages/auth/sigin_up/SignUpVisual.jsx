import { BadgeCheck, Leaf } from 'lucide-react'

const FOLIAGE_IMAGE_SRC = `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
  'lush green foliage wall background, realistic photo, soft depth of field, high detail, moody lighting, dark greens, professional photography, no text',
)}&image_size=portrait_16_9`

export default function SignUpVisual({ appName = 'CrowdRecycle' }) {
  return (
    <section className="relative hidden min-h-[640px] overflow-hidden lg:block">
      <img
        src={FOLIAGE_IMAGE_SRC}
        alt="Green foliage background"
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
      />

      <div className="absolute inset-0 bg-emerald-950/75" />
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/40 via-emerald-950/55 to-emerald-950/85" />

      <div className="relative flex h-full flex-col justify-between p-8">
        <div className="flex justify-end">
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-900/60 px-4 py-3 text-white shadow-sm ring-1 ring-white/10">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-800/60 ring-1 ring-white/10">
              <BadgeCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <div className="text-[11px] font-semibold tracking-widest">TRUSTED PARTNER</div>
              <div className="text-xs text-white/80">ISO 14001 Certified</div>
            </div>
          </div>
        </div>

        <div className="max-w-md">
          <div className="flex items-center gap-2 text-emerald-200">
            <Leaf className="h-4 w-4" aria-hidden="true" />
            <div className="text-sm font-semibold">{appName}</div>
          </div>

          <div className="mt-6 text-3xl font-semibold italic leading-tight tracking-tight text-white">
            “Connecting professionals with sustainable urban solutions.”
          </div>

          <div className="mt-6 flex items-center gap-3 text-sm text-white/80">
            <div className="h-1.5 w-10 rounded-full bg-emerald-400" />
            <div>Join 10,000+ sustainability experts</div>
          </div>
        </div>
      </div>
    </section>
  )
}

