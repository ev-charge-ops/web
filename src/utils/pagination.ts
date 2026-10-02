export function getPageItems(page: number, pageCount: number) {
  const pages = new Set([1, pageCount, page - 1, page, page + 1])
  const sorted = [...pages]
    .filter((value) => value >= 1 && value <= pageCount)
    .sort((a, b) => a - b)
  return sorted.flatMap((value, index) =>
    index > 0 && value - sorted[index - 1] > 1
      ? (['gap', value] as const)
      : [value],
  )
}
