import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList,
  Plus,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Eye,
  Calendar,
  FileText,
  Loader2,
  Trash2,
  SkipForward,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TextArea } from '@/components/ui/TextArea';
import { Input } from '@/components/ui/Input';
import { Toggle } from '@/components/ui/Toggle';
import { useAppStore } from '@/store/useAppStore';
import { generateMarketingPlan, generateContent } from '@/services/ai-client';
import { getOptimalSlotsForDay } from '@/services/scheduleOptimizer';
import type {
  MarketingPlan,
  PlannedPost,
  PlanGoal,
  PlanStatus,
  Platform,
  BudgetCategory,
} from '@/types';

type ActiveMode = 'list' | 'brief' | 'review' | 'generating';

const platformIcons: Record<Platform, string> = {
  twitter: 'X',
  linkedin: 'in',
  instagram: 'IG',
  tiktok: 'TT',
  facebook: 'FB',
};

const platformColors: Record<Platform, string> = {
  twitter: 'bg-gray-800 text-white',
  linkedin: 'bg-blue-600 text-white',
  instagram: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
  tiktok: 'bg-black text-white',
  facebook: 'bg-blue-500 text-white',
};

const goalLabels: Record<PlanGoal, string> = {
  brand_awareness: 'Brand Awareness',
  lead_generation: 'Lead Generation',
  engagement: 'Engagement',
  traffic: 'Traffic',
  sales: 'Sales',
  community: 'Community',
};

