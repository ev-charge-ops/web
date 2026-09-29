import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { cn } from '@/utils/cn'

import styles from './background-video.module.css'

type BackgroundVideoProps = {
  src: string
  poster?: string
  className?: string
}

export function BackgroundVideo({ src, poster, className }: BackgroundVideoProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const posterSrc = poster ?? `${src}-poster.webp`

  if (prefersReducedMotion) {
    return (
      <img
        src={posterSrc}
        alt=""
        aria-hidden="true"
        className={cn(styles.media, className)}
      />
    )
  }

  return (
    <video
      className={cn(styles.media, className)}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={posterSrc}
      aria-hidden="true"
      tabIndex={-1}
    >
      <source src={`${src}.webm`} type="video/webm" />
      <source src={`${src}.mp4`} type="video/mp4" />
    </video>
  )
}
