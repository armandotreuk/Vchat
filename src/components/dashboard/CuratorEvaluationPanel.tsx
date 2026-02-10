import { useState } from 'react';
import { Star, TriangleAlert } from 'lucide-react';

interface CuratorEvaluationPanelProps {
    compact?: boolean;
    defaultValue?: number | null;
    defaultComment?: string | null;
    isRisk?: boolean;
    showRiskButton?: boolean;
}

export const CuratorEvaluationPanel = ({
    compact = false,
    defaultValue = 0,
    defaultComment = '',
    isRisk = false,
    showRiskButton = true
}: CuratorEvaluationPanelProps) => {
    const [rating, setRating] = useState(defaultValue || 0);
    const [comment, setComment] = useState(defaultComment || '');
    const [risk, setRisk] = useState(isRisk);

    return (
        <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${compact ? 'mt-0' : 'h-full'}`}>
            <div className="flex justify-between mb-3 items-center">
                <h3 className="font-bold text-sm text-gray-700 flex items-center gap-2">
                    <Star size={14} className="text-purple-700" /> Avaliação Técnica
                </h3>
                {showRiskButton && (
                    <button
                        onClick={() => setRisk(!risk)}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors border ${risk ? 'bg-red-100 text-red-700 border-red-200' : 'text-gray-400 border-transparent hover:bg-gray-100'}`}
                    >
                        <TriangleAlert size={14} /> {risk ? 'Atenção Sinalizada' : 'Sinalizar Atenção'}
                    </button>
                )}
            </div>

            <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} onClick={() => setRating(s)} className="focus:outline-none transition-transform hover:scale-110">
                        <Star
                            size={compact ? 20 : 24}
                            className={`${s <= (rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`}
                        />
                    </button>
                ))}
                <span className="ml-2 text-sm font-bold text-gray-600 self-center">{rating && rating > 0 ? `${rating}/5` : ''}</span>
            </div>

            <textarea
                className="w-full border border-gray-300 p-2 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white min-h-[80px]"
                placeholder="Comentários técnicos sobre a precisão da resposta..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
            />
            <button
                disabled={rating === (defaultValue || 0) && comment === (defaultComment || '') && risk === (isRisk || false)}
                className="w-full bg-purple-700 text-white py-2 rounded mt-3 text-sm font-medium hover:bg-purple-800 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-purple-700"
            >
                Salvar Avaliação
            </button>
        </div>
    );
};
