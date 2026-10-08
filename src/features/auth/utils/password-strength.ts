export const minPasswordLength = 8

export type PasswordRule = {
  id: 'length' | 'case' | 'digit' | 'symbol'
  label: string
  isRequired: boolean
  test: (password: string) => boolean
}

export const passwordRules: PasswordRule[] = [
  {
    id: 'length',
    label: `Pelo menos ${minPasswordLength} caracteres`,
    isRequired: true,
    test: (password) => password.length >= minPasswordLength,
  },
  {
    id: 'case',
    label: 'Letras maiúsculas e minúsculas',
    isRequired: false,
    test: (password) => /[a-z]/.test(password) && /[A-Z]/.test(password),
  },
  {
    id: 'digit',
    label: 'Pelo menos um número',
    isRequired: false,
    test: (password) => /\d/.test(password),
  },
  {
    id: 'symbol',
    label: 'Um símbolo, como ! ou #',
    isRequired: false,
    test: (password) => /[^A-Za-z0-9]/.test(password),
  },
]

export const strengthLevels = 4

export const strengthLabels = ['', 'Fraca', 'Razoável', 'Boa', 'Forte']

export function getPasswordStrength(password: string) {
  if (!password) return 0
  if (password.length < minPasswordLength) return 1
  const optional = passwordRules.filter(
    (rule) => !rule.isRequired && rule.test(password),
  ).length
  const lengthBonus = password.length >= 12 ? 1 : 0
  return Math.min(strengthLevels, 1 + optional + lengthBonus)
}

export const passwordHighlights = [
  'Link de uso único',
  'Outras sessões são encerradas',
  'Válido por 30 minutos',
]
