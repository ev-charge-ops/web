const percentFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1,
})

export function formatPercent(value: number) {
  return `${percentFormatter.format(value)}%`
}
