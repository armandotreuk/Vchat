import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, TriangleAlert, ThumbsUp, ThumbsDown, MessageSquare, User, Bot } from 'lucide-react';
import { CuratorEvaluationPanel } from '@/components/dashboard/CuratorEvaluationPanel';

interface AdminSessionData {
    sessionId: string;
    agentTitle: string;
    interactions: any[];
}

interface AdminSessionViewProps {
    sessionData: AdminSessionData;
}

const COLORS = {
    primary: '#281352',
};

export function AdminSessionView({ sessionData }: AdminSessionViewProps) {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'session' | 'message'>('session');
    const [selectedId, setSelectedId] = useState<number | string | null>(null);

    const handleBackToDashboard = () => {
        sessionStorage.removeItem('adminSessionView');
        navigate('/dashboard');
    };

    const handleMessageClick = (interactionId: number | string) => {
        if (viewMode === 'message' && selectedId === interactionId) {
            setViewMode('session');
            setSelectedId(null);
        } else {
            setViewMode('message');
            setSelectedId(interactionId);
        }
    };

    const selectedInteraction = sessionData.interactions.find(i => i.id === selectedId);
    const hasAnyRisk = sessionData.interactions.some(i => i.is_risk);

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm flex-shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBackToDashboard}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="text-sm font-medium">Voltar ao Dashboard</span>
                    </button>
                    <div className="h-6 w-px bg-gray-300"></div>
                    <div>
                        <h1 className="text-lg font-bold" style={{ color: COLORS.primary }}>
                            Sessão de Conversa
                        </h1>
                        <p className="text-xs text-gray-500">ID: {sessionData.sessionId}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium border border-purple-200">
                        {sessionData.agentTitle}
                    </span>
                    {hasAnyRisk && (
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-red-200">
                            <TriangleAlert size={12} /> ATENÇÃO
                        </span>
                    )}
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium border border-gray-200">
                        Modo Admin
                    </span>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Chat Area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 space-y-10">
                        {sessionData.interactions.map((interaction, index) => (
                            <div key={interaction.id} className="space-y-6">
                                {/* Interaction Marker */}
                                <div className="flex items-center gap-4">
                                    <div className="h-px bg-gray-200 flex-1"></div>
                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                                        Interação {index + 1} • {new Date(interaction.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <div className="h-px bg-gray-200 flex-1"></div>
                                </div>

                                {/* User Message */}
                                <div className="flex gap-4 max-w-4xl">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                        <User size={20} className="text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-semibold text-gray-800">Usuário</span>
                                            <span className="text-xs text-gray-400">Mensagem ID: {interaction.question_id}</span>
                                        </div>
                                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                            <p className="text-gray-800">{interaction.question}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Assistant Message */}
                                <div className="flex gap-4 max-w-4xl">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: COLORS.primary }}>
                                        <Bot size={20} className="text-white" />
                                    </div>
                                    <div className="flex-1 cursor-pointer group" onClick={() => handleMessageClick(interaction.id)}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-800">{sessionData.agentTitle}</span>
                                                <span className="text-xs text-gray-400">Assistente IA</span>
                                            </div>
                                            {interaction.is_risk && (
                                                <span className="text-[10px] font-bold text-red-600 flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                                                    <TriangleAlert size={10} /> ATENÇÃO
                                                </span>
                                            )}
                                        </div>
                                        <div className={`border rounded-lg p-4 shadow-sm transition-all duration-200 
                                            ${selectedId === interaction.id
                                                ? 'bg-red-50 border-red-300 ring-2 ring-red-500/20'
                                                : 'bg-purple-50 border-purple-100 group-hover:border-purple-300'}`}>
                                            <p className="text-gray-800 whitespace-pre-wrap">{interaction.response}</p>
                                        </div>
                                        {interaction.feedback && (
                                            <div className="mt-2 flex items-center gap-2">
                                                {interaction.feedback === 'LIKE' ? (
                                                    <span className="flex items-center gap-1 text-green-600 text-[10px] font-bold bg-green-50 px-2 py-1 rounded-full border border-green-200">
                                                        <ThumbsUp size={10} className="fill-current" /> Feedback Positivo
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-red-600 text-[10px] font-bold bg-red-50 px-2 py-1 rounded-full border border-red-200">
                                                        <ThumbsDown size={10} className="fill-current" /> Feedback Negativo
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Evaluation Panel Sidebar */}
                <aside className="w-80 border-l border-gray-200 bg-white flex flex-col overflow-hidden shrink-0">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="font-bold text-gray-800 flex items-center gap-2">
                            <Star size={16} className="text-purple-700" />
                            {viewMode === 'session' ? 'Curadoria da Sessão' : 'Curadoria da Mensagem'}
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">
                            {viewMode === 'session'
                                ? `Avalie a qualidade total desta sessão (${sessionData.interactions.length} msgs)`
                                : `Avalie a resposta selecionada`}
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        {viewMode === 'session' ? (
                            <div className="space-y-6">
                                <CuratorEvaluationPanel
                                    defaultValue={null}
                                    isRisk={hasAnyRisk}
                                />
                                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                    <h4 className="text-xs font-bold text-blue-800 mb-1 flex items-center gap-1">
                                        <MessageSquare size={12} /> Dica de Curadoria
                                    </h4>
                                    <p className="text-[10px] text-blue-700 leading-normal">
                                        Clique em uma resposta do assistente para realizar uma avaliação detalhada de uma mensagem específica.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="animate-in slide-in-from-right duration-300">
                                <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200 text-xs text-gray-600 italic border-l-4 border-l-purple-500">
                                    Avaliando resposta do agente: "{sessionData.agentTitle}"
                                </div>
                                <CuratorEvaluationPanel
                                    key={selectedInteraction?.id}
                                    compact
                                    defaultValue={selectedInteraction?.curator_grade}
                                    defaultComment={selectedInteraction?.curator_comment}
                                    isRisk={selectedInteraction?.is_risk}
                                />
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-gray-200 space-y-2">
                        {viewMode === 'message' && (
                            <button
                                onClick={() => { setViewMode('session'); setSelectedId(null); }}
                                className="w-full py-2 px-4 rounded-lg bg-gray-100 text-gray-700 font-medium text-sm hover:bg-gray-200 transition-colors"
                            >
                                Voltar para Sessão
                            </button>
                        )}
                        <button
                            onClick={handleBackToDashboard}
                            className="w-full py-2 px-4 rounded-lg text-white font-medium text-sm hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: COLORS.primary }}
                        >
                            Finalizar Avaliação
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
}
