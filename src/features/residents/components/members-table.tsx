import { Alert } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { StatusPill } from '@/components/ui/status-pill'
import { formatDate } from '@/utils/format-date'

import { useMembers } from '../api/get-members'
import { membershipRoleLabels } from '../utils/labels'
import styles from '@/components/ui/table.module.css'

type MembersTableProps = {
  organizationId: string
}

export function MembersTable({ organizationId }: MembersTableProps) {
  const members = useMembers(organizationId)

  return (
    <Card flush>
      <div className={styles.head}>
        <h2 className={styles.title}>Moradores</h2>
        {members.data ? (
          <span className={styles.count}>{members.data.length}</span>
        ) : null}
      </div>
      {members.isPending ? (
        <div className={styles.state}>
          <Spinner label="Carregando moradores" />
        </div>
      ) : members.error ? (
        <div className={styles.state}>
          <Alert>Não foi possível carregar os moradores.</Alert>
        </div>
      ) : members.data.length === 0 ? (
        <p className={styles.empty}>Nenhum morador ainda.</p>
      ) : (
        <div className={styles.wrap}>
          <table className={styles.table} aria-label="Moradores">
            <thead>
              <tr>
                <th scope="col">Nome</th>
                <th scope="col">E-mail</th>
                <th scope="col">Unidade</th>
                <th scope="col">Papel</th>
                <th scope="col">Entrada</th>
              </tr>
            </thead>
            <tbody>
              {members.data.map((member) => (
                <tr key={member.userId}>
                  <td className={styles.strong}>{member.name}</td>
                  <td className={styles.muted}>{member.email}</td>
                  <td className={styles.mono}>{member.unitLabel ?? '—'}</td>
                  <td>
                    <StatusPill
                      tone={member.role === 'MANAGER' ? 'info' : 'offline'}
                    >
                      {membershipRoleLabels[member.role]}
                    </StatusPill>
                  </td>
                  <td className={styles.mono}>{formatDate(member.joinedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
