import { useState, useMemo } from 'react';

// --- MOCK DATA ---
const SQL_DATA_MOCK = [
    {
        id: 101,
        created_at: "2024-02-03T10:42:00",
        created_by: "ana.silva@vitru.com",
        agent_id: 1,
        agent_title: "RH Bot",
        category: "Recursos Humanos",
        session_id: "sess_9823",
        question_id: "msg_101",
        question: "Como faço para solicitar minhas férias?",
        response_id: "msg_102",
        response: "Para solicitar férias, acesse o Portal do Colaborador > Menu Férias > Solicitação. Lembre-se de fazer isso com 30 dias de antecedência.",
        response_time: "00:00:02",
        feedback: "LIKE",
        feedback_desc: "Resposta rápida e precisa, obrigado.",
        has_document: "Sim",
        curator_grade: 5,
        curator_comment: null,
        is_risk: false
    },
    {
        id: 102,
        created_at: "2024-02-03T10:40:15",
        created_by: "joao.vitor@vitru.com",
        agent_title: "TI Support",
        category: "Tecnologia",
        session_id: "sess_9824",
        question_id: "msg_102",
        question: "Meu VPN está apresentando erro 404 ao conectar.",
        response: "O erro 404 na VPN geralmente indica falha de autenticação. Por favor, tente reiniciar seu token MFA e conectar novamente. Se o problema persistir, abra um chamado no Jira.",
        response_time: "00:00:15",
        feedback: "DISLIKE",
        feedback_desc: "Não resolveu, preciso de um humano urgentemente.",
        has_document: "Sim",
        curator_grade: 2,
        curator_comment: "Resposta genérica, não abordou o erro 404 especificamente para o contexto do usuário.",
        is_risk: true
    },
    {
        id: 111,
        created_at: "2024-02-03T10:45:00",
        created_by: "ana.silva@vitru.com",
        agent_id: 1,
        agent_title: "RH Bot",
        category: "Recursos Humanos",
        session_id: "sess_9823",
        question_id: "msg_111",
        question: "Qual o prazo para aprovação das férias?",
        response_id: "msg_111_res",
        response: "O gestor tem até 15 dias antes do início das férias para realizar a aprovação no sistema.",
        response_time: "00:00:01",
        feedback: null,
        feedback_desc: null,
        has_document: "Sim",
        curator_grade: null,
        curator_comment: null,
        is_risk: false
    },
    {
        id: 112,
        created_at: "2024-02-03T10:48:00",
        created_by: "ana.silva@vitru.com",
        agent_id: 1,
        agent_title: "RH Bot",
        category: "Recursos Humanos",
        session_id: "sess_9823",
        question_id: "msg_112",
        question: "Posso vender 10 dias de férias?",
        response_id: "msg_112_res",
        response: "Sim, você pode solicitar o abono pecuniário no momento da marcação das férias no portal.",
        response_time: "00:00:02",
        feedback: "LIKE",
        feedback_desc: null,
        has_document: "Sim",
        curator_grade: 5,
        curator_comment: "Resposta correta e direta.",
        is_risk: false
    },
    {
        id: 113,
        created_at: "2024-02-03T10:42:00",
        created_by: "joao.vitor@vitru.com",
        agent_title: "TI Support",
        category: "Tecnologia",
        session_id: "sess_9824",
        question_id: "msg_113",
        question: "Como solicito acesso a uma nova pasta no servidor?",
        response: "Para solicitar acesso a pastas, preencha o formulário de 'Acesso a Arquivos' no Service Desk e informe o gestor da área.",
        response_time: "00:00:05",
        feedback: null,
        feedback_desc: null,
        has_document: "Sim",
        curator_grade: 4,
        curator_comment: null,
        is_risk: false
    },
    {
        id: 114,
        created_at: "2024-02-03T10:45:00",
        created_by: "joao.vitor@vitru.com",
        agent_title: "TI Support",
        category: "Tecnologia",
        session_id: "sess_9824",
        question_id: "msg_114",
        question: "Onde baixo o novo instalador do antivírus?",
        response: "O antivírus é instalado automaticamente via GPO. Se o seu computador não possuir o ícone do Defender, abra um chamado.",
        response_time: "00:00:04",
        feedback: "LIKE",
        feedback_desc: "Informação útil.",
        has_document: "Não",
        curator_grade: 5,
        curator_comment: "Boa orientação sobre GPO.",
        is_risk: false
    },
    {
        id: 103,
        created_at: "2024-02-03T10:38:00",
        created_by: "carlos.m@vitru.com",
        agent_title: "Vendas Helper",
        category: "Comercial",
        session_id: "sess_9825",
        question_id: "msg_103",
        question: "Qual o valor atualizado do Plano Enterprise B?",
        response: "O valor de tabela para o Plano Enterprise B é R$ 1.200,00/usuário, mas há descontos progressivos para contratos anuais.",
        response_time: "00:00:01",
        feedback: null,
        feedback_desc: null,
        has_document: "Não",
        curator_grade: null,
        curator_comment: null,
        is_risk: false
    },
    {
        id: 104,
        created_at: "2024-02-03T09:15:00",
        created_by: "lucia.ferreira@vitru.com",
        agent_title: "RH Bot",
        category: "Recursos Humanos",
        session_id: "sess_9810",
        question_id: "msg_104",
        question: "Quais são os benefícios de saúde?",
        response: "A Vitru oferece plano de saúde Unimed Nacional (Coparticipativo) e Plano Odontológico OdontoPrev. Ambos podem ser estendidos a dependentes diretos.",
        response_time: "00:00:03",
        feedback: "LIKE",
        feedback_desc: null,
        has_document: "Sim",
        curator_grade: 4,
        is_risk: false
    },
    {
        id: 105,
        created_at: "2024-02-02T16:20:00",
        created_by: "roberto.k@vitru.com",
        agent_title: "TI Support",
        category: "Tecnologia",
        session_id: "sess_9755",
        question_id: "msg_105",
        question: "Como reseto minha senha do AD?",
        response: "Você pode resetar sua senha através do portal self-service: reset.vitru.com. Caso não tenha acesso, ligue no ramal 5000.",
        response_time: "00:00:05",
        feedback: "LIKE",
        feedback_desc: "Muito prático.",
        has_document: "Sim",
        curator_grade: 5,
        is_risk: false
    },
    ...Array.from({ length: 95 }).map((_, i) => ({
        id: 200 + i,
        created_at: new Date(2024, 1, 3, 10, 30 - i).toISOString(),
        created_by: `user${i}@vitru.com`,
        agent_title: i % 2 === 0 ? "RH Bot" : "TI Support",
        category: i % 2 === 0 ? "Recursos Humanos" : "Tecnologia",
        session_id: `sess_${10000 + i}`,
        question_id: `msg_${200 + i}`,
        question: `Dúvida gerada automaticamente número ${i}`,
        response: `Resposta automática para a dúvida ${i}.`,
        response_time: "00:00:02",
        feedback: i % 5 === 0 ? "LIKE" : null,
        feedback_desc: i % 5 === 0 ? "Bom atendimento" : null,
        has_document: "Sim",
        curator_grade: i % 3 === 0 ? 4 : null,
        is_risk: i % 10 === 0
    }))
];

