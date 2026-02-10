# Documentação: Gráfico de Retenção de Usuários

Este documento define a lógica e os critérios para o cálculo da métrica de **Retenção de Usuários** no dashboard de analytics. O objetivo é monitorar a fidelidade e o engajamento contínuo dos usuários semana a semana.

## Conceito de Usuário Retido
Um **Usuário Retido** é aquele que demonstra atividade recente na plataforma. Para fins de cálculo, consideramos como retido o usuário que realizou qualquer interação (envio de mensagem, feedback, login, etc.) dentro de uma janela de **duas semanas**.

### Regras de Negócio

1.  **Critério de Inclusão (Retido):**
    O usuário é considerado **RETIDO** na semana vigente se atender a **pelo menos uma** das seguintes condições:
    *   Interagiu com a ferramenta na **semana atual**.
    *   Interagiu com a ferramenta na **semana imediatamente anterior**.

2.  **Critério de Exclusão (Não Retido / Churn):**
    O usuário perde o status de retido e passa a ser considerado **NÃO RETIDO** se passar **duas semanas consecutivas sem interagir** com a ferramenta.

3.  **Transição de Status:**
    *   Um usuário pode transitar de "Retido" para "Não Retido" dinamicamente conforme sua frequência de uso diminui.
    *   Um usuário "Não Retido" pode voltar a ser "Retido" a qualquer momento, bastando realizar uma nova interação.

## Exemplo de Cenário

A tabela abaixo ilustra o status de um usuário ao longo de 4 semanas, demonstrando a aplicação das regras:

| Semana | Ação do Usuário | Status Resultante | Motivo |
| :--- | :--- | :--- | :--- |
| **Semana 1** | Realizou interação | **Retido** | Interação na semana vigente. |
| **Semana 2** | Nenhuma interação | **Retido** | Benefício da interação na semana anterior (Semana 1). |
| **Semana 3** | Nenhuma interação | **Não Retido** | Duas semanas consecutivas (Semana 2 e 3) sem interação. |
| **Semana 4** | Realizou interação | **Retido** | Nova interação na semana vigente, recuperando o status. |

## Representação Visual (Gráfico)

O gráfico de retenção deve exibir, para cada semana:
*   **Eixo X:** Semanas (ex: Sem 42, Sem 43).
*   **Eixo Y:** Porcentagem (%) de usuários da base total que atenderam ao critério de retenção naquela semana.
*   **Linha de Tendência:** Permite visualizar a evolução da fidelidade dos usuários ao longo do tempo.
