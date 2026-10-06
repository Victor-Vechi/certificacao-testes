# Introdução

API REST de **agenda de consultas** desenvolvida em **NestJS** com **TypeScript**, responsável por agendar e cancelar consultas entre pacientes e profissionais, aplicando as regras de negócio descritas em [`DomainRules.md`](./DomainRules.md).

O projeto aplica os princípios de **Clean Architecture**, separando domínio, aplicação e infraestrutura em camadas bem definidas, com baixo acoplamento e alta coesão. Todo o desenvolvimento foi guiado por **TDD**, seguindo o ciclo **red → green → refactor**, com um commit por fase e evidências de cada ciclo.

---

## Tecnologias utilizadas

| Tecnologia | Descrição |
|---|---|
| **Node.js 22** | Runtime JavaScript |
| **NestJS 11** | Framework para construção da API |
| **TypeScript** | Superset tipado do JavaScript |
| **class-validator** | Validação dos payloads de entrada |
| **Jest** | Framework de testes unitários |
| **Docker** | Containerização da aplicação |
| **ESLint + Prettier** | Lint e formatação de código |

---

## Arquitetura

O projeto segue os princípios de **Clean Architecture**, separando responsabilidades em camadas:

```
src/
├── appointment/
│   ├── application/        # Casos de uso (agendar e cancelar consulta)
│   ├── domain/
│   │   ├── entities/       # Entidade Appointment e suas regras
│   │   ├── enums/          # Status da consulta
│   │   ├── exceptions/     # Exceções de negócio
│   │   ├── interfaces/     # Contratos e inputs dos casos de uso
│   │   └── repositories/   # Contrato do repositório
│   └── infra/
│       ├── http/v1/        # Controller e DTOs
│       └── persistence/    # Repositório em memória
└── shared/
    ├── domain/             # Relógio, exceções base e tokens de injeção de dependência
    └── infra/              # Implementação do relógio do sistema
```

---

## Decisões estratégicas

O projeto foi desenvolvido com **TDD**: cada regra começou com um teste falhando (**red**), recebeu o código mínimo para passar (**green**) e depois foi melhorada sem mudar o comportamento (**refactor**). Cada fase virou um commit semântico (`test:`, `feat:`, `refactor:`), e os prints da execução dos testes de cada ciclo estão na pasta [`evidencias/`](./evidencias), separados por regra. Nos commits de red, o esqueleto do código de produção (exceção, método vazio) já vai junto, para que o teste falhe na asserção e não por erro de import.

As regras de negócio ficam na entidade `Appointment` (por exemplo `overlaps`, `hasMinimumNotice`, `isWithinBusinessHours`, `hasCancellationNotice`), enquanto os casos de uso apenas orquestram: buscam os dados, consultam a entidade e lançam a exceção adequada.

Para tornar as regras de tempo testáveis, o "agora" vem de um relógio injetável (`ClockInterface`). Nos testes é usado um relógio fixo; em execução, o `SystemClock`. As dependências são injetadas por tokens do `DependencyInjectionEnum`.

As exceções de negócio estendem uma de três classes base, e o controller converte cada categoria para o status HTTP correspondente. Assim, uma nova regra não exige mudança no controller:

| Exceção base | Status HTTP | Exemplos |
|---|---|---|
| `ResourceNotFoundException` | `404` | Consulta inexistente |
| `BusinessConflictException` | `409` | Conflito de horário, consulta já cancelada |
| `BusinessRuleException` | `422` | Antecedência, horário comercial, prazo de cancelamento, limites do paciente |

A persistência é feita em **memória**, o que mantém o foco nas regras de negócio e nos testes. Os dados são perdidos ao reiniciar a aplicação; trocar por um banco real exige apenas uma nova implementação do contrato `AppointmentRepository`.

Os requisitos deixaram algumas regras implícitas, que precisaram ser interpretadas:

- **Cancelamento fora do prazo é recusado** — a regra permitia recusar ou marcar a consulta como "falta". Optei por recusar, por ser mais simples e direto de testar.
- **Limites inclusivos** — "até 24h antes" permite cancelar com exatamente 24h; consultas podem começar às 08:00, terminar às 18:00 e ser marcadas com exatamente 2h de antecedência.
- **Consultas em aberto** — para o limite por paciente, contam apenas consultas com status `SCHEDULED` e que ainda não começaram.
- **Horário local** — o horário comercial é avaliado no fuso do servidor, por isso a variável `TZ` deve ser configurada.
- **Consultas realizadas** — o status `COMPLETED` existe e é respeitado no cancelamento, mas ainda não há um caso de uso que marque uma consulta como realizada.

---

## Regras de negócio

