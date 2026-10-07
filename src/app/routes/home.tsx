import { MetricTile } from '@/components/ui/metric-tile'
import { PageTitle } from '@/components/ui/page-title'
import { StatusPill } from '@/components/ui/status-pill'
import { useMe } from '@/features/auth/api/get-me'
import { roleLabels } from '@/features/auth/utils/role-labels'
import { useAuth } from '@/lib/use-auth'

import styles from './home.module.css'

export function HomeRoute() {
  const { user: sessionUser } = useAuth()
  const { data: me } = useMe()
  const user = me ?? sessionUser

  return (
    <>
      <PageTitle
        title={user ? `Olá, ${user.name}` : 'Visão geral'}
        description="Os indicadores do condomínio aparecem aqui assim que a medição estiver conectada."
        tag={
          user ? (
            <StatusPill tone="info">{roleLabels[user.role]}</StatusPill>
          ) : null
        }
      />
      <div className={styles.metrics}>
        <MetricTile eyebrow="Energia no mês" value="—" unit="kWh" hint="Sem medições ainda" />
        <MetricTile eyebrow="Valor a ratear" value="—" hint="Aguardando fechamento" />
        <MetricTile eyebrow="Pontos ativos" value="—" hint="Nenhum ponto cadastrado" />
        <MetricTile eyebrow="Moradores" value="—" hint="Nenhum convite enviado" />
      </div>
    </>
  )
}
