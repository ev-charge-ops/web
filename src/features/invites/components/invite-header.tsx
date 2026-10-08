import { ShieldCheck } from 'lucide-react'

import { formatDate } from '@/utils/format-date'
import { getInitials } from '@/utils/initials'

import type { InvitePreview } from '../api/get-invite-preview'
import styles from './invite-acceptance.module.css'

type InviteHeaderProps = {
  preview: InvitePreview
}

export function InviteHeader({ preview }: InviteHeaderProps) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>
        Você foi convidado para {preview.organizationName}
      </h1>
      <div className={styles.role}>
        <span className={styles.roleIcon}>
          <ShieldCheck size={18} strokeWidth={2} aria-hidden />
        </span>
        <span className={styles.roleText}>
          <span className={styles.roleName}>
            Morador
            {preview.unitLabel ? ` · unidade ${preview.unitLabel}` : ''}
          </span>
          <span className={styles.roleDescription}>
            Recargas pelo app, com o consumo no rateio da sua unidade
          </span>
        </span>
      </div>
      <p className={styles.meta}>
        <span className={styles.avatar} aria-hidden="true">
          {getInitials(preview.organizationName)}
        </span>
        <span>
          Enviado para <strong>{preview.email}</strong> · válido até{' '}
          {formatDate(preview.expiresAt)}
        </span>
      </p>
    </header>
  )
}
