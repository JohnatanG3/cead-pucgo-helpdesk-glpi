# Sistema de Chamados CEAD PUC-GO

Este é um sistema de gerenciamento de chamados desenvolvido para o CEAD (Coordenação de Educação a Distância) da PUC-GO, utilizando Next.js, TypeScript e integração com a API do GLPI.

## Funcionalidades

- Autenticação de usuários com diferentes níveis de acesso (admin e usuário)
- Abertura de chamados
- Atribuição de chamados a técnicos ou grupos
- Acompanhamento de status
- Upload de anexos
- Comentários em chamados
- Painel administrativo
- Sistema de notificações
- Interface responsiva para dispositivos móveis
- Perfis de usuário personalizáveis
- Relatórios e estatísticas
- Gerenciamento de categorias

## Requisitos

- Node.js 18.x ou superior
- npm ou yarn
- Acesso a uma instância do GLPI

## Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

\`\`\`
# URL da API do GLPI (obrigatório para produção)
NEXT_PUBLIC_GLPI_API_URL=http://seu-servidor-glpi/apirest.php
GLPI_API_URL=http://seu-servidor-glpi/apirest.php

# Tokens de autenticação do GLPI (obrigatórios para produção)
GLPI_APP_TOKEN=seu-app-token
GLPI_USER_TOKEN=seu-user-token

# Segredo para NextAuth (obrigatório)
# Gere com: openssl rand -base64 32 ou node -e "console.log(crypto.randomBytes(32).toString('hex'))"
NEXTAUTH_SECRET=seu-segredo-gerado

# URL base da aplicação (obrigatório para produção)
NEXT_PUBLIC_APP_URL=https://seu-dominio.com

# Configuração do Redis (opcional, apenas para produção)
REDIS_URL=redis://usuario:senha@seu-servidor-redis:6379

# Usar dados simulados para desenvolvimento
USE_MOCK_DATA=true
\`\`\`

## Instalação

1. Clone o repositório:
\`\`\`bash
git clone https://github.com/JohnatanG3/cead-pucgo-helpdesk-glpi.git
cd cead-pucgo-helpdesk-glpi
\`\`\`

2. Instale as dependências:
\`\`\`bash
npm install
# ou
yarn
\`\`\`

3. Execute o servidor de desenvolvimento:
\`\`\`bash
npm run dev
# ou
yarn dev
\`\`\`

4. Acesse `http://localhost:3000` no seu navegador.

## Estrutura do Projeto

- `/app` - Rotas e páginas da aplicação (Next.js App Router)
  - `/admin` - Páginas administrativas (acesso restrito)
  - `/dashboard` - Páginas de usuário comum
  - `/api` - Rotas de API, incluindo autenticação
- `/components` - Componentes React reutilizáveis
  - `/ui` - Componentes de interface de usuário
  - `/dashboard` - Componentes específicos do dashboard
- `/lib` - Funções utilitárias e serviços
  - `auth-glpi.ts` - Serviço de autenticação com GLPI
  - `glpi-api.ts` - Cliente para API do GLPI
  - `cache.ts` - Gerenciamento de cache
- `/contexts` - Contextos React para gerenciamento de estado
  - `auth-context.tsx` - Contexto de autenticação
- `/types` - Definições de tipos TypeScript
- `/public` - Arquivos estáticos (imagens, favicon, etc.)
- `/config` - Arquivos de configuração

## Sistema de Autenticação

O sistema implementa autenticação baseada em NextAuth.js com integração ao GLPI:

### Fluxo de Autenticação

1. O usuário insere credenciais na página de login
2. As credenciais são validadas contra a API do GLPI
3. Se válidas, um token de sessão é gerado e armazenado
4. O usuário é redirecionado com base em seu papel:
   - Administradores: `/admin`
   - Usuários comuns: `/dashboard`

### Papéis de Usuário

- **Administrador**: Acesso completo ao sistema, incluindo gerenciamento de chamados, categorias e relatórios
- **Usuário**: Acesso limitado para abrir e acompanhar seus próprios chamados

### Proteção de Rotas

O sistema implementa proteção de rotas baseada em papéis:
- Middleware verifica a autenticação e redireciona usuários não autorizados
- Contexto de autenticação fornece informações do usuário em toda a aplicação

## Principais Funcionalidades

### Sistema de Chamados

- Criação e acompanhamento de chamados
- Atribuição de prioridades e categorias
- Upload de anexos e documentos
- Comentários e atualizações de status

### Painel Administrativo

- Gerenciamento de todos os chamados
- Atribuição de chamados a técnicos
- Gerenciamento de categorias
- Relatórios e estatísticas

### Perfil de Usuário

- Visualização e edição de informações pessoais
- Alteração de senha
- Preferências de notificação
- Histórico de atividades

### Integração com o GLPI

O sistema se comunica com o GLPI através de sua API REST. As principais funcionalidades implementadas são:

- Autenticação via token
- Listagem e criação de chamados
- Upload de documentos
- Gerenciamento de categorias
- Atribuição de chamados a técnicos e grupos

### Configuração do GLPI

1. No GLPI, acesse Configuração > Geral > API
2. Habilite a API REST
3. Crie um App Token para a aplicação
4. Crie um User Token para o usuário que será usado para autenticação

## Desenvolvimento

### Ambiente de Desenvolvimento

Em ambiente de desenvolvimento, o sistema utiliza dados simulados (mock data) para facilitar o desenvolvimento sem necessidade de uma instância real do GLPI.

Para usar dados reais durante o desenvolvimento, configure as variáveis de ambiente e altere a variável de ambiente `USE_MOCK_DATA` para "false".

### Modo de Desenvolvimento vs. Produção

#### Desenvolvimento
- Autenticação simulada disponível (quando USE_MOCK_DATA=true)
- Armazenamento de sessão em memória
- Hot-reloading para atualizações em tempo real
- Mensagens de erro detalhadas

#### Produção
- Autenticação real com GLPI obrigatória
- Armazenamento de sessão em Redis recomendado
- Otimizações de performance ativadas
- Mensagens de erro genéricas para usuários finais

### Validação de Dados

O sistema utiliza a biblioteca Zod para validação de dados nos formulários. Os schemas de validação estão definidos em `lib/validation.ts`.

### Gestão de Sessões

O sistema implementa um mecanismo de cache para tokens de sessão do GLPI, com renovação automática antes da expiração. Em produção, é possível utilizar Redis para armazenamento persistente dos tokens.

### Sistema de Notificações

O sistema inclui um serviço de notificações que permite alertar os usuários sobre atualizações em seus chamados. As notificações são exibidas em tempo real através de um componente de sino de notificações.

## Produção

Para build de produção:

\`\`\`bash
npm run build
# ou
yarn build
\`\`\`

Para executar em produção:

\`\`\`bash
npm start
# ou
yarn start
\`\`\`

### Configuração para Produção

Em ambiente de produção, recomenda-se:

1. Configurar um servidor Redis para armazenamento de tokens de sessão
2. Utilizar um serviço como Vercel, Netlify ou servidor próprio com PM2
3. Configurar HTTPS para segurança das comunicações
4. Definir a variável `USE_MOCK_DATA` como "false"
5. Gerar um NEXTAUTH_SECRET forte e único
6. Configurar corretamente todas as variáveis de ambiente obrigatórias

## Recursos Adicionais

- Interface de administração para gerenciamento de chamados
- Painel de estatísticas para acompanhamento de métricas
- Editor de texto rico para descrições e respostas
- Upload de múltiplos arquivos
- Filtros avançados para busca de chamados
- Perfis de usuário personalizáveis
- Relatórios detalhados para administradores

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.
