# Forja

Kit inicial para acelerar o desenvolvimento de aplicações SaaS com Nuxt.js. Pronto para produção, contendo autenticação TOTP, gestão de perfil, administração, assinaturas e muito mais.

Desenvolvido por [Gabriel Philipe](https://philipe.dev), desenvolvedor full stack com ampla experiência em PHP que decidiu mergulhar no universo do JavaScript/TypeScript.

## Recursos incluídos

- Cadastro com usuário e senha
- Cadastro via OAuth (Google, Facebook e GitHub)
- Confirmação de conta, via e-mail
- Login (incluindo rate limit e TOTP)
- Login via JWT
- Recuperação de senha
- Dashboard de acesso
- Edição de perfil
- Troca de senha
- Exclusão de conta

## Início rápido

Para começar a desenvolver com o `Forja`, siga as instruções abaixo.

```bash
# Clone o repositório
git clone https://github.com/gabrielphilipes/forja-nuxt-startet-kit
cd forja

# Instale as dependências
bun install

# Copie as configurações iniciais de exemplo
cp .env.example .env

# Inicie o ambiente de desenvolvimento
bun run dev
```

O comando `bun run dev` irá automaticamente:

- Subir os serviços Docker necessários (banco de dados)
- Aguardar a conexão com o banco
- Executar as migrações do banco de dados
- Iniciar o servidor de desenvolvimento Nuxt

Para parar o ambiente, use `Ctrl+C` e os serviços serão encerrados automaticamente.

Fique a vontade para executar os testes (`bun run test`) para garantir que tudo está funcionando :-D

## Boas práticas

Para garantir boas práticas do projeto, implementamos as seguintes ferramentas e processos:

### 📝 Qualidade de Código

- **ESLint**: Análise estática de código JavaScript/TypeScript
- **Prettier**: Formatação automática, garantindo estética padrão no projeto
- **Secretlint**: Verificação automática de credenciais expostas no código
- **Husky**: Execução de hooks para validação geral de: qualidade, estética, segurança e outros...

### 🧪 Testes

- **Vitest**: Framework de testes unitários e de integração
- **CI/CD**: Execução automática de testes em Pull Requests

### 📋 Padrões de Commit

- **Commitlint**: Validação de mensagens de commit seguindo Conventional Commits
- **Commitizen**: Interface interativa para criação de commits padronizados (`bun run commit`)
- **Template de PR**: Estrutura padronizada para Pull Requests
- **Templates de Issue**: Formulários estruturados para bugs e features

### 🔄 Workflow

- **GitHub Actions**: Automação de CI/CD para validação do código via pull request e garantia de qualidade
- **Pre-commit**: Validação automática local antes de commits
- **Pull Request**: Revisão obrigatória de código
- **Docker Compose**: Gerenciamento automatizado de serviços de infraestrutura (`bun run services:up/down`)
- **Migrations**: Sistema de migrações de banco de dados automatizado (`bun run migrations:generate/migrate`)

### 🛠️ Scripts Disponíveis

- **`bun run dev`**: Inicializa ambiente completo (serviços + banco + migrações)
- **`bun run test`**: Executa testes com ambiente completo
- **`bun run test:watch`**: Modo watch para desenvolvimento
- **`bun run lint:eslint:fix`**: Correção automática de problemas de linting
- **`bun run lint:prettier:fix`**: Formatação automática de código
- **`bun run check-updates`**: Verificação e atualização de dependências
