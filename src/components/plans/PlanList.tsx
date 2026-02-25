import { motion } from 'framer-motion';
import { ClipboardList, Plus, Sparkles, Trash2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/store/useAppStore';
import { platformIcons, platformColors, goalLabels, statusConfig } from './MarketingPlanner';

interface PlanListProps {
  onNewPlan: () => void;
  onSelectPlan: (planId: string) => void;
}

export function PlanList({ onNewPlan, onSelectPlan }: PlanListProps) {
  const plans = useAppStore((s) => s.plans);
  const deletePlan = useAppStore((s) => s.deletePlan);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Marketing Plans</h1>
          <p className="text-sm text-gray-400 mt-1">Create AI-powered marketing strategies</p>
        </div>
        <Button variant="aurora" onClick={onNewPlan}>
          <Plus size={16} />
          New Plan
        </Button>
      </div>

      {plans.length === 0 ? (
        <GlassCard variant="aurora">
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-aurora-neon/10 flex items-center justify-center mx-auto mb-4">
              <ClipboardList size={32} className="text-aurora-neon" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Create Your First Plan</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              Write a marketing brief and let AI generate a complete strategy with posts, scheduling, and budget allocation.
            </p>
            <Button variant="aurora" onClick={onNewPlan}>
              <Sparkles size={16} />
              Get Started
            </Button>
          </div>
        </GlassCard>
      ) : (
        <div className="grid gap-4">
          {plans.map((plan) => {
            const sc = statusConfig[plan.status];
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                layout
              >
                <GlassCard hoverable>
                  <button
                    className="w-full text-left"
                    onClick={() => onSelectPlan(plan.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={sc.variant} size="sm">{sc.label}</Badge>
                          {plan.goal && (
                            <Badge size="sm">{goalLabels[plan.goal]}</Badge>
                          )}
                        </div>
                        <p className="text-white font-medium truncate">{plan.brief}</p>
                        <p className="text-sm text-gray-400 mt-1 line-clamp-2">{plan.summary}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1.5">
                            {plan.platforms.map((pc) => (
                              <span
                                key={pc.platform}
                                className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${platformColors[pc.platform]}`}
                              >
                                {platformIcons[pc.platform]}
                              </span>
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">
                            {plan.totalPostCount} posts
                          </span>
                          <span className="text-xs text-gray-500">
                            {plan.durationDays} days
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(plan.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePlan(plan.id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-critical transition-colors"
                        title="Delete plan"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </button>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
