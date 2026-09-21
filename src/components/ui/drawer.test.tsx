import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Drawer } from './drawer'

describe('Drawer', () => {
  it('renders a labelled dialog that closes on the button and Escape', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(
      <Drawer
        isOpen
        onClose={onClose}
        title="Convidar morador"
        description="Informe o e-mail."
      >
        <p>Conteúdo</p>
      </Drawer>,
    )

    expect(
      screen.getByRole('dialog', { name: 'Convidar morador' }),
    ).toHaveAccessibleDescription('Informe o e-mail.')
    expect(document.body.style.overflow).toBe('hidden')

    await user.click(screen.getAllByRole('button', { name: 'Fechar' })[1])
    await user.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('renders nothing when closed', () => {
    render(
      <Drawer isOpen={false} onClose={vi.fn()} title="Convidar morador">
        <p>Conteúdo</p>
      </Drawer>,
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
