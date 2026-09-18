import { LegalLayout } from '@/components/layouts/legal-layout'

const contactEmail = 'privacidade@evchargeops.com.br'

export function PrivacyRoute() {
  return (
    <LegalLayout title="Política de Privacidade" updatedAt="7 de outubro de 2026">
      <p>
        O EV ChargeOps é um MVP acadêmico desenvolvido no FIAP Enterprise
        Challenge em parceria com a GoodWe. Ele ajuda condomínios a controlar
        e ratear o custo da energia usada na recarga de veículos elétricos.
        Esta política explica, de forma direta, quais dados tratamos e por
        quê, em conformidade com a Lei Geral de Proteção de Dados (Lei nº
        13.709/2018 — LGPD).
      </p>

      <h2>Dados que coletamos</h2>
      <ul>
        <li>Nome e endereço de e-mail.</li>
        <li>Condomínio e unidade (apartamento ou casa) a que você pertence.</li>
        <li>
          Sessões de recarga: início, fim, ponto de recarga utilizado e
          energia consumida em kWh.
        </li>
        <li>
          Identificadores de autenticação fornecidos pelo Google ou pela Apple
          quando você escolhe entrar com essas contas (identificador da conta,
          nome e e-mail).
        </li>
        <li>
          Dados técnicos mínimos necessários para manter sua sessão ativa,
          como tokens de acesso.
        </li>
      </ul>
      <p>
        Não coletamos dados de pagamento, documentos pessoais nem localização
        do seu dispositivo.
      </p>

      <h2>Para que usamos os dados</h2>
      <ul>
        <li>Autenticar seu acesso ao portal e ao aplicativo.</li>
        <li>
          Calcular o consumo de cada unidade e o rateio do custo de energia
          entre os moradores.
        </li>
        <li>
          Enviar notificações e e-mails sobre sua conta, convites, recargas e
          fechamentos mensais.
        </li>
      </ul>
      <p>Não vendemos dados nem os usamos para publicidade.</p>

      <h2>Com quem compartilhamos</h2>
      <p>
        Usamos fornecedores que processam dados apenas para operar o serviço:
      </p>
      <ul>
        <li>Vercel — hospedagem do portal e da API.</li>
        <li>Neon — banco de dados.</li>
        <li>Resend — envio de e-mails.</li>
        <li>Google e Apple — login com contas desses provedores.</li>
        <li>Expo — distribuição do aplicativo e envio de notificações.</li>
      </ul>
      <p>
        O gestor do seu condomínio tem acesso aos dados dos moradores e ao
        consumo de cada unidade, pois é responsável pelo rateio.
      </p>

      <h2>Por quanto tempo guardamos</h2>
      <p>
        Mantemos os dados enquanto sua conta estiver ativa ou enquanto durar
        o projeto acadêmico. Ao fim do projeto, ou quando você pedir a
        exclusão da conta, os dados pessoais são apagados ou anonimizados,
        salvo quando a lei exigir sua guarda.
      </p>

      <h2>Seus direitos</h2>
      <p>Pela LGPD, você pode, a qualquer momento:</p>
      <ul>
        <li>confirmar se tratamos seus dados e acessá-los;</li>
        <li>corrigir dados incompletos, inexatos ou desatualizados;</li>
        <li>pedir a anonimização, o bloqueio ou a eliminação de dados;</li>
        <li>pedir a portabilidade dos seus dados;</li>
        <li>revogar o consentimento e excluir sua conta.</li>
      </ul>

      <h2>Contato</h2>
      <p>
        Para exercer seus direitos ou tirar dúvidas, escreva para{' '}
        <a href={`mailto:${contactEmail}`}>{contactEmail}</a>. Os e-mails
        enviados pelo endereço noreply não são monitorados.
      </p>
    </LegalLayout>
  )
}
