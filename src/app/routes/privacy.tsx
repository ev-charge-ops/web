import { Link } from "react-router";

import {
  LegalLayout,
  type LegalSection,
} from "@/components/layouts/legal-layout";
import { company } from "@/config/company";
import { paths } from "@/config/paths";

const contactEmail = "contato@softmoon.io";

const sections: LegalSection[] = [
  {
    id: "quem-somos",
    title: "Quem somos",
    content: (
      <>
        <p>
          O EV ChargeOps é o app do motorista para a recarga compartilhada de
          veículos elétricos em condomínios e em pontos públicos, com um portal
          web para o gestor do condomínio.
        </p>
        <p>
          A controladora dos dados é {company.legalName}, inscrita no CNPJ sob o
          nº {company.cnpj}.
        </p>
        <p>
          Esta política explica como tratamos os dados pessoais de motoristas,
          moradores, gestores e visitantes que usam o app e o portal, em
          conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018,
          LGPD).
        </p>
      </>
    ),
  },
  {
    id: "dados",
    title: "Quais dados coletamos",
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
          energia em kWh, potência, duração, preço travado, valor e eventuais
          multas de ocupação.
        </li>
        <li>
          <strong>Pagamentos com cartão:</strong> nos pontos comerciais, os
          dados do cartão são informados diretamente à Stripe, que processa o
          pagamento. Não recebemos nem guardamos o número do cartão. Guardamos
          apenas os identificadores da cobrança, os valores autorizados e
          capturados e o status do pagamento.
        </li>
        <li>
          <strong>Localização precisa:</strong> com a sua permissão e somente
          com o app aberto, usamos a localização do aparelho para mostrar e
          buscar os pontos de recarga próximos. O app não acessa a localização
          em segundo plano e não guardamos histórico dos seus deslocamentos.
        </li>
        <li>
          <strong>Câmera:</strong> usada apenas pelo leitor de cartão da Stripe,
          se você escolher escanear o cartão no pagamento. Não recebemos as
          imagens.
        </li>
        <li>
          <strong>Dados técnicos:</strong> tokens de acesso para manter sua
          sessão e o token do dispositivo para enviar notificações do app.
        </li>
      </ul>
    ),
  },
  {
    id: "finalidades",
    title: "Para que usamos",
    content: (
      <>
        <ul>
          <li>
            <strong>Serviço essencial (obrigatório):</strong> autenticar você,
            mostrar os pontos, iniciar e encerrar recargas, processar pagamentos
            e manter a segurança da conta.
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
          Você pode alterar as finalidades opcionais a qualquer momento em{" "}
          <strong>Conta → Privacidade e dados</strong> no app. Não vendemos
          dados, não os usamos para publicidade e não rastreamos você em apps ou
          sites de terceiros.
        </p>
      </>
    ),
  },
  {
    id: "notificacoes",
    title: "Notificações",
    content: (
      <p>
        Com a sua permissão, o app envia notificações push e agenda lembretes
        locais no aparelho sobre a recarga (conclusão, fim da tolerância e
        início da multa de ocupação), pagamentos, fila dos pontos e convites.
        Você pode desativá-las a qualquer momento nos ajustes do aparelho. Ao
        sair da conta, o token do dispositivo deixa de receber avisos.
      </p>
    ),
  },
  {
    id: "base-legal",
    title: "Base legal",
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
    id: "compartilhamento",
    title: "Compartilhamento",
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
            <strong>Stripe:</strong> processadora dos pagamentos com cartão nos
            pontos comerciais, que trata os dados do cartão conforme a própria
            política de privacidade.
          </li>
          <li>
            <strong>Resend:</strong> envio de e-mails, como códigos de acesso,
            convites e links de senha.
          </li>
          <li>
            <strong>Google e Apple:</strong> login com contas desses provedores.
          </li>
          <li>
            <strong>Google Maps:</strong> exibição do mapa dos pontos no app. O
            SDK do mapa recebe dados técnicos do aparelho, como identificadores
            e dados de falhas e desempenho.
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
    id: "fontes",
    title: "Dados de pontos públicos",
    content: (
      <p>
        A localização dos pontos de recarga públicos vem do{" "}
        <a href="https://openchargemap.org" target="_blank" rel="noreferrer">
          Open Charge Map
        </a>
        , disponibilizada sob a licença{" "}
        <a
          href="https://creativecommons.org/licenses/by-sa/4.0/"
          target="_blank"
          rel="noreferrer"
        >
          CC BY-SA 4.0
        </a>
        . Os preços desses pontos são de demonstração. Não enviamos seus dados
        ao Open Charge Map.
      </p>
    ),
  },
  {
    id: "retencao",
    title: "Retenção",
    content: (
      <p>
        Mantemos os dados enquanto sua conta estiver ativa. Quando você excluir
        a conta, os dados pessoais são apagados ou anonimizados. Ficam guardados
        apenas os registros de recargas e pagamentos necessários ao rateio do
        condomínio e ao cumprimento de obrigações legais, pelo prazo que a lei
        exigir.
      </p>
    ),
  },
  {
    id: "exclusao",
    title: "Exclusão da conta",
    content: (
      <>
        <p>
          Você pode excluir a conta a qualquer momento no app, em{" "}
          <strong>Conta → Privacidade e dados → Excluir conta</strong>. A
          exclusão é imediata e não depende de contato com o suporte.
        </p>
        <ul>
          <li>
            <strong>Apagamos ou anonimizamos:</strong> nome, e-mail, senha,
            vínculos com Google e Apple, tokens de acesso e de notificação e as
            preferências de consentimento.
          </li>
          <li>
            <strong>Mantemos sem identificar você:</strong> os registros das
            recargas (ponto, horários, energia e valores), vinculados à unidade
            do condomínio para o rateio, e os registros de pagamento exigidos
            por lei.
          </li>
        </ul>
        <p>
          Recargas em andamento precisam ser encerradas antes da exclusão. A
          Stripe mantém os registros das transações conforme a política dela.
        </p>
      </>
    ),
  },
  {
    id: "direitos",
    title: "Seus direitos",
    content: (
      <>
        <p>
          Pela LGPD (art. 18), você pode pedir a confirmação do tratamento, o
          acesso, a correção, a anonimização ou eliminação de dados
          desnecessários, a portabilidade, informações sobre compartilhamento e
          a revogação do consentimento.
        </p>
        <p>
          No app, você pode <strong>exportar seus dados</strong> e{" "}
          <strong>excluir a conta</strong> em Conta → Privacidade e dados. Você
          também pode apresentar reclamação à Autoridade Nacional de Proteção de
          Dados (ANPD).
        </p>
      </>
    ),
  },
  {
    id: "encarregado",
    title: "Encarregado de dados",
    content: (
      <p>
        Para exercer seus direitos ou tirar dúvidas, escreva para{" "}
        <a href={`mailto:${contactEmail}`}>{contactEmail}</a>. Para ajuda com o
        app, veja a página de{" "}
        <Link to={paths.legal.support.getHref()}>Suporte</Link>. Os e-mails
        enviados pelo endereço noreply não são monitorados.
      </p>
    ),
  },
];

export function PrivacyRoute() {
  return (
    <LegalLayout
      title="Política de privacidade"
      version="08/10/2026"
      sections={sections}
    />
  );
}
