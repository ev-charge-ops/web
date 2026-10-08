const connectors = new Set(['da', 'das', 'de', 'do', 'dos', 'e'])

export function getInitials(name: string) {
  const words = name
    .trim()
    .split(/\s+/)
    .filter((word) => word && !connectors.has(word.toLowerCase()))

  const letters =
    words.length > 1
      ? [words[0][0], words[1][0]]
      : Array.from(words[0] ?? '').slice(0, 2)

  return letters.join('').toLocaleUpperCase('pt-BR')
}
