import { Link } from 'react-router'

import {
  LegalLayout,
  type LegalSection,
} from '@/components/layouts/legal-layout'
import { paths } from '@/config/paths'

const contactEmail = 'privacidade@evchargeops.com.br'

const sections: LegalSection[] = [
  {
    id: 'servico',
    title: 'O que é o EV ChargeOps',
    content: (
      <>
        <p>
          Estes termos regem o uso do portal e do aplicativo EV ChargeOps. Ao
          criar uma conta ou usar o serviço, você concorda com eles.
        </p>
        <p>
          O EV ChargeOps é um MVP acadêmico desenvolvido no FIAP Enterprise
          Challenge em parceria com a GoodWe. Ele permite que condomínios
          acompanhem a energia usada na recarga de veículos elétricos e rateiem
          o custo entre os moradores. Por ser um projeto acadêmico, o serviço é
          oferecido sem garantia de disponibilidade contínua e pode mudar ou ser
          encerrado ao fim do projeto.
        </p>
      </>
    ),
  },
  {
    id: 'contas',
    title: 'Contas',
    content: (
      <ul>
        <li>
          Gestores administram o condomínio pelo portal web e convidam os
          moradores.
        </li>
        <li>Moradores usam o aplicativo para recarregar e ver seu consumo.</li>
        <li>
          Você é responsável por manter sua senha em sigilo e por informar dados
          corretos, incluindo sua unidade.
        </li>
      </ul>
    ),
  },
  {
    id: 'uso',
    title: 'Uso adequado',
    content: (
      <p>
        Não use o serviço para fins ilícitos, não tente acessar contas de outras
        pessoas e não interfira no funcionamento do sistema. Contas usadas de
        forma abusiva podem ser suspensas.
      </p>
    ),
  },
  {
    id: 'valores',
    title: 'Valores e rateio',
    content: (
      <p>
        Os valores exibidos são calculados a partir das medições de energia e
        das tarifas configuradas pelo gestor. A tarifa fica travada no início de
        cada recarga. Eles servem como apoio ao condomínio, que continua
        responsável pela cobrança e por eventuais ajustes.
      </p>
    ),
  },
  {
    id: 'pagamentos',
    title: 'Pagamentos de visitantes',
    content: (
      <p>
        Nos pontos de visitantes, o valor máximo da recarga é pré-autorizado no
        cartão antes do início e só o valor final é capturado ao encerrar. O
        pagamento é processado pela Stripe.
      </p>
    ),
  },
  {
    id: 'privacidade',
    title: 'Privacidade',
    content: (
      <p>
        O tratamento dos seus dados está descrito na{' '}
        <Link to={paths.legal.privacy.getHref()}>Política de privacidade</Link>.
      </p>
    ),
  },
  {
    id: 'responsabilidade',
    title: 'Responsabilidade',
    content: (
      <p>
        Fazemos o possível para manter as informações corretas, mas não nos
        responsabilizamos por indisponibilidades, falhas de medição dos
        equipamentos ou decisões tomadas com base nos valores exibidos.
      </p>
    ),
  },
  {
    id: 'contato',
    title: 'Contato',
    content: (
      <p>
        Dúvidas sobre estes termos podem ser enviadas para{' '}
        <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
      </p>
    ),
  },
]

export function TermsRoute() {
  return (
    <LegalLayout
      title="Termos de uso"
      version="08/10/2026"
      sections={sections}
    />
  )
}
