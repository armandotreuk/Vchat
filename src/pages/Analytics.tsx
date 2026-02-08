import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    ResponsiveContainer, LineChart, Line
} from 'recharts';
import {
    Users, MessageSquare, ThumbsUp, ThumbsDown, Calendar, ArrowUpRight,
    ArrowDown, ArrowUp, CheckSquare, Square, Filter, ChevronDown,
    ChevronLeft, ChevronRight, Minus, Info, Activity, AlertCircle, X,
    ClipboardCheck, Star, AlertTriangle
} from 'lucide-react';
import MainLayout from "@/components/MainLayout";

// --- Design Tokens & Paleta ---
const COLORS = {
    primary: '#281352',    // Roxo Profundo - Institucional
    secondary: '#FFC629',  // Amarelo Ouro - Destaque
    neutral: '#64748b',    // Slate-500 - Texto secundário
    neutralLight: '#f1f5f9', // Slate-100 - Fundos leves
    success: '#22c55e',    // Verde - Feedback Positivo
    danger: '#ef4444',     // Vermelho - Feedback Negativo/Involução
    bg: '#f8fafc'          // Slate-50 - Fundo da página
};

// --- Helpers ---
const getWeekNumber = (d: Date) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return weekNo;
};

// --- TypeScript Interfaces ---
interface KPIData {
    title: string;
    rawValue: number;
    format: (v: number) => string;
    change: string;
    trend: 'up' | 'down';
    icon: React.ComponentType<{ size?: string | number; strokeWidth?: string | number; className?: string }>;
    color: string;
    bgColor: string;
    textColor?: string;
    subtext: string | null;
    value?: string;
}

interface DateRange {
    start: Date | null;
    end: Date | null;
}

interface SortConfig {
    key: string;
    direction: 'ascending' | 'desc';
}

interface TooltipState {
    active: boolean;
    payload: {
        day: string;
        hour: number;
        value: number;
        percentage: string;
    } | null;
    position: { x: number; y: number };
}

interface UserRankingRow {
    id: string;
    [key: string]: string | number;
}

interface HeatmapData {
    day: string;
    hours: number[];
    total: number;
}

// --- Mock Data ---

const AGENT_STRUCTURE: Record<string, string[]> = {
    'Financeiro': ['Ana Silva', 'Carlos Souza', 'Roberto Firmino'],
    'Suporte': ['Beatriz Lima', 'Daniel Rocha', 'Julia Mendes'],
    'Vendas': ['Eduardo Santos', 'Fernanda Oliveira', 'Gabriela Torres']
};

const ALL_CATEGORIES = Object.keys(AGENT_STRUCTURE);
const ALL_AGENTS = Object.values(AGENT_STRUCTURE).flat();

const baseKpiData: KPIData[] = [
    {
        title: "Mensagens Totais",
        rawValue: 2386,
        format: (v: number) => v.toLocaleString('pt-BR'),
        change: "+10%",
        trend: "up" as const,
        icon: MessageSquare,
        color: COLORS.primary,
        bgColor: '#eaddff',
        subtext: null
    },
    {
        title: "Usuários Ativos",
        rawValue: 98,
        format: (v: number) => v.toString(),
        change: "+2%",
        trend: "up" as const,
        icon: Users,
        color: COLORS.primary,
        bgColor: '#eaddff',
        subtext: null
    },
    {
        title: "Feedbacks Positivos",
        rawValue: 15,
        format: (v: number) => v.toString(),
        change: "+5%",
        trend: "up" as const,
        icon: ThumbsUp,
        color: '#15803d',
        bgColor: '#dcfce7',
        textColor: 'text-green-700',
        subtext: null
    },
    {
        title: "Feedbacks Negativos",
        rawValue: 3,
        format: (v: number) => v.toString(),
        change: "-10%",
        trend: "down" as const,
        icon: ThumbsDown,
        color: '#b91c1c',
        bgColor: '#fee2e2',
        textColor: 'text-red-700',
        subtext: null
    },
    {
        title: "Conversas Auditadas",
        rawValue: 452,
        format: (v: number) => v.toString(),
        change: "+12%",
        trend: "up" as const,
        icon: ClipboardCheck,
        color: '#4f46e5',
        bgColor: '#e0e7ff',
        subtext: null
    },
    {
        title: "Nota Média Conversas",
        rawValue: 4.8,
        format: (v: number) => v.toFixed(1),
        change: "+0.1",
        trend: "up" as const,
        icon: Star,
        color: '#ca8a04',
        bgColor: '#fef9c3',
        subtext: "escala 1-5"
    },
    {
        title: "Nota Média Sessões",
        rawValue: 4.5,
        format: (v: number) => v.toFixed(1),
        change: "-0.2",
        trend: "down" as const,
        icon: Activity,
        color: '#0284c7',
        bgColor: '#e0f2fe',
        subtext: "escala 1-5"
    },
    {
        title: "Conversas de Risco",
        rawValue: 12,
        format: (v: number) => v.toString(),
        change: "-5%",
        trend: "down" as const,
        icon: AlertTriangle,
        color: '#dc2626',
        bgColor: '#fee2e2',
        textColor: 'text-red-700',
        subtext: null
    }
];

