import type { components } from '@/lib/api-schema'

type Statement = components['schemas']['MonthlyStatementResponseDto']
type StatementLine = components['schemas']['StatementLineDto']

function line(overrides: Partial<StatementLine>): StatementLine {
  return {
    unitLabel: 'A · 11',
    sessionsCount: 0,
    energyKwh: 0,
    energyCents: 0,
    accessFeeCents: 3500,
    idleFeeCents: 0,
    totalCents: 3500,
    ...overrides,
  }
}

export const statementLines: StatementLine[] = [
  line({ unitLabel: 'A · 11' }),
  line({
    unitLabel: 'B · 23',
    sessionsCount: 3,
    energyKwh: 38.33,
    energyCents: 3412,
    idleFeeCents: 200,
    totalCents: 7112,
  }),
  line({
    unitLabel: 'A · 12',
    sessionsCount: 1,
    energyKwh: 12.518,
    energyCents: 1114,
    totalCents: 4614,
  }),
]

export function createStatement(overrides: Partial<Statement> = {}): Statement {
  return {
    month: '2026-10',
    periodStart: '2026-10-01T03:00:00.000Z',
    periodEnd: '2026-11-01T03:00:00.000Z',
    accessFeeCents: 3500,
    lines: statementLines,
    totals: {
      sessionsCount: 4,
      energyKwh: 50.848,
      energyCents: 4526,
      accessFeeCents: 10500,
      idleFeeCents: 200,
      totalCents: 15226,
      unitsCount: 3,
    },
    ...overrides,
  }
}
