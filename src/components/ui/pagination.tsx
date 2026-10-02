import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/utils/cn'
import { getPageItems } from '@/utils/pagination'

import styles from './pagination.module.css'

type PaginationProps = {
  page: number
  pageSize: number
  total: number
  itemLabel: string
  onChange: (page: number) => void
}

const countFormatter = new Intl.NumberFormat('pt-BR')

export function Pagination({
  page,
  pageSize,
  total,
  itemLabel,
  onChange,
}: PaginationProps) {
  if (total === 0) return null

  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const first = (page - 1) * pageSize + 1
  const last = Math.min(total, page * pageSize)

  return (
    <div className={styles.pagination}>
      <span className={styles.status}>
        Mostrando {countFormatter.format(first)}–{countFormatter.format(last)}{' '}
        de {countFormatter.format(total)} {itemLabel}
      </span>
      {pageCount > 1 ? (
        <nav className={styles.pages} aria-label="Paginação">
          <button
            type="button"
            className={cn(styles.page, styles.step)}
            aria-label="Página anterior"
            disabled={page <= 1}
            onClick={() => onChange(page - 1)}
          >
            <ChevronLeft size={18} strokeWidth={2} aria-hidden />
          </button>
          {getPageItems(page, pageCount).map((item, index) =>
            item === 'gap' ? (
              <span
                key={`gap-${index}`}
                className={styles.gap}
                aria-hidden="true"
              >
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                className={styles.page}
                aria-current={item === page ? 'page' : undefined}
                aria-label={`Página ${item}`}
                onClick={() => onChange(item)}
              >
                {item}
              </button>
            ),
          )}
          <button
            type="button"
            className={cn(styles.page, styles.step)}
            aria-label="Próxima página"
            disabled={page >= pageCount}
            onClick={() => onChange(page + 1)}
          >
            <ChevronRight size={18} strokeWidth={2} aria-hidden />
          </button>
        </nav>
      ) : null}
    </div>
  )
}