const rawWeeklyData = [
    { name: 'Sem 43', mensagens: 350, usuarios: 20 },
    { name: 'Sem 44', mensagens: 390, usuarios: 24 },
    { name: 'Sem 45', mensagens: 211, usuarios: 29 },
    { name: 'Sem 46', mensagens: 139, usuarios: 25 },
    { name: 'Sem 47', mensagens: 104, usuarios: 15 },
    { name: 'Sem 48', mensagens: 219, usuarios: 21 },
];

const userIds = ['34759018', '16688646', '9223673', '7897063', '100080039', '20167897', '100007510', '88291022', '55412311', '33219088', '11293844', '99283711'];
const fullUserRankingData = userIds.map(id => {
    const weeklyData: Record<number, number> = {};
    for (let i = 1; i <= 52; i++) {
        const base = parseInt(id.substring(0, 2)) || 50;
        weeklyData[i] = Math.floor(Math.random() * 50) + base;
    }
    return { id, weeklyData };
});

const retentionData = [
    { week: 'Sem 44', retained: 100, delta: 0 },
    { week: 'Sem 45', retained: 85, delta: -15 },
    { week: 'Sem 46', retained: 70, delta: -15 },
    { week: 'Sem 47', retained: 65, delta: -5 },
    { week: 'Sem 48', retained: 60, delta: -5 },
];

