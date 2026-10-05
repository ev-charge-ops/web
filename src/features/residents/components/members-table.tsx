import type { ReactNode } from 'react'

import { StatusPill } from '@/components/ui/status-pill'
import tableStyles from '@/components/ui/table.module.css'
import { cn } from '@/utils/cn'
import { getInitials } from '@/utils/initials'

import type { OrganizationMember } from '../api/get-members'
import { membershipRoleLabels } from '../utils/labels'
import styles from './residents-table.module.css'

const monthYearFormatter = new Intl.DateTimeFormat('pt-BR', {
  month: '2-digit',
  year: 'numeric',
  timeZone: 'America/Sao_Paulo',
})

type MembersTableProps = {
  members: OrganizationMember[]
  currentUserId?: string
  emptyMessage: string
  footer?: ReactNode
}

export function MembersTable({
  members,
  currentUserId,
  emptyMessage,
  footer,
}: MembersTableProps) {
  return (
    <section className={styles.card} aria-label="Lista de moradores">
      {members.length === 0 ? (
        <p className={styles.empty}>{emptyMessage}</p>
      ) : (
        <div className={tableStyles.wrap}>
          <table
            className={cn(tableStyles.table, styles.table)}
            aria-label="Moradores"
          >
            <thead>
              <tr>
                <th scope="col">Nome</th>
                <th scope="col">Unidade</th>
                <th scope="col">E-mail</th>
                <th scope="col">Desde</th>
                <th scope="col">Papel</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.userId}>
                  <td>
                    <span className={styles.who}>
                      <span
                        className={cn(
                          styles.avatar,
                          member.userId === currentUserId && styles.self,
                        )}
                        aria-hidden="true"
                      >
                        {getInitials(member.name)}
                      </span>
                      {member.name}
                    </span>
                  </td>
                  <td>{member.unitLabel ?? '—'}</td>
                  <td>{member.email}</td>
                  <td>
                    <span className={tableStyles.num}>
                      {monthYearFormatter.format(new Date(member.joinedAt))}
                    </span>
                  </td>
                  <td>
                    <StatusPill
                      tone={member.role === 'MANAGER' ? 'info' : 'charging'}
                    >
                      {membershipRoleLabels[member.role]}
                    </StatusPill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {footer ? <p className={styles.footer}>{footer}</p> : null}
    </section>
  )
}
