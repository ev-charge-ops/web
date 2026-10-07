const powerFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1,
})

export function formatPower(kilowatts: number) {
  return `${powerFormatter.format(kilowatts)} kW`
}
