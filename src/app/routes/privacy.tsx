import {
  LegalLayout,
  type LegalSection,
} from '@/components/layouts/legal-layout'

const contactEmail = 'privacidade@evchargeops.com.br'

const sections: LegalSection[] = [
  {
    id: 'quem-somos',
    title: 'Quem somos',
    content: (
      <>
        <p>
          O EV ChargeOps é a plataforma que o seu condomínio usa para gerir a
          recarga de veículos elétricos na garagem. É um MVP acadêmico
          desenvolvido no FIAP Enterprise Challenge em parceria com a GoodWe.
        </p>
        <p>
          Esta política explica como tratamos os dados pessoais de moradores,
          gestores e visitantes que usam o app e o portal, em conformidade com a
          Lei Geral de Proteção de Dados (Lei nº 13.709/2018, LGPD).
        </p>
      </>
    ),
  },
  {
    id: 'dados',
    title: 'Quais dados coletamos',
    content: (
      <ul>
        <li>
          <strong>Cadastro:</strong> nome, e-mail, condomínio, unidade e papel
          no condomínio (morador ou gestor).
        </li>
        <li>
          <strong>Login com Google ou Apple:</strong> o identificador da conta,
          o nome e o e-mail fornecidos pelo provedor, quando você escolhe entrar
          assim.
        </li>
        <li>
          <strong>Recargas:</strong> ponto usado, horário de início e fim,
          energia em kWh, potência, duração, valor e eventuais multas de
          ocupação.
        </li>
        <li>
          <strong>Pagamento de visitantes:</strong> os dados do cartão são
          recebidos e processados pela Stripe. Guardamos apenas os
          identificadores da cobrança, os valores autorizados e capturados e o
          status do pagamento.
        </li>
        <li>
          <strong>Dados técnicos:</strong> tokens de acesso para manter sua
          sessão e o token do dispositivo para enviar notificações do app.
        </li>
      </ul>
    ),
  },
  {
    id: 'finalidades',
    title: 'Para que usamos',
    content: (
      <>
        <ul>
          <li>
            <strong>Serviço essencial (obrigatório):</strong> autenticar você,
            iniciar e encerrar recargas e manter a segurança da conta.
          </li>
          <li>
            <strong>Rateio e cobrança no condomínio:</strong> calcular quanto
            cada unidade consumiu e repassar a energia a custo, sem margem,
            conforme a ANEEL RN 1.000/2021.
          </li>
          <li>
            <strong>Análise de uso (opcional):</strong> melhorar o produto e
            detectar sessões fora do padrão. Nenhuma cobrança muda sem revisão
            do gestor.
          </li>
          <li>
            <strong>Comunicações (opcional):</strong> avisos sobre novidades e
            pesquisas. Os avisos de recarga, convites e e-mails da conta não
            dependem desta opção.
          </li>
        </ul>
        <p>
          Você pode alterar as finalidades opcionais a qualquer momento na área
          de privacidade da sua conta no app. Não vendemos dados nem os usamos
          para publicidade.
        </p>
      </>
    ),
  },
  {
    id: 'base-legal',
    title: 'Base legal',
    content: (
      <p>
        Cada finalidade se apoia em uma base prevista no art. 7º da LGPD:
        execução de contrato para o serviço essencial e o rateio; cumprimento de
        obrigação legal ou regulatória quando a lei exigir a guarda de
        registros; legítimo interesse para segurança e prevenção a fraudes; e
        consentimento para análise de uso e comunicações.
      </p>
    ),
  },
  {
    id: 'compartilhamento',
    title: 'Compartilhamento',
    content: (
      <>
        <p>
          Compartilhamos dados apenas com quem precisa deles para prestar o
          serviço:
        </p>
        <ul>
          <li>
            <strong>Vercel e Neon:</strong> hospedagem do portal, da API e do
            banco de dados.
          </li>
          <li>
            <strong>Stripe:</strong> processamento dos pagamentos com cartão de
            visitantes.
          </li>
          <li>
            <strong>Resend:</strong> envio de e-mails, como códigos de acesso,
            convites e links de senha.
          </li>
          <li>
            <strong>Google e Apple:</strong> login com contas desses provedores.
          </li>
          <li>
            <strong>Expo:</strong> distribuição do aplicativo e envio de
            notificações.
          </li>
          <li>
            <strong>Gestor do condomínio:</strong> acessa os dados dos moradores
            e o consumo de cada unidade, porque é responsável pelo rateio.
          </li>
        </ul>
        <p>
          Alguns fornecedores podem tratar dados fora do Brasil, com as
          salvaguardas exigidas pela LGPD.
        </p>
      </>
    ),
  },
  {
    id: 'retencao',
    title: 'Retenção',
    content: (
      <p>
        Mantemos os dados enquanto sua conta estiver ativa ou enquanto durar o
        projeto acadêmico. Ao fim do projeto, ou quando você pedir a exclusão da
        conta, os dados pessoais são apagados ou anonimizados, salvo quando a
        lei exigir sua guarda.
      </p>
    ),
  },
  {
    id: 'direitos',
    title: 'Seus direitos',
    content: (
      <>
        <p>
          Pela LGPD (art. 18), você pode pedir a confirmação do tratamento, o
          acesso, a correção, a anonimização ou eliminação de dados
          desnecessários, a portabilidade, informações sobre compartilhamento e
          a revogação do consentimento.
        </p>
        <p>
          No app, você pode <strong>exportar seus dados</strong> e{' '}
          <strong>pedir a exclusão da conta</strong> na área de privacidade.
          Você também pode apresentar reclamação à Autoridade Nacional de
          Proteção de Dados (ANPD).
        </p>
      </>
    ),
  },
  {
    id: 'encarregado',
    title: 'Encarregado de dados',
    content: (
      <p>
        Para exercer seus direitos ou tirar dúvidas, escreva para{' '}
        <a href={`mailto:${contactEmail}`}>{contactEmail}</a>. Os e-mails
        enviados pelo endereço noreply não são monitorados.
      </p>
    ),
  },
]

export function PrivacyRoute() {
  return (
    <LegalLayout
      title="Política de privacidade"
      version="08/10/2026"
      sections={sections}
    />
  )
}
