import { useState } from "react";
import { Calendar as CalendarIcon, Filter, Search, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface DashboardFiltersProps {
    onSearch: (term: string) => void;
    onDateChange: (range: DateRange | undefined) => void;
    onAgentChange: (agent: string) => void;
}

export function DashboardFilters({
    onSearch,
    onDateChange,
    onAgentChange,
}: DashboardFiltersProps) {
    const [date, setDate] = useState<DateRange | undefined>();
    const [searchTerm, setSearchTerm] = useState("");

    const handleDateSelect = (range: DateRange | undefined) => {
        // Validate 31 days logic here if needed, or in the parent
        setDate(range);
        onDateChange(range);
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        onSearch(e.target.value);
    }

    return (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
            <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar em conversas..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="pl-8"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                <Select onValueChange={onAgentChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Todos os Agentes" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos os Agentes</SelectItem>
                        <SelectItem value="gpt-4">GPT-4 Omni</SelectItem>
                        <SelectItem value="claude-3">Claude 3.5 Sonnet</SelectItem>
                        <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                    </SelectContent>
                </Select>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                                "w-[240px] justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date?.from ? (
                                date.to ? (
                                    <>
                                        {format(date.from, "LLL dd, y", { locale: ptBR })} -{" "}
                                        {format(date.to, "LLL dd, y", { locale: ptBR })}
                                    </>
                                ) : (
                                    format(date.from, "LLL dd, y", { locale: ptBR })
                                )
                            ) : (
                                <span>Selecione uma data</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={handleDateSelect}
                            numberOfMonths={2}
                            locale={ptBR}
                        />
                    </PopoverContent>
                </Popover>

                {(searchTerm || date) && (
                    <Button variant="ghost" size="icon" onClick={() => {
                        setDate(undefined);
                        setSearchTerm("");
                        onSearch("");
                        onDateChange(undefined);
                    }}>
                        <X className="w-4 h-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}
