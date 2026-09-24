import {
  BatteryCharging,
  LayoutDashboard,
  Menu,
  PlugZap,
  SlidersHorizontal,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router'

import { paths } from '@/config/paths'
import { cn } from '@/utils/cn'

import styles from './dashboard-layout.module.css'

type NavItem = {
  to: string
  label: string
  description: string
  icon: LucideIcon
  end?: boolean
}

const navItems: NavItem[] = [
  {
    to: paths.home.getHref(),
    label: 'Visão geral',
    description: 'Resumo do condomínio',
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: paths.sessions.getHref(),
    label: 'Sessões',
    description: 'Recargas medidas e anomalias',
    icon: BatteryCharging,
  },
  {
    to: paths.chargePoints.getHref(),
    label: 'Pontos e capacidade',
    description: 'Status, carregadores e preço agora',
    icon: PlugZap,
  },
  {
    to: paths.rules.getHref(),
    label: 'Regras',
    description: 'Tarifas, tolerância e ocupação',
    icon: SlidersHorizontal,
  },
  {
    to: paths.residents.getHref(),
    label: 'Moradores',
    description: 'Moradores e convites do condomínio',
    icon: Users,
  },
]

function isActive(item: NavItem, pathname: string) {
  return item.end ? pathname === item.to : pathname.startsWith(item.to)
}

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
  const { pathname } = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const current = navItems.find((item) => isActive(item, pathname)) ?? navItems[0]

  useEffect(() => {
    if (!isMenuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <div className={styles.shell}>
      {isMenuOpen ? (
        <button
          type="button"
          className={styles.scrim}
          aria-label="Fechar menu"
          onClick={closeMenu}
        />
      ) : null}

      <aside
        id="main-menu"
        className={cn(styles.sidebar, isMenuOpen && styles.sidebarOpen)}
      >
        <div className={styles.brand}>
          <div>
            <div className={styles.brandName}>EV ChargeOps</div>
            <p className={styles.eyebrow}>Portal do condomínio</p>
          </div>
          <button
            type="button"
            className={styles.closeMenu}
            aria-label="Fechar menu"
            onClick={closeMenu}
          >
            <X size={18} strokeWidth={2} aria-hidden />
          </button>
        </div>

        <nav className={styles.nav} aria-label="Seções do portal">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={closeMenu}
              className={({ isActive: active }) =>
                cn(styles.navItem, active && styles.navItemActive)
              }
            >
              <Icon size={17} strokeWidth={2} aria-hidden />
              <span className={styles.navLabel}>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <button
            type="button"
            className={styles.openMenu}
            aria-label="Abrir menu"
            aria-expanded={isMenuOpen}
            aria-controls="main-menu"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu size={20} strokeWidth={2} aria-hidden />
          </button>

          <div className={styles.topbarTitle}>
            <span className={styles.title}>{current.label}</span>
            <span className={styles.description}>{current.description}</span>
          </div>

          {organization ? (
            <div className={styles.organization}>{organization}</div>
          ) : null}
          {user ? <div className={styles.user}>{user}</div> : null}
        </header>

        <main className={styles.page}>{children}</main>
      </div>
    </div>
  )
}
