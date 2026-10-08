import { useCountUp } from '@/hooks/use-count-up'

type AnimatedNumberProps = {
  value: number
  format: (value: number) => string
  durationMs?: number
  delayMs?: number
  className?: string
}

export function AnimatedNumber({
  value,
  format,
  durationMs,
  delayMs,
  className,
}: AnimatedNumberProps) {
  const current = useCountUp(value, { durationMs, delayMs })
  return <span className={className}>{format(current)}</span>
}
