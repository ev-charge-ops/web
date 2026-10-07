import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { CheckboxField } from './checkbox-field'

describe('CheckboxField', () => {
  it('associates the label with the checkbox and reports changes', async () => {
    const onChange = vi.fn()
    render(
      <CheckboxField label="Somente anomalias" checked={false} onChange={onChange} />,
    )

    await userEvent.click(screen.getByLabelText('Somente anomalias'))

    expect(onChange).toHaveBeenCalledOnce()
    expect(screen.getByRole('checkbox', { name: 'Somente anomalias' })).not.toBeChecked()
  })
})
