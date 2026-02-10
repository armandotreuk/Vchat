# Documentação: Gráfico de Horários de Pico

Este documento define a lógica e os critérios para o cálculo da métrica de **Horários de Pico** no dashboard de analytics. O objetivo é mapear o comportamento temporal dos usuários, identificando os períodos de maior e menor utilização da ferramenta.

## Conceito de Volume Temporal
O gráfico consolida o **volume total de mensagens enviadas** pelos usuários, segmentando esta contagem por dia da semana e hora do dia. A visualização permite identificar padrões de uso (ex: concentrado em horário comercial, picos noturnos, etc.).

### Regras de Negócio

1.  **Filtros Obrigatórios:**
    O cálculo do volume DEVE respeitar estritamente todos os filtros globais selecionados pelo usuário no topo da página:
    *   **Período de Data:** Considerar apenas interações dentro do intervalo (Start Date - End Date).
    *   **Categoria:** Considerar apenas interações de agentes pertencentes às categorias selecionadas.
    *   **Agentes:** Considerar apenas interações dos agentes especificamente selecionados.

2.  **Agregação de Dados:**
    Todas as mensagens filtradas devem ser agrupadas em uma matriz de **7 dias x 24 horas**:
    *   **Dia da Semana:** Domingo (0) a Sábado (6).
    *   **Hora do Dia:** 00h às 23h.
    *   **Valor:** Soma absoluta total de mensagens no período para aquela combinação específica de Dia/Hora.

3.  **Normalização (Opcional para Visualização):**
    Para facilitar a leitura do mapa de calor, pode-se calcular a porcentagem de cada célula em relação ao volume total do dia ou do período, definindo a intensidade da cor.

## Exemplo de Cenário

Imagine que o filtro de data esteja definido para "Últimos 30 dias". O sistema processa todas as mensagens desse período:

| Mensagem | Data/Hora | Dia da Semana | Hora | Contabilizado em |
| :--- | :--- | :--- | :--- | :--- |
| **Msg A** | 10/Out - 14:30 | Terça | 14h | [Terça, 14h] -> +1 |
| **Msg B** | 17/Out - 14:45 | Terça | 14h | [Terça, 14h] -> +1 |
| **Msg C** | 10/Out - 09:10 | Terça | 09h | [Terça, 09h] -> +1 |
| **Msg D** | 11/Out - 14:15 | Quarta | 14h | [Quarta, 14h] -> +1 |

*Resultado:* O binário **[Terça, 14h]** terá um volume acumulado de **2 mensagens**, somando ocorrências de dias diferentes (dia 10 e dia 17).

## Representação Visual (Gráfico)

A visualização deve ser feita através de um **Mapa de Calor (Heatmap)**:

*   **Eixo X (Colunas):** Horas do Dia (00h, 01h, ... 23h).
*   **Eixo Y (Linhas):** Dias da Semana (Seg, Ter, Qua, Qui, Sex, Sáb, Dom).
*   **Células:** A interseção entre Dia e Hora.
*   **Intensidade de Cor:**
    *   Representa o volume relativo de mensagens.
    *   Cores mais escuras/intensas indicam maior volume.
    *   Cores mais claras indicam menor volume.
