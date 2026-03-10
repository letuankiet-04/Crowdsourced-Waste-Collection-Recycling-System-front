import Container from '../ui/Container.jsx'
import { Recycle, Share2, Globe, MessageSquare, Mail, MapPin, Info, Asterisk } from 'lucide-react'
import { useState } from 'react'
import PolicyTermsDialog from '../ui/PolicyTermsDialog.jsx'

export default function CD_Footer({ portalName = 'Citizen Portal' }) {
  const year = new Date().getFullYear()
  const [open, setOpen] = useState(false)
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      <Container className="py-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600">
                <Recycle className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-semibold leading-tight text-slate-900">{portalName}</div>
            </div>
            <p className="mt-4">
              Crowdsourced Waste Collection & Recycling System. Empowering sustainable communities through high-tech
              waste management solutions.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <a href="#" aria-label="Share" className="text-slate-500 transition-colors hover:text-slate-900">
                <Share2 className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Website" className="text-slate-500 transition-colors hover:text-slate-900">
                <Globe className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Support chat" className="text-slate-500 transition-colors hover:text-slate-900">
                <MessageSquare className="h-5 w-5" />
              </a>
            </div>
            <div className="mt-6 text-xs text-slate-400">© {year} {portalName}. All rights reserved.</div>
          </div>

          

          <div>
            <h3 className="font-semibold text-slate-900">Contact & Support</h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 text-emerald-500" />
                <span>supportecostream@gmail.com</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-emerald-500" />
                <span>7 D1 Street, Long Thanh My Ward, Thu Duc District, Ho Chi Minh City, Vietnam</span>
              </li>
              <li className="flex items-start gap-3">
                <Info className="mt-0.5 h-5 w-5 text-emerald-500" />
                <button
                  type="button"
                  className="text-left text-slate-600 transition-colors hover:text-slate-900"
                  onClick={() => setOpen(true)}
                >
                  Privacy Policy &amp; Terms
                </button>
              </li>
            </ul>
          </div>

          <div className="md:pl-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900">Emergency Hotline</h3>
              <p className="mt-1 text-xs tracking-wider text-slate-500">AVAILABLE 24/7</p>
              <div className="mt-4 flex items-center gap-3">
                <Asterisk className="h-6 w-6 text-emerald-500" />
                <div className="text-2xl font-bold text-emerald-600">1800 1234</div>
              </div>
              <p className="mt-3 text-sm">
                Report urgent waste hazards or spillages immediately via the hotline.
              </p>
            </div>
          </div>
        </div>
      </Container>
      <PolicyTermsDialog open={open} onClose={() => setOpen(false)} />
    </footer>
  )
}
