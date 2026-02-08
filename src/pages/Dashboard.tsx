import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Filter as FilterIcon, Search as SearchIcon, TriangleAlert, MoreHorizontal, ChevronLeft, ChevronRight, Star, Clock, X, MessageSquare, ThumbsUp, ThumbsDown, ChevronDown } from 'lucide-react';
import MainLayout from "@/components/MainLayout";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import { CustomDatePicker } from "@/components/dashboard/filters/CustomDatePicker";
import { MultiSelectDropdown } from "@/components/dashboard/filters/MultiSelectDropdown";
import { SearchScopeSelector } from "@/components/dashboard/filters/SearchScopeSelector";
import { FeedbackIndicator } from "@/components/dashboard/FeedbackIndicator";
import { CuratorEvaluationPanel } from "@/components/dashboard/CuratorEvaluationPanel";

const COLORS = {
    primary: '#281352',
};

const PAGE_SIZES = [10, 25, 50, 100];

// --- Toast Component ---
const Toast = ({ message, onClose }: { message: string, onClose: () => void }) => (
    <div className="fixed top-4 right-4 z-[60] bg-red-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-top-5 duration-300">
        <TriangleAlert size={20} className="text-white" />
        <div>
            <p className="font-bold text-sm">Atenção</p>
            <p className="text-xs opacity-90">{message}</p>
        </div>
        <button onClick={onClose} className="ml-2 hover:bg-white/20 p-1 rounded"><X size={16} /></button>
    </div>
);