const statusConfig: Record<PlanStatus, { label: string; variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' }> = {
  draft: { label: 'Draft', variant: 'default' },
  generating: { label: 'Generating', variant: 'info' },
  review: { label: 'In Review', variant: 'warning' },
  approved: { label: 'Approved', variant: 'primary' },
  active: { label: 'Active', variant: 'info' },
  completed: { label: 'Completed', variant: 'success' },
  failed: { label: 'Failed', variant: 'danger' },
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Map timeOfDay to hour ranges for schedule optimizer
function timeOfDayToHour(timeOfDay: string): number {
  switch (timeOfDay) {
    case 'morning': return 9;
    case 'afternoon': return 14;
    case 'evening': return 19;
    default: return 12;
  }
}

export function MarketingPlanner() {
  const [activeMode, setActiveMode] = useState<ActiveMode>('list');
  const [activePlanId, setLocalActivePlanId] = useState<string | null>(null);

  // Brief mode state
  const [brief, setBrief] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<PlanGoal | null>(null);
  const [postDestination, setPostDestination] = useState<'drafts' | 'scheduled'>('drafts');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // Review mode state
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

  // Store
  const plans = useAppStore((s) => s.plans);
  const addPlan = useAppStore((s) => s.addPlan);
  const updatePlan = useAppStore((s) => s.updatePlan);
  const deletePlan = useAppStore((s) => s.deletePlan);
  const updatePlannedPost = useAppStore((s) => s.updatePlannedPost);
  const updatePlanStatus = useAppStore((s) => s.updatePlanStatus);
  const addGeneratedPostId = useAppStore((s) => s.addGeneratedPostId);
  const updateGenerationProgress = useAppStore((s) => s.updateGenerationProgress);
  const persona = useAppStore((s) => s.persona);
  const budgetConfig = useAppStore((s) => s.budgetConfig);
  const addPost = useAppStore((s) => s.addPost);
  const addBudgetSpend = useAppStore((s) => s.addBudgetSpend);
  const addActivity = useAppStore((s) => s.addActivity);
  const addNotification = useAppStore((s) => s.addNotification);

  const activePlan = plans.find((p) => p.id === activePlanId) || null;

  // Available platforms from persona credentials
  const platformCredentials = useAppStore((s) => s.platformCredentials);
  const availablePlatforms: Platform[] = platformCredentials
    .filter((c) => c.isConnected)
    .map((c) => c.platform);
  const platformsToUse = availablePlatforms.length > 0
    ? availablePlatforms
    : (['twitter', 'instagram', 'linkedin'] as Platform[]);

  const resetBriefForm = useCallback(() => {
    setBrief('');
    setSelectedGoal(null);
    setPostDestination('drafts');
  }, []);

  // --- Generate Plan ---
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

      // Map posts with real scheduled times
      const plannedPosts: PlannedPost[] = result.posts.map((p, index) => {
        const postDate = new Date(startDate);
        postDate.setDate(postDate.getDate() + p.dayOffset);

        // Try to get an optimal slot for this day/platform
        let scheduledFor: string | undefined;
        try {
          const daySchedule = getOptimalSlotsForDay(postDate, [p.platform]);
          const bestSlot = daySchedule.platformBest[p.platform];
          if (bestSlot) {
            scheduledFor = bestSlot.date.toISOString();
          } else {
            // Fallback to timeOfDay
            postDate.setHours(timeOfDayToHour(p.timeOfDay), 0, 0, 0);
            scheduledFor = postDate.toISOString();
          }
        } catch {
          postDate.setHours(timeOfDayToHour(p.timeOfDay), 0, 0, 0);
          scheduledFor = postDate.toISOString();
        }

        return {
          id: generateId(),
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
        id: generateId(),
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
      setLocalActivePlanId(plan.id);
      setActiveMode('review');
      resetBriefForm();
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Plan Generation Failed',
        message: err instanceof Error ? err.message : 'Failed to generate plan',
      });
    } finally {
      setIsGeneratingPlan(false);
    }
  }, [brief, selectedGoal, postDestination, persona, platformsToUse, budgetConfig.monthlyBudget, addPlan, resetBriefForm, addNotification]);

  // --- Approve & Generate ---
  const handleApproveAndGenerate = useCallback(async () => {
    if (!activePlan) return;

    updatePlanStatus(activePlan.id, 'approved');
    setActiveMode('generating');

    const postsToGenerate = activePlan.plannedPosts.filter((pp) => pp.status !== 'skipped');
    const total = postsToGenerate.length;

    try {
      for (let i = 0; i < postsToGenerate.length; i++) {
        const pp = postsToGenerate[i];
        updateGenerationProgress(activePlan.id, Math.round(((i) / total) * 100));

        try {
          const generated = await generateContent({
            topic: pp.topic,
            platform: pp.platform,
            tone: persona?.tone || 'professional',
            niche: persona?.niche,
            targetAudience: persona?.targetAudience,
          });

          const postId = generateId();
          const isScheduled = activePlan.postDestination === 'scheduled';

          addPost({
            id: postId,
            content: generated.caption,
            caption: generated.caption,
            hashtags: generated.hashtags,
            platform: pp.platform,
            status: isScheduled ? 'scheduled' : 'draft',
            scheduledFor: isScheduled ? pp.scheduledFor : undefined,
            planId: activePlan.id,
          });

          addGeneratedPostId(activePlan.id, postId);
          updatePlannedPost(activePlan.id, pp.id, {
            status: 'generated',
            generatedPostId: postId,
          });
        } catch {
          // Continue with other posts if one fails
          updatePlannedPost(activePlan.id, pp.id, { status: 'skipped' });
        }
      }

      // Record budget spends
      if (activePlan.budgetAllocations.length > 0) {
        for (const ba of activePlan.budgetAllocations) {
          if (ba.amount > 0) {
            addBudgetSpend({
              id: generateId(),
              category: ba.category,
              amount: ba.amount,
              description: `Marketing Plan: ${activePlan.brief.slice(0, 50)}`,
              date: new Date().toISOString(),
            });
          }
        }
      }

      updateGenerationProgress(activePlan.id, 100);
      updatePlanStatus(activePlan.id, 'completed');

      addActivity({
        id: generateId(),
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
      updatePlanStatus(activePlan.id, 'failed');
      updatePlan(activePlan.id, {
        error: err instanceof Error ? err.message : 'Generation failed',
      });
      addNotification({
        type: 'error',
        title: 'Generation Failed',
        message: err instanceof Error ? err.message : 'Failed to generate posts',
      });
    }
  }, [activePlan, persona, updatePlanStatus, updateGenerationProgress, addPost, addGeneratedPostId, updatePlannedPost, addBudgetSpend, addActivity, addNotification, updatePlan]);

  // --- Open plan for review ---
  const openPlan = useCallback((planId: string) => {
    setLocalActivePlanId(planId);
    const plan = plans.find((p) => p.id === planId);
    if (plan?.status === 'completed' || plan?.status === 'failed') {
      setActiveMode('generating'); // Show results
    } else {
      setActiveMode('review');
    }
  }, [plans]);

  // --- Render: List Mode ---
  const renderList = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Marketing Plans</h1>
          <p className="text-sm text-gray-400 mt-1">Create AI-powered marketing strategies</p>
        </div>
        <Button variant="aurora" onClick={() => setActiveMode('brief')}>
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
            <Button variant="aurora" onClick={() => setActiveMode('brief')}>
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
                    onClick={() => openPlan(plan.id)}
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

  // --- Render: Brief Mode ---
  const renderBrief = () => (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <button
          onClick={() => { setActiveMode('list'); resetBriefForm(); }}
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
        <Button variant="secondary" onClick={() => { setActiveMode('list'); resetBriefForm(); }}>
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

  // --- Render: Review Mode ---
  const renderReview = () => {
    if (!activePlan) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setActiveMode('list'); setLocalActivePlanId(null); }}
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
            <Badge variant={statusConfig[activePlan.status].variant}>
              {statusConfig[activePlan.status].label}
            </Badge>
          </div>
        </div>

        {/* Summary */}
        <GlassCard variant="aurora" title="Plan Summary">
          <TextArea
            value={activePlan.summary}
            onChange={(e) => updatePlan(activePlan.id, { summary: e.target.value })}
            rows={3}
            className="text-sm"
          />
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
            <span>{activePlan.totalPostCount} posts</span>
            <span>{activePlan.durationDays} days</span>
            <span>{activePlan.postDestination === 'scheduled' ? 'Auto-schedule' : 'Drafts'}</span>
            {activePlan.totalBudget > 0 && <span>${activePlan.totalBudget} budget</span>}
          </div>
        </GlassCard>

        {/* Platform Breakdown */}
        <GlassCard title="Platform Breakdown">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activePlan.platforms.map((pc) => (
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
        <GlassCard title="Post Timeline" subtitle={`${activePlan.plannedPosts.length} planned posts`}>
          <div className="space-y-2">
            {activePlan.plannedPosts
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
                            updatePlannedPost(activePlan.id, pp.id, {
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
                                onChange={(e) => updatePlannedPost(activePlan.id, pp.id, { topic: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 mb-1 block">Caption</label>
                              <TextArea
                                value={pp.suggestedCaption}
                                onChange={(e) => updatePlannedPost(activePlan.id, pp.id, { suggestedCaption: e.target.value })}
                                rows={4}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 mb-1 block">Hashtags</label>
                              <Input
                                value={pp.suggestedHashtags.join(', ')}
                                onChange={(e) => updatePlannedPost(activePlan.id, pp.id, {
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
        {activePlan.budgetAllocations.length > 0 && (
          <GlassCard title="Budget Allocations" subtitle={`Total: $${activePlan.totalBudget}`}>
            <div className="space-y-3">
              {activePlan.budgetAllocations.map((ba, index) => (
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
                      const newAllocations = [...activePlan.budgetAllocations];
                      newAllocations[index] = { ...ba, amount: newAmount };
                      const newTotal = newAllocations.reduce((s, a) => s + a.amount, 0);
                      updatePlan(activePlan.id, {
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
            <Button variant="ghost" onClick={() => { setActiveMode('list'); setLocalActivePlanId(null); }}>
              <ArrowLeft size={16} />
              Back
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setBrief(activePlan.brief);
                setSelectedGoal(activePlan.goal || null);
                setPostDestination(activePlan.postDestination);
                setActiveMode('brief');
              }}
            >
              <RefreshCw size={14} />
              Edit Brief
            </Button>
          </div>
          <Button variant="aurora" onClick={handleApproveAndGenerate}>
            <Sparkles size={16} />
            Approve & Generate
          </Button>
        </div>
      </div>
    );
  };

  // --- Render: Generating Mode ---
  const renderGenerating = () => {
    if (!activePlan) return null;

    const progress = activePlan.generationProgress;
    const isComplete = activePlan.status === 'completed';
    const isFailed = activePlan.status === 'failed';
    const posts = activePlan.plannedPosts.filter((pp) => pp.status !== 'skipped');
    const generatedCount = posts.filter((pp) => pp.status === 'generated').length;
    const totalCount = posts.length;

    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setActiveMode('list'); setLocalActivePlanId(null); }}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isComplete ? 'Plan Complete' : isFailed ? 'Generation Failed' : 'Generating Posts'}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {isComplete
                ? `Successfully generated ${generatedCount} posts`
                : isFailed
                ? activePlan.error || 'An error occurred during generation'
                : `Generating post ${generatedCount + 1} of ${totalCount}...`}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <GlassCard>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Progress</span>
              <span className="text-white font-medium">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${
                  isFailed ? 'bg-critical' : isComplete ? 'bg-success' : 'bg-aurora-neon'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </GlassCard>

        {/* Post Status List */}
        <GlassCard title="Posts">
          <div className="space-y-2">
            {posts.map((pp) => (
              <div key={pp.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                <span className={`w-6 h-6 rounded flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${platformColors[pp.platform]}`}>
                  {platformIcons[pp.platform]}
                </span>
                <span className="flex-1 text-sm text-white truncate">{pp.topic}</span>
                <span className="flex-shrink-0">
                  {pp.status === 'generated' ? (
                    <Check size={16} className="text-success" />
                  ) : pp.status === 'skipped' ? (
                    <X size={16} className="text-critical" />
                  ) : (
                    <Loader2 size={16} className="text-gray-500 animate-spin" />
                  )}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Completion Actions */}
        {(isComplete || isFailed) && (
          <div className="flex items-center justify-center gap-3">
            {isComplete && activePlan.postDestination === 'drafts' && (
              <Button
                variant="primary"
                onClick={() => {
                  window.location.href = '/drafts';
                }}
              >
                <FileText size={16} />
                View in Drafts
              </Button>
            )}
            {isComplete && activePlan.postDestination === 'scheduled' && (
              <Button
                variant="primary"
                onClick={() => {
                  window.location.href = '/calendar';
                }}
              >
                <Calendar size={16} />
                View in Calendar
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => { setActiveMode('list'); setLocalActivePlanId(null); }}
            >
              <Eye size={16} />
              Back to Plans
            </Button>
          </div>
        )}
      </div>
    );
  };

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
          {activeMode === 'list' && renderList()}
          {activeMode === 'brief' && renderBrief()}
          {activeMode === 'review' && renderReview()}
          {activeMode === 'generating' && renderGenerating()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
