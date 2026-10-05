import { UserPlus } from 'lucide-react'
import { useState } from 'react'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { PageTitle } from '@/components/ui/page-title'
import { SearchField } from '@/components/ui/search-field'
import { SegmentedTabs } from '@/components/ui/segmented-tabs'
import { Spinner } from '@/components/ui/spinner'
import { ManagedOrganization } from '@/features/organizations/components/managed-organization'
import { useOverview } from '@/features/overview/api/get-overview'
import { useInvites } from '@/features/residents/api/get-invites'
import { useMembers } from '@/features/residents/api/get-members'
import {
  InviteActionDialogs,
  type InviteAction,
} from '@/features/residents/components/invite-action-dialogs'
import { InviteDrawer } from '@/features/residents/components/invite-drawer'
import { InvitesTable } from '@/features/residents/components/invites-table'
import { MembersTable } from '@/features/residents/components/members-table'
import { PendingInvites } from '@/features/residents/components/pending-invites'
import { useAuth } from '@/lib/use-auth'
import { formatMonthName, getCurrentMonth } from '@/utils/month'

import styles from './residents.module.css'

const pageTitle = 'Moradores'

type Tab = 'members' | 'invites'

function normalize(value: string) {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

function matches(query: string, ...fields: Array<string | null>) {
  const needle = normalize(query.trim())
  return (
    !needle ||
    fields.some((field) => field && normalize(field).includes(needle))
  )
}

function plural(count: number, singular: string, pluralForm: string) {
  return `${count} ${count === 1 ? singular : pluralForm}`
}

function ResidentsPage({
  organizationId,
  organizationName,
}: {
  organizationId: string
  organizationName: string
}) {
  const { user } = useAuth()
  const members = useMembers(organizationId)
  const invites = useInvites(organizationId)
  const month = getCurrentMonth()
  const overview = useOverview(organizationId, month)
  const [tab, setTab] = useState<Tab>('members')
  const [query, setQuery] = useState('')
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [action, setAction] = useState<InviteAction | null>(null)

  const memberList = members.data ?? []
  const inviteList = invites.data ?? []
  const unitCount = new Set(
    memberList.flatMap((member) =>
      member.unitLabel ? [member.unitLabel] : [],
    ),
  ).size
  const filteredMembers = memberList.filter((member) =>
    matches(query, member.name, member.email, member.unitLabel),
  )
  const filteredInvites = inviteList.filter((invite) =>
    matches(query, invite.email, invite.unitLabel),
  )
  const openInvites = filteredInvites.filter(
    (invite) => invite.status === 'PENDING' || invite.status === 'EXPIRED',
  )
  const residentSessions = overview.data
    ? Math.max(
        0,
        overview.data.sessionsCount - overview.data.visitorSessionsCount,
      )
    : null

  const isPending = members.isPending || invites.isPending
  const error = members.error ?? invites.error

  return (
    <>
      <PageTitle
        eyebrow={
          members.data
            ? `${plural(unitCount, 'unidade', 'unidades')} com acesso à recarga`
            : organizationName
        }
        title={pageTitle}
        actions={
          <Button
            variant="secondary"
            className={styles.invite}
            icon={<UserPlus size={18} strokeWidth={2} aria-hidden />}
            onClick={() => setIsInviteOpen(true)}
          >
            Convidar morador
          </Button>
        }
      />
      <div className={styles.toolbar}>
        <SegmentedTabs
          label="Lista"
          value={tab}
          onChange={setTab}
          tabs={[
            {
              id: 'members',
              label: members.data
                ? `Moradores (${memberList.length})`
                : 'Moradores',
            },
            {
              id: 'invites',
              label: invites.data
                ? `Convites (${inviteList.length})`
                : 'Convites',
            },
          ]}
        />
        <SearchField
          label={tab === 'members' ? 'Buscar morador' : 'Buscar convite'}
          placeholder={
            tab === 'members'
              ? 'Buscar por nome, unidade ou e-mail'
              : 'Buscar por e-mail ou unidade'
          }
          className={styles.search}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      {isPending ? (
        <div className={styles.state}>
          <Spinner label="Carregando moradores" />
        </div>
      ) : error ? (
        <Alert
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                void members.refetch()
                void invites.refetch()
              }}
            >
              Tentar novamente
            </Button>
          }
        >
          Não foi possível carregar os moradores e convites.
        </Alert>
      ) : tab === 'members' ? (
        <div role="tabpanel" aria-label="Moradores" className={styles.panel}>
          <MembersTable
            members={filteredMembers}
            currentUserId={user?.id}
            emptyMessage={
              query
                ? 'Nenhum morador encontrado com essa busca.'
                : 'Nenhum morador ainda. Convide o primeiro pelo botão acima.'
            }
            footer={
              filteredMembers.length > 0
                ? [
                    plural(filteredMembers.length, 'morador', 'moradores'),
                    residentSessions === null
                      ? null
                      : `${plural(residentSessions, 'sessão', 'sessões')} em ${formatMonthName(month)}`,
                  ]
                    .filter(Boolean)
                    .join(' · ')
                : undefined
            }
          />
          <PendingInvites invites={openInvites} onAction={setAction} />
        </div>
      ) : (
        <div role="tabpanel" aria-label="Convites" className={styles.panel}>
          <InvitesTable
            invites={filteredInvites}
            emptyMessage={
              query
                ? 'Nenhum convite encontrado com essa busca.'
                : 'Nenhum convite enviado ainda.'
            }
            onAction={setAction}
          />
        </div>
      )}
      <InviteActionDialogs
        organizationId={organizationId}
        action={action}
        onClose={() => setAction(null)}
      />
      <InviteDrawer
        organizationId={organizationId}
        organizationName={organizationName}
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />
    </>
  )
}

export function ResidentsRoute() {
  return (
    <ManagedOrganization title={pageTitle}>
      {(organization) => (
        <ResidentsPage
          key={organization.id}
          organizationId={organization.id}
          organizationName={organization.name}
        />
      )}
    </ManagedOrganization>
  )
}
