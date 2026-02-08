import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, Star, AlertTriangle, MessageSquareText, Download } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type Interaction = {
    id: string;
    date: string;
    sessionId: string;
    agent: string;
    query: string;
    response: string;
    rating?: number;
    flagged?: boolean;
    feedback?: "positive" | "negative";
};

interface InteractionsTableProps {
    data: Interaction[];
    onRowClick: (interaction: Interaction) => void;
}

export function InteractionsTable({ data, onRowClick }: InteractionsTableProps) {
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

    const toggleSelectAll = () => {
        if (selectedRows.size === data.length) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(data.map((i) => i.id)));
        }
    };

    const toggleSelectRow = (id: string) => {
        const newSelected = new Set(selectedRows);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedRows(newSelected);
    };

    const handleExport = () => {
        const headers = ["ID", "Data", "Agente", "Pergunta", "Resposta", "Avaliação", "Flag"];
        const rows = data.map(item => [
            item.id,
            new Date(item.date).toLocaleString(),
            item.agent,
            `"${item.query.replace(/"/g, '""')}"`,
            `"${item.response.replace(/"/g, '""')}"`,
            item.rating || "",
            item.flagged ? "SIM" : "NAO"
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(e => e.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "vitruchat_analytics.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="w-4 h-4 mr-2" />
                    Exportar CSV
                </Button>
            </div>
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    checked={data.length > 0 && selectedRows.size === data.length}
                                    onCheckedChange={toggleSelectAll}
                                />
                            </TableHead>
                            <TableHead className="w-[100px]">Data</TableHead>
                            <TableHead className="w-[150px]">Agente</TableHead>
                            <TableHead className="max-w-[300px]">Pergunta</TableHead>
                            <TableHead className="max-w-[300px]">Resposta</TableHead>
                            <TableHead className="w-[100px]">Avaliação</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    Nehuma interação encontrada.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((interaction) => (
                                <TableRow
                                    key={interaction.id}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => onRowClick(interaction)}
                                >
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        <Checkbox
                                            checked={selectedRows.has(interaction.id)}
                                            onCheckedChange={() => toggleSelectRow(interaction.id)}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium text-xs text-muted-foreground">
                                        {new Date(interaction.date).toLocaleDateString()}
                                        <br />
                                        {new Date(interaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-normal">
                                            {interaction.agent}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="truncate font-medium max-w-[280px]" title={interaction.query}>
                                            {interaction.query}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="truncate text-muted-foreground max-w-[280px]" title={interaction.response}>
                                            {interaction.response}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            {interaction.flagged && (
                                                <AlertTriangle className="w-4 h-4 text-destructive mr-1" />
                                            )}
                                            {interaction.rating ? (
                                                <div className="flex text-yellow-500">
                                                    <span className="text-sm font-semibold mr-1">{interaction.rating}</span>
                                                    <Star className="w-4 h-4 fill-current" />
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">-</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(interaction.id)}>
                                                    Copiar ID
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => onRowClick(interaction)}>
                                                    <MessageSquareText className="w-4 h-4 mr-2" />
                                                    Ver Detalhes
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
