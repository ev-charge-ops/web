import { Link } from 'react-router'

import { LegalLayout } from '@/components/layouts/legal-layout'
import { paths } from '@/config/paths'

const contactEmail = 'privacidade@evchargeops.com.br'

export function TermsRoute() {
  return (
    <LegalLayout title="Termos de Uso" updatedAt="7 de outubro de 2026">
      <p>
        Estes termos regem o uso do portal e do aplicativo EV ChargeOps. Ao
        criar uma conta ou usar o serviço, você concorda com eles.
      </p>

      <h2>O que é o EV ChargeOps</h2>
      <p>
        O EV ChargeOps é um MVP acadêmico desenvolvido no FIAP Enterprise
        Challenge em parceria com a GoodWe. Ele permite que condomínios
        acompanhem a energia usada na recarga de veículos elétricos e rateiem
        o custo entre os moradores. Por ser um projeto acadêmico, o serviço é
        oferecido sem garantia de disponibilidade contínua e pode mudar ou ser
        encerrado ao fim do projeto.
      </p>

      <h2>Contas</h2>
      <ul>
        <li>
          Gestores administram o condomínio pelo portal web e convidam os
          moradores.
        </li>
        <li>Moradores usam o aplicativo para recarregar e ver seu consumo.</li>
        <li>
          Você é responsável por manter sua senha em sigilo e por informar
          dados corretos, incluindo sua unidade.
        </li>
      </ul>

      <h2>Uso adequado</h2>
      <p>
        Não use o serviço para fins ilícitos, não tente acessar contas de
        outras pessoas e não interfira no funcionamento do sistema. Contas
        usadas de forma abusiva podem ser suspensas.
      </p>

      <h2>Valores e rateio</h2>
      <p>
        Os valores exibidos são calculados a partir das medições de energia e
        das tarifas configuradas pelo gestor. Eles servem como apoio ao
        condomínio, que continua responsável pela cobrança e por eventuais
        ajustes.
      </p>

      <h2>Privacidade</h2>
      <p>
        O tratamento dos seus dados está descrito na{' '}
        <Link to={paths.legal.privacy.getHref()}>Política de Privacidade</Link>.
      </p>

      <h2>Responsabilidade</h2>
      <p>
        Fazemos o possível para manter as informações corretas, mas não nos
        responsabilizamos por indisponibilidades, falhas de medição dos
        equipamentos ou decisões tomadas com base nos valores exibidos.
      </p>

      <h2>Alterações</h2>
      <p>
        Podemos atualizar estes termos. A data da última atualização fica no
        topo desta página.
      </p>

      <h2>Contato</h2>
      <p>
        Dúvidas sobre estes termos podem ser enviadas para{' '}
        <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
      </p>
    </LegalLayout>
  )
}
