import { Info } from 'lucide-react'

import { Alert } from '@/components/ui/alert'
import { PageTitle } from '@/components/ui/page-title'
import { Spinner } from '@/components/ui/spinner'
import { useChargePoints } from '@/features/charge-points/api/get-charge-points'
import type { PointLive } from '@/features/charge-points/components/charge-point-card'
import { ChargePointsGrid } from '@/features/charge-points/components/charge-points-grid'
import { DynamicPriceCard } from '@/features/charge-points/components/dynamic-price-card'
import { FullLoadCard } from '@/features/charge-points/components/full-load-card'
import { ManagedOrganization } from '@/features/organizations/components/managed-organization'
import {
  overviewLiveRefreshMs,
  useOverview,
  type OrganizationOverview,
} from '@/features/overview/api/get-overview'
import { ElectricalCapacityCard } from '@/features/overview/components/electrical-capacity-card'
import { formatPercent } from '@/utils/format-percent'
import { formatPower } from '@/utils/format-power'
import { getCurrentMonth } from '@/utils/month'

import styles from './charge-points.module.css'

const pageTitle = 'Pontos e capacidade'
const refreshSeconds = overviewLiveRefreshMs / 1000

function CapacityTiles({
  capacity,
}: {
  capacity: OrganizationOverview['capacity']
}) {
  const tiles = [
    { label: 'Contratada', value: capacity.contractedDemandKw },
    { label: 'Reserva comum', value: capacity.commonAreaReserveKw },
    {
      label: 'Para recarga',
      value: Math.max(
        0,
        capacity.contractedDemandKw - capacity.commonAreaReserveKw,
      ),
    },
  ]

  return (
    <dl className={styles.tiles}>
      {tiles.map(({ label, value }) => (
        <div className={styles.tile} key={label}>
          <dt>{label}</dt>
          <dd>{formatPower(value)}</dd>
        </div>
      ))}
      <div className={styles.tile}>
        <dt>Pico médio diário</dt>
        <dd>
          {formatPower(capacity.averagePeakDemandKw)}
          <span className={styles.tileHint}>
            {formatPercent(capacity.averagePeakUtilizationPercent)}
          </span>
        </dd>
      </div>
    </dl>
  )
}

function ChargePointsPage({ organizationId }: { organizationId: string }) {
  const overview = useOverview(organizationId, getCurrentMonth(), {
    refetchInterval: overviewLiveRefreshMs,
  })
  const chargePoints = useChargePoints(organizationId)
  const pointCount = chargePoints.data?.length
  const live = new Map<string, PointLive>(
    (overview.data?.chargePoints ?? []).map((point) => [
      point.id,
      {
        currentPowerKw: point.currentPowerKw,
        activeSession: point.activeSession,
      },
    ]),
  )

  return (
    <>
      <PageTitle
        eyebrow={
          pointCount === undefined
            ? `Atualizado a cada ${refreshSeconds} s`
            : `${pointCount} ${pointCount === 1 ? 'ponto' : 'pontos'} · atualizado a cada ${refreshSeconds} s`
        }
        title={pageTitle}
      />
      {overview.isPending ? (
        <div className={styles.state}>
          <Spinner label="Carregando capacidade" />
        </div>
      ) : overview.error ? (
        <Alert>Não foi possível carregar a capacidade elétrica.</Alert>
      ) : (
        <>
          <div className={styles.pair}>
            <ElectricalCapacityCard
              capacity={overview.data.capacity}
              chargePoints={overview.data.chargePoints}
              subtitle={`Alocação ao vivo · atualizada a cada ${refreshSeconds} s`}
              hasAvailableLegend
            >
              <CapacityTiles capacity={overview.data.capacity} />
            </ElectricalCapacityCard>
            <FullLoadCard
              capacity={overview.data.capacity}
              chargePoints={overview.data.chargePoints}
            />
          </div>
          <DynamicPriceCard chargePoints={overview.data.chargePoints} />
        </>
      )}
      <ChargePointsGrid organizationId={organizationId} live={live} />
      <p className={styles.note}>
        <Info size={20} strokeWidth={2} aria-hidden />
        <span>
          <strong>Cadastro de pontos pela equipe de implantação</strong>
          Para incluir, trocar ou remover um carregador, fale com o suporte. Os
          dados de potência e status chegam pela telemetria dos carregadores.
        </span>
      </p>
    </>
  )
}

export function ChargePointsRoute() {
  return (
    <ManagedOrganization title={pageTitle}>
      {(organization) => (
        <ChargePointsPage
          key={organization.id}
          organizationId={organization.id}
        />
      )}
    </ManagedOrganization>
  )
}
