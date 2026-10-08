import { cn } from '@/utils/cn'

import styles from './logo.module.css'

export type LogoVariant = 'dark' | 'light' | 'inverse'

type LogoProps = {
  variant?: LogoVariant
  size?: number
  hasWordmark?: boolean
  className?: string
}

const markColors = {
  dark: { tile: '#111316', ring: '#FFFFFF', bolt: '#3DDC84' },
  light: { tile: '#26282C', ring: '#FFFFFF', bolt: '#3DDC84' },
  inverse: { tile: '#FFFFFF', ring: '#111316', bolt: '#1F9D57' },
} satisfies Record<LogoVariant, { tile: string; ring: string; bolt: string }>

export function LogoMark({
  variant = 'dark',
  size = 36,
}: Pick<LogoProps, 'variant' | 'size'>) {
  const isCompact = size < 32
  const colors = markColors[variant]

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
      className={styles.mark}
    >
      <rect width="64" height="64" rx="18" fill={colors.tile} />
      <path
        d="M45.02 42.93 A17 17 0 1 1 45.02 21.07"
        fill="none"
        stroke={colors.ring}
        strokeWidth={isCompact ? 6 : 5}
        strokeLinecap="round"
      />
      <path d="M34 20 L24 34 H31 L29 44 L40 29 H33 Z" fill={colors.bolt} />
      {isCompact ? null : (
        <circle cx="45.02" cy="21.07" r="3.4" fill={colors.bolt} />
      )}
    </svg>
  )
}

export function Logo({
  variant = 'dark',
  size = 36,
  hasWordmark = true,
  className,
}: LogoProps) {
  return (
    <span
      role="img"
      aria-label="EV ChargeOps"
      data-variant={variant}
      className={cn(styles.logo, styles[variant], className)}
    >
      <LogoMark variant={variant} size={size} />
      {hasWordmark ? (
        <span className={styles.wordmark} aria-hidden="true">
          EV ChargeOps
        </span>
      ) : null}
    </span>
  )
}
