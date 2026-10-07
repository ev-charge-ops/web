import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from './button'
import styles from './pagination.module.css'

type PaginationProps = {
  page: number
  pageSize: number
  total: number
  onChange: (page: number) => void
}

export function Pagination({ page, pageSize, total, onChange }: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  if (pageCount <= 1) return null

  return (
    <nav className={styles.pagination} aria-label="Paginação">
      <Button
        variant="outline"
        size="sm"
        icon={<ChevronLeft size={15} strokeWidth={2} aria-hidden />}
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Anterior
      </Button>
      <span className={styles.status}>
        Página {page} de {pageCount}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= pageCount}
        onClick={() => onChange(page + 1)}
      >
        Próxima
        <ChevronRight size={15} strokeWidth={2} aria-hidden />
      </Button>
    </nav>
  )
}
