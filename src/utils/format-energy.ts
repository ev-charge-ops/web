type FormatEnergyOptions = {
  maximumFractionDigits?: number
}

export function formatEnergy(
  kilowattHours: number,
  { maximumFractionDigits = 1 }: FormatEnergyOptions = {},
) {
  const value = new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits,
  }).format(kilowattHours)
  return `${value} kWh`
}
