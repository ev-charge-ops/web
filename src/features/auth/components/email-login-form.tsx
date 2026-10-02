import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Mail } from 'lucide-react'
import { useId, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { CodeInput } from '@/components/ui/code-input'
import { TextField } from '@/components/ui/text-field'
import { useToast } from '@/components/ui/use-toast'
import { useCooldown } from '@/hooks/use-cooldown'

import {
  emailLoginCodeLength,
  emailLoginRequestSchema,
  useRequestEmailLogin,
  useVerifyEmailLogin,
  type EmailLoginRequestInput,
} from '../api/email-login'
import {
  hasStatus,
  isRateLimited,
  tooManyRequestsMessage,
  unexpectedErrorMessage,
} from '../utils/error-messages'
import styles from './email-login-form.module.css'

export const resendCooldownSeconds = 30

function getRequestErrorMessage(error: Error) {
  return isRateLimited(error) ? tooManyRequestsMessage : unexpectedErrorMessage
}

function getVerifyErrorMessage(error: Error) {
  if (hasStatus(error, 401)) {
    return 'Código inválido ou expirado. Confira o e-mail ou peça um novo código.'
  }
  return getRequestErrorMessage(error)
}

function formatCountdown(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function EmailLoginForm() {
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [attempt, setAttempt] = useState(0)
  const hintId = useId()
  const { showToast } = useToast()
  const cooldown = useCooldown(resendCooldownSeconds)
  const request = useRequestEmailLogin()
  const resend = useRequestEmailLogin()
  const verify = useVerifyEmailLogin()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<EmailLoginRequestInput>({
    resolver: zodResolver(emailLoginRequestSchema),
    defaultValues: { email: '' },
  })
  const email = useWatch({ control, name: 'email' })
  const isCodeStep =
    sentTo !== null && normalizeEmail(email) === normalizeEmail(sentTo)

  const sendCode = (values: EmailLoginRequestInput) =>
    request.mutate(values, {
      onSuccess: () => {
        setSentTo(values.email)
        setCode('')
        verify.reset()
        cooldown.start()
      },
    })

  const submitCode = (value: string) => {
    if (!sentTo || value.length !== emailLoginCodeLength || verify.isPending) {
      return
    }
    verify.mutate(
      { email: sentTo, code: value },
      {
        onError: (error) => {
          if (!hasStatus(error, 401)) return
          setCode('')
          setAttempt((current) => current + 1)
        },
      },
    )
  }

  const resendCode = () => {
    if (!sentTo) return
    resend.mutate(
      { email: sentTo },
      {
        onSuccess: () => {
          cooldown.start()
          showToast({ message: `Enviamos um novo código para ${sentTo}.` })
        },
        onError: (error) =>
          showToast({ tone: 'error', message: getRequestErrorMessage(error) }),
      },
    )
  }

  return (
    <form
      className={styles.form}
      noValidate
      onSubmit={
        isCodeStep
          ? (event) => {
              event.preventDefault()
              submitCode(code)
            }
          : handleSubmit(sendCode)
      }
    >
      {!isCodeStep && request.error ? (
        <Alert>{getRequestErrorMessage(request.error)}</Alert>
      ) : null}
      <TextField
        label="E-mail"
        type="email"
        autoComplete="username"
        placeholder="gestor@condominio.com.br"
        error={errors.email?.message}
        trailing={
          isCodeStep ? (
            <span className={styles.sentBadge} title="Código enviado">
              <Check size={14} strokeWidth={2.5} aria-hidden />
            </span>
          ) : null
        }
        {...register('email')}
      />
      {isCodeStep ? (
        <section className={styles.codeCard} aria-label="Código de acesso">
          <div className={styles.codeIntro}>
            <span className={styles.codeIcon}>
              <Mail size={20} strokeWidth={2} aria-hidden />
            </span>
            <p id={hintId} className={styles.codeHint}>
              Digite o código de 6 dígitos enviado para{' '}
              <strong>{sentTo}</strong>
            </p>
          </div>
          {verify.error ? (
            <Alert>{getVerifyErrorMessage(verify.error)}</Alert>
          ) : null}
          <CodeInput
            key={attempt}
            label="Código de acesso"
            labelledBy={hintId}
            appearance="inset"
            value={code}
            onChange={setCode}
            onComplete={submitCode}
            disabled={verify.isPending}
            autoFocus
          />
          <div className={styles.codeFooter}>
            <span>Não recebeu? Confira o spam.</span>
            {cooldown.isCoolingDown ? (
              <span className={styles.countdown} aria-live="polite">
                Reenviar em{' '}
                <span className="tnum">
                  {formatCountdown(cooldown.secondsLeft)}
                </span>
              </span>
            ) : (
              <Button
                variant="link"
                size="sm"
                isLoading={resend.isPending}
                onClick={resendCode}
              >
                Reenviar código
              </Button>
            )}
          </div>
        </section>
      ) : null}
      <Button
        type="submit"
        size="lg"
        isLoading={isCodeStep ? verify.isPending : request.isPending}
        disabled={isCodeStep && code.length !== emailLoginCodeLength}
        className={styles.submit}
      >
        {isCodeStep ? 'Entrar' : 'Enviar código'}
      </Button>
    </form>
  )
}
