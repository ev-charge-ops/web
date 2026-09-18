import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

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
import styles from './auth-form.module.css'
import emailLoginStyles from './email-login-form.module.css'

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

export function EmailLoginForm() {
  const [email, setEmail] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [attempt, setAttempt] = useState(0)
  const { showToast } = useToast()
  const cooldown = useCooldown(resendCooldownSeconds)
  const request = useRequestEmailLogin()
  const resend = useRequestEmailLogin()
  const verify = useVerifyEmailLogin()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailLoginRequestInput>({
    resolver: zodResolver(emailLoginRequestSchema),
    defaultValues: { email: '' },
  })

  const sendCode = (values: EmailLoginRequestInput) =>
    request.mutate(values, {
      onSuccess: () => {
        setEmail(values.email)
        setCode('')
        cooldown.start()
      },
    })

  const submitCode = (value: string) => {
    if (!email || value.length !== emailLoginCodeLength || verify.isPending) {
      return
    }
    verify.mutate(
      { email, code: value },
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
    if (!email) return
    resend.mutate(
      { email },
      {
        onSuccess: () => {
          cooldown.start()
          showToast({ message: `Enviamos um novo código para ${email}.` })
        },
        onError: (error) =>
          showToast({ tone: 'error', message: getRequestErrorMessage(error) }),
      },
    )
  }

  const changeEmail = () => {
    setEmail(null)
    setCode('')
    verify.reset()
  }

  if (!email) {
    return (
      <form className={styles.form} noValidate onSubmit={handleSubmit(sendCode)}>
        {request.error ? (
          <Alert>{getRequestErrorMessage(request.error)}</Alert>
        ) : null}
        <TextField
          label="E-mail"
          type="email"
          autoComplete="username"
          placeholder="voce@condominio.com.br"
          hint="Enviaremos um código de 6 dígitos para você entrar sem senha."
          error={errors.email?.message}
          {...register('email')}
        />
        <Button
          type="submit"
          isLoading={request.isPending}
          className={styles.submit}
        >
          Enviar código
        </Button>
      </form>
    )
  }

  return (
    <form
      className={styles.form}
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        submitCode(code)
      }}
    >
      <p className={emailLoginStyles.sentTo}>
        Se existir uma conta para <strong>{email}</strong>, você receberá um
        código de 6 dígitos em instantes.
      </p>
      {verify.error ? <Alert>{getVerifyErrorMessage(verify.error)}</Alert> : null}
      <CodeInput
        key={attempt}
        label="Código de acesso"
        value={code}
        onChange={setCode}
        onComplete={submitCode}
        disabled={verify.isPending}
        autoFocus
      />
      <Button
        type="submit"
        isLoading={verify.isPending}
        disabled={code.length !== emailLoginCodeLength}
        className={styles.submit}
      >
        Entrar
      </Button>
      <div className={emailLoginStyles.actions}>
        <Button
          variant="link"
          size="sm"
          disabled={cooldown.isCoolingDown}
          isLoading={resend.isPending}
          onClick={resendCode}
        >
          {cooldown.isCoolingDown
            ? `Reenviar código em ${cooldown.secondsLeft}s`
            : 'Reenviar código'}
        </Button>
        <Button variant="link" size="sm" onClick={changeEmail}>
          Usar outro e-mail
        </Button>
      </div>
    </form>
  )
}
