const extendedFilenamePattern = /filename\*\s*=\s*[^']*'[^']*'([^;]+)/i
const filenamePattern = /filename\s*=\s*(?:"([^"]*)"|([^;]+))/i

function decodeExtendedValue(value: string) {
  try {
    return decodeURIComponent(value.trim())
  } catch {
    return null
  }
}

export function getContentDispositionFilename(header: string | null) {
  if (!header) return null

  const extended = extendedFilenamePattern.exec(header)
  const extendedName = extended ? decodeExtendedValue(extended[1]) : null
  if (extendedName) return extendedName

  const plain = filenamePattern.exec(header)
  const name = (plain?.[1] ?? plain?.[2] ?? '').trim()
  return name || null
}
