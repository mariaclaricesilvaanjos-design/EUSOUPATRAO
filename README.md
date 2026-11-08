# Prato & Prosa — PWA de gestão

Aplicação web instalável, em português, para organizar a operação de pequenos negócios de alimentação. É um site estático, compatível com GitHub Pages, sem backend ou dependência de um serviço externo para as funções locais.

## Publicar no GitHub Pages

1. Envie as alterações para a branch `main`.
2. No repositório, abra **Settings → Pages** e selecione **GitHub Actions** como origem de publicação.
3. O workflow `.github/workflows/deploy-pages.yml` publica automaticamente cada atualização da branch `main`. Também pode ser executado manualmente pela aba **Actions**.
4. Após a publicação, acesse <https://mariaclaricesilvaanjos-design.github.io/EUSOUPATRAO/>.

O workflow empacota apenas os arquivos do site; manifest, ícones e service worker usam caminhos relativos compatíveis com o subdiretório `/EUSOUPATRAO/`. A primeira execução precisa das permissões de Actions/Pages habilitadas no repositório.

## Instalação e dados

Abra o endereço publicado em um navegador compatível e use **Instalar aplicativo** / **Adicionar à tela inicial**. O cache do shell permite abrir o app sem conexão após a primeira visita. Pedidos, produtos, clientes e preferências são armazenados no navegador deste dispositivo; não há sincronização ou backup automático. Em **Configurações → Conta e dados**, é possível exportar e importar uma cópia JSON ou apagar os dados locais.

No primeiro acesso, o onboarding permite começar com listas vazias ou manter os dados demonstrativos fictícios e editáveis. O onboarding e as configurações aceitam logo e capa em PNG, JPG ou WebP de até 1 MB; as imagens são guardadas no dispositivo e incluídas na cópia JSON. Os painéis incluem um gráfico de faturamento semanal que acompanha as vendas registradas. A tipografia foi ampliada para leitura mais confortável em celular e desktop. As mensagens de WhatsApp podem ser personalizadas e copiadas para envio manual; não há envio automático. O modo avançado oferece registros locais de receitas/insumos, lotes e validade, despesas e indicadores básicos. Ao produzir uma receita, insumos com lotes cadastrados só são descontados de lotes não vencidos, por ordem de validade; saldo insuficiente bloqueia a produção sem baixas parciais. Mantenha os totais dos insumos alinhados aos lotes cadastrados. O app não substitui contabilidade, controle fiscal ou sanitário.

## Como salvar os dados na conta de cada usuário

Hoje os dados ficam no navegador do aparelho (`localStorage`), não na conta GitHub nem em um banco compartilhado. O Pages serve apenas os arquivos estáticos e o repositório é público; portanto, nunca se deve usar commits, arquivos JSON publicados ou tabelas no GitHub para guardar pedidos, dados de clientes, telefone ou chave Pix.

**Arquitetura recomendada:** um projeto Supabase administrado pelo produto, com PostgreSQL privado, Supabase Auth para login Google e políticas Row Level Security (RLS). Cada registro pertence a um usuário (`user_id` da identidade autenticada); as policies limitam `SELECT`, `INSERT`, `UPDATE` e `DELETE` a `auth.uid() = user_id`. Não basta ocultar linhas na interface: habilite RLS em todas as tabelas e teste as policies com dois usuários diferentes. Para exigir MFA, habilite a inscrição/verificação do fator e imponha o nível de autenticação reforçado (AAL2) nas operações que leem ou alteram dados.

Um esquema inicial normalizado poderia conter `businesses`, `products`, `clients`, `orders`, `order_items`, `sales`, `ingredients`, `recipes`, `recipe_ingredients`, `batches` e `expenses`. Use UUIDs, `business_id` nas tabelas do negócio, timestamps e chaves estrangeiras; aplique a mesma autorização por usuário ao negócio pai (por exemplo, uma policy que verifica a associação do usuário ao `business_id`). Isso permite que cada usuário tenha um ou mais negócios sem tornar os dados visíveis a outros clientes.

**Alternativa para dados literalmente na conta do próprio cliente:** cada empreendedor poderia provisionar seu próprio projeto Supabase e fornecer a URL e a chave publicável. Isso transfere hospedagem, backups, limites e suporte para cada cliente, e não é recomendado para o primeiro lançamento. OAuth Google identifica o usuário; não cria automaticamente uma base de dados privada na conta Google dele.

**Etapas para ativar sincronização real:**

1. Criar e administrar o projeto Supabase, configurar região, retenção/backups e as tabelas/migrações; aplicar RLS e testar isolamento entre contas antes de importar dados reais.
2. Configurar Google como provedor no Supabase e cadastrar o OAuth client/URIs de redirecionamento no Google Cloud. Habilitar e exigir MFA conforme a política de segurança; OAuth sozinho não exige MFA.
3. Implementar a sessão de autenticação e uma camada de dados no app; toda consulta deve usar a identidade autenticada e respeitar RLS. Não considerar `localStorage` autorização.
4. Definir e testar migração explícita da cópia local JSON, resolução de conflitos e restauração de backup; não enviar dados sem consentimento do usuário.
5. Configurar somente a chave publicável (`anon`/publishable) e a URL no frontend, quando as policies estiverem corretas. Nunca colocar `service_role`, senha de banco, client secret OAuth ou chave privada no PWA, no GitHub Pages ou em variáveis `VITE_*`/`PUBLIC_*`.

Essa integração ainda não está ativa: não há projeto Supabase, OAuth client nem backend associados ao repositório. Até sua configuração, o app continua local e permite exportar/importar uma cópia JSON; não há sincronização entre dispositivos.

## Conta e segurança

Esta versão não oferece login. Google OAuth 2.0 com MFA e sincronização segura exigem um backend, credenciais e configuração no provedor; nenhum segredo deve ser distribuído no JavaScript do navegador. A interface informa essa limitação e não simula autenticação.

Para habilitar uma implementação real, antes da publicação:

1. Provisione uma API HTTPS e um banco de dados com autorização por usuário, política de retenção e cópias de segurança. Defina como os dados locais serão migrados e como conflitos de sincronização serão resolvidos.
2. Cadastre um cliente OAuth para aplicação web no Google Cloud, configure a tela de consentimento, os domínios autorizados e os URIs de redirecionamento do backend. Mantenha o segredo OAuth exclusivamente no servidor ou em um gerenciador de segredos.
3. Implemente no backend o fluxo OAuth apropriado, valide os tokens e associe cada registro à identidade autenticada. Não trate dados no `localStorage` como prova de identidade ou autorização.
4. Configure a exigência de MFA na organização/provedor de identidade e confirme que a política escolhida se aplica ao público do app. OAuth, por si só, não ativa MFA.
5. Só então conecte o frontend à API e apresente o login real. GitHub Pages hospeda arquivos estáticos e não fornece o backend nem armazena segredos com segurança.

## Desenvolvimento local

Sirva a pasta por um servidor HTTP local (por exemplo, `python -m http.server 8000`) e abra `http://localhost:8000`. Service worker e instalação PWA exigem HTTPS ou `localhost`; abrir o HTML diretamente por `file://` não ativa esses recursos.
