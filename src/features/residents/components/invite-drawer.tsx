import { zodResolver } from '@hookform/resolvers/zod'
import { Send } from 'lucide-react'
import { useId } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Drawer } from '@/components/ui/drawer'
import { TextField } from '@/components/ui/text-field'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/lib/use-auth'

import {
  createInviteInputSchema,
  useCreateInvite,
  type CreateInviteInput,
} from '../api/create-invite'
import { getCreateInviteErrorMessage } from '../utils/error-messages'
import styles from './invite-drawer.module.css'

const emptyValues: CreateInviteInput = { email: '', unitLabel: '' }

const inviteValidityDays = 7

type InviteDrawerProps = {
  organizationId: string
  organizationName: string
  isOpen: boolean
  onClose: () => void
}

export function InviteDrawer({
  organizationId,
  organizationName,
  isOpen,
  onClose,
}: InviteDrawerProps) {
  const formId = useId()
  const { user } = useAuth()
  const { showToast } = useToast()
  const createInvite = useCreateInvite(organizationId)
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateInviteInput>({
    resolver: zodResolver(createInviteInputSchema),
    defaultValues: emptyValues,
  })
  const unitLabel = useWatch({ control, name: 'unitLabel' }).trim()
  const headline = `${user?.name ?? 'O gestor'} convidou você para o ${organizationName}`

  const close = () => {
    reset(emptyValues)
    createInvite.reset()
    onClose()
  }

  const submit = handleSubmit((values) =>
    createInvite.mutate(values, {
      onSuccess: (invite) => {
        showToast({
          tone: 'success',
          message: `Convite enviado para ${invite.email}`,
        })
        close()
      },
    }),
  )

  return (
    <Drawer
      isOpen={isOpen}
      onClose={close}
      eyebrow={organizationName}
      title="Convidar morador"
      footer={
        <Button
          type="submit"
          form={formId}
          size="lg"
          icon={<Send size={18} strokeWidth={2} aria-hidden />}
          isLoading={createInvite.isPending}
        >
          Enviar convite
        </Button>
      }
    >
      <form id={formId} className={styles.form} noValidate onSubmit={submit}>
        {createInvite.error ? (
          <Alert>{getCreateInviteErrorMessage(createInvite.error)}</Alert>
        ) : null}
        <TextField
          label="E-mail do morador"
          type="email"
          autoComplete="off"
          placeholder="morador@email.com"
          error={errors.email?.message}
          autoFocus
          {...register('email')}
        />
        <TextField
          label="Unidade"
          placeholder="B · 42"
          error={errors.unitLabel?.message}
          {...register('unitLabel')}
        />
        <div className={styles.role}>
          <span className={styles.roleLabel}>Função</span>
          <span className={styles.roleValue}>Morador</span>
          <span className={styles.roleHint}>
            Pode iniciar recargas pelo app e ver o próprio extrato.
          </span>
        </div>
      </form>
      <div className={styles.preview}>
        <span className={styles.previewLabel}>Prévia do e-mail</span>
        <div className={styles.mail}>
          <span className={styles.subject}>
            <strong>Assunto:</strong> {headline}
          </span>
          <span className={styles.rule} aria-hidden="true" />
          <span>Olá!</span>
          <span>
            {headline} no EV ChargeOps, a plataforma que organiza as recargas de
            veículos elétricos e o rateio dos custos de energia.
          </span>
          {unitLabel ? <span>Sua unidade: {unitLabel}.</span> : null}
          <span>
            Aceite o convite para criar seu acesso. Depois, use o app EV
            ChargeOps no celular ou a versão web para acompanhar suas recargas.
          </span>
          <span className={styles.note}>
            Este convite expira em {inviteValidityDays} dias. Se você não
            esperava este convite, ignore este e-mail.
          </span>
        </div>
      </div>
    </Drawer>
  )
}
