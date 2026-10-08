import { MailWarning } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import type { AuthUser } from '@/lib/use-auth'

import { useMe } from '../api/get-me'
import { useResendEmailVerification } from '../api/resend-email-verification'
import {
  isRateLimited,
  tooManyRequestsMessage,
  unexpectedErrorMessage,
} from '../utils/error-messages'
import styles from './email-verification-banner.module.css'

type EmailVerificationBannerProps = {
  user: AuthUser
}

export function EmailVerificationBanner({ user }: EmailVerificationBannerProps) {
  const { data: me } = useMe()
  const { showToast } = useToast()
  const resend = useResendEmailVerification()
  const current = me ?? user

  if (current.emailVerified) return null

  const onResend = () =>
    resend.mutate(undefined, {
      onSuccess: () =>
        showToast({
          message: `Enviamos um novo e-mail de verificação para ${current.email}.`,
        }),
      onError: (error) =>
        showToast({
          tone: 'error',
          message: isRateLimited(error)
            ? tooManyRequestsMessage
            : unexpectedErrorMessage,
        }),
    })

  return (
    <section className={styles.banner} aria-label="Verificação de e-mail">
      <MailWarning size={18} strokeWidth={2} className={styles.icon} aria-hidden />
      <div className={styles.text}>
        <strong className={styles.title}>Confirme seu e-mail</strong>
        <span className={styles.description}>
          Enviamos um link de verificação para {current.email}. A confirmação
          garante o recebimento de avisos e a recuperação do acesso.
        </span>
      </div>
      <Button
        variant="secondary"
        size="sm"
        isLoading={resend.isPending}
        onClick={onResend}
        className={styles.action}
      >
        Reenviar e-mail de verificação
      </Button>
    </section>
  )
}
