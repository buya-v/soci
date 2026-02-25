import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  RefreshCw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  SkipForward,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TextArea } from '@/components/ui/TextArea';
import { Input } from '@/components/ui/Input';
import { useAppStore } from '@/store/useAppStore';
import { platformIcons, platformColors, statusConfig } from './MarketingPlanner';
import type { PlanGoal } from '@/types';

interface PlanReviewProps {
  planId: string;
  onBack: () => void;
  onEditBrief: (brief: string, goal: PlanGoal | null, destination: 'drafts' | 'scheduled') => void;
  onApproveAndGenerate: () => void;
}

export function PlanReview({ planId, onBack, onEditBrief, onApproveAndGenerate }: PlanReviewProps) {
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

  const plan = useAppStore((s) => s.plans.find((p) => p.id === planId)) || null;
  const updatePlan = useAppStore((s) => s.updatePlan);
  const updatePlannedPost = useAppStore((s) => s.updatePlannedPost);

  if (!plan) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Review Plan</h1>
            <p className="text-sm text-gray-400 mt-0.5">Review and tweak before generating</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusConfig[plan.status].variant}>
            {statusConfig[plan.status].label}
          </Badge>
        </div>
      </div>

      {/* Summary */}
      <GlassCard variant="aurora" title="Plan Summary">
        <TextArea
          value={plan.summary}
          onChange={(e) => updatePlan(plan.id, { summary: e.target.value })}
          rows={3}
          className="text-sm"
        />
        <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
          <span>{plan.totalPostCount} posts</span>
          <span>{plan.durationDays} days</span>
          <span>{plan.postDestination === 'scheduled' ? 'Auto-schedule' : 'Drafts'}</span>
          {plan.totalBudget > 0 && <span>${plan.totalBudget} budget</span>}
        </div>
      </GlassCard>

      {/* Platform Breakdown */}
      <GlassCard title="Platform Breakdown">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {plan.platforms.map((pc) => (
            <div
              key={pc.platform}
              className="p-3 rounded-lg bg-white/5 border border-glass-border"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold ${platformColors[pc.platform]}`}>
                  {platformIcons[pc.platform]}
                </span>
                <span className="text-white font-medium capitalize">{pc.platform}</span>
              </div>
              <div className="text-sm text-gray-400 space-y-1">
                <div>{pc.postCount} posts &middot; {pc.frequency}</div>
                <div className="flex flex-wrap gap-1">
                  {pc.themes.map((theme) => (
                    <Badge key={theme} size="sm">{theme}</Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Post Timeline */}
      <GlassCard title="Post Timeline" subtitle={`${plan.plannedPosts.length} planned posts`}>
        <div className="space-y-2">
          {plan.plannedPosts
            .sort((a, b) => a.order - b.order)
            .map((pp) => {
              const isExpanded = expandedPostId === pp.id;
              const isSkipped = pp.status === 'skipped';

              return (
                <div
                  key={pp.id}
                  className={`rounded-lg border transition-all ${
                    isSkipped
                      ? 'bg-white/2 border-glass-border opacity-50'
                      : 'bg-white/5 border-glass-border hover:border-glass-border-hover'
                  }`}
                >
                  <div className="flex items-center gap-3 p-3">
                    <span className={`w-7 h-7 rounded flex-shrink-0 flex items-center justify-center text-xs font-bold ${platformColors[pp.platform]}`}>
                      {platformIcons[pp.platform]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${isSkipped ? 'line-through text-gray-500' : 'text-white'}`}>
                          {pp.topic}
                        </span>
                        <Badge size="sm">{pp.theme}</Badge>
                      </div>
                      {pp.scheduledFor && (
                        <span className="text-xs text-gray-500">
                          {new Date(pp.scheduledFor).toLocaleDateString()} at{' '}
                          {new Date(pp.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          updatePlannedPost(plan.id, pp.id, {
                            status: isSkipped ? 'pending' : 'skipped',
                          });
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isSkipped
                            ? 'text-warning hover:bg-warning/10'
                            : 'text-gray-500 hover:bg-white/10 hover:text-gray-300'
                        }`}
                        title={isSkipped ? 'Include post' : 'Skip post'}
                      >
                        <SkipForward size={14} />
                      </button>
                      <button
                        onClick={() => setExpandedPostId(isExpanded ? null : pp.id)}
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 space-y-3 border-t border-glass-border pt-3">
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Topic</label>
                            <Input
                              value={pp.topic}
                              onChange={(e) => updatePlannedPost(plan.id, pp.id, { topic: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Caption</label>
                            <TextArea
                              value={pp.suggestedCaption}
                              onChange={(e) => updatePlannedPost(plan.id, pp.id, { suggestedCaption: e.target.value })}
                              rows={4}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Hashtags</label>
                            <Input
                              value={pp.suggestedHashtags.join(', ')}
                              onChange={(e) => updatePlannedPost(plan.id, pp.id, {
                                suggestedHashtags: e.target.value.split(',').map((h) => h.trim()).filter(Boolean),
                              })}
                              hint="Comma-separated"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
        </div>
      </GlassCard>

      {/* Budget Allocations */}
      {plan.budgetAllocations.length > 0 && (
        <GlassCard title="Budget Allocations" subtitle={`Total: $${plan.totalBudget}`}>
          <div className="space-y-3">
            {plan.budgetAllocations.map((ba, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-1">
                  <span className="text-sm text-white capitalize">
                    {ba.category.replace(/_/g, ' ')}
                  </span>
                  <p className="text-xs text-gray-500">{ba.rationale}</p>
                </div>
                <Input
                  value={ba.amount.toString()}
                  onChange={(e) => {
                    const newAmount = parseFloat(e.target.value) || 0;
                    const newAllocations = [...plan.budgetAllocations];
                    newAllocations[index] = { ...ba, amount: newAmount };
                    const newTotal = newAllocations.reduce((s, a) => s + a.amount, 0);
                    updatePlan(plan.id, {
                      budgetAllocations: newAllocations,
                      totalBudget: newTotal,
                    });
                  }}
                  className="w-24 text-right"
                  leftIcon={<span className="text-xs">$</span>}
                />
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between sticky bottom-4 p-4 rounded-xl bg-glass-bg/80 backdrop-blur-xl border border-glass-border">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft size={16} />
            Back
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              onEditBrief(plan.brief, plan.goal || null, plan.postDestination);
            }}
          >
            <RefreshCw size={14} />
            Edit Brief
          </Button>
        </div>
        <Button variant="aurora" onClick={onApproveAndGenerate}>
          <Sparkles size={16} />
          Approve & Generate
        </Button>
      </div>
    </div>
  );
}
