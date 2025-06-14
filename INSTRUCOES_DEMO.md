# Instruções para Demonstração do Sistema de Chamados CEAD

## Configuração Inicial

1. **Instale as dependências**:
   \`\`\`bash
   npm install
   # ou
   yarn
   \`\`\`

2. **Inicie o servidor de desenvolvimento**:
   \`\`\`bash
   npm run dev
   # ou
   yarn dev
   \`\`\`

3. **Acesse o sistema** no navegador através do endereço: `http://localhost:3000`

## Credenciais para Acesso

### Perfil de Administrador
- **Usuário**: admin@pucgoias.edu.br
- **Senha**: admin123

### Perfil de Usuário Comum
- **Usuário**: usuario@pucgoias.edu.br
- **Senha**: user123

### Perfil de Suporte Técnico
- **Usuário**: suporte@pucgoias.edu.br
- **Senha**: suporte123

## Roteiro para Demonstração

### 1. Demonstração do Perfil de Usuário

1. **Login como Usuário**:
   - Acesse a página inicial
   - Entre com as credenciais de usuário comum
   - Observe o redirecionamento para o dashboard do usuário

2. **Abertura de Chamado**:
   - No dashboard, clique em "Novo Chamado"
   - Preencha o formulário com:
     - Título: "Problema com material didático"
     - Categoria: "Material Didático"
     - Prioridade: "Média"
     - Descrição: "O material da disciplina X está com links quebrados na página 30."
   - Adicione um anexo (opcional)
   - Clique em "Enviar Chamado"
   - Observe a mensagem de confirmação

3. **Visualização de Chamados**:
   - Clique em "Ver Todos os Chamados"
   - Observe a lista de chamados abertos
   - Clique em um chamado para ver os detalhes
   - Verifique o histórico do chamado

4. **Adição de Comentário**:
   - Na página de detalhes do chamado, adicione um comentário
   - Clique em "Enviar"
   - Observe o comentário adicionado ao histórico

5. **Logout**:
   - Clique no seu nome no canto superior direito
   - Selecione "Sair"
   - Observe o redirecionamento para a página de login

### 2. Demonstração do Perfil de Administrador

1. **Login como Administrador**:
   - Entre com as credenciais de administrador
   - Observe o redirecionamento para o dashboard administrativo

2. **Visualização de Todos os Chamados**:
   - Observe o painel com estatísticas gerais
   - Veja a lista de chamados recentes
   - Clique em "Ver Chamados" para ver todos os chamados

3. **Gerenciamento de Chamado**:
   - Clique em um chamado para ver os detalhes
   - Altere o status para "Em Andamento"
   - Adicione um comentário como administrador
   - Atribua o chamado a um técnico
   - Clique em "Salvar"

4. **Visualização de Relatórios**:
   - Clique em "Relatórios" no menu lateral
   - Explore os diferentes relatórios disponíveis
   - Observe os gráficos e estatísticas

5. **Gerenciamento de Categorias**:
   - Clique em "Gerenciar Categorias"
   - Veja as categorias existentes
   - Adicione uma nova categoria (opcional)

6. **Logout**:
   - Clique no seu nome no canto superior direito
   - Selecione "Sair"
   - Observe o redirecionamento para a página de login

## Observações Importantes

- O sistema está configurado para funcionar com dados simulados, sem necessidade de conexão com o GLPI.
- Todas as ações são salvas apenas na memória durante a sessão atual. Ao reiniciar o servidor, os dados voltam ao estado inicial.
- Para uma demonstração mais completa, recomenda-se criar alguns chamados com diferentes status e prioridades antes da apresentação.

## Solução de Problemas

- Se encontrar algum erro, verifique o console do navegador para mais detalhes.
- Em caso de problemas com a autenticação, tente limpar o localStorage do navegador e reiniciar a aplicação.
- Se o servidor travar, reinicie-o com `npm run dev` ou `yarn dev`.
