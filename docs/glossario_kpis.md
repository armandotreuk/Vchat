# Glossário de KPIs e Métricas

Este documento centraliza as definições de todas as métricas e indicadores chave de desempenho (KPIs) exibidos no Dashboard de Analytics.

## Resumo Executivo (Cards)

Os cards no topo do dashboard oferecem uma visão rápida da saúde da operação.

| Métrica | Definição | Regra de Negócio |
| :--- | :--- | :--- |
| **Mensagens Totais** | Volume total de interações (perguntas/respostas) no período selecionado. | Contagem absoluta de registros de mensagens que atendem aos filtros de data, categoria e agente. |
| **Usuários Ativos** | Quantidade de usuários distintos que interagiram com o bot. | Contagem de IDs de usuários únicos (`created_by`) que enviaram pelo menos uma mensagem no período selecionado. |
| **Feedbacks Positivos** | Quantidade absoluta de avaliações positivas dos usuários. | Contagem de mensagens onde o campo `feedback` é igual a 'LIKE'. |
| **Feedbacks Negativos** | Quantidade absoluta de avaliações negativas dos usuários. | Contagem de mensagens onde o campo `feedback` é igual a 'DISLIKE'. |
| **Conversas Auditadas** | Volume de interações avaliadas por um curador humano. | Contagem de mensagens que possuem valor preenchido em `curator_grade` (Nota do Curador). |
| **Nota Média Conversas** | Avaliação média da qualidade das respostas individuais. | Média aritmética das notas (`curator_grade`) atribuídas pelos curadores. Escala de 1 a 5. |
| **Nota Média Sessões** | Avaliação média da qualidade das sessões completas. | Média das notas atribuídas às sessões. *Nota: Atualmente calculado como agregação das notas das mensagens da sessão.* |
| **Conversas de Risco** | Volume de interações identificadas como críticas ou problemáticas. | Contagem de mensagens marcadas com a flag `is_risk = true`. Indica ofensas, erros críticos ou insatisfação severa. |

## Gráficos e Visualizações

### 1. Volume Semanal (Evolução)
**Objetivo:** Acompanhar o crescimento da base e do uso ao longo do tempo.
*   **Eixo X:** Semanas do ano (ex: Sem 43, Sem 44).
*   **Barras (Mensagens):** Quantidade total de mensagens naquela semana.
*   **Barras (Usuários):** Quantidade de usuários únicos ativos naquela semana.

### 2. Retenção de Usuários
**Objetivo:** Monitorar a fidelidade dos usuários semana a semana.
*   **Definição Detalhada:** [Ver Documentação Específica](metricas_retencao.md)
*   **Resumo:** Porcentagem de usuários que continuam ativos em relação às semanas anteriores. Considera-se retido o usuário com interação na semana atual ou anterior (Janela de 2 semanas).

### 3. Horários de Pico (Mapa de Calor)
**Objetivo:** Identificar padrões de uso temporal para planejamento de recursos.
*   **Definição Detalhada:** [Ver Documentação Específica](metricas_horarios_pico.md)
*   **Visualização:** Matriz de intensidade (Dia da Semana x Hora do Dia).
*   **Métrica:** Volume acumulado de mensagens para aquele dia/hora específico no período selecionado.

### 4. Ranking de Engajamento
**Objetivo:** Identificar os "Power Users" ou usuários que mais demandam da ferramenta.
*   **Dados:** Lista de usuários ordenada pelo volume total de interações.
*   **Colunas:**
    *   **ID Usuário:** Identificador único anonimizado ou e-mail.
    *   **Semana X:** Volume de mensagens enviadas pelo usuário em cada semana exibida.
    *   **Total:** Soma total de mensagens do usuário no período visualizado.

## Filtros Globais

Todas as métricas acima (exceto quando especificado o contrário) respondem aos seguintes filtros globais:

1.  **Período de Data:** Intervalo de datas (Start Date - End Date). Apenas registros criados (`created_at`) neste intervalo são considerados.
    *   *Regra de Interface:* Intervalo máximo permitido de 31 dias para performance.
2.  **Categorias:** Filtra mensagens associadas a agentes de temas específicos (ex: RH, TI, Vendas).
3.  **Agentes:** Filtra mensagens de bots específicos.
