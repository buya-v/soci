import { useAppStore } from '@/store/useAppStore';
import { generateContent } from '@/services/ai-client';

/**
 * Orchestrates post generation from an approved marketing plan.
 * Reads/writes store directly via useAppStore.getState() (same pattern as getEffectiveLanguage).
 */
export async function executePlanGeneration(planId: string): Promise<void> {
  const state = useAppStore.getState();
  const plan = state.plans.find((p) => p.id === planId);
  if (!plan) return;

  const {
    updatePlanStatus,
    updateGenerationProgress,
    addPost,
    addGeneratedPostId,
    updatePlannedPost,
    addBudgetSpend,
    addActivity,
    addNotification,
    updatePlan,
  } = state;

  const persona = state.persona;

  updatePlanStatus(planId, 'approved');

  const postsToGenerate = plan.plannedPosts.filter((pp) => pp.status !== 'skipped');
  const total = postsToGenerate.length;

  try {
    for (let i = 0; i < postsToGenerate.length; i++) {
      const pp = postsToGenerate[i];
      updateGenerationProgress(planId, Math.round((i / total) * 100));

      try {
        const generated = await generateContent({
          topic: pp.topic,
          platform: pp.platform,
          tone: persona?.tone || 'professional',
          niche: persona?.niche,
          targetAudience: persona?.targetAudience,
        });

        const postId = crypto.randomUUID();
        const isScheduled = plan.postDestination === 'scheduled';

        addPost({
          id: postId,
          content: generated.caption,
          caption: generated.caption,
          hashtags: generated.hashtags,
          platform: pp.platform,
          status: isScheduled ? 'scheduled' : 'draft',
          scheduledFor: isScheduled ? pp.scheduledFor : undefined,
          planId,
        });

        addGeneratedPostId(planId, postId);
        updatePlannedPost(planId, pp.id, {
          status: 'generated',
          generatedPostId: postId,
        });
      } catch {
        updatePlannedPost(planId, pp.id, { status: 'skipped' });
      }
    }

    // Record budget spends
    if (plan.budgetAllocations.length > 0) {
      for (const ba of plan.budgetAllocations) {
        if (ba.amount > 0) {
          addBudgetSpend({
            id: crypto.randomUUID(),
            category: ba.category,
            amount: ba.amount,
            description: `Marketing Plan: ${plan.brief.slice(0, 50)}`,
            date: new Date().toISOString(),
          });
        }
      }
    }

    updateGenerationProgress(planId, 100);
    updatePlanStatus(planId, 'completed');

    addActivity({
      id: crypto.randomUUID(),
      action: 'Plan Completed',
      description: `Generated ${total} posts from marketing plan`,
      timestamp: new Date().toISOString(),
      status: 'success',
    });

    addNotification({
      type: 'success',
      title: 'Plan Complete',
      message: `Successfully generated ${total} posts`,
    });
  } catch (err) {
    updatePlanStatus(planId, 'failed');
    updatePlan(planId, {
      error: err instanceof Error ? err.message : 'Generation failed',
    });
    addNotification({
      type: 'error',
      title: 'Generation Failed',
      message: err instanceof Error ? err.message : 'Failed to generate posts',
    });
  }
}
