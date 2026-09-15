import { MetricTile } from '@/components/ui/metric-tile'
import { PageTitle } from '@/components/ui/page-title'
import { StatusPill } from '@/components/ui/status-pill'

import styles from './home.module.css'

export function HomeRoute() {
  return (
    <>
      <PageTitle
        title="Visão geral"
        description="Os indicadores do condomínio aparecem aqui assim que a medição estiver conectada."
        tag={<StatusPill tone="info">Em construção</StatusPill>}
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
