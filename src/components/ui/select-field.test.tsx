import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { SelectField } from './select-field'

const options = [
  { value: '', label: 'Todos' },
  { value: 'CLOSED', label: 'Encerrada' },
]

describe('SelectField', () => {
  it('associates the label with the select and reports changes', async () => {
    const onChange = vi.fn()
    render(
      <SelectField label="Status" options={options} value="" onChange={onChange} />,
    )

    await userEvent.selectOptions(screen.getByLabelText('Status'), 'CLOSED')

    expect(onChange).toHaveBeenCalledOnce()
    expect(screen.getByRole('option', { name: 'Encerrada' })).toBeInTheDocument()
  })
})
