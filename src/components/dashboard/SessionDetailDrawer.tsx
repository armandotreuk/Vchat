import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Star, AlertTriangle, X, Check } from "lucide-react";
import { Interaction } from "./InteractionsTable";
import { useState, useEffect } from "react";
import { ChatMessage } from "@/components/chat/ChatMessage";

interface SessionDetailDrawerProps {
    interaction: Interaction | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SessionDetailDrawer({ interaction, open, onOpenChange }: SessionDetailDrawerProps) {
    const [rating, setRating] = useState<number>(0);
    const [comment, setComment] = useState("");
    const [flagged, setFlagged] = useState(false);

    useEffect(() => {
        if (interaction) {
            setRating(interaction.rating || 0);
            setFlagged(interaction.flagged || false);
            setComment(""); // Reset comment for now, ideally fetch from backend
        }
    }, [interaction]);

    if (!interaction) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-0 gap-0">
                <SheetHeader className="p-6 border-b">
                    <div className="flex items-center justify-between">
                        <SheetTitle>Detalhes da Sessão</SheetTitle>
                        <Badge variant="outline">{interaction.agent}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                        ID: {interaction.id} • {new Date(interaction.date).toLocaleString()}
                    </div>
                </SheetHeader>

                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Chat View Mockup */}
                    <ScrollArea className="flex-1 p-6 bg-[hsl(var(--chat-bg))]">
                        <div className="space-y-6">
                            <ChatMessage
                                message={{
                                    id: 'msg-1',
                                    role: 'user',
                                    content: interaction.query,
                                    timestamp: new Date(interaction.date)
                                }}
                                isLast={false}
                            />
                            <ChatMessage
                                message={{
                                    id: 'msg-2',
                                    role: 'assistant',
                                    content: interaction.response,
                                    timestamp: new Date(new Date(interaction.date).getTime() + 2000)
                                }}
                                isLast={true}
                            />
                        </div>
                    </ScrollArea>

                    {/* Curation Panel */}
                    <div className="p-6 border-t bg-card z-10">
                        <h3 className="font-semibold mb-4">Curadoria Técnica</h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Avaliação da Resposta</Label>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setRating(star)}
                                            className="focus:outline-none"
                                        >
                                            <Star
                                                className={`w-6 h-6 ${star <= rating
                                                    ? "fill-yellow-500 text-yellow-500"
                                                    : "text-muted-foreground hover:text-yellow-500"
                                                    } transition-colors`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="comment">Comentários</Label>
                                <Textarea
                                    id="comment"
                                    placeholder="Descreva problemas de alucinação, tom ou precisão..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="h-20 resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="flag-risk"
                                        checked={flagged}
                                        onCheckedChange={setFlagged}
                                    />
                                    <Label htmlFor="flag-risk" className="flex items-center cursor-pointer text-red-600 font-medium">
                                        <AlertTriangle className="w-4 h-4 mr-2" />
                                        Sinalizar Atenção
                                    </Label>
                                </div>

                                <Button size="sm" onClick={() => onOpenChange(false)}>
                                    <Check className="w-4 h-4 mr-2" />
                                    Salvar Avaliação
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