export default function Dashboard() {
    const navigate = useNavigate();
    const {
        data,
        allData,
        allAgentsList,
        allCategoriesList,
        categoryToAgentsMap,
        filters
    } = useAnalyticsData();

    const [toastMsg, setToastMsg] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [pageInput, setPageInput] = useState("1");
    const [selectedInteraction, setSelectedInteraction] = useState<any | null>(null);

    // Pagination Logic
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return data.slice(startIndex, startIndex + itemsPerPage);
    }, [data, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(data.length / itemsPerPage);

    useEffect(() => {
        setPageInput(currentPage.toString());
    }, [currentPage]);

    const handlePageInputBlur = () => {
        let newPage = parseInt(pageInput, 10);
        if (isNaN(newPage)) newPage = 1;
        if (newPage < 1) newPage = 1;
        if (newPage > totalPages) newPage = totalPages || 1;

        setCurrentPage(newPage);
        setPageInput(newPage.toString());
    };

    const handleCategoryChange = (newCats: (string | number)[]) => {
        filters.setSelectedCategories(newCats as string[]);
        // Filter agents based on category
        const newAllowedAgents = new Set<string>();
        (newCats as string[]).forEach(cat => {
            const agents = categoryToAgentsMap[cat] || [];
            agents.forEach(a => newAllowedAgents.add(a));
        });
        filters.setSelectedAgents(Array.from(newAllowedAgents));
    };

    const filteredAgentOptions = useMemo(() => {
        if (filters.selectedCategories.length === 0) return [];
        const allowedAgents = new Set<string>();
        filters.selectedCategories.forEach(cat => {
            const agents = categoryToAgentsMap[cat] || [];
            agents.forEach(a => allowedAgents.add(a));
        });
        return Array.from(allowedAgents).map(a => ({ label: a, value: a }));
    }, [filters.selectedCategories, categoryToAgentsMap]);

    return (
        <MainLayout>
            <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 shadow-sm flex-shrink-0">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold" style={{ color: COLORS.primary }}>
                        Análise de Conversas
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">Admin Mode</span>
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold border border-gray-300">AD</div>
                </div>
            </header>

            <div className="flex-1 overflow-auto p-8 animate-in fade-in duration-300">

                {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6 flex flex-col gap-4">

                    <div className="flex flex-wrap gap-4 items-center justify-between w-full">
                        <div className="flex gap-4 flex-1 items-center flex-wrap">

                            <SearchScopeSelector
                                value={filters.searchScope}
                                onChange={filters.setSearchScope}
                                options={[
                                    { label: 'Todos', value: 'all' },
                                    { label: 'Pergunta', value: 'question' },
                                    { label: 'Resposta', value: 'response' },
                                    { label: 'Mensagem ID', value: 'question_id' },
                                    { label: 'Sessão ID', value: 'session_id' },
                                ]}
                            />

                            <div className="relative flex-1 min-w-[250px] max-w-lg">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Buscar..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                    value={filters.searchTerm}
                                    onChange={(e) => filters.setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="hidden md:block h-8 w-px bg-gray-300 mx-2"></div>
                            <CustomDatePicker
                                dateRange={filters.dateRange}
                                setDateRange={filters.setDateRange}
                                setToast={setToastMsg}
                            />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-md text-white text-sm font-medium hover:opacity-90 shadow-sm" style={{ backgroundColor: COLORS.primary }}>
                            <Download size={16} /> Exportar
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-3 items-center bg-gray-50 p-3 rounded-md border border-gray-100">
                        <span className="text-xs font-bold text-gray-500 uppercase mr-2 flex items-center gap-1">
                            <FilterIcon size={12} /> Filtros:
                        </span>

                        <div className="w-40">
                            <MultiSelectDropdown
                                label="Categorias"
                                allLabel="Todas Categorias"
                                options={allCategoriesList}
                                selectedValues={filters.selectedCategories}
                                onChange={(vals) => handleCategoryChange(vals)}
                            />
                        </div>

                        <div className="w-40">
                            <MultiSelectDropdown
                                label="Agentes"
                                allLabel="Todos Agentes"
                                options={filteredAgentOptions.length > 0 ? filteredAgentOptions : allAgentsList}
                                selectedValues={filters.selectedAgents}
                                onChange={(vals) => filters.setSelectedAgents(vals as string[])}
                            />
                        </div>

                        <div className="w-40">
                            <MultiSelectDropdown
                                label="Feedback"
                                allLabel="Todos Feedbacks"
                                options={[
                                    { label: "Positivo (Like)", value: 'LIKE' },
                                    { label: "Negativo (Dislike)", value: 'DISLIKE' },
                                    { label: "Sem Feedback", value: 'NULL' }
                                ]}
                                selectedValues={filters.selectedFeedbacks}
                                onChange={(vals) => filters.setSelectedFeedbacks(vals as string[])}
                            />
                        </div>

                        <div className="w-40">
                            <MultiSelectDropdown
                                label="Nota Curador"
                                allLabel="Todas Notas"
                                options={[
                                    { label: "5 Estrelas", value: 5 },
                                    { label: "4 Estrelas", value: 4 },
                                    { label: "3 Estrelas", value: 3 },
                                    { label: "2 Estrelas", value: 2 },
                                    { label: "1 Estrela", value: 1 },
                                    { label: "Não Avaliado", value: 'NULL' }
                                ]}
                                selectedValues={filters.selectedGrades}
                                onChange={(vals) => filters.setSelectedGrades(vals)}
                            />
                        </div>

                        <button
                            onClick={() => filters.setFilterRiskOnly(!filters.filterRiskOnly)}
                            className={`flex items-center gap-1 px-3 py-2 rounded-md text-xs font-bold transition-all border
              ${filters.filterRiskOnly
                                    ? 'bg-red-100 text-red-700 border-red-300 shadow-inner'
                                    : 'bg-white text-gray-600 border-gray-300 hover:border-red-300 hover:text-red-500'}`}
                        >
                            <TriangleAlert size={14} />
                            {filters.filterRiskOnly ? 'Apenas Atenção' : 'Atenção'}
                        </button>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-6 py-4 font-semibold text-gray-600">Data/Hora</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600">Sessão ID</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600">Mensagem ID</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600">Agente</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 w-1/4">Pergunta</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-center">Feedback</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-center">Nota Curador</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedData.map((row) => (
                                    <tr key={row.id} className={`hover:bg-gray-50 transition-colors cursor-pointer ${row.is_risk ? 'bg-red-50/50' : ''}`} onClick={() => setSelectedInteraction(row)}>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(row.created_at).toLocaleDateString('pt-BR')} <br />
                                            <span className="text-xs">{new Date(row.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-gray-600 text-xs">
                                            {row.session_id}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-purple-700 font-medium">
                                            {row.question_id}
                                            {row.is_risk && <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700"><TriangleAlert size={12} /></span>}
                                        </td>
                                        <td className="px-6 py-4"><span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs border border-gray-200">{row.agent_title}</span></td>
                                        <td className="px-6 py-4"><p className="line-clamp-2 text-gray-800">{row.question}</p></td>
                                        <td className="px-6 py-4 text-center"><FeedbackIndicator type={row.feedback} /></td>
                                        <td className="px-6 py-4 text-center">
                                            {row.curator_grade ? (
                                                <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full text-xs font-bold">
                                                    <Star size={12} className="fill-yellow-500 text-yellow-500" /> {row.curator_grade}
                                                </span>
                                            ) : <span className="text-gray-300 text-xs">-</span>}
                                        </td>
                                        <td className="px-6 py-4 text-right"><MoreHorizontal size={18} className="text-gray-400" /></td>
                                    </tr>
                                ))}
                                {paginatedData.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="text-center py-12 text-gray-500 flex flex-col items-center justify-center w-full">
                                            <Search size={48} className="text-gray-200 mb-2" />
                                            <p>Nenhum resultado encontrado.</p>
                                            <p className="text-xs opacity-70">Tente ajustar seus filtros.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION FOOTER */}
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500">Itens por página:</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                className="border border-gray-300 rounded text-sm p-1 bg-white focus:outline-purple-500"
                            >
                                {PAGE_SIZES.map(size => <option key={size} value={size}>{size}</option>)}
                            </select>
                            <span className="text-sm text-gray-500 ml-4">
                                Exibindo {paginatedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, data.length)} de {data.length}
                            </span>
                        </div>

                        <div className="flex gap-2 items-center">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-1 border border-gray-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                            >
                                <ChevronLeft size={18} className="text-gray-600" />
                            </button>

                            <div className="flex items-center gap-1 mx-2">
                                <span className="text-sm text-gray-600">Página</span>
                                <input
                                    type="number"
                                    min={1}
                                    max={totalPages || 1}
                                    value={pageInput}
                                    onChange={(e) => setPageInput(e.target.value)}
                                    onBlur={handlePageInputBlur}
                                    onKeyDown={(e) => e.key === 'Enter' && handlePageInputBlur()}
                                    className="w-12 h-8 text-center border border-gray-300 rounded text-sm focus:outline-purple-500"
                                />
                                <span className="text-sm text-gray-600">de {totalPages || 1}</span>
                            </div>

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="p-1 border border-gray-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                            >
                                <ChevronRight size={18} className="text-gray-600" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* MODAL */}
                {selectedInteraction && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

                            {/* Modal Header */}
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between shrink-0" style={{ backgroundColor: COLORS.primary }}>
                                <div>
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                        Detalhes da Interação
                                        {selectedInteraction.is_risk && (
                                            <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-red-400">
                                                <TriangleAlert size={14} fill="currentColor" />
                                            </span>
                                        )}
                                    </h2>
                                    <p className="text-purple-200 text-xs">ID: {selectedInteraction.question_id}</p>
                                </div>
                                <button onClick={() => setSelectedInteraction(null)} className="text-white hover:bg-white/10 rounded-full p-1"><X size={20} /></button>
                            </div>

                            {/* Modal Body Scrollable */}
                            <div className="p-6 overflow-y-auto flex-1">
                                {/* Pergunta e Resposta */}
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <p className="font-bold text-gray-500 text-xs mb-1 uppercase tracking-wide">Pergunta</p>
                                        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg text-gray-800 text-sm">{selectedInteraction.question}</div>
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-500 text-xs mb-1 uppercase tracking-wide">Resposta do Agente</p>
                                        <div className="bg-purple-50 border border-purple-100 p-4 rounded-lg text-gray-800 text-sm relative group">
                                            {selectedInteraction.response}
                                            <span className="absolute bottom-2 right-2 text-[10px] text-purple-400 bg-white/50 px-1 rounded flex items-center gap-1">
                                                <Clock size={10} /> {selectedInteraction.response_time}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Seção de Feedback do Usuário */}
                                {selectedInteraction.feedback && (
                                    <div className="mb-6 bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                                        <p className="font-bold text-yellow-800 text-xs mb-2 uppercase flex items-center gap-2">
                                            <MessageSquare size={14} /> Feedback do Usuário
                                        </p>
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-full shrink-0 ${selectedInteraction.feedback === 'LIKE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {selectedInteraction.feedback === 'LIKE' ? <ThumbsUp size={16} className="fill-current" /> : <ThumbsDown size={16} className="fill-current" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className={`text-sm font-bold ${selectedInteraction.feedback === 'LIKE' ? 'text-green-700' : 'text-red-700'}`}>
                                                    {selectedInteraction.feedback === 'LIKE' ? 'Positivo' : 'Negativo'}
                                                </p>

                                                {selectedInteraction.feedback !== 'LIKE' && selectedInteraction.feedback_desc && (
                                                    <div className="mt-2 text-gray-600 text-sm italic relative pl-3 border-l-2 border-yellow-300">
                                                        "{selectedInteraction.feedback_desc}"
                                                    </div>
                                                )}

                                                {selectedInteraction.feedback === 'LIKE' && (
                                                    <div className="mt-1 text-xs text-gray-500">Sem comentários adicionais.</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="border-t border-gray-100 pt-6">
                                    <CuratorEvaluationPanel compact defaultValue={selectedInteraction.curator_grade} defaultComment={selectedInteraction.curator_comment} isRisk={selectedInteraction.is_risk} />
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 bg-gray-50 flex justify-between gap-2 rounded-b-xl border-t border-gray-200 shrink-0">
                                <button
                                    onClick={() => {
                                        // Collect all interactions of the same session
                                        const sessionInteractions = allData
                                            .filter(item => item.session_id === selectedInteraction.session_id)
                                            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

                                        const sessionData = {
                                            sessionId: selectedInteraction.session_id,
                                            agentTitle: selectedInteraction.agent_title,
                                            interactions: sessionInteractions
                                        };

                                        // Store in sessionStorage for the chat page to read
                                        sessionStorage.setItem('adminSessionView', JSON.stringify(sessionData));
                                        navigate('/?adminMode=true');
                                    }}
                                    className="px-4 py-2 rounded text-sm font-medium text-white hover:opacity-90 transition-opacity"
                                    style={{ backgroundColor: COLORS.primary }}
                                >
                                    Ver Sessão Completa
                                </button>
                                <button onClick={() => setSelectedInteraction(null)} className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-white text-gray-700">Fechar</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </MainLayout>
    );
}
