import { ArrowLeft } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink } from 'react-router'

import { Logo } from '@/components/ui/logo'
import { companyIdentification } from '@/config/company'
import { paths } from '@/config/paths'
import { cn } from '@/utils/cn'

import styles from './legal-layout.module.css'

export type LegalSection = {
  id: string
  title: string
  content: ReactNode
}

type LegalLayoutProps = {
  title: string
  subtitle?: string
  version?: string
  sections: LegalSection[]
  intro?: ReactNode
}

const documents = [
  { href: paths.legal.terms.getHref(), label: 'Termos de uso' },
  { href: paths.legal.privacy.getHref(), label: 'Política de privacidade' },
  { href: paths.legal.support.getHref(), label: 'Suporte' },
]

function useActiveSection(ids: string[]) {
  const [activeId, setActiveId] = useState(ids[0])

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const visible = new Map<string, boolean>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visible.set(entry.target.id, entry.isIntersecting)
        }
        const first = ids.find((id) => visible.get(id))
        if (first) setActiveId(first)
      },
      { rootMargin: '0px 0px -65% 0px' },
    )
    for (const id of ids) {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    }
    return () => observer.disconnect()
  }, [ids])

  return activeId
}

export function LegalLayout({
  title,
  subtitle,
  version,
  sections,
  intro,
}: LegalLayoutProps) {
  const [ids] = useState(() => sections.map((section) => section.id))
  const activeId = useActiveSection(ids)

  return (
    <div className={styles.page}>
      <header className={styles.bar}>
        <Link to={paths.home.getHref()} className={styles.brand}>
          <Logo size={32} />
        </Link>
        <Link to={paths.home.getHref()} className={styles.back}>
          <ArrowLeft size={18} strokeWidth={2} aria-hidden />
          Voltar ao portal
        </Link>
      </header>

      <div className={styles.layout}>
        <aside className={styles.toc}>
          <span className={styles.tocLabel}>Nesta página</span>
          <nav aria-label="Sumário" className={styles.tocLinks}>
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={cn(
                  styles.tocLink,
                  section.id === activeId && styles.tocActive,
                )}
                aria-current={section.id === activeId ? 'location' : undefined}
              >
                {section.title}
              </a>
            ))}
          </nav>
          <div className={styles.version}>
            {version ? <strong>Versão de {version}</strong> : null}
            <span>Projeto acadêmico FIAP Enterprise Challenge</span>
          </div>
        </aside>

        <main className={styles.main}>
          <article className={styles.article}>
            <nav aria-label="Documentos legais" className={styles.switcher}>
              {documents.map((document) => (
                <NavLink
                  key={document.href}
                  to={document.href}
                  className={({ isActive }) =>
                    cn(styles.switch, isActive && styles.switchActive)
                  }
                >
                  {document.label}
                </NavLink>
              ))}
            </nav>
            <div className={styles.heading}>
              <h1 className={styles.title}>{title}</h1>
              <p className={styles.subtitle}>
                {subtitle ??
                  `Versão de ${version} · em conformidade com a LGPD (Lei 13.709/2018)`}
              </p>
            </div>
            <div className={styles.doc}>
              {intro}
              {sections.map((section) => (
                <section key={section.id} aria-labelledby={section.id}>
                  <h2 id={section.id}>{section.title}</h2>
                  {section.content}
                </section>
              ))}
              {version ? (
                <p className={styles.notice}>
                  Versão de {version}. Avisaremos por e-mail e no app antes de
                  qualquer mudança relevante neste documento.
                </p>
              ) : null}
              <p className={styles.company}>{companyIdentification}</p>
            </div>
          </article>
        </main>
      </div>
    </div>
  )
}
