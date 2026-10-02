import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { getPageItems } from '@/utils/pagination'

import { Pagination } from './pagination'

describe('Pagination', () => {
  it('collapses distant pages into gaps', () => {
    expect(getPageItems(1, 8)).toEqual([1, 2, 'gap', 8])
    expect(getPageItems(5, 8)).toEqual([1, 'gap', 4, 5, 6, 'gap', 8])
    expect(getPageItems(2, 3)).toEqual([1, 2, 3])
  })

  it('shows the range and moves between pages', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(
      <Pagination
        page={1}
        pageSize={20}
        total={58}
        itemLabel="sessões"
        onChange={onChange}
      />,
    )

    expect(screen.getByText('Mostrando 1–20 de 58 sessões')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Página 1' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(
      screen.getByRole('button', { name: 'Página anterior' }),
    ).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Página 3' }))
    await user.click(screen.getByRole('button', { name: 'Próxima página' }))

    expect(onChange.mock.calls).toEqual([[3], [2]])
  })
})
