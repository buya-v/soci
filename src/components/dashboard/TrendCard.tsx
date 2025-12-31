import { Trend } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Sparkles, TrendingUp } from 'lucide-react';

interface TrendCardProps {
  trend: Trend;
  onGenerate: (trend: Trend) => void;
  isGenerating: boolean;
}

export const TrendCard = ({ trend, onGenerate, isGenerating }: TrendCardProps) => {
  return (
    <Card hoverEffect className="group">
      <div className="flex justify-between items-start mb-3">
        <Badge variant="default" className="bg-zinc-800/80">{trend.category}</Badge>
        <span className="text-xs font-mono text-primary">Score: {trend.sociScore}/10</span>
      </div>
      
      <h3 className="text-lg font-semibold text-zinc-100 mb-1 group-hover:text-primary transition-colors">
        {trend.topic}
      </h3>
      
      <div className="flex items-center gap-2 text-muted text-xs mb-4">
        <TrendingUp className="w-3 h-3" />
        {trend.volume} posts
      </div>

      <Button 
        onClick={() => onGenerate(trend)} 
        disabled={isGenerating}
        className="w-full gap-2"
        size="sm"
        variant="outline"
      >
        <Sparkles className="w-4 h-4" />
        {isGenerating ? 'Drafting...' : 'Generate Post'}
      </Button>
    </Card>
  );
};