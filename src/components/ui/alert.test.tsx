import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Alert } from './alert'

describe('Alert', () => {
  it('announces errors as alerts', () => {
    render(<Alert>Algo deu errado</Alert>)

    expect(screen.getByRole('alert')).toHaveTextContent('Algo deu errado')
  })

  it('announces other tones politely with an optional action', () => {
    render(
      <Alert tone="success" action={<a href="/login">Entrar</a>}>
        Tudo certo
      </Alert>,
    )

    expect(screen.getByRole('status')).toHaveTextContent('Tudo certo')
    expect(screen.getByRole('link', { name: 'Entrar' })).toBeInTheDocument()
  })
})