// --- UI Components ---

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-white p-6 rounded-xl shadow-sm border border-slate-200/60 ${className}`}>
        {children}
    </div>
);

const KPICard = ({ item }: { item: KPIData }) => {
    const isPositiveTrend = item.trend === 'up';
    const isInverseMetric = item.title.includes('Negativos') || item.title.includes('Risco');
    const isGoodState = isInverseMetric ? !isPositiveTrend : isPositiveTrend;
    const isNeutral = item.change.includes('0%') || item.change === '0.0';

    let badgeColor = 'bg-slate-100 text-slate-600';
    let BadgeIcon = Minus;

    if (!isNeutral) {
        if (isGoodState) {
            badgeColor = 'bg-green-100 text-green-700';
            BadgeIcon = isInverseMetric ? ArrowDown : ArrowUpRight;
        } else {
            badgeColor = 'bg-red-100 text-red-700';
            BadgeIcon = isInverseMetric ? ArrowUpRight : ArrowDown;
        }
    }

    return (
        <Card className="hover:shadow-md transition-shadow duration-300 flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <div
                    className="p-3 rounded-lg flex items-center justify-center transition-colors"
                    style={{ backgroundColor: item.bgColor, color: item.color }}
                >
                    <item.icon size={24} strokeWidth={2} />
                </div>
                <span className={`flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${badgeColor}`}>
                    {item.change}
                    <BadgeIcon size={14} className="ml-1" />
                </span>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-3 tracking-wide uppercase">{item.title}</h3>
            <div className="flex-1"></div>
            <div className="flex flex-col items-start">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">{item.value}</h2>
                <div className="h-6 mt-2">
                    {item.subtext && (
                        <p className="text-xs text-slate-400">
                            {item.subtext}
                        </p>
                    )}
                </div>
            </div>
        </Card>
    );
};

const CustomDatePicker = ({ dateRange, setDateRange, setToast }: {
    dateRange: DateRange;
    setDateRange: (range: DateRange) => void;
    setToast: (message: string) => void;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const handleDateClick = (day: number) => {
        const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);

        if (dateRange.start && dateRange.end) {
            setDateRange({ start: clickedDate, end: null });
            return;
        }

        if (!dateRange.start) {
            setDateRange({ start: clickedDate, end: null });
            return;
        }

        if (dateRange.start && !dateRange.end) {
            let start = dateRange.start;
            let end = clickedDate;

            if (clickedDate < start) {
                start = clickedDate;
                end = dateRange.start;
            }

            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 31) {
                setToast("O intervalo máximo permitido é de 31 dias.");
                return;
            }

            setDateRange({ start, end });
            setIsOpen(false);
        }
    };

    const isDateDisabled = (day: number) => {
        if (!dateRange.start || dateRange.end) return false;

        const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const diffTime = Math.abs(currentDate.getTime() - dateRange.start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays > 31;
    };

    const renderCalendar = () => {
        const totalDays = daysInMonth(currentMonth);
        const startDay = firstDayOfMonth(currentMonth);
        const days = [];

        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
        }

        for (let i = 1; i <= totalDays; i++) {
            const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
            const isStart = dateRange.start && currentDate.getTime() === dateRange.start.getTime();
            const isEnd = dateRange.end && currentDate.getTime() === dateRange.end.getTime();
            const isInRange = dateRange.start && dateRange.end && currentDate > dateRange.start && currentDate < dateRange.end;
            const disabled = isDateDisabled(i);

            days.push(
                <button
                    key={i}
                    onClick={() => !disabled && handleDateClick(i)}
                    disabled={disabled}
                    className={`h-8 w-8 text-xs rounded-full flex items-center justify-center transition-colors relative
            ${disabled ? 'text-gray-300 cursor-not-allowed bg-gray-50' : 'hover:bg-purple-100 text-gray-700'}
            ${isStart || isEnd ? 'bg-purple-700 text-white hover:bg-purple-800 font-bold z-10' : ''}
            ${isInRange ? 'bg-purple-100 text-purple-900 rounded-none' : ''}
          `}
                >
                    {i}
                </button>
            );
        }
        return days;
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-700 hover:border-purple-500 min-w-[200px] shadow-sm"
            >
                <Calendar size={16} className="text-gray-500" />
                {dateRange.start ? (
                    dateRange.end
                        ? `${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`
                        : `${dateRange.start.toLocaleDateString()} - Selecione o fim`
                ) : "Filtrar por Período"}
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4 w-72 animate-in fade-in zoom-in-95">
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-1 hover:bg-gray-100 rounded-full">
                            <ChevronLeft size={16} />
                        </button>
                        <span className="font-bold text-sm text-gray-700">
                            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </span>
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-1 hover:bg-gray-100 rounded-full">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 mb-2 text-center text-[10px] text-gray-500 font-bold uppercase">
                        <div>D</div><div>S</div><div>T</div><div>Q</div><div>Q</div><div>S</div><div>S</div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 row-auto">
                        {renderCalendar()}
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                        <button
                            onClick={() => { setDateRange({ start: null, end: null }); setIsOpen(false); }}
                            className="text-xs text-red-500 hover:text-red-700 font-medium"
                        >
                            Limpar
                        </button>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-xs text-purple-700 font-bold hover:underline"
                        >
                            Aplicar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const HeatmapTooltip = ({ active, payload, position }: {
    active: boolean;
    payload: { day: string; hour: number; value: number; percentage: string } | null;
    position: { x: number; y: number };
}) => {
    if (!active || !payload) return null;

    return (
        <div
            className="fixed z-50 bg-slate-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full mt-[-8px]"
            style={{ left: position.x, top: position.y }}
        >
            <div className="font-bold mb-1 border-b border-slate-700 pb-1">{payload.day} às {payload.hour}h</div>
            <div className="flex justify-between gap-4">
                <span className="text-slate-300">Acessos:</span>
                <span className="font-mono font-bold">{payload.value}</span>
            </div>
            <div className="flex justify-between gap-4">
                <span className="text-slate-300">Intensidade:</span>
                <span className="font-mono text-yellow-400">{payload.percentage}%</span>
            </div>
            <div className="absolute bottom-[-4px] left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
        </div>
    );
};

const HeatmapCell = ({ value, dayTotal, day, hour, onHover, onLeave }: {
    value: number;
    dayTotal: number;
    day: string;
    hour: number;
    onHover: (state: TooltipState) => void;
    onLeave: () => void;
}) => {
    const percentage = dayTotal > 0 ? (value / dayTotal) : 0;
    const maxDayPercentage = 0.15;
    const opacity = Math.min(1, Math.max(0.05, percentage / maxDayPercentage));
    const displayPercentage = (percentage * 100).toFixed(1);

    return (
        <div
            className="w-full h-9 rounded-sm transition-all hover:scale-110 hover:shadow-lg hover:z-10 relative cursor-pointer border border-transparent hover:border-white box-border"
            style={{ backgroundColor: COLORS.primary, opacity: opacity }}
            onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                onHover({
                    active: true,
                    payload: { day, hour, value, percentage: displayPercentage },
                    position: { x: rect.left + rect.width / 2, y: rect.top }
                });
            }}
            onMouseLeave={onLeave}
        />
    );
};

const FilterDropdown = ({ title, items, selectedItems, onItemToggle, onAllToggle }: {
    title: string;
    items: string[];
    selectedItems: string[];
    onItemToggle: (item: string) => void;
    onAllToggle: (selectAll: boolean) => void;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const allSelected = items.every((i: string) => selectedItems.includes(i));
    const someSelected = selectedItems.length > 0 && !allSelected;

    const renderCheckbox = (isSelected: boolean, isPartial = false) => {
        if (isSelected) return <CheckSquare size={16} className="mr-2 text-purple-700 fill-purple-100" />;
        if (isPartial) return <Minus size={16} className="mr-2 text-purple-700 bg-purple-100 rounded-sm p-[1px]" />;
        return <Square size={16} className="mr-2 text-slate-300" />;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center text-xs font-medium px-4 py-2 rounded-lg border transition-all gap-2 shadow-sm whitespace-nowrap ${selectedItems.length > 0
                    ? 'bg-purple-50 border-purple-200 text-purple-900 ring-1 ring-purple-100'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
            >
                <Filter size={14} className={selectedItems.length > 0 ? "text-purple-600" : "text-slate-400"} />
                {title}
                {selectedItems.length > 0 && (
                    <span className="bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[1.4em] text-center font-bold">
                        {selectedItems.length}
                    </span>
                )}
                <ChevronDown size={14} className={`ml-auto transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-3 border-b border-slate-50 bg-slate-50/50">
                        <button
                            onClick={() => onAllToggle(!allSelected)}
                            className="flex items-center w-full px-2 py-1.5 text-xs font-bold text-slate-700 hover:bg-white hover:shadow-sm rounded transition-all"
                        >
                            {renderCheckbox(allSelected, someSelected && !allSelected)}
                            Selecionar Todos
                        </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {items.map((item: string) => {
                            return (
                                <button
                                    key={item}
                                    onClick={() => onItemToggle(item)}
                                    className={`flex items-center w-full px-2 py-2 text-xs rounded transition-colors ${selectedItems.includes(item) ? 'bg-purple-50 text-purple-900 font-medium' : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {renderCheckbox(selectedItems.includes(item))}
                                    {item}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Main Dashboard Component ---

export default function Analytics() {
    // Estados de Negócio
    const [selectedCats, setSelectedCats] = useState(ALL_CATEGORIES);
    const [selectedAgents, setSelectedAgents] = useState(ALL_AGENTS);

    // Estados de Filtro Global
    const [dateRange, setDateRange] = useState<DateRange>({
        start: new Date(2025, 9, 1),
        end: new Date(2025, 10, 30) // Nov 30 2025 - Week 48
    });
    const [toast, setToast] = useState<string | null>(null);

    // Lógica para determinar as semanas exibidas baseada na data fim
    const displayedWeeks = useMemo(() => {
        const endDate = dateRange.end || new Date();
        const endWeek = getWeekNumber(endDate);
        const weeks = [];
        for (let i = 0; i < 4; i++) {
            let w = endWeek - i;
            if (w < 1) w = 52 + w;
            weeks.push(w);
        }
        return weeks; // Recent to old: [48, 47, 46, 45]
    }, [dateRange.end]);

    // Estados de UI
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: `w${displayedWeeks[0]}`, direction: 'desc' });
    const [rankingPage, setRankingPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [tooltipState, setTooltipState] = useState<TooltipState>({ active: false, payload: null, position: { x: 0, y: 0 } });

    // Atualizar ordenação padrão quando o período muda
    useEffect(() => {
        setSortConfig({ key: `w${displayedWeeks[0]}`, direction: 'desc' });
    }, [displayedWeeks]);

    // Ratio de Filtro Global (Simulação)
    const filterRatio = useMemo(() => {
        const total = ALL_AGENTS.length;
        const active = selectedAgents.length;
        return total > 0 ? active / total : 0;
    }, [selectedAgents]);

    // Toast Auto-hide
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    // Lógica de Filtros
    const handleCategoryToggle = (cat: string) => {
        let newSelectedCats;
        if (selectedCats.includes(cat)) {
            newSelectedCats = selectedCats.filter(c => c !== cat);
            const agentsToRemove = AGENT_STRUCTURE[cat];
            setSelectedAgents(prev => prev.filter(a => !agentsToRemove.includes(a)));
        } else {
            newSelectedCats = [...selectedCats, cat];
            const agentsToAdd = AGENT_STRUCTURE[cat];
            setSelectedAgents(prev => [...new Set([...prev, ...agentsToAdd])]);
        }
        setSelectedCats(newSelectedCats);
    };

    const handleAllCategoriesToggle = (shouldSelectAll: boolean) => {
        if (shouldSelectAll) {
            setSelectedCats(ALL_CATEGORIES);
            setSelectedAgents(ALL_AGENTS);
        } else {
            setSelectedCats([]);
            setSelectedAgents([]);
        }
    };

    const handleAgentToggle = (agent: string) => {
        let newSelectedAgents;
        if (selectedAgents.includes(agent)) {
            newSelectedAgents = selectedAgents.filter(a => a !== agent);
        } else {
            newSelectedAgents = [...selectedAgents, agent];
        }
        setSelectedAgents(newSelectedAgents);

        const newSelectedCats: string[] = [];
        ALL_CATEGORIES.forEach(cat => {
            const catAgents = AGENT_STRUCTURE[cat];
            const allAgentsSelected = catAgents.every(a => newSelectedAgents.includes(a));
            if (allAgentsSelected) {
                newSelectedCats.push(cat);
            }
        });
        setSelectedCats(newSelectedCats);
    };

    const handleAllAgentsToggle = (shouldSelectAll: boolean) => {
        if (shouldSelectAll) {
            setSelectedAgents(ALL_AGENTS);
            setSelectedCats(ALL_CATEGORIES);
        } else {
            setSelectedAgents([]);
            setSelectedCats([]);
        }
    };

    // Filtragem Reativa dos KPIs (Global)
    const filteredKpiData: KPIData[] = useMemo(() => {
        return baseKpiData.map(kpi => {
            const isAverageMetric = kpi.title.includes('Nota');
            let newValue = kpi.rawValue;
            if (!isAverageMetric) {
                newValue = Math.round(kpi.rawValue * filterRatio);
            }
            return {
                ...kpi,
                value: kpi.format(newValue)
            };
        });
    }, [filterRatio]);

    // Filtragem Reativa dos Dados Semanais (Global)
    const filteredWeeklyData = useMemo(() => {
        return rawWeeklyData.map(week => ({
            name: week.name,
            mensagens: Math.round(week.mensagens * filterRatio),
            usuarios: Math.round(week.usuarios * filterRatio)
        }));
    }, [filterRatio]);

    // Filtragem Reativa do Ranking (Global) com Janela Dinâmica
    const sortedRankingData = useMemo(() => {
        const simulatedCount = Math.ceil(fullUserRankingData.length * filterRatio);
        let activeUsers = fullUserRankingData.slice(0, simulatedCount);

        // Mapear para o formato da tabela
        const tableData: UserRankingRow[] = activeUsers.map(user => {
            const row: UserRankingRow = { id: user.id };
            let total = 0;
            displayedWeeks.forEach(week => {
                const val = user.weeklyData[week] || 0;
                row[`w${week}`] = Math.round(val * filterRatio);
                total += row[`w${week}`] as number;
            });
            row.total = total;
            return row;
        });

        if (sortConfig !== null) {
            tableData.sort((a: UserRankingRow, b: UserRankingRow) => {
                const aVal = a[sortConfig.key] as number;
                const bVal = b[sortConfig.key] as number;
                if (aVal < bVal) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aVal > bVal) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return tableData;
    }, [sortConfig, filterRatio, displayedWeeks]);

    const paginatedRankingData = useMemo(() => {
        const startIndex = (rankingPage - 1) * itemsPerPage;
        return sortedRankingData.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedRankingData, rankingPage, itemsPerPage]);

    const totalPages = Math.ceil(sortedRankingData.length / itemsPerPage);

    // Filtragem Reativa do Heatmap (Global)
    const filteredHeatmapData = useMemo(() => {
        const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
        const hourlyWeights = [
            5, 2, 1, 0, 0, 1, 5, 10,    // 00-07h
            40, 80, 100, 90, 80, 90, 120, 110, // 08-15h
            90, 70, 40, 20, 15, 10, 8, 5 // 16-23h
        ];

        return days.map(day => {
            const hours = hourlyWeights.map(w => Math.floor((Math.random() * 20 + w) * filterRatio));
            const total = hours.reduce((a, b) => a + b, 0);
            return { day, hours, total };
        });
    }, [filterRatio]);

    const requestSort = (key: string) => {
        let direction: 'ascending' | 'desc' = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'ascending';
        }
        setSortConfig({ key, direction });
    };

    useEffect(() => {
        setRankingPage(1);
    }, [itemsPerPage, selectedAgents]);

    const SortIcon = ({ column }: { column: string }) => {
        if (sortConfig.key !== column) return <ArrowDown size={14} className="opacity-10 ml-1 inline text-slate-400" />;
        return sortConfig.direction === 'ascending'
            ? <ArrowUp size={14} className="text-amber-500 ml-1 inline" />
            : <ArrowDown size={14} className="text-amber-500 ml-1 inline" />;
    };

    return (
        <MainLayout>

            {/* Toast Notification System */}
            {toast && (
                <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 duration-300">
                    <div className="bg-red-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-red-500">
                        <AlertCircle size={20} />
                        <span className="text-sm font-bold">{toast}</span>
                        <button onClick={() => setToast(null)} className="ml-2 hover:bg-white/20 p-1 rounded-full transition">
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Global Header com Filtros */}
            <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-40 shadow-sm/50 backdrop-blur-sm bg-white/95">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight" style={{ color: COLORS.primary }}>Analytics</h1>
                        <p className="text-xs text-slate-500 mt-0.5">Visão Global</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                            <FilterDropdown
                                title="Categorias"
                                items={ALL_CATEGORIES}
                                selectedItems={selectedCats}
                                onItemToggle={handleCategoryToggle}
                                onAllToggle={handleAllCategoriesToggle}
                            />
                            <div className="w-px h-5 bg-slate-200"></div>
                            <FilterDropdown
                                title="Agentes"
                                items={ALL_AGENTS}
                                selectedItems={selectedAgents}
                                onItemToggle={handleAgentToggle}
                                onAllToggle={handleAllAgentsToggle}
                            />
                            <div className="w-px h-5 bg-slate-200"></div>
                            <CustomDatePicker
                                dateRange={dateRange}
                                setDateRange={setDateRange}
                                setToast={setToast}
                            />
                        </div>

                        <div className="w-px h-8 bg-slate-200"></div>

                        <div className="flex items-center gap-3 pl-2">
                            <div className="text-xs text-right hidden sm:block">
                                <div className="font-bold text-slate-700">John Doe</div>
                                <div className="text-slate-400">Curador</div>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" alt="Avatar" className="w-full h-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8">

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {filteredKpiData.map((kpi, idx) => (
                        <KPICard key={idx} item={kpi} />
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-2 flex flex-col">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                            <div>
                                <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: COLORS.primary }}>
                                    Volume Semanal
                                </h2>
                                <p className="text-xs text-slate-400 mt-1">Mensagens vs Usuários Únicos</p>
                            </div>
                        </div>

                        <div className="flex-1 min-h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={filteredWeeklyData} margin={{ top: 20, right: 0, bottom: 20, left: 0 }}>
                                    <CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                                    <YAxis yAxisId="left" stroke={COLORS.primary} tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} />
                                    <YAxis yAxisId="right" orientation="right" stroke={COLORS.secondary} tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} />
                                    <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                    <Bar yAxisId="left" dataKey="mensagens" name="Mensagens" fill={COLORS.primary} radius={[6, 6, 0, 0]} barSize={24} />
                                    <Bar yAxisId="right" dataKey="usuarios" name="Usuários" fill={COLORS.secondary} radius={[6, 6, 0, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card className="flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: COLORS.primary }}>
                                    Retenção
                                    <Info size={14} className="text-slate-300 cursor-help" />
                                </h2>
                            </div>
                        </div>
                        <div className="flex-1 min-h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={retentionData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} dy={10} />
                                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
                                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                    <Line type="monotone" dataKey="retained" stroke={COLORS.secondary} strokeWidth={4} dot={{ fill: 'white', r: 5, stroke: COLORS.secondary, strokeWidth: 3 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-8">
                    <Card className="lg:col-span-2 overflow-hidden flex flex-col p-0">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-bold" style={{ color: COLORS.primary }}>Ranking de Engajamento</h2>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs uppercase bg-slate-100 text-slate-600 font-semibold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4 border-r-2 border-slate-300">ID Usuário</th>
                                        {displayedWeeks.map((week, idx) => (
                                            <th key={week} onClick={() => requestSort(`w${week}`)} className={`px-4 py-4 text-center cursor-pointer border-r-2 border-slate-300 ${idx % 2 === 0 ? 'bg-purple-100/60' : ''}`}>
                                                Sem {week} <SortIcon column={`w${week}`} />
                                            </th>
                                        ))}
                                        <th onClick={() => requestSort('total')} className="px-6 py-4 text-right cursor-pointer bg-amber-100/70">Total <SortIcon column="total" /></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {paginatedRankingData.map((user, i) => (
                                        <tr key={user.id} className="hover:bg-slate-100/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-700 flex items-center gap-3 border-r-2 border-slate-200">
                                                <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">{user.id}</span>
                                            </td>
                                            {displayedWeeks.map((week, idx) => (
                                                <td key={week} className={`px-4 py-4 text-center font-bold border-r-2 border-slate-200 ${idx % 2 === 0 ? 'bg-purple-50/50' : ''}`}>{user[`w${week}`]}</td>
                                            ))}
                                            <td className="px-6 py-4 text-right font-bold text-lg bg-amber-50/60" style={{ color: COLORS.secondary }}>{user.total}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center bg-slate-50/30 mt-auto gap-4">
                            <div className="flex items-center gap-4">
                                <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))} className="bg-white border border-slate-200 rounded px-1.5 py-1 text-xs">
                                    <option value={5}>5 linhas</option>
                                    <option value={10}>10 linhas</option>
                                    <option value={20}>20 linhas</option>
                                </select>
                                <span className="text-xs text-slate-400">
                                    Mostrando {((rankingPage - 1) * itemsPerPage) + 1} - {Math.min(rankingPage * itemsPerPage, sortedRankingData.length)} de {sortedRankingData.length}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setRankingPage(Math.max(1, rankingPage - 1))}
                                    disabled={rankingPage === 1}
                                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition cursor-pointer"
                                >
                                    <ChevronLeft size={16} className="text-slate-600" />
                                </button>
                                <button
                                    onClick={() => setRankingPage(Math.min(totalPages, rankingPage + 1))}
                                    disabled={rankingPage === totalPages}
                                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition cursor-pointer"
                                >
                                    <ChevronRight size={16} className="text-slate-600" />
                                </button>
                            </div>
                        </div>
                    </Card>

                    <Card className="flex flex-col h-auto">
                        <div className="mb-6">
                            <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: COLORS.primary }}>
                                Horários de Pico
                            </h2>
                            <p className="text-xs text-slate-400 mt-1">Mapa de calor de atividade</p>
                        </div>
                        <div className="flex-1 relative flex flex-col justify-center">
                            <div className="flex gap-2 mb-2">
                                <div className="w-12 flex-shrink-0"></div>
                                <div className="flex-1 flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                    <span>00h</span><span>06h</span><span>12h</span><span>18h</span><span>23h</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {filteredHeatmapData.map(d => (
                                    <div key={d.day} className="flex gap-2 items-center">
                                        <div className="w-12 flex-shrink-0 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right pr-2">{d.day}</div>
                                        <div className="flex-1 grid grid-cols-[repeat(24,minmax(0,1fr))] gap-[2px]">
                                            {d.hours.map((val, hIdx) => (
                                                <HeatmapCell
                                                    key={hIdx}
                                                    value={val}
                                                    dayTotal={d.total}
                                                    day={d.day}
                                                    hour={hIdx}
                                                    onHover={setTooltipState}
                                                    onLeave={() => setTooltipState({ ...tooltipState, active: false })}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <HeatmapTooltip {...tooltipState} />
                        </div>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}
