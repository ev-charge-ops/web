import {
  LayoutDashboard,
  Menu,
  Plug,
  Receipt,
  Settings2,
  Users,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router'

import { Logo } from '@/components/ui/logo'
import { paths } from '@/config/paths'
import { cn } from '@/utils/cn'

import styles from './dashboard-layout.module.css'

type NavItem = {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

const navItems: NavItem[] = [
  {
    to: paths.home.getHref(),
    label: 'Visão geral',
    icon: LayoutDashboard,
    end: true,
  },
  { to: paths.sessions.getHref(), label: 'Sessões', icon: Zap },
  { to: paths.costSharing.getHref(), label: 'Rateio mensal', icon: Receipt },
  {
    to: paths.chargePoints.getHref(),
    label: 'Pontos e capacidade',
    icon: Plug,
  },
  { to: paths.rules.getHref(), label: 'Regras de tarifa', icon: Settings2 },
  { to: paths.residents.getHref(), label: 'Moradores', icon: Users },
]

type DashboardLayoutProps = {
  children: ReactNode
  user?: ReactNode
  organization?: ReactNode
}

export function DashboardLayout({
  children,
  user,
  organization,
}: DashboardLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const openButtonRef = useRef<HTMLButtonElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isMenuOpen) return
    const openButton = openButtonRef.current
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false)
    }
    closeButtonRef.current?.focus({ preventScroll: true })
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
      openButton?.focus({ preventScroll: true })
    }
  }, [isMenuOpen])

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <div className={styles.shell}>
      <header className={styles.mobileBar}>
        <Logo size={32} />
        <button
          ref={openButtonRef}
          type="button"
          className={styles.iconButton}
          aria-label="Abrir menu"
          aria-expanded={isMenuOpen}
          aria-controls="main-menu"
          onClick={() => setIsMenuOpen(true)}
        >
          <Menu size={20} strokeWidth={2} aria-hidden />
        </button>
      </header>

      {isMenuOpen ? (
        <button
          type="button"
          className={styles.scrim}
          aria-label="Fechar menu"
          tabIndex={-1}
          onClick={closeMenu}
        />
      ) : null}

      <aside
        id="main-menu"
        aria-label="Menu do portal"
        className={cn(styles.sidebar, isMenuOpen && styles.sidebarOpen)}
      >
        <div className={styles.brand}>
          <Logo size={36} />
          <button
            ref={closeButtonRef}
            type="button"
            className={cn(styles.iconButton, styles.closeMenu)}
            aria-label="Fechar menu"
            onClick={closeMenu}
          >
            <X size={20} strokeWidth={2} aria-hidden />
          </button>
        </div>

        {organization ? (
          <div className={styles.organization}>{organization}</div>
        ) : null}

        <nav className={styles.nav} aria-label="Principal">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={closeMenu}
              className={({ isActive }) =>
                cn(styles.navItem, isActive && styles.navItemActive)
              }
            >
              <Icon size={20} strokeWidth={2} aria-hidden />
              <span className={styles.navLabel}>{label}</span>
            </NavLink>
          ))}
        </nav>

        {user ? <div className={styles.footer}>{user}</div> : null}
      </aside>

      <main className={styles.page}>
        <div key={pathname} className={styles.view}>
          {children}
        </div>
      </main>
    </div>
  )
}
