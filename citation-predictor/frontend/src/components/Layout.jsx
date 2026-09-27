import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Brain, BarChart2, Clock, Info, Zap, Menu, X } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { to: '/',         label: 'Home',    icon: Zap },
  { to: '/analyze',  label: 'Analyze', icon: Brain },
  { to: '/history',  label: 'History', icon: Clock },
  { to: '/about',    label: 'About',   icon: Info },
]

export default function Layout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="glass sticky top-0 z-50 border-b border-[rgba(108,99,255,0.15)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#A855F7] flex items-center justify-center">
              <Brain size={18} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-lg text-white font-[Space_Grotesk]">Citelytics</span>
              <span className="text-xs text-[#6C63FF] block leading-none">AI Citation Intelligence</span>
            </div>
          </NavLink>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[rgba(108,99,255,0.2)] text-[#6C63FF] border border-[rgba(108,99,255,0.3)]'
                      : 'text-[#94A3B8] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
                  }`
                }
              >
                <Icon size={15} />
                {label}
              </NavLink>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden text-[#94A3B8] hover:text-white" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-[rgba(108,99,255,0.15)] bg-[#0F172A] px-4 py-3 space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive ? 'bg-[rgba(108,99,255,0.2)] text-[#6C63FF]' : 'text-[#94A3B8]'
                  }`
                }
              >
                <Icon size={15} />
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* Main */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-[rgba(108,99,255,0.1)] py-6 text-center">
        <p className="text-[#475569] text-sm">
          Citelytics — Research Prototype |{' '}
          <span className="text-[#6C63FF]">Citation Likelihood Prediction in Generative Answer Engines</span>
        </p>
        <p className="text-[#334155] text-xs mt-1">
          By{' '}
          <a
            href="https://github.com/stephinarnold"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#6C63FF] hover:underline"
          >
            Stephin Arnold
          </a>
          {' '}· Demo model trained on synthetic data · Not affiliated with any AI provider.
        </p>
      </footer>

    </div>
  )
}
