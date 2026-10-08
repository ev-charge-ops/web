import { useId, useRef, type KeyboardEvent } from 'react'

import styles from './segmented-tabs.module.css'

export type SegmentedTab<T extends string> = {
  id: T
  label: string
}

type SegmentedTabsProps<T extends string> = {
  label: string
  tabs: SegmentedTab<T>[]
  value: T
  onChange: (value: T) => void
}

export function SegmentedTabs<T extends string>({
  label,
  tabs,
  value,
  onChange,
}: SegmentedTabsProps<T>) {
  const baseId = useId()
  const buttonsRef = useRef<Array<HTMLButtonElement | null>>([])

  const onKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const offset =
      event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (!offset) return
    event.preventDefault()
    const next = (index + offset + tabs.length) % tabs.length
    onChange(tabs[next].id)
    buttonsRef.current[next]?.focus()
  }

  return (
    <div role="tablist" aria-label={label} className={styles.tabs}>
      {tabs.map((tab, index) => {
        const isSelected = tab.id === value
        return (
          <button
            key={tab.id}
            ref={(element) => {
              buttonsRef.current[index] = element
            }}
            type="button"
            role="tab"
            id={`${baseId}-tab-${tab.id}`}
            aria-selected={isSelected}
            tabIndex={isSelected ? 0 : -1}
            className={styles.tab}
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
