const timeZone = 'America/Sao_Paulo'

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone,
})

const dayMonthFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  timeZone,
})

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  timeZone,
})

const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone,
})

function toDate(value: string | Date) {
  return typeof value === 'string' ? new Date(value) : value
}

export function formatDate(value: string | Date) {
  return dateFormatter.format(toDate(value))
}

export function formatDateTime(value: string | Date) {
  return dateTimeFormatter.format(toDate(value)).replace(',', '')
}

export function formatTime(value: string | Date) {
  return timeFormatter.format(toDate(value))
}

export function formatDayMonth(value: string | Date) {
  return dayMonthFormatter.format(toDate(value))
}

export function formatDayTime(value: string | Date) {
  return `${formatDayMonth(value)} · ${formatTime(value)}`
}
