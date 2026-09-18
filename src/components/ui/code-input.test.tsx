import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { CodeInput } from './code-input'

function ControlledCodeInput({
  onComplete,
}: {
  onComplete?: (value: string) => void
}) {
  const [value, setValue] = useState('')
  return (
    <>
      <CodeInput
        label="Código"
        value={value}
        onChange={setValue}
        onComplete={onComplete}
      />
      <output>{value}</output>
    </>
  )
}

function boxes() {
  return screen.getAllByRole('textbox')
}

describe('CodeInput', () => {
  it('renders six numeric boxes inside a labelled group', () => {
    render(<ControlledCodeInput />)

    expect(screen.getByRole('group', { name: 'Código' })).toBeInTheDocument()
    expect(boxes()).toHaveLength(6)
    expect(boxes()[0]).toHaveAttribute('inputmode', 'numeric')
    expect(boxes()[0]).toHaveAttribute('autocomplete', 'one-time-code')
  })

  it('moves to the next box while typing and ignores non digits', async () => {
    const onComplete = vi.fn()
    render(<ControlledCodeInput onComplete={onComplete} />)

    await userEvent.type(boxes()[0], '12a3456')

    expect(screen.getByRole('status')).toHaveTextContent('123456')
    expect(onComplete).toHaveBeenCalledWith('123456')
    expect(boxes()[5]).toHaveFocus()
  })

  it('fills every box when a code is pasted', async () => {
    const onComplete = vi.fn()
    const user = userEvent.setup()
    render(<ControlledCodeInput onComplete={onComplete} />)

    await user.click(boxes()[0])
    await user.paste('Código: 042 817')

    expect(boxes().map((box) => (box as HTMLInputElement).value)).toEqual([
      '0',
      '4',
      '2',
      '8',
      '1',
      '7',
    ])
    expect(onComplete).toHaveBeenCalledWith('042817')
  })

  it('goes back to the previous box with backspace', async () => {
    const user = userEvent.setup()
    render(<ControlledCodeInput />)

    await user.type(boxes()[0], '12')
    await user.keyboard('{Backspace}')

    expect(screen.getByRole('status')).toHaveTextContent(/^1$/)
    expect(boxes()[1]).toHaveFocus()
  })
})
