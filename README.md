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

No primeiro acesso, o onboarding permite começar com listas vazias ou manter os dados demonstrativos fictícios e editáveis. O onboarding e as configurações aceitam logo e capa em PNG, JPG ou WebP de até 1 MB; as imagens são guardadas no dispositivo e incluídas na cópia JSON. As mensagens de WhatsApp podem ser personalizadas e copiadas para envio manual; não há envio automático. O modo avançado oferece registros locais de receitas/insumos, lotes e validade, despesas e indicadores básicos. Ao produzir uma receita, insumos com lotes cadastrados só são descontados de lotes não vencidos, por ordem de validade; saldo insuficiente bloqueia a produção sem baixas parciais. Mantenha os totais dos insumos alinhados aos lotes cadastrados. O app não substitui contabilidade, controle fiscal ou sanitário.

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
