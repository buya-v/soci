import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { executePlanGeneration } from '@/services/planExecutor';
import { PlanList } from './PlanList';
import { PlanBriefForm } from './PlanBriefForm';
import { PlanReview } from './PlanReview';
import { PlanGeneration } from './PlanGeneration';
import type { Platform, PlanGoal, PlanStatus } from '@/types';

type ActiveMode = 'list' | 'brief' | 'review' | 'generating';

// Shared constants used by child views
export const platformIcons: Record<Platform, string> = {
  twitter: 'X',
  linkedin: 'in',
  instagram: 'IG',
  tiktok: 'TT',
  facebook: 'FB',
};

export const platformColors: Record<Platform, string> = {
  twitter: 'bg-gray-800 text-white',
  linkedin: 'bg-blue-600 text-white',
  instagram: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
  tiktok: 'bg-black text-white',
  facebook: 'bg-blue-500 text-white',
};

export const goalLabels: Record<PlanGoal, string> = {
  brand_awareness: 'Brand Awareness',
  lead_generation: 'Lead Generation',
  engagement: 'Engagement',
  traffic: 'Traffic',
  sales: 'Sales',
  community: 'Community',
};

export const statusConfig: Record<PlanStatus, { label: string; variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' }> = {
  draft: { label: 'Draft', variant: 'default' },
  generating: { label: 'Generating', variant: 'info' },
  review: { label: 'In Review', variant: 'warning' },
  approved: { label: 'Approved', variant: 'primary' },
  active: { label: 'Active', variant: 'info' },
  completed: { label: 'Completed', variant: 'success' },
  failed: { label: 'Failed', variant: 'danger' },
};

export function MarketingPlanner() {
  const [activeMode, setActiveMode] = useState<ActiveMode>('list');
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [briefFormState, setBriefFormState] = useState<{
    initialBrief?: string;
    initialGoal?: PlanGoal | null;
    initialDestination?: 'drafts' | 'scheduled';
  } | null>(null);

  const plans = useAppStore((s) => s.plans);

  const handleSelectPlan = useCallback((planId: string) => {
    setActivePlanId(planId);
    const plan = plans.find((p) => p.id === planId);
    if (plan?.status === 'completed' || plan?.status === 'failed') {
      setActiveMode('generating');
    } else {
      setActiveMode('review');
    }
  }, [plans]);

  const handleBackToList = useCallback(() => {
    setActiveMode('list');
    setActivePlanId(null);
    setBriefFormState(null);
  }, []);

  const handleNewPlan = useCallback(() => {
    setBriefFormState(null);
    setActiveMode('brief');
  }, []);

  const handlePlanCreated = useCallback((planId: string) => {
    setActivePlanId(planId);
    setActiveMode('review');
    setBriefFormState(null);
  }, []);

  const handleCancelBrief = useCallback(() => {
    setActiveMode('list');
    setBriefFormState(null);
  }, []);

  const handleEditBrief = useCallback((brief: string, goal: PlanGoal | null, destination: 'drafts' | 'scheduled') => {
    setBriefFormState({ initialBrief: brief, initialGoal: goal, initialDestination: destination });
    setActiveMode('brief');
  }, []);

  const handleApproveAndGenerate = useCallback(() => {
    if (!activePlanId) return;
    setActiveMode('generating');
    executePlanGeneration(activePlanId).catch(console.error);
  }, [activePlanId]);

  return (
    <div className="pb-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeMode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeMode === 'list' && (
            <PlanList onNewPlan={handleNewPlan} onSelectPlan={handleSelectPlan} />
          )}
          {activeMode === 'brief' && (
            <PlanBriefForm
              onPlanCreated={handlePlanCreated}
              onCancel={handleCancelBrief}
              {...briefFormState}
            />
          )}
          {activeMode === 'review' && activePlanId && (
            <PlanReview
              planId={activePlanId}
              onBack={handleBackToList}
              onEditBrief={handleEditBrief}
              onApproveAndGenerate={handleApproveAndGenerate}
            />
          )}
          {activeMode === 'generating' && activePlanId && (
            <PlanGeneration planId={activePlanId} onBack={handleBackToList} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
