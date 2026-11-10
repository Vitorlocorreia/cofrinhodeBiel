# Direção do produto de finanças pessoais

## Proposta
Controle pessoal com uma resposta clara: o que tenho, o que está comprometido e o que deve sobrar. Celular como experiência principal, branco com azul claro e tema escuro equivalente.

## Marca
Simplifica é uma hipótese sugerida pelo usuário, ainda não adotada. O nome já foi usado em um app financeiro do Bradesco e existem negócios de gestão com nomes próximos. Definir uma marca própria antes de domínio, identidade definitiva e lançamento. A busca realizada não substitui uma pesquisa de disponibilidade de marca.

## Implementado nesta etapa
- Painel com saldo realizado, saldo previsto, despesas totais e progresso dos pagamentos.
- Receitas e despesas do mês incluem pagamentos e previsões, inclusive recorrências e parcelas.
- Compromissos são um subconjunto das despesas: não somar novamente ao total.
- Só a ocorrência do mês entra no total mensal. Parcelas de outros meses continuam nos seus respectivos períodos.
- Dar baixa reclassifica a mesma ocorrência, sem criar uma segunda despesa.
- Página de contas agrega compromissos do mês, valor base das recorrências ativas e parcelamentos pendentes de todos os meses em indicadores separados.

## Próxima versão de experiência
1. Cadastro inicial guiado: contas, saldos iniciais, renda, contas fixas.
2. Registro rápido com escolha de despesa, receita ou transferência e opção de recorrência no mesmo fluxo.
3. Edição de recorrências: esta ocorrência ou próximas; reajustes com data de início, preservando pagamentos.
4. Orçamento por categoria, metas e alertas com ações claras.
5. Cartões: fechamento, vencimento e parcelas. Pagamento da fatura como liquidação; evitar duplicação das compras.
6. Resumo mensal com resultado pessoal em linguagem simples e exportação Excel.
7. Instalação como app e notificações com consentimento, depois de implementar entrega confiável.

## Etapas para SaaS
O sistema atual continua sendo um histórico compartilhado de uma pessoa. Esta entrega não o transforma em SaaS nem muda o acesso aberto autorizado anteriormente.

1. Criar ambiente de desenvolvimento separado e preservar o histórico do Gabriel.
2. Implementar cadastro, login, recuperação e sessões por usuário.
3. Separar dados por proprietário em todas as entidades e proteger leitura e gravação no banco. Uma conta nunca acessa dados de outra, inclusive via API, relatórios, importações e anexos.
4. Migrar o histórico existente para o proprietário confirmado; novos usuários começam com seu próprio espaço vazio.
5. Modelar contas, categorias, lançamentos, recorrências, parcelas e metas como registros próprios; migrar do documento único compartilhado com revisão global.
6. Gerar ocorrências de forma idempotente no servidor, com vencimentos, fuso horário e tarefas de notificação. Retentar falhas sem duplicar lançamentos ou mensagens.
7. Assinaturas e permissões verificadas no servidor, eventos de cobrança idempotentes e estado da assinatura confirmado pelo provedor.
8. Exportação, recuperação de dados, exclusão da conta, monitoramento e testes de isolamento antes da venda.

## Critérios de validação
- Previsto = saldo realizado + receitas pendentes - despesas pendentes do período.
- Transferências não alteram o resultado consolidado.
- Os próximos doze meses de uma recorrência não são cobrados como despesa do mês atual.
- Uma baixa no mesmo mês não muda o saldo previsto.
- Valores sem sincronização devem ser identificados como cópia local ou dados não carregados.
- Em SaaS, testes com duas contas devem demonstrar isolamento antes do lançamento.
