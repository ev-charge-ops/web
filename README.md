# EV ChargeOps — Portal do gestor

**Enterprise Challenge 2026 — FIAP × GoodWe · Grupo 23 · Sprint 02**

Portal web do EV ChargeOps para o gestor (síndico) do condomínio. É nele que o gestor acompanha o consumo e a capacidade elétrica, revisa as sessões e as anomalias apontadas pela IA, fecha o rateio mensal por unidade, ajusta as tarifas e convida os moradores.

O portal é uma SPA que consome a [`api`](https://github.com/ev-charge-ops/api). Os motoristas usam o app [`mobile`](https://github.com/ev-charge-ops/mobile); o portal só atende usuários com papel de gestor e orienta o motorista a usar o app.

> A visão geral da solução, a arquitetura, as decisões (ADRs) e o roteiro de avaliação estão no repositório hub [`ev-charge-ops/docs`](https://github.com/ev-charge-ops/docs), a partir do [README](https://github.com/ev-charge-ops/docs#readme).

## Produção

- **Portal:** [app.evchargeops.com.br](https://app.evchargeops.com.br)
- **API usada:** [api.evchargeops.com.br](https://api.evchargeops.com.br) (Swagger em [/docs](https://api.evchargeops.com.br/docs))

A conta de demonstração do gestor está descrita no [README do `docs`](https://github.com/ev-charge-ops/docs#6-como-testar-a-demonstração-em-produção). A senha está no arquivo da entrega e não fica publicada.

## Stack

| Camada | Tecnologia |
|---|---|
| Base | React 19, TypeScript 6, Vite 8 |
| Rotas | React Router 8 |
| Dados do servidor | TanStack Query 5, `openapi-fetch` com tipos gerados por `openapi-typescript` a partir do OpenAPI da API |
| Formulários | React Hook Form + Zod (`@hookform/resolvers`) |
| Interface | CSS Modules, `lucide-react`, `react-error-boundary` |
| Login social | `@react-oauth/google` e Sign in with Apple (JS da Apple) |
| Qualidade | Vitest 5 + Testing Library + MSW (jsdom), `oxlint` e ESLint com `eslint-plugin-boundaries` |

## Principais funcionalidades

| Tela | Rota | O que faz |
|---|---|---|
| Visão geral | `/` | consumo e valores do mês, capacidade elétrica (demanda contratada, reserva, demanda atual e pico), energia por semana e anomalias recentes |
| Sessões | `/sessions` | lista paginada com filtros por mês, ponto, status e "somente anomalias"; o detalhe mostra energia, valores, fator de demanda e a explicação do score de anomalia |
| Rateio | `/cost-sharing` | extrato do mês por unidade (energia, taxa de acesso e multas por ocupação), troca de mês e exportação em CSV |
| Pontos e capacidade | `/charge-points` | estado de cada ponto, potência e preço por kWh do momento com o fator de demanda |
| Regras e tarifas | `/rules` | edição da tarifa da organização; cada alteração cria uma versão nova na API |
| Moradores e convites | `/residents` | membros com papel e unidade, convites por e-mail, reenvio e revogação |

Além dessas telas, o portal tem login com e-mail e senha, link de acesso por e-mail, Google e Apple, recuperação de senha, verificação de e-mail, aceite de convite (`/invite`) e as páginas de privacidade e termos.

O portal apresenta as regras de negócio que a API calcula ([ADRs 0010 a 0014](https://github.com/ev-charge-ops/docs/tree/main/adr)):

- **Preço por kWh** ([ADR 0011](https://github.com/ev-charge-ops/docs/blob/main/adr/0011-pricing-with-demand-factor.md)): nos pontos `PRIVATE` a cobrança é a tarifa da concessionária, e o fator de demanda da IA aparece **só como informação** ("energia a custo · fator informativo"). No ponto `COMMERCIAL`, o preço é `tarifa base × fator`. O portal mostra a origem do fator: modelo de IA ou regra por horário.
- **Anomalias** ([ADR 0012](https://github.com/ev-charge-ops/docs/blob/main/adr/0012-anomaly-detection.md)): cada sessão encerrada recebe um score do modelo. Não há fallback por regras: se o serviço de IA falhar, a sessão fica **sem score** e o portal a mostra assim. A anomalia é um alerta para revisão, e a sessão continua no rateio.
- **Sessões** ([ADR 0010](https://github.com/ev-charge-ops/docs/blob/main/adr/0010-charging-session-state-machine.md)): a API avança o estado das sessões a cada leitura, então o portal sempre mostra os valores calculados até o instante da consulta.
- **Rateio** ([ADR 0013](https://github.com/ev-charge-ops/docs/blob/main/adr/0013-monthly-cost-sharing.md)): só entram sessões de pontos `PRIVATE`. O ponto comercial é pago no cartão, com pré-autorização no Stripe em modo de teste ([ADR 0014](https://github.com/ev-charge-ops/docs/blob/main/adr/0014-stripe-preauthorization.md)).
- **Autenticação** ([ADR 0007](https://github.com/ev-charge-ops/docs/blob/main/adr/0007-authentication.md) e [ADR 0008](https://github.com/ev-charge-ops/docs/blob/main/adr/0008-authentication-flows.md)): access token só em memória e refresh token no `localStorage`, renovado com rotação.

## Estrutura de pastas

```
web/
├── .github/workflows/ci.yml   lint, testes e build
├── public/
│   ├── .well-known/           App Links (Android) e Universal Links (iOS) do app mobile
│   └── favicon.svg
├── scripts/
│   └── generate-api-schema.mjs  gera src/lib/api-schema.d.ts a partir do OpenAPI da API
├── src/
│   ├── main.tsx               ponto de entrada
│   ├── app/                   camada de aplicação
│   │   ├── app.tsx, provider.tsx, router.tsx   providers e definição das rotas
│   │   └── routes/            uma página por rota, com os testes de cada uma
│   ├── features/              uma pasta por domínio, cada uma com api/, components/ e utils/
│   │   ├── auth/              login, recuperação de senha, OAuth e verificação de e-mail
│   │   ├── organizations/     organização selecionada e troca de organização
│   │   ├── overview/          métricas do mês, capacidade e gráfico semanal
│   │   ├── sessions/          tabela, detalhe e explicação de anomalias
│   │   ├── cost-sharing/      extrato mensal e exportação CSV
│   │   ├── charge-points/     cartões dos pontos e preço dinâmico
│   │   ├── tariff/            formulário de tarifas
│   │   ├── residents/         membros e convites
│   │   └── invites/           aceite de convite
│   ├── components/            componentes compartilhados
│   │   ├── ui/                design system (botões, campos, tabela, drawer, toast...)
│   │   ├── layouts/           layouts de autenticação, painel e páginas legais
│   │   └── errors/            tela de erro
│   ├── lib/                   cliente da API, tipos gerados, autenticação e React Query
│   ├── config/                variáveis de ambiente e caminhos das rotas
│   ├── hooks/                 hooks compartilhados
│   ├── utils/                 formatação de moeda, energia, datas e demanda
│   ├── styles/                estilos globais e tokens
│   └── testing/               setup do Vitest e handlers do MSW
├── vercel.json                rewrite da SPA e cabeçalhos do .well-known
├── vite.config.ts
└── vitest.config.ts
```

As dependências seguem `app → features → compartilhado`, e uma feature não importa outra. O ESLint (`eslint-plugin-boundaries`) garante essa regra.

## Como rodar localmente

Requisitos: Node 24 e a [`api`](https://github.com/ev-charge-ops/api) rodando (localmente ou em produção).

### 1. Variáveis de ambiente

```bash
cp .env.example .env
```

| Variável | Uso |
|---|---|
| `VITE_API_URL` | URL da API (padrão do exemplo: `http://localhost:3000`) |
| `VITE_GOOGLE_CLIENT_ID` | client ID web do Google; vazio esconde o botão do Google |
| `VITE_APPLE_SERVICES_ID` | Services ID do Sign in with Apple; vazio esconde o botão da Apple |

A origem do portal (`http://localhost:5173`) precisa estar em `CORS_ORIGINS` na API.

### 2. Comandos

```bash
npm ci                 # instala as dependências
npm run dev            # servidor do Vite em http://localhost:5173
npm test               # testes (Vitest)
npm run test:watch     # testes em modo watch
npm run lint           # oxlint + ESLint
npm run build          # tsc -b e vite build
npm run preview        # serve o build localmente
npm run gen:api        # regenera os tipos da API (API_SCHEMA_URL, padrão http://localhost:3000/docs-json)
```

## Testes, CI e deploy

- **Testes** (`*.test.ts(x)`): Vitest com Testing Library em jsdom. As chamadas à API são interceptadas pelo MSW ([`src/testing/mocks`](src/testing/mocks)), então os testes não dependem da API. Cobrem as páginas (login, visão geral, sessões, rateio, pontos, regras, moradores, convites, páginas legais), os componentes de UI, o cliente da API, a renovação de tokens e as funções de formatação.
- **CI** ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)), em todo PR e push na `main`: `npm ci`, `npm run lint`, `npm test` e `npm run build` (que inclui a checagem de tipos com `tsc -b`).
- **Deploy na Vercel** ([ADR 0015](https://github.com/ev-charge-ops/docs/blob/main/adr/0015-deploy-and-ci.md)): integração Git. Cada PR gera um preview, e cada merge na `main` publica em [app.evchargeops.com.br](https://app.evchargeops.com.br). O [`vercel.json`](vercel.json) reescreve as rotas para `index.html` e serve os arquivos `.well-known` com `Content-Type: application/json`.
- As variáveis de produção ficam na Vercel.
