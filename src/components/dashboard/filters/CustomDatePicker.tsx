import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';

interface DateRange {
    start: Date | null;
    end: Date | null;
}

interface CustomDatePickerProps {
    dateRange: DateRange;
    setDateRange: (range: DateRange) => void;
    setToast: (msg: string) => void;
}

export const CustomDatePicker = ({ dateRange, setDateRange, setToast }: CustomDatePickerProps) => {
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
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-700 hover:border-purple-500 min-w-[200px]"
            >
                <CalendarIcon size={16} className="text-gray-500" />
                {dateRange.start ? (
                    dateRange.end
                        ? `${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`
                        : `${dateRange.start.toLocaleDateString()} - Selecione o fim`
                ) : "Filtrar por Período"}
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4 w-72 animate-in fade-in zoom-in-95">
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
                            <ChevronLeft size={16} />
                        </button>
                        <span className="font-bold text-sm text-gray-700">
                            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </span>
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 mb-2 text-center text-[10px] text-gray-500 font-bold uppercase">
                        <div>D</div><div>S</div><div>T</div><div>Q</div><div>Q</div><div>S</div><div>S</div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 row-auto">
                        {renderCalendar()}
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between">
                        <button
                            onClick={() => { setDateRange({ start: null, end: null }); setIsOpen(false); }}
                            className="text-xs text-red-500 hover:text-red-700"
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
