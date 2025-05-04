# Sistema de Chamados CEAD PUC-GO

Este é um sistema de gerenciamento de chamados desenvolvido para o CEAD (Coordenação de Educação a Distância) da PUC-GO, utilizando Next.js, TypeScript e integração com a API do GLPI.

## Funcionalidades

- Autenticação de usuários
- Abertura de chamados com prioridade e categoria
- Edição de chamados (título, descrição e prioridade)
- Atribuição de chamados a técnicos ou grupos
- Acompanhamento de status em tempo real
- Upload de anexos
- Comentários em chamados
- Painel administrativo com estatísticas
- Sistema de notificações
- Interface responsiva para dispositivos móveis
- Tratamento de erros avançado
- Validação em tempo real dos formulários
- Filtros com rolagem para listas extensas

## Componentes Principais

- **AppHeader**: Cabeçalho unificado para interfaces de usuário e administrador
- **FilterDropdown**: Componente de filtro com suporte a rolagem para listas extensas
- **ErrorMessage**: Exibição padronizada de mensagens de erro
- **LoadingSpinner**: Indicador de carregamento
- **FormField**: Campo de formulário com validação em tempo real
- **PriorityIndicator**: Indicador visual de prioridade dos chamados
- **NotificationBell**: Sistema de notificações em tempo real

## Requisitos

- Node.js 18.x ou superior
- npm ou yarn
- Acesso a uma instância do GLPI

## Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```
# URL da API do GLPI
NEXT_PUBLIC_GLPI_API_URL=http://seu-servidor-glpi/apirest.php

# Tokens de autenticação do GLPI
GLPI_APP_TOKEN=seu-app-token
GLPI_USER_TOKEN=seu-user-token

# Configuração do Redis (opcional, apenas para produção)
REDIS_URL=redis://usuario:senha@seu-servidor-redis:6379

# Usar dados simulados para desenvolvimento
USE_MOCK_DATA=true
```

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/JohnatanG3/cead-pucgo-helpdesk-glpi.git
cd cead-pucgo-helpdesk-glpi
```

2. Instale as dependências:
```bash
npm install
# ou
yarn
```

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
# ou
yarn dev
```

4. Acesse `http://localhost:3000` no seu navegador.

## Estrutura do Projeto

- `/app` - Rotas e páginas da aplicação (Next.js App Router)
- `/components` - Componentes React reutilizáveis
- `/lib` - Funções utilitárias e serviços
- `/contexts` - Contextos React para gerenciamento de estado
- `/types` - Definições de tipos TypeScript
- `/public` - Arquivos estáticos (imagens, favicon, etc.)

## Tratamento de Erros

O sistema implementa um tratamento de erros robusto:

- **handleApiRequest**: Função utilitária para simplificar chamadas à API com tratamento de erros padronizado
- **ErrorMessage**: Componente para exibição consistente de mensagens de erro
- **notificationService**: Serviço para exibição de notificações de sucesso, erro e informações

## Validação de Dados

O sistema utiliza a biblioteca Zod para validação de dados nos formulários, com validação em tempo real através do componente FormField.

## Integração com o GLPI

O sistema se comunica com o GLPI através de sua API REST. As principais funcionalidades implementadas são:

- Autenticação via token
- Listagem e criação de chamados
- Edição de chamados (título, descrição e prioridade)
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

### Gestão de Sessões

O sistema implementa um mecanismo de cache para tokens de sessão do GLPI, com renovação automática antes da expiração. Em produção, é possível utilizar Redis para armazenamento persistente dos tokens.

### Sistema de Notificações

O sistema inclui um serviço de notificações que permite alertar os usuários sobre atualizações em seus chamados. As notificações são exibidas em tempo real através de um componente de sino de notificações.

## Produção

Para build de produção:

```bash
npm run build
# ou
yarn build
```

Para executar em produção:

```bash
npm start
# ou
yarn start
```

### Configuração para Produção

Em ambiente de produção, recomenda-se:

1. Configurar um servidor Redis para armazenamento de tokens de sessão
2. Utilizar um serviço como Vercel, Netlify ou servidor próprio com PM2
3. Configurar HTTPS para segurança das comunicações
4. Definir a variável `USE_MOCK_DATA` como "false"

## Recursos Adicionais

- Interface de administração para gerenciamento de chamados
- Painel de estatísticas para acompanhamento de métricas
- Editor de texto rico para descrições e respostas
- Upload de múltiplos arquivos
- Filtros avançados para busca de chamados
- Página de debug para administradores

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.
```

O README atualizado agora reflete todas as principais melhorias e funcionalidades que implementamos, incluindo:

1. Menção ao cabeçalho unificado (AppHeader)
2. Adição da funcionalidade de edição de prioridade dos chamados
3. Inclusão dos novos componentes (FilterDropdown, ErrorMessage, LoadingSpinner, FormField)
4. Descrição do sistema de tratamento de erros aprimorado
5. Menção à validação em tempo real dos formulários
6. Referência à página de debug para administradores