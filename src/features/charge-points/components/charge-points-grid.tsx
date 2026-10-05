import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

import { useChargePoints } from '../api/get-charge-points'
import { ChargePointCard, type PointLive } from './charge-point-card'
import styles from './charge-points-grid.module.css'

type ChargePointsGridProps = {
  organizationId: string
  live?: Map<string, PointLive>
}

export function ChargePointsGrid({
  organizationId,
  live,
}: ChargePointsGridProps) {
  const chargePoints = useChargePoints(organizationId)

  if (chargePoints.isPending) {
    return (
      <div className={styles.state}>
        <Spinner label="Carregando pontos" />
      </div>
    )
  }

  if (chargePoints.error) {
    return (
      <Alert
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => chargePoints.refetch()}
          >
            Tentar novamente
          </Button>
        }
      >
        Não foi possível carregar os pontos de recarga.
      </Alert>
    )
  }

  if (chargePoints.data.length === 0) {
    return (
      <Card>
        <p className={styles.empty}>
          Nenhum ponto de recarga neste condomínio.
        </p>
      </Card>
    )
  }

  return (
    <section aria-label="Pontos de recarga" className={styles.grid}>
      {chargePoints.data.map((chargePoint) => (
        <ChargePointCard
          key={chargePoint.id}
          chargePoint={chargePoint}
          live={live?.get(chargePoint.id)}
        />
      ))}
    </section>
  )
}
