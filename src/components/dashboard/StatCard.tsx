import { ArrowUpRight, ArrowDownRight, HelpCircle } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Metric } from '../../types';
import { Skeleton } from '../ui/Skeleton';

interface Props {
  data?: Metric | null;
  isLoading: boolean;
}

// Defensive Component
export const StatCard = ({ data, isLoading }: Props) => {
  if (isLoading) {
    return (
      <GlassCard className="h-32 flex flex-col justify-between">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-16 h-8" />
        <Skeleton className="w-full h-2" />
      </GlassCard>
    );
  }

  // Handle missing data gracefully (Resilience)
  const value = data?.value ?? "--";
  const label = data?.label ?? "Unknown Metric";
  const trend = data?.trend ?? 0;
  
  const isPositive = trend >= 0;

  return (
    <GlassCard interactive>
      <div className="flex justify-between items-start mb-4">
        <span className="text-slate-400 text-sm font-medium">{label}</span>
        {trend !== 0 && (
          <div className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="flex items-end gap-2">
        <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
        {data?.unit && <span className="text-slate-500 mb-1">{data.unit}</span>}
      </div>
      {/* Decorative Sparkline Fallback */}
      <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
         <div 
            className={`h-full ${isPositive ? 'bg-accent-primary' : 'bg-slate-600'}`} 
            style={{ width: `${Math.min(Math.abs(trend * 2), 100)}%` }} 
         />
      </div>
    </GlassCard>
  );
};