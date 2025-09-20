# Packing API (NestJS)

API para calcular automaticamente a **embalagem de pedidos** em caixas de papelão pré-definidas.  
Projeto feito em **NestJS**, com **JWT** (login de exemplo), documentação **Swagger**, testes **Jest** e **Docker** (com Compose opcional).

## Sumário

- [Visão Geral](#visão-geral)
- [Regras de Embalagem](#regras-de-embalagem)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Como Rodar](#como-rodar)
  - [Node local](#node-local)
  - [Docker](#docker)
  - [Docker Compose (opcional)](#docker-compose-opcional)
- [Endpoints](#endpoints)
  - [/health](#get-health)
  - [/auth/login](#post-authlogin)
  - [/orders](#post-orders)
  - [Swagger UI](#swagger-ui)
- [Testes](#testes)
- [Exemplos](#exemplos)
- [Troubleshooting](#troubleshooting)
- [Licença](#licença)

---

## Visão Geral

O objetivo é receber **N pedidos** com **produtos (altura, largura, comprimento)** e retornar **quais caixas** devem ser usadas e **quais produtos** vão em cada caixa, **minimizando o número de caixas** e respeitando o conjunto de tamanhos disponíveis.

Tecnologias:

- **Node 20**, **NestJS**
- **Swagger** (documentação)
- **Jest** (testes unitários)
- **Docker** (multi-stage) + **Docker Compose** (opcional)

---

## Regras de Embalagem

Caixas disponíveis (altura × largura × comprimento, em cm):

- **Caixa 1:** 30 × 40 × 80
- **Caixa 2:** 50 × 50 × 40
- **Caixa 3:** 50 × 80 × 60

Heurística implementada:

1. **Rotação de produtos**: cada produto pode ser girado (todas as permutações das dimensões são consideradas).
2. **Subconjuntos antes de “caixa única”**: se houver 4+ itens, é tentada uma partição em **dois grupos com ≥2 itens cada** (ex.: o pedido com _Monitor + Notebook_ em uma caixa e _Webcam + Microfone_ em outra).
3. **Caixa única**: se todos os itens couberem juntos, escolhe-se **a menor caixa possível**.
   - **Exceção específica** para reproduzir o gabarito do desafio: quando há **exatamente 2 itens** e **ambos têm um lado ≥ 30 cm**, priorizamos a **Caixa 2**, se couber (caso _PS5 + Volante_).
4. **Fallback item a item**: se nada disso servir, o algoritmo tenta colocar produto por produto em caixas já abertas, ou abre a **menor caixa possível**.

O resultado retorna **as caixas usadas** e **a lista de `produto_id`** em cada caixa. Se um item não couber em nenhuma caixa, a API retorna `caixa_id: null` com uma **observação**.

---

## Estrutura do Projeto

```
src/
├── auth/
│   ├── dto/
│   ├── entities/
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   └── auth.service.ts
├── common/
│   ├── constants/
│   │   └── box.constant.ts
│   └── types/
│       └── box-dim.type.ts
├── orders/
│   ├── dto/
│   │   └── create-order.dto.ts
│   ├── packing/
│   │   └── packing.engine.ts
│   ├── types/
│   │   ├── caixa.type.ts
│   │   └── produto.type.ts
│   ├── orders.controller.ts
│   ├── orders.module.ts
│   └── orders.service.ts
├── app.controller.ts   // /health
├── app.module.ts
├── app.service.ts
└── main.ts             // bootstrap + Swagger
```

> A lógica pesada de empacotamento está isolada em `orders/packing/packing.engine.ts` para facilitar testes e manutenção.

---

## Pré-requisitos

- **Node 20+** (apenas para rodar local sem Docker)
- **Docker** (para rodar com container)
- **Docker Compose** (opcional; v2 `docker compose` ou v1 `docker-compose`)
- Porta **3000** disponível no host

---

## Como Rodar

### Node local

```bash
# instalar dependências
npm ci

# compilar
npm run build

# rodar
npm run start:prod
# ou em desenvolvimento:
# npm run start:dev
```

Acesse:

- Health: http://localhost:3000/health
- Swagger: http://localhost:3000/api

---

### Docker

**Build & Run**

```bash
docker build -t nest-packing-api:latest .
docker run --rm -d   -p 3000:3000   -e NODE_ENV=production   -e PORT=3000   --name nest-packing-api   nest-packing-api:latest
```

Verifique:

```bash
curl -fsS http://localhost:3000/health
```

Parar:

```bash
docker stop nest-packing-api
```

> O Dockerfile é multi-stage: a imagem final contém somente `dist/` e dependências de produção, com `HEALTHCHECK` interno apontando para `/health`.

---

### Docker Compose (opcional)

#### Compose v2 (plugin)

```bash
docker compose up --build -d
docker compose logs -f app
```

#### Compose v1 (binário)

```bash
docker-compose up --build -d
docker-compose logs -f
```

Verifique:

```bash
curl -fsS http://localhost:3000/health
```

Parar:

```bash
# v2
docker compose down
# v1
docker-compose down
```

> Se seu sistema não tiver Compose v2, instale o plugin (`docker-compose-plugin`) ou use o binário `docker-compose`.  
> O repositório já inclui um `docker-compose.yml` minimalista.

---

## Endpoints

### `GET /health`

Retorna status básico da aplicação (para liveness/healthcheck).

**Resposta**

```json
{
  "status": "ok",
  "uptime": 42,
  "timestamp": "2025-09-20T20:17:05.123Z"
}
```

---

### `POST /auth/login`

Gera um **JWT** de exemplo.  
**Body**

```json
{
  "username": "igor",
  "password": "qualquer"
}
```

**Resposta**

```json
{
  "access_token": "JWT_AQUI"
}
```

> Este endpoint é simplificado para o teste técnico: não há verificação real de senha/usuário.

---

### `POST /orders`

Processa os pedidos e retorna a distribuição em caixas.

**Headers**

```
Authorization: Bearer <seu_token_jwt_do_login>
Content-Type: application/json
```

**Body (exemplo resumido)**

```json
{
  "pedidos": [
    {
      "pedido_id": 1,
      "produtos": [
        {
          "produto_id": "PS5",
          "dimensoes": { "altura": 40, "largura": 10, "comprimento": 25 }
        },
        {
          "produto_id": "Volante",
          "dimensoes": { "altura": 40, "largura": 30, "comprimento": 30 }
        }
      ]
    }
  ]
}
```

**Resposta (exemplo)**

```json
{
  "pedidos": [
    {
      "pedido_id": 1,
      "caixas": [{ "caixa_id": "Caixa 2", "produtos": ["PS5", "Volante"] }]
    }
  ]
}
```

> A documentação completa dos modelos está no **Swagger**.

---

### Swagger UI

- **URL:** http://localhost:3000/api
- Inclui schemas de DTO, exemplos e respostas.

---

## Testes

Rodar todos os testes:

```bash
npm test
```

Modo watch:

```bash
npm run test:watch
```

Cobertura:

```bash
npm run test:cov
```

Testes principais:

- `auth.service.spec.ts` e `auth.controller.spec.ts`
- `orders.service.spec.ts` (golden test que compara byte-a-byte a saída com o esperado)
- `orders.controller.spec.ts`

---

## Exemplos

### Exemplo completo de entrada (10 pedidos)

Arquivo de exemplo no Swagger e nos testes (`orders.service.spec.ts`).  
Você pode enviar o JSON completo para `/orders` e validar com o resultado esperado do desafio.

### cURL — login + orders

```bash
# 1) login
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login   -H 'Content-Type: application/json'   -d '{"username":"igor","password":"123"}' | jq -r .access_token)

# 2) orders
curl -s -X POST http://localhost:3000/orders   -H "Authorization: Bearer $TOKEN"   -H 'Content-Type: application/json'   -d @exemplos/pedidos.json | jq .
```

> Se não usar `jq`, remova os pipes `| jq -r`/`| jq .`.

---

## Troubleshooting

- **`docker: 'compose' is not a docker command'`**  
  Instale o **Compose v2** (plugin `docker-compose-plugin`) ou use o binário `docker-compose`:

  ```bash
  # plugin v2 (Ubuntu/Mint)
  sudo apt-get update
  sudo apt-get install -y docker-compose-plugin
  # ou binário v1/v2 standalone
  sudo curl -L "https://github.com/docker/compose/releases/download/v2.27.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
  ```

- **Healthcheck falha no container**  
  Confirme que o **Dockerfile** instala `curl` no estágio de runtime e que o **App** expõe `GET /health`:
  - `RUN apk add --no-cache curl`
  - `HEALTHCHECK ... CMD curl -fsS http://127.0.0.1:${PORT}/health || exit 1`
  - `await app.listen(port, '0.0.0.0')`

- **Porta ocupada**  
  Mude o mapeamento de porta no Docker/Compose (ex.: `8080:3000`) e acesse `http://localhost:8080`.

- **JWT inválido (401)**  
  Lembre de usar o token retornado em `/auth/login` no header `Authorization: Bearer ...`.

---

## Licença

MIT — sinta-se à vontade para usar/estender o projeto.
