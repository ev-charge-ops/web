const monthFormatter = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  timeZone: 'America/Sao_Paulo',
})

const monthLabelFormatter = new Intl.DateTimeFormat('pt-BR', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

const monthNameFormatter = new Intl.DateTimeFormat('pt-BR', {
  month: 'long',
  timeZone: 'UTC',
})

const shortMonthFormatter = new Intl.DateTimeFormat('pt-BR', {
  month: 'short',
  timeZone: 'UTC',
})

const monthPattern = /^\d{4}-(0[1-9]|1[0-2])$/

function toUtcDate(month: string) {
  const [year, monthIndex] = month.split('-').map(Number)
  return new Date(Date.UTC(year, monthIndex - 1, 15))
}

export function isMonth(value: string | null | undefined): value is string {
  return Boolean(value && monthPattern.test(value))
}

export function getCurrentMonth(now: Date = new Date()) {
  return monthFormatter.format(now).slice(0, 7)
}

export function shiftMonth(month: string, offset: number) {
  const date = toUtcDate(month)
  date.setUTCMonth(date.getUTCMonth() + offset)
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

export function formatMonth(month: string) {
  return monthLabelFormatter.format(toUtcDate(month))
}

export function formatMonthName(month: string) {
  return monthNameFormatter.format(toUtcDate(month))
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function formatMonthTitle(month: string) {
  return capitalize(formatMonth(month))
}

export function formatShortMonth(month: string) {
  const name = shortMonthFormatter.format(toUtcDate(month)).replace('.', '')
  return `${capitalize(name)} ${month.slice(0, 4)}`
}

export function getMonthLastDay(month: string) {
  const [year, monthIndex] = month.split('-').map(Number)
  const day = new Date(Date.UTC(year, monthIndex, 0)).getUTCDate()
  return `${String(day).padStart(2, '0')}/${String(monthIndex).padStart(2, '0')}`
}
