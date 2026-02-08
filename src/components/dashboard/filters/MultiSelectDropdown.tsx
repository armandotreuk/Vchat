import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
    label: string;
    value: string | number;
}

interface MultiSelectDropdownProps {
    label: string;
    options: Option[];
    selectedValues: (string | number)[];
    onChange: (values: (string | number)[]) => void;
    allLabel?: string;
}

export const MultiSelectDropdown = ({ label, options, selectedValues, onChange, allLabel = "Todos" }: MultiSelectDropdownProps) => {
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

    const isAllSelected = options.length > 0 && selectedValues.length === options.length;

    const handleToggleAll = () => {
        if (isAllSelected) {
            onChange([]);
        } else {
            onChange(options.map(o => o.value));
        }
    };

    const handleToggleOption = (value: string | number) => {
        if (selectedValues.includes(value)) {
            onChange(selectedValues.filter(v => v !== value));
        } else {
            onChange([...selectedValues, value]);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between gap-2 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-700 hover:border-purple-500 min-w-[160px] w-full"
            >
                <span className="truncate max-w-[140px]">
                    {selectedValues.length === 0 ? label :
                        selectedValues.length === options.length ? allLabel :
                            `${selectedValues.length} selecionados`}
                </span>
                <ChevronDown size={14} className="text-gray-400" />
            </button>

            {isOpen && (
                <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 w-56 max-h-60 overflow-y-auto">
                    <div className="p-2 border-b border-gray-100">
                        <div
                            className="flex items-center gap-2 px-2 py-1.5 hover:bg-purple-50 rounded cursor-pointer"
                            onClick={handleToggleAll}
                        >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${isAllSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300 bg-white'}`}>
                                {isAllSelected && <Check size={10} className="text-white" />}
                            </div>
                            <span className="text-sm font-medium text-gray-700">{allLabel}</span>
                        </div>
                    </div>
                    <div className="p-2 space-y-1">
                        {options.length === 0 ? (
                            <div className="px-2 py-1.5 text-xs text-gray-500 italic">Nenhum item disponível</div>
                        ) : options.map((option) => {
                            const isSelected = selectedValues.includes(option.value);
                            return (
                                <div
                                    key={option.value}
                                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer"
                                    onClick={() => handleToggleOption(option.value)}
                                >
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300 bg-white'}`}>
                                        {isSelected && <Check size={10} className="text-white" />}
                                    </div>
                                    <span className="text-sm text-gray-700">{option.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