export interface DateRange {
    start: Date | null;
    end: Date | null;
}

export function useAnalyticsData() {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchScope, setSearchScope] = useState('all');
    const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
    const [selectedFeedbacks, setSelectedFeedbacks] = useState<string[]>([]);
    const [selectedGrades, setSelectedGrades] = useState<(number | string)[]>([]);
    const [filterRiskOnly, setFilterRiskOnly] = useState(false);

    // Derivados
    const allAgentsList = useMemo(() => [...Array.from(new Set(SQL_DATA_MOCK.map(d => d.agent_title)))].map(a => ({ label: a, value: a })), []);
    const allCategoriesList = useMemo(() => [...Array.from(new Set(SQL_DATA_MOCK.map(d => d.category)))].map(c => ({ label: c, value: c })), []);

    const categoryToAgentsMap = useMemo(() => {
        const map: Record<string, string[]> = {};
        SQL_DATA_MOCK.forEach(item => {
            if (!map[item.category]) map[item.category] = [];
            if (!map[item.category].includes(item.agent_title)) {
                map[item.category].push(item.agent_title);
            }
        });
        return map;
    }, []);

    const filteredData = useMemo(() => {
        return SQL_DATA_MOCK.filter(item => {
            // Busca
            let matchesSearch = true;
            const term = searchTerm.toLowerCase();

            if (term) {
                if (searchScope === 'all') {
                    matchesSearch =
                        item.question.toLowerCase().includes(term) ||
                        item.response.toLowerCase().includes(term) ||
                        item.question_id.toLowerCase().includes(term) ||
                        item.session_id.toLowerCase().includes(term);
                } else {
                    // @ts-ignore
                    const fieldVal = item[searchScope];
                    matchesSearch = fieldVal ? String(fieldVal).toLowerCase().includes(term) : false;
                }
            }

            const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(item.category);
            const matchesAgent = selectedAgents.length === 0 || selectedAgents.includes(item.agent_title);

            let matchesDate = true;
            if (dateRange.start) {
                const itemDate = new Date(item.created_at);
                const start = new Date(dateRange.start); start.setHours(0, 0, 0, 0);

                if (dateRange.end) {
                    const end = new Date(dateRange.end); end.setHours(23, 59, 59, 999);
                    matchesDate = itemDate >= start && itemDate <= end;
                } else {
                    matchesDate = itemDate >= start;
                }
            }

            let matchesFeedback = true;
            if (selectedFeedbacks.length > 0) {
                const itemFeedback = item.feedback || 'NULL';
                matchesFeedback = selectedFeedbacks.includes(itemFeedback);
            }

            let matchesGrade = true;
            if (selectedGrades.length > 0) {
                const itemGrade = item.curator_grade || 'NULL';
                matchesGrade = selectedGrades.includes(itemGrade);
            }

            const matchesRisk = !filterRiskOnly || item.is_risk === true;

            return matchesSearch && matchesCategory && matchesAgent && matchesDate && matchesFeedback && matchesGrade && matchesRisk;
        });
    }, [searchTerm, searchScope, selectedCategories, selectedAgents, dateRange, selectedFeedbacks, selectedGrades, filterRiskOnly]);

    return {
        data: filteredData,
        allData: SQL_DATA_MOCK,
        allAgentsList,
        allCategoriesList,
        categoryToAgentsMap,
        filters: {
            searchTerm, setSearchTerm,
            searchScope, setSearchScope,
            dateRange, setDateRange,
            selectedCategories, setSelectedCategories,
            selectedAgents, setSelectedAgents,
            selectedFeedbacks, setSelectedFeedbacks,
            selectedGrades, setSelectedGrades,
            filterRiskOnly, setFilterRiskOnly
        }
    };
}
