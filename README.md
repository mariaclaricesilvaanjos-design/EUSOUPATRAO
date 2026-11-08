# Prato & Prosa — PWA de gestão

Aplicação web instalável, em português, para organizar a operação de pequenos negócios de alimentação. O modo local funciona em GitHub Pages sem backend; uma integração opcional com Supabase habilita login Google, verificação TOTP/MFA e cópia dos dados por conta.

## Publicar no GitHub Pages

1. Envie as alterações para a branch `main`.
2. No repositório, abra **Settings → Pages** e selecione **GitHub Actions** como origem de publicação.
3. O workflow `.github/workflows/deploy-pages.yml` publica automaticamente cada atualização da branch `main`. Também pode ser executado manualmente pela aba **Actions**.
4. Após a publicação, acesse <https://mariaclaricesilvaanjos-design.github.io/EUSOUPATRAO/>.

O workflow empacota apenas os arquivos do site; manifest, ícones e service worker usam caminhos relativos compatíveis com o subdiretório `/EUSOUPATRAO/`. A primeira execução precisa das permissões de Actions/Pages habilitadas no repositório.

## Instalação e dados

Abra o endereço publicado em um navegador compatível e use **Instalar aplicativo** / **Adicionar à tela inicial**. O cache do shell permite abrir o app sem conexão após a primeira visita. Sem Supabase configurado, pedidos, produtos, clientes e preferências permanecem no navegador deste dispositivo. Em **Configurações → Conta e dados**, é possível exportar/importar uma cópia JSON ou apagar os dados locais. Com Supabase, os dados locais continuam como cópia de trabalho e podem ser sincronizados com a conta autenticada.

No primeiro acesso, o onboarding permite começar com listas vazias ou manter os dados demonstrativos fictícios e editáveis. O onboarding e as configurações aceitam logo e capa em PNG, JPG ou WebP de até 1 MB; as imagens são guardadas no dispositivo e incluídas na cópia JSON. Os painéis incluem um gráfico de faturamento semanal que acompanha as vendas registradas. A tipografia foi ampliada para leitura mais confortável em celular e desktop. As mensagens de WhatsApp podem ser personalizadas e copiadas para envio manual; não há envio automático. O modo avançado oferece registros locais de receitas/insumos, lotes e validade, despesas e indicadores básicos. Ao produzir uma receita, insumos com lotes cadastrados só são descontados de lotes não vencidos, por ordem de validade; saldo insuficiente bloqueia a produção sem baixas parciais. Mantenha os totais dos insumos alinhados aos lotes cadastrados. O app não substitui contabilidade, controle fiscal ou sanitário.

As configurações também exibem uma opção de contribuição voluntária ao desenvolvedor por Pix. A chave é pública para esse fim; o envio é iniciado e confirmado pelo próprio doador no aplicativo do banco.

## Configuração Supabase

O PWA está apontado para o projeto Supabase configurado em `supabase-config.js`, que contém somente a Project URL e a chave publicável. A migração `supabase/migrations/20261108000000_user_app_state.sql` foi aplicada; a tabela tem RLS habilitada, leitura restrita ao usuário autenticado com AAL2 e gravação pela função revisada `save_my_app_state`. A configuração de MFA TOTP está habilitada e sessões AAL1 têm duração limitada. O domínio GitHub Pages e `http://localhost:8000/` estão na lista de URLs de redirecionamento.

**Falta configurar o provedor Google OAuth antes de entrar no app:** crie um OAuth Client ID do tipo Web no Google Cloud, adicione `https://mariaclaricesilvaanjos-design.github.io` como origem JavaScript autorizada e use `https://ichxiilizeysmroglrvj.supabase.co/auth/v1/callback` como URI de redirecionamento autorizado. Em seguida, habilite Google em **Supabase → Authentication → Sign In / Providers** e informe ali o Client ID e o Client Secret. O segredo deve permanecer somente no Supabase; nunca o coloque no repositório, no frontend ou em variáveis `VITE_*`/`PUBLIC_*`.

Depois de habilitar Google, entre em **Configurações → Conta e dados**, configure o app autenticador e conclua a verificação MFA. Escolha explicitamente entre enviar os dados locais ou restaurar a cópia da nuvem. Cada gravação usa revisão otimista: alterações concorrentes pausam a sincronização em vez de sobrescrever silenciosamente os dados. A exportação JSON continua disponível como backup. Teste com dados fictícios antes de incluir informações reais. SMTP personalizado não é necessário para esse fluxo Google + TOTP; configure-o no Supabase apenas se também for usar e-mails transacionais do Auth.

O bundle Supabase JS é carregado sob demanda para autenticação/sincronização; o app local continua abrindo offline quando o serviço externo não está disponível. O arquivo `supabase-config.js` contém somente configurações públicas; o repositório e o Pages são públicos.

## Conta e segurança

O app local continua disponível caso a configuração cloud esteja ausente ou sem conexão. A sessão Supabase autentica o usuário, mas não substitui cópias de segurança, revisão de políticas, gestão de retenção ou resposta a incidentes. Teste a migração e a restauração com dados fictícios antes de usar informações de clientes. A chave publicável não é segredo; a autorização é garantida pela migração, RLS e AAL2.

## Desenvolvimento local

Sirva a pasta por um servidor HTTP local (por exemplo, `python -m http.server 8000`) e abra `http://localhost:8000`. Service worker e instalação PWA exigem HTTPS ou `localhost`; abrir o HTML diretamente por `file://` não ativa esses recursos.
