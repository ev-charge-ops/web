import { Mail } from 'lucide-react'
import { Link } from 'react-router'

import {
  LegalLayout,
  type LegalSection,
} from '@/components/layouts/legal-layout'
import { paths } from '@/config/paths'

import styles from './support.module.css'

const supportEmail = 'suporte@evchargeops.com.br'

const sections: LegalSection[] = [
  {
    id: 'sobre',
    title: 'O que é o EV ChargeOps',
    content: (
      <>
        <p>
          O EV ChargeOps é o app do motorista para a recarga compartilhada de
          veículos elétricos em condomínios e em pontos públicos. Pelo app você
          encontra pontos no mapa, vê o preço por kWh, inicia e encerra a
          recarga, acompanha a sessão ao vivo e consulta o rateio do condomínio.
        </p>
        <p>
          O portal web é usado pelo gestor ou síndico para administrar
          moradores, pontos, tarifas e o rateio mensal.
        </p>
      </>
    ),
  },
  {
    id: 'iniciar-recarga',
    title: 'Como inicio uma recarga?',
    content: (
      <>
        <ol>
          <li>
            Abra a aba <strong>Pontos</strong> e escolha um ponto livre no mapa
            ou na lista. Se você permitir o acesso à localização, os pontos mais
            próximos aparecem primeiro.
          </li>
          <li>
            Confira o preço por kWh. Ele é calculado por um modelo de IA a
            partir da demanda do momento e fica travado durante toda a recarga.
          </li>
          <li>
            Toque em <strong>Iniciar recarga</strong>. Nos pontos comerciais, o
            app pede o cartão antes de liberar o carregador.
          </li>
          <li>
            Acompanhe energia, potência, tempo e valor na tela da recarga e
            toque em <strong>Encerrar agora</strong> quando quiser parar. O
            recibo fica na aba <strong>Histórico</strong>.
          </li>
        </ol>
        <p>
          Quando a bateria completa, há um tempo de tolerância para liberar a
          vaga. Depois dele, pode haver multa de ocupação, e o app avisa antes
          por notificação.
        </p>
      </>
    ),
  },
  {
    id: 'pagamentos',
    title: 'Como funcionam os pagamentos e reembolsos?',
    content: (
      <>
        <ul>
          <li>
            <strong>Pontos do condomínio:</strong> não há cobrança no app. O
            consumo entra no rateio mensal da sua unidade, que você acompanha na
            aba <strong>Início</strong>, e é cobrado pelo condomínio.
          </li>
          <li>
            <strong>Pontos comerciais:</strong> o pagamento é feito com cartão e
            processado pela Stripe. Antes de começar, o valor máximo estimado é
            pré-autorizado no cartão. Ao encerrar, só o valor final é capturado
            e o restante é liberado.
          </li>
        </ul>
        <p>
          O EV ChargeOps não armazena o número do cartão. Se a recarga for
          cancelada antes de começar, a pré-autorização é liberada sem cobrança.
          O prazo para o valor voltar ao limite depende do banco emissor.
        </p>
        <p>
          Para contestar uma cobrança ou pedir reembolso, escreva para{' '}
          <a href={`mailto:${supportEmail}`}>{supportEmail}</a> informando a
          data e o ponto da recarga. Reembolsos aprovados voltam para o mesmo
          cartão.
        </p>
      </>
    ),
  },
  {
    id: 'excluir-conta',
    title: 'Como excluo minha conta?',
    content: (
      <>
        <p>
          No app, abra{' '}
          <strong>Conta → Privacidade e dados → Excluir conta</strong> e
          confirme. A exclusão é imediata e não depende de contato com o
          suporte.
        </p>
        <p>
          Seus dados pessoais são apagados ou anonimizados. Os registros das
          recargas e dos pagamentos ficam guardados sem identificar você, porque
          são necessários ao rateio do condomínio e às obrigações legais. Os
          detalhes estão na{' '}
          <Link to={paths.legal.privacy.getHref()}>
            Política de privacidade
          </Link>
          .
        </p>
      </>
    ),
  },
  {
    id: 'dados-privacidade',
    title: 'Como meus dados são tratados?',
    content: (
      <>
        <p>
          Usamos seus dados apenas para prestar o serviço, em conformidade com a
          LGPD. Não vendemos dados nem os usamos para publicidade.
        </p>
        <ul>
          <li>
            A localização é usada só com o app aberto, para mostrar os pontos
            próximos.
          </li>
          <li>
            A câmera é usada apenas pelo leitor de cartão da Stripe, se você
            escolher escanear o cartão.
          </li>
          <li>
            Em <strong>Conta → Privacidade e dados</strong> você revisa os
            consentimentos e exporta seus dados.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'piloto',
    title: 'Os carregadores são reais?',
    content: (
      <>
        <p>
          O EV ChargeOps é um projeto piloto acadêmico. Nesta fase, as recargas
          são simuladas: o carregador não é acionado e a energia, a potência e o
          tempo exibidos vêm de um simulador.
        </p>
        <p>
          A localização dos pontos públicos vem do Open Charge Map, sob a
          licença CC BY-SA 4.0, e os preços desses pontos são de demonstração.
        </p>
      </>
    ),
  },
]

const intro = (
  <div className={styles.contact}>
    <span className={styles.contactIcon} aria-hidden="true">
      <Mail size={22} strokeWidth={2} />
    </span>
    <div className={styles.contactTexts}>
      <strong className={styles.contactTitle}>Fale com a gente</strong>
      <span className={styles.contactHint}>
        Dúvidas, problemas com uma recarga ou pagamento: escreva para nós.
      </span>
    </div>
    <a className={styles.contactAction} href={`mailto:${supportEmail}`}>
      {supportEmail}
    </a>
  </div>
)

export function SupportRoute() {
  return (
    <LegalLayout
      title="Suporte"
      subtitle="Ajuda para usar o app EV ChargeOps"
      intro={intro}
      sections={sections}
    />
  )
}
