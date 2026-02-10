# Guia de Curadoria e Avaliação

Este documento descreve as funcionalidades de curadoria disponíveis na tela de visualização de sessão (`AdminSessionView`), acessível via dashboard administrativo (`?adminMode=true`). A interface permite avaliar tanto a qualidade geral da sessão quanto a precisão de respostas individuais do assistente.

## 1. Visão Geral da Interface

A tela de sessão é dividida em duas áreas principais:
- **Esquerda (Chat):** Exibe o histórico completo da conversa entre Usuário e Assistente.
- **Direita (Painel de Curadoria):** Exibe as ferramentas de avaliação contextual (Sessão ou Mensagem).

## 2. Modos de Curadoria

A interface opera em dois modos distintos de avaliação:

### A. Curadoria da Sessão (Padrão)
Ao abrir uma sessão, o painel lateral exibe o modo de avaliação geral da conversa.

**Funcionalidades:**
- **Avaliação Técnica:** Permite atribuir uma nota de 1 a 5 estrelas para a qualidade geral do atendimento.
- **Comentários:** Campo de texto para observações gerais sobre o desempenho do assistente na sessão.
- **Dica de Navegação:** Instrução visual indicando que é possível clicar nas mensagens para avaliações granulares.
- **Botão Salvar:** "Salvar Avaliação" registra a nota e o comentário da sessão.

> **Nota Importante:** O botão de "Sinalizar Risco" **não está disponível** neste nível, pois o risco é considerado um atributo específico de uma resposta (mensagem), e não da sessão inteira.

---

### B. Curadoria da Mensagem (Detalhada)
Ao clicar em qualquer balão de resposta do **Assistente** na área de chat, o painel lateral muda para o modo de avaliação específica daquela mensagem.

**Como Acessar:**
1. No histórico do chat, localize a resposta do assistente que deseja avaliar.
2. Clique sobre o balão da mensagem. O balão ficará destacado visualmente.

**Funcionalidades Específicas:**
- **Indicador de Contexto:** Exibe "Avaliando resposta do agente: [Nome do Agente]".
- **Avaliação Técnica Individual:** Nota de 1 a 5 estrelas específica para aquela resposta.
- **Sinalização de Risco (`⚠ Atenção`):** Botão exclusivo deste modo. Permite marcar/desmarcar a resposta como contendo conteúdo de risco/alucinação.
    - *Ativo:* Botão vermelho ("Atenção Sinalizada").
    - *Inativo:* Botão cinza ("Sinalizar Atenção").
- **Visualização de Feedback do Usuário:** Se o usuário final deu feedback (Like/Dislike), ele é exibido no chat e considerado durante a curadoria.

## 3. Navegação e Finalização

- **Voltar para Sessão:** No modo de mensagem, um botão "Voltar para Sessão" aparece no rodapé do painel lateral, permitindo retornar à avaliação geral sem sair da tela.
- **Finalizar Avaliação:** Botão principal que encerra a revisão da sessão e retorna ao Dashboard administrativo.
