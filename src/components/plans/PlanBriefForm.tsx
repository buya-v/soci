import { useState, useCallback } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { TextArea } from '@/components/ui/TextArea';
import { Toggle } from '@/components/ui/Toggle';
import { useAppStore } from '@/store/useAppStore';
import { generateMarketingPlan } from '@/services/ai-client';
import { getOptimalSlotsForDay } from '@/services/scheduleOptimizer';
import { goalLabels } from './MarketingPlanner';
import type { PlanGoal, PlannedPost, BudgetCategory, Platform, MarketingPlan } from '@/types';

function timeOfDayToHour(timeOfDay: string): number {
  switch (timeOfDay) {
    case 'morning': return 9;
    case 'afternoon': return 14;
    case 'evening': return 19;
    default: return 12;
  }
}

interface PlanBriefFormProps {
  onPlanCreated: (planId: string) => void;
  onCancel: () => void;
  initialBrief?: string;
  initialGoal?: PlanGoal | null;
  initialDestination?: 'drafts' | 'scheduled';
}

export function PlanBriefForm({
  onPlanCreated,
  onCancel,
  initialBrief = '',
  initialGoal = null,
  initialDestination = 'drafts',
}: PlanBriefFormProps) {
  const [brief, setBrief] = useState(initialBrief);
  const [selectedGoal, setSelectedGoal] = useState<PlanGoal | null>(initialGoal);
  const [postDestination, setPostDestination] = useState<'drafts' | 'scheduled'>(initialDestination);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  const persona = useAppStore((s) => s.persona);
  const budgetConfig = useAppStore((s) => s.budgetConfig);
  const addPlan = useAppStore((s) => s.addPlan);
  const addNotification = useAppStore((s) => s.addNotification);
  const platformCredentials = useAppStore((s) => s.platformCredentials);

  const availablePlatforms: Platform[] = platformCredentials
    .filter((c) => c.isConnected)
    .map((c) => c.platform);
  const platformsToUse = availablePlatforms.length > 0
    ? availablePlatforms
    : (['twitter', 'instagram', 'linkedin'] as Platform[]);

  const handleGeneratePlan = useCallback(async () => {
    if (!brief.trim()) return;
    setIsGeneratingPlan(true);

    try {
      const result = await generateMarketingPlan({
        brief: brief.trim(),
        goal: selectedGoal || undefined,
        niche: persona?.niche,
        targetAudience: persona?.targetAudience,
        tone: persona?.tone,
        topics: persona?.topics,
        platforms: platformsToUse,
        monthlyBudget: budgetConfig.monthlyBudget,
      });

      const startDate = new Date();
      const startDateISO = startDate.toISOString();

      const plannedPosts: PlannedPost[] = result.posts.map((p, index) => {
        const postDate = new Date(startDate);
        postDate.setDate(postDate.getDate() + p.dayOffset);

        let scheduledFor: string | undefined;
        try {
          const daySchedule = getOptimalSlotsForDay(postDate, [p.platform]);
          const bestSlot = daySchedule.platformBest[p.platform];
          if (bestSlot) {
            scheduledFor = bestSlot.date.toISOString();
          } else {
            postDate.setHours(timeOfDayToHour(p.timeOfDay), 0, 0, 0);
            scheduledFor = postDate.toISOString();
          }
        } catch {
          postDate.setHours(timeOfDayToHour(p.timeOfDay), 0, 0, 0);
          scheduledFor = postDate.toISOString();
        }

        return {
          id: crypto.randomUUID(),
          platform: p.platform,
          topic: p.topic,
          theme: p.theme,
          suggestedCaption: p.suggestedCaption,
          suggestedHashtags: p.suggestedHashtags || [],
          scheduledFor,
          order: index,
          status: 'pending' as const,
        };
      });

      const budgetAllocations = result.budgetAllocations.map((ba) => ({
        category: ba.category as BudgetCategory,
        amount: ba.amount,
        rationale: ba.rationale,
      }));

      const totalBudget = budgetAllocations.reduce((sum, ba) => sum + ba.amount, 0);

      const plan: MarketingPlan = {
        id: crypto.randomUUID(),
        brief: brief.trim(),
        goal: selectedGoal || undefined,
        status: 'review',
        postDestination,
        summary: result.summary,
        platforms: result.platforms.map((p) => ({
          platform: p.platform,
          postCount: p.postCount,
          frequency: p.frequency,
          themes: p.themes,
        })),
        plannedPosts,
        totalPostCount: plannedPosts.length,
        durationDays: result.durationDays,
        startDate: startDateISO,
        budgetAllocations,
        totalBudget,
        createdAt: startDateISO,
        updatedAt: startDateISO,
        generationProgress: 0,
        generatedPostIds: [],
      };

      addPlan(plan);
      onPlanCreated(plan.id);
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Plan Generation Failed',
        message: err instanceof Error ? err.message : 'Failed to generate plan',
      });
    } finally {
      setIsGeneratingPlan(false);
    }
  }, [brief, selectedGoal, postDestination, persona, platformsToUse, budgetConfig.monthlyBudget, addPlan, onPlanCreated, addNotification]);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <button
          onClick={onCancel}
          className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">New Marketing Plan</h1>
          <p className="text-sm text-gray-400 mt-0.5">Describe your goals and let AI build a strategy</p>
        </div>
      </div>

      <GlassCard title="Marketing Brief">
        <TextArea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder="Describe your marketing goals, target campaign, product launch, or any specific objectives. For example: 'Launch a 2-week campaign for our new eco-friendly water bottle targeting health-conscious millennials. Focus on sustainability messaging and user testimonials.'"
          rows={6}
          className="text-base"
        />
      </GlassCard>

      <GlassCard title="Goal (Optional)">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(goalLabels) as PlanGoal[]).map((goal) => (
            <button
              key={goal}
              onClick={() => setSelectedGoal(selectedGoal === goal ? null : goal)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                selectedGoal === goal
                  ? 'bg-aurora-neon/20 border-aurora-neon/40 text-aurora-neon'
                  : 'bg-white/5 border-glass-border text-gray-400 hover:text-white hover:border-glass-border-hover'
              }`}
            >
              {goalLabels[goal]}
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard title="Post Destination">
        <Toggle
          enabled={postDestination === 'scheduled'}
          onChange={(v) => setPostDestination(v ? 'scheduled' : 'drafts')}
          label={postDestination === 'scheduled' ? 'Auto-Schedule' : 'Save as Drafts'}
          description={
            postDestination === 'scheduled'
              ? 'Posts will be automatically scheduled at optimal times'
              : 'Posts will be saved to your drafts queue for manual review'
          }
        />
      </GlassCard>

      {persona && (
        <GlassCard title="Persona Context">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Niche:</span>
              <span className="text-white ml-2">{persona.niche || 'Not set'}</span>
            </div>
            <div>
              <span className="text-gray-500">Audience:</span>
              <span className="text-white ml-2">{persona.targetAudience || 'Not set'}</span>
            </div>
            <div>
              <span className="text-gray-500">Tone:</span>
              <span className="text-white ml-2 capitalize">{persona.tone}</span>
            </div>
            <div>
              <span className="text-gray-500">Budget:</span>
              <span className="text-white ml-2">${budgetConfig.monthlyBudget}/mo</span>
            </div>
          </div>
        </GlassCard>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="aurora"
          onClick={handleGeneratePlan}
          isLoading={isGeneratingPlan}
          disabled={!brief.trim()}
        >
          <Sparkles size={16} />
          Generate Plan
        </Button>
      </div>
    </div>
  );
}
