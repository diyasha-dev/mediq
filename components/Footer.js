import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-ash bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-1.5 mb-3">
              <div className="w-8 h-8 flex items-center justify-center">
                <img src="/logo.png" alt="MedIQ Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-lg font-heading text-charcoal tracking-tight">
                Med<span className="text-teal">IQ</span>
              </span>
            </Link>
            <p className="text-sm text-muted leading-relaxed">
              Evidence-based drug information explained in plain English.
            </p>
          </div>

          {/* Tools */}
          <div>
            <p className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-3">Tools</p>
            <ul className="space-y-2">
              <li><Link href="/search" className="text-sm text-slate hover:text-teal transition-colors">Medicine Search</Link></li>
              <li><Link href="/interactions" className="text-sm text-slate hover:text-teal transition-colors">Interaction Checker</Link></li>
              <li><Link href="/report" className="text-sm text-slate hover:text-teal transition-colors">Report Explainer</Link></li>
              <li><Link href="/vault" className="text-sm text-slate hover:text-teal transition-colors">Medication Vault</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <p className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-3">Resources</p>
            <ul className="space-y-2">
              <li><a href="https://github.com/diyasha-dev/mediq#readme" target="_blank" rel="noopener noreferrer" className="text-sm text-slate hover:text-teal transition-colors">How It Works</a></li>
              <li><a href="https://open.fda.gov/apis/drug/" target="_blank" rel="noopener noreferrer" className="text-sm text-slate hover:text-teal transition-colors">Data Sources</a></li>
              <li><a href="https://github.com/diyasha-dev/mediq#readme" target="_blank" rel="noopener noreferrer" className="text-sm text-slate hover:text-teal transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-3">Legal</p>
            <ul className="space-y-2">
              <li><a href="https://github.com/diyasha-dev/mediq" target="_blank" rel="noopener noreferrer" className="text-sm text-slate hover:text-teal transition-colors">Privacy Policy</a></li>
              <li><a href="https://github.com/diyasha-dev/mediq" target="_blank" rel="noopener noreferrer" className="text-sm text-slate hover:text-teal transition-colors">Terms of Service</a></li>
              <li><a href="https://github.com/diyasha-dev/mediq#%E2%9A%A0%EF%B8%8F-disclaimer" target="_blank" rel="noopener noreferrer" className="text-sm text-slate hover:text-teal transition-colors">Medical Disclaimer</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-ash pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted">
            © 2025 MedIQ. Not a substitute for professional medical advice.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              FDA / NHS verified data
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Private by default
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
