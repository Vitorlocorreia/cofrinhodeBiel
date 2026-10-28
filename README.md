# Cofre Gabriel

Aplicação financeira exclusiva do Gabriel, ligada ao projeto Supabase **Controlegabriel** (`aidyozfnugrutveowkah`) da conexão “acdaint e biel”.

## Executar

`npm start` abre o servidor local em http://localhost:4173. A configuração privada fica em `.env.local`, fora do Git. A variável `COFRE_GATEWAY_TOKEN` deve corresponder à credencial configurada no Supabase e no ambiente Sites. Não coloque essa variável em arquivos da pasta `web/`.

`npm test` executa os testes. `npm run build` prepara o Worker em `dist/server/index.js`, com os arquivos da interface incorporados. A pasta `web/` contém os arquivos editáveis da aplicação.

## Acesso e banco

Há um único histórico financeiro, sem Supabase Auth e sem cadastro de usuários. Em produção, o acesso usa a proteção privada já existente do Site. Não torne este Site público: o servidor compartilha um único histórico do Gabriel, e a proteção do Site é a fronteira de acesso da aplicação. O servidor local escuta apenas no endereço de loopback.

O navegador chama `/api/cofre` no próprio endereço. O servidor autentica a chamada à função Supabase `cofre-gateway` com uma credencial privada. Apenas o hash SHA-256 dessa credencial fica no banco. A função usa os segredos administrativos fornecidos pelo próprio ambiente Supabase; eles nunca são enviados à interface.

As tabelas ficam no schema não exposto `cofre_private`, com RLS e acesso revogado para `anon` e `authenticated`. A função SQL pública só pode ser executada por `service_role` e também verifica a credencial da integração. `database/schema.sql` documenta a estrutura; a provisão do hash da credencial é feita separadamente. As migrações aplicadas pelo plugin estão no histórico remoto do projeto.

Para preparar novamente os arquivos compartilhados da Edge Function, execute `node scripts/prepare-edge.mjs` e faça o deploy da pasta `supabase/functions/cofre-gateway` com autenticação própria habilitada no corpo da função. A verificação JWT da plataforma fica desligada porque essa conexão usa credencial de servidor, não sessão de usuário. Não remova a conferência da credencial.

## Sincronização e recuperação

O estado no banco tem uma revisão. Gravações usam a revisão carregada; uma alteração concorrente recebe HTTP 409 e preserva a cópia pendente para backup, sem sobrescrever a nuvem. A aplicação busca atualizações ao retornar à aba e a cada 30 segundos enquanto estiver visível. A atualização fica pausada durante edição em modais.

A fila de envio fica em `cofre-cloud-outbox-v1`, e a última cópia sincronizada em `cofre-cloud-cache-v1`. O histórico original anterior à integração continua em `cofre-gabriel-v1`. Se o banco estiver vazio e houver dados locais anteriores, a interface solicita a escolha de enviar esses dados ou usar a nuvem vazia. Não mistura históricos automaticamente.

Se a conexão cair após o primeiro carregamento, as alterações ficam na fila local e são reenviadas ao recuperar o acesso. Confirme “Histórico sincronizado” antes de limpar o navegador ou mudar de aparelho. Uma nova instalação ainda precisa de conexão para carregar o aplicativo e o histórico; não há instalação offline/PWA.

Contas recorrentes, parcelas, avisos internos, exportações Excel e backups JSON continuam disponíveis. A conexão com o banco não adiciona notificações com o navegador fechado. Os lembretes externos continuam dependendo da exportação `.ics` para um calendário compatível.