| # | Regra | Resumo |
|---|---|---|
| 1 | Sem conflito de horário | Um profissional não pode ter duas consultas agendadas com horários sobrepostos. Consultas encostadas (uma termina às 10:00 e outra começa às 10:00) são permitidas. |
| 2 | Antecedência e horário comercial | A consulta precisa ser marcada com pelo menos 2h de antecedência, de segunda a sexta, entre 08:00 e 18:00. |
| 3 | Cancelamento com prazo mínimo | O cancelamento só é permitido até 24h antes da consulta, e apenas para consultas agendadas. |
| 4 | Limite por paciente | O paciente pode ter no máximo 2 consultas futuras em aberto e não pode ter duas consultas no mesmo dia com o mesmo profissional. |

---

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/appointment` | Agenda uma consulta |
| `PATCH` | `/appointment/:id/cancel` | Cancela uma consulta |

> Uma collection do **Insomnia** com os requests prontos, cobrindo os cenários de sucesso e de erro de cada regra, está disponível em [`agenda-collection.json`](./agenda-collection.json) na raiz do projeto. As datas são calculadas automaticamente no momento da execução, então a collection não fica desatualizada. Como o repositório é em memória, reinicie a aplicação antes de executar a collection inteira (**Run Collection**).

### Agendar consulta

**Payload**
```json
{
  "professionalId": "prof-1",
  "patientId": "pac-1",
  "startsAt": "2026-10-12T10:00:00-03:00",
  "endsAt": "2026-10-12T10:30:00-03:00"
}
```

**Resposta `201`**
```json
{
  "professionalId": "prof-1",
  "patientId": "pac-1",
  "startsAt": "2026-10-12T13:00:00.000Z",
  "endsAt": "2026-10-12T13:30:00.000Z",
  "id": "922e2b80-64c6-4691-97c5-80e2189f07af",
  "status": "SCHEDULED"
}
```

| Status | Quando |
|---|---|
| `201` | Consulta agendada |
| `400` | Payload inválido (campos vazios ou datas fora do padrão ISO 8601) |
| `409` | O profissional já tem consulta nesse horário |
| `422` | Antecedência menor que 2h, fora do horário comercial, limite de consultas do paciente ou consulta no mesmo dia com o mesmo profissional |

### Cancelar consulta

```
PATCH /appointment/922e2b80-64c6-4691-97c5-80e2189f07af/cancel
```

**Resposta `200`**: a consulta com `"status": "CANCELLED"`.

| Status | Quando |
|---|---|
| `200` | Consulta cancelada |
| `404` | Consulta inexistente |
| `409` | Consulta já cancelada ou realizada |
| `422` | Menos de 24h para o início da consulta |

---

## Como rodar o projeto

### Pré-requisitos

- [Node.js 22.22.3+](https://nodejs.org/) — caso tenha o [nvm](https://github.com/nvm-sh/nvm) instalado, basta rodar:
  ```bash
  nvm install
  ```
  O arquivo `.nvmrc` já aponta para a versão correta (`v22.22.3`).
- [Docker](https://www.docker.com/) (opcional, para rodar via container)

---

### Rodando localmente (sem Docker)

**1. Copie o .env para o projeto**
```bash
cp .env.example .env
```

**2. Instale as dependências**
```bash
npm install
```

**3. Inicie a aplicação**
```bash
# Desenvolvimento (com hot-reload)
npm run start:dev

# Produção
npm run build
npm run start:prod
```

A API estará disponível em `http://localhost:3000`.

---

### Rodando com Docker

**Copie o .env para o projeto**
```bash
cp .env.example .env
```

**Build e start do container:**
```bash
docker compose up -d --build
```

O Docker irá instalar as dependências e iniciar a aplicação na porta `3000`.

> **Atenção:** o diretório do projeto é montado como volume no container, então alterações no código são refletidas no container. O `--build` só é necessário quando o próprio `dockerfile` ou as dependências mudarem.

---

## Testes

O projeto possui apenas testes **unitários** (Jest), localizados em `test/` e identificados pelo padrão `*.spec.ts`.

```bash
# Rodar todos os testes unitários
npm test

# Gerar relatório de cobertura
npm run test:cov

# Rodar todos os testes unitários via docker
docker compose exec api-service npm test

# Gerar relatório de cobertura via docker
docker compose exec api-service npm run test:cov
```

O relatório de cobertura em HTML fica em `coverage/lcov-report/index.html`.

### Evidências do TDD

Os prints da execução dos testes em cada fase do ciclo estão em [`evidencias/`](./evidencias), separados por regra:

```
evidencias/
├── regra-1-conflito-de-horario/
├── regra-2-antecedencia-e-horario-comercial/
├── regra-3-cancelamento/
├── regra-4-limite-por-paciente/
└── correcao-horario-cancelado/
```

Cada arquivo segue o padrão `NN-<fase>-<commit>.png`, em que a fase é `red`, `green`, `refactor` ou `guard` (teste de proteção que já nasce verde). Como cada print aponta para um commit, qualquer ciclo pode ser reproduzido com `git checkout <commit> && npm test`.

---

## Variáveis de ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `PORT` | `3000` | Porta em que a aplicação será iniciada |
| `TZ` | `America/Sao_Paulo` | Fuso horário usado para avaliar o horário comercial |
