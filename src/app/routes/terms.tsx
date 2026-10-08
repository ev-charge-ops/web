import { Link } from 'react-router'

import {
  LegalLayout,
  type LegalSection,
} from '@/components/layouts/legal-layout'
import { company } from '@/config/company'
import { paths } from '@/config/paths'

const contactEmail = 'contato@softmoon.io'
const supportEmail = 'contato@softmoon.io'

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
          O EV ChargeOps é operado por {company.legalName}, inscrita no CNPJ
          sob o nº {company.cnpj}.
        </p>
        <p>
          O EV ChargeOps é um MVP acadêmico desenvolvido no FIAP Enterprise
          Challenge em parceria com a GoodWe. O app permite que motoristas
          encontrem pontos de recarga em condomínios e em locais públicos,
          iniciem e encerrem recargas e acompanhem o rateio do condomínio. Por
          ser um projeto acadêmico, o serviço é oferecido sem garantia de
          disponibilidade contínua e pode mudar ou ser encerrado ao fim do
          projeto.
        </p>
      </>
    ),
  },
  {
    id: 'piloto',
    title: 'Projeto piloto',
    content: (
      <p>
        Nesta fase piloto, as recargas são simuladas: o carregador não é
        acionado e a energia, a potência e o tempo exibidos vêm de um simulador.
        Os preços por kWh são calculados com apoio de um modelo de IA a partir
        da demanda e ficam travados no início de cada recarga.
      </p>
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
        <li>
          Motoristas usam o aplicativo para recarregar e ver seu consumo, com
          e-mail e senha, código por e-mail, Google ou Apple.
        </li>
        <li>
          Você é responsável por manter sua senha em sigilo e por informar dados
          corretos, incluindo sua unidade.
        </li>
        <li>
          Você pode excluir a conta a qualquer momento no app, em Conta →
          Privacidade e dados → Excluir conta. A exclusão é imediata.
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
        cada recarga. Nos pontos do condomínio, eles servem como apoio ao
        rateio, e o condomínio continua responsável pela cobrança e por
        eventuais ajustes.
      </p>
    ),
  },
  {
    id: 'pagamentos',
    title: 'Pagamentos com cartão',
    content: (
      <>
        <p>
          Nos pontos comerciais, o valor máximo estimado da recarga é
          pré-autorizado no cartão antes do início e só o valor final é
          capturado ao encerrar. A diferença é liberada, e o prazo para voltar
          ao limite depende do banco emissor.
        </p>
        <p>
          Os pagamentos são processados pela Stripe, que recebe os dados do
          cartão diretamente. Para contestar uma cobrança ou pedir reembolso,
          escreva para <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.
        </p>
      </>
    ),
  },
  {
    id: 'localizacao-notificacoes',
    title: 'Localização e notificações',
    content: (
      <p>
        Com a sua permissão, o app usa a localização somente enquanto está
        aberto, para mostrar os pontos próximos, e envia notificações sobre
        recargas, pagamentos, fila e convites. Você pode negar ou revogar essas
        permissões nos ajustes do aparelho e continuar usando o app.
      </p>
    ),
  },
  {
    id: 'pontos-publicos',
    title: 'Pontos públicos',
    content: (
      <p>
        A localização dos pontos públicos vem do{' '}
        <a href="https://openchargemap.org" target="_blank" rel="noreferrer">
          Open Charge Map
        </a>{' '}
        e é usada sob a licença{' '}
        <a
          href="https://creativecommons.org/licenses/by-sa/4.0/"
          target="_blank"
          rel="noreferrer"
        >
          CC BY-SA 4.0
        </a>
        . Os preços desses pontos são de demonstração, e a disponibilidade real
        dos carregadores pode ser diferente da exibida.
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
        Para ajuda com o app, escreva para{' '}
        <a href={`mailto:${supportEmail}`}>{supportEmail}</a> ou veja a página
        de <Link to={paths.legal.support.getHref()}>Suporte</Link>. Dúvidas
        sobre dados pessoais podem ser enviadas para{' '}
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
