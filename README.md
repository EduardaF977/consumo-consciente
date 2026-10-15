# Consumo Consciente

Plataforma web para monitoramento de consumo doméstico de água e energia elétrica.

## Tecnologias

| Camada      | Tecnologia                              |
|-------------|-----------------------------------------|
| Frontend    | React 18 + TypeScript + Vite            |
| Backend     | Node.js + Express + TypeScript          |
| Banco       | PostgreSQL                              |
| ORM         | Prisma                                  |
| Gráficos    | Recharts                                |
| Auth        | JWT + bcryptjs                          |

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- [PostgreSQL](https://www.postgresql.org/) v14 ou superior
- npm (incluído com o Node.js)

---

## Estrutura do projeto

```
itinerario/
├── backend/          # API REST (Express + Prisma)
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── utils/
│   ├── .env
│   └── package.json
└── frontend/         # SPA (React + Vite)
    ├── src/
    │   ├── components/
    │   ├── contexts/
    │   ├── pages/
    │   ├── services/
    │   ├── types/
    │   └── utils/
    └── package.json
```

---

## Configuração do banco de dados

1. Crie o banco no PostgreSQL:

```sql
CREATE DATABASE consumo_consciente;
```

2. Confirme que o arquivo `backend/.env` tem a URL correta:

```env
DATABASE_URL="postgresql://postgres:sua_senha@localhost:5432/consumo_consciente"
JWT_SECRET="consumo_consciente_jwt_secret_2024"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
```

> Ajuste `usuario`, `senha` e `host` conforme sua instalação local do PostgreSQL.

---

## Instalação e execução

### Backend

```bash
# Entrar na pasta
cd backend

# Instalar dependências
npm install

# Gerar o cliente Prisma
npm run prisma:generate

# Executar as migrações (cria as tabelas)
npm run prisma:migrate

# Popular o banco com dados iniciais (tipos de consumo, dicas e usuário demo)
npm run prisma:seed

# Iniciar o servidor em modo desenvolvimento
npm run dev
```

O backend estará disponível em `http://localhost:3001`.

---

### Frontend

Em outro terminal:

```bash
# Entrar na pasta
cd frontend

# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```

O frontend estará disponível em `http://localhost:5173`.

> O Vite está configurado para fazer proxy das chamadas `/api` para `http://localhost:3001`, então não é necessário nenhuma configuração adicional de CORS durante o desenvolvimento.

---

## Credenciais de demonstração

Após rodar o seed, uma conta de demonstração já estará disponível:

| Campo  | Valor                          |
|--------|--------------------------------|
| E-mail | demo@consumoconsciente.com     |
| Senha  | Demo@1234                      |

Você também pode criar uma conta nova diretamente pela tela de cadastro.

---

## Scripts disponíveis

### Backend (`cd backend`)

| Comando                  | Descrição                                        |
|--------------------------|--------------------------------------------------|
| `npm run dev`            | Inicia o servidor em modo desenvolvimento        |
| `npm run build`          | Compila o TypeScript para `dist/`                |
| `npm run start`          | Inicia o servidor a partir do build compilado    |
| `npm run prisma:generate`| Gera o cliente Prisma a partir do schema         |
| `npm run prisma:migrate` | Executa as migrações pendentes                   |
| `npm run prisma:seed`    | Popula o banco com dados iniciais                |

### Frontend (`cd frontend`)

| Comando          | Descrição                                     |
|------------------|-----------------------------------------------|
| `npm run dev`    | Inicia o servidor de desenvolvimento          |
| `npm run build`  | Gera o build de produção em `dist/`           |
| `npm run preview`| Visualiza o build de produção localmente      |

---

## Funcionalidades implementadas

- **Autenticação** — cadastro, login com JWT, sessão persistida, logout
- **Dashboard** — resumo do período selecionado, variações, médias históricas, gráfico dos últimos 6 meses e dica aleatória
- **Novo consumo** — registro de água (m³) ou energia (kWh) com valor pago opcional
- **Análise automática** — variação percentual, classificação e observação gerados a cada registro
- **Histórico** — tabela com filtros por tipo e período, edição e exclusão com confirmação
- **Gráficos** — evolução mensal de água e energia, valores pagos, variações percentuais (3, 6 ou 12 meses)
- **Dicas** — 12 dicas categorizadas (Água, Energia, Geral) com filtro e nível de relevância
- **Perfil** — editar nome/e-mail, alterar senha, encerrar sessão
- **Responsividade** — sidebar fixa no desktop, menu hambúrguer no mobile

---
## Observações

- Cada usuário visualiza exclusivamente seus próprios registros.
- A análise de consumo é recalculada automaticamente em toda edição.
- O dashboard não armazena dados calculados no banco — os valores são derivados dos registros em tempo real, evitando inconsistências.
- O seed pode ser executado múltiplas vezes com segurança (verificação por título nas dicas e upsert no usuário demo).
- Senhas são armazenadas com hash bcrypt (custo 10). O JWT expira em 7 dias por padrão.
