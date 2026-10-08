import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from './button'

describe('Button', () => {
  it('renders as a non-submitting button by default', () => {
    render(<Button>Salvar</Button>)

    expect(screen.getByRole('button', { name: 'Salvar' })).toHaveAttribute(
      'type',
      'button',
    )
  })

  it('calls onClick when pressed', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Salvar</Button>)

    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('applies the requested variant', () => {
    render(<Button variant="secondary">Cancelar</Button>)

    expect(screen.getByRole('button', { name: 'Cancelar' }).className).toMatch(
      /secondary/,
    )
  })

  it.each(['primary', 'destructive', 'ghost'] as const)(
    'applies the %s variant',
    (variant) => {
      render(<Button variant={variant}>Ação</Button>)

      expect(screen.getByRole('button', { name: 'Ação' }).className).toMatch(
        new RegExp(variant),
      )
    },
  )

  it('applies the large size', () => {
    render(<Button size="lg">Iniciar</Button>)

    expect(screen.getByRole('button', { name: 'Iniciar' }).className).toMatch(
      /lg/,
    )
  })

  it('is disabled and shows a spinner while loading', async () => {
    const onClick = vi.fn()
    render(
      <Button isLoading onClick={onClick}>
        Salvar
      </Button>,
    )

    const button = screen.getByRole('button', { name: /Salvar/ })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('status')).toHaveTextContent('Carregando')

    await userEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })
})
