import { zodResolver } from '@hookform/resolvers/zod'
import { CircleDashed } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Drawer } from '@/components/ui/drawer'
import { TextField } from '@/components/ui/text-field'
import { useToast } from '@/components/ui/use-toast'

import {
  createInviteInputSchema,
  useCreateInvite,
  type CreateInviteInput,
} from '../api/create-invite'
import { getCreateInviteErrorMessage } from '../utils/error-messages'
import styles from './invite-drawer.module.css'

const residentSteps = [
  { label: 'Nome completo', hint: 'Identifica o morador' },
  { label: 'Senha ou conta Google/Apple', hint: 'Acesso ao app' },
  { label: 'Aceite do convite', hint: 'Vincula a unidade' },
]

const emptyValues: CreateInviteInput = { email: '', unitLabel: '' }

type InviteDrawerProps = {
  organizationId: string
  isOpen: boolean
  onClose: () => void
}

export function InviteDrawer({
  organizationId,
  isOpen,
  onClose,
}: InviteDrawerProps) {
  const { showToast } = useToast()
  const createInvite = useCreateInvite(organizationId)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateInviteInput>({
    resolver: zodResolver(createInviteInputSchema),
    defaultValues: emptyValues,
  })

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
      title="Convidar morador"
      description="Você informa o e-mail e a unidade. O morador cria a conta pelo link do convite e usa o app para recarregar."
    >
      <form className={styles.form} noValidate onSubmit={submit}>
        {createInvite.error ? (
          <Alert>{getCreateInviteErrorMessage(createInvite.error)}</Alert>
        ) : null}
        <TextField
          label="E-mail do morador"
          type="email"
          autoComplete="off"
          placeholder="morador@email.com"
          hint="O convite vale por 7 dias e pode ser reenviado."
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

        <Card flush>
          <div className={styles.listHead}>O morador preenche no convite</div>
          {residentSteps.map(({ label, hint }) => (
            <div className={styles.listRow} key={label}>
              <CircleDashed
                size={15}
                strokeWidth={2}
                aria-hidden
                className={styles.listIcon}
              />
              <span className={styles.listLabel}>{label}</span>
              <span className={styles.listHint}>{hint}</span>
            </div>
          ))}
        </Card>

        <div className={styles.footer}>
          <Button variant="outline" onClick={close} className={styles.cancel}>
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={createInvite.isPending}
            className={styles.submit}
          >
            Enviar convite
          </Button>
        </div>
      </form>
    </Drawer>
  )
}
