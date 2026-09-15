import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { TextField } from './text-field'

describe('TextField', () => {
  it('associates the label with the input', async () => {
    render(<TextField label="E-mail" />)

    const input = screen.getByLabelText('E-mail')
    await userEvent.type(input, 'sindica@condominio.com')

    expect(input).toHaveValue('sindica@condominio.com')
  })

  it('describes the input with its hint', () => {
    render(<TextField label="Unidade" hint="Ex.: 42" />)

    expect(screen.getByLabelText('Unidade')).toHaveAccessibleDescription(
      'Ex.: 42',
    )
  })

  it('marks the input as invalid and announces the error', () => {
    render(<TextField label="E-mail" error="Informe um e-mail válido" />)

    const input = screen.getByLabelText('E-mail')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('Informe um e-mail válido')
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Informe um e-mail válido',
    )
  })

  it('is valid when there is no error', () => {
    render(<TextField label="E-mail" />)

    expect(screen.getByLabelText('E-mail')).not.toHaveAttribute('aria-invalid')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
