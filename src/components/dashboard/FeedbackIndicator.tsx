import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface FeedbackIndicatorProps {
    type: string | null;
}

export const FeedbackIndicator = ({ type }: FeedbackIndicatorProps) => {
    if (!type || type === 'NULL') return <span className="text-gray-300">-</span>;
    const isLike = type === 'LIKE';
    return isLike ? <ThumbsUp size={18} className="text-green-600 fill-green-100" /> : <ThumbsDown size={18} className="text-red-500" />;
};
