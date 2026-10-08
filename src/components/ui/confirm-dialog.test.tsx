import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ConfirmDialog } from './confirm-dialog'

describe('ConfirmDialog', () => {
  it('confirms, cancels and closes on Escape', async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    const user = userEvent.setup()
    render(
      <ConfirmDialog
        isOpen
        title="Revogar convite?"
        description="O link deixa de funcionar."
        confirmLabel="Revogar"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    )

    expect(
      screen.getByRole('alertdialog', { name: 'Revogar convite?' }),
    ).toHaveAccessibleDescription('O link deixa de funcionar.')

    await user.click(screen.getByRole('button', { name: 'Revogar' }))
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    await user.keyboard('{Escape}')

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onCancel).toHaveBeenCalledTimes(2)
  })

  it('styles the confirmation as destructive when requested', () => {
    render(
      <ConfirmDialog
        isOpen
        isDestructive
        title="Revogar convite?"
        description="O link deixa de funcionar."
        confirmLabel="Revogar"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Revogar' }).className).toMatch(
      /destructive/,
    )
    expect(screen.getByRole('button', { name: 'Cancelar' }).className).toMatch(
      /secondary/,
    )
  })

  it('renders nothing when closed', () => {
    render(
      <ConfirmDialog
        isOpen={false}
        title="Revogar convite?"
        description="O link deixa de funcionar."
        confirmLabel="Revogar"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })
})
