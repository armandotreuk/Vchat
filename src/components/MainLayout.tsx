import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Bot, Settings, LogOut } from 'lucide-react';

interface MainLayoutProps {
    children: React.ReactNode;
}

const COLORS = {
    primary: '#281352',
    activeItem: 'rgba(255, 255, 255, 0.1)'
};

export default function MainLayout({ children }: MainLayoutProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const [isDashboardOpen, setIsDashboardOpen] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    const SidebarItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) => (
        <div
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${active ? 'bg-white/10 text-white font-medium' : 'text-purple-200 hover:bg-white/5 hover:text-white'}`}
        >
            {icon} <span className="text-sm">{label}</span>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-50 w-full font-sans text-slate-800">
            {/* Dashboard Sidebar */}
            <aside
                className="w-64 flex-shrink-0 flex flex-col transition-all duration-300"
                style={{ backgroundColor: COLORS.primary }}
            >
                <div className="p-6 flex items-center gap-3 border-b border-purple-900/50">
                    <div className="w-8 h-8 rounded bg-white flex items-center justify-center text-purple-900 font-bold">V</div>
                    <span className="text-white font-semibold text-lg tracking-wide">Vitruchat</span>
                </div>

                <nav className="flex-1 py-6 px-3 space-y-2">
                    <SidebarItem
                        icon={<MessageSquare size={20} />}
                        label="Conversas"
                        active={isActive('/')}
                        onClick={() => navigate('/')}
                    />
                    <SidebarItem
                        icon={<Bot size={20} />}
                        label="Agentes"
                    />

                    {/* DASHBOARD MOVIDO PARA O FIM COM SUBMENU */}
                    <div
                        className="group"
                        onMouseEnter={() => setIsDashboardOpen(true)}
                        onMouseLeave={() => setIsDashboardOpen(false)}
                    >
                        <SidebarItem
                            icon={<LayoutDashboard size={20} />}
                            label="Dashboard"
                            active={isActive('/dashboard')}
                            onClick={() => setIsDashboardOpen(!isDashboardOpen)}
                        />
                        {/* SUBMENU */}
                        <div className={`pl-11 space-y-1 overflow-hidden transition-all duration-300 ${isDashboardOpen ? 'max-h-20 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                            <div
                                onClick={() => navigate('/analytics')}
                                className={`text-sm py-1 cursor-pointer transition-colors block ${isActive('/analytics') ? 'text-white font-medium' : 'text-purple-200 hover:text-white'}`}
                            >
                                Analytics
                            </div>
                            <div
                                onClick={() => navigate('/dashboard')}
                                className={`text-sm py-1 cursor-pointer transition-colors block ${isActive('/dashboard') ? 'text-white font-medium' : 'text-purple-200 hover:text-white'}`}
                            >
                                Análise de Conversas
                            </div>
                        </div>
                    </div>

                </nav>

                <div className="p-4 border-t border-purple-900/50">
                    <SidebarItem icon={<Settings size={20} />} label="Configurações" />
                    <SidebarItem icon={<LogOut size={20} />} label="Sair" />
                </div>
            </aside>

            {/* Main Content Area - Just the shell now */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {children}
            </main>
        </div>
    );
}
