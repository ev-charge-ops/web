const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const amountFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatCurrency(value: number) {
  return brlFormatter.format(value)
}

export function formatCents(cents: number) {
  return formatCurrency(cents / 100)
}

export function formatCentsAmount(cents: number) {
  return amountFormatter.format(cents / 100)
}
