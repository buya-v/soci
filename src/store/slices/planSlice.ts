import type { PlanSlice, SliceCreator } from '../types';

export const createPlanSlice: SliceCreator<PlanSlice> = (set) => ({
  plans: [],
  activePlanId: null,

  addPlan: (plan) =>
    set((state) => ({
      plans: [plan, ...state.plans].slice(0, 50),
    })),

  updatePlan: (id, updates) =>
    set((state) => ({
      plans: state.plans.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      ),
    })),

  deletePlan: (id) =>
    set((state) => ({
      plans: state.plans.filter((p) => p.id !== id),
      activePlanId: state.activePlanId === id ? null : state.activePlanId,
    })),

  setActivePlan: (id) =>
    set(() => ({
      activePlanId: id,
    })),

  updatePlannedPost: (planId, postId, updates) =>
    set((state) => ({
      plans: state.plans.map((p) =>
        p.id === planId
          ? {
              ...p,
              plannedPosts: p.plannedPosts.map((pp) =>
                pp.id === postId ? { ...pp, ...updates } : pp
              ),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    })),

  updatePlanStatus: (id, status) =>
    set((state) => ({
      plans: state.plans.map((p) => {
        if (p.id !== id) return p;
        const now = new Date().toISOString();
        return {
          ...p,
          status,
          updatedAt: now,
          ...(status === 'approved' ? { approvedAt: now } : {}),
          ...(status === 'completed' ? { completedAt: now } : {}),
        };
      }),
    })),

  addGeneratedPostId: (planId, postId) =>
    set((state) => ({
      plans: state.plans.map((p) =>
        p.id === planId
          ? { ...p, generatedPostIds: [...p.generatedPostIds, postId] }
          : p
      ),
    })),

  updateGenerationProgress: (planId, progress) =>
    set((state) => ({
      plans: state.plans.map((p) =>
        p.id === planId ? { ...p, generationProgress: progress } : p
      ),
    })),
});
