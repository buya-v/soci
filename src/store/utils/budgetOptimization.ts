import type { BudgetAllocation, BudgetCategory, BudgetConfig } from '@/types';

export const optimizationStrategies: Record<BudgetConfig['optimizationMode'], Record<BudgetCategory, number>> = {
  balanced: {
    content_boost: 30,
    ad_campaigns: 25,
    influencer_collab: 15,
    tools_software: 10,
    content_creation: 10,
    analytics_insights: 5,
    reserve: 5,
  },
  growth: {
    content_boost: 35,
    ad_campaigns: 30,
    influencer_collab: 20,
    tools_software: 5,
    content_creation: 5,
    analytics_insights: 3,
    reserve: 2,
  },
  engagement: {
    content_boost: 40,
    ad_campaigns: 15,
    influencer_collab: 25,
    tools_software: 5,
    content_creation: 8,
    analytics_insights: 5,
    reserve: 2,
  },
  reach: {
    content_boost: 25,
    ad_campaigns: 40,
    influencer_collab: 20,
    tools_software: 5,
    content_creation: 5,
    analytics_insights: 3,
    reserve: 2,
  },
};

export function applyOptimizationStrategy(
  allocations: BudgetAllocation[],
  mode: BudgetConfig['optimizationMode'],
  monthlyBudget: number
): BudgetAllocation[] {
  const strategy = optimizationStrategies[mode];
  return allocations.map((alloc) => ({
    ...alloc,
    percentage: strategy[alloc.category],
    amount: (strategy[alloc.category] / 100) * monthlyBudget,
  }));
}

export function recalculateAllocations(
  allocations: BudgetAllocation[],
  monthlyBudget: number
): BudgetAllocation[] {
  return allocations.map((alloc) => ({
    ...alloc,
    amount: (alloc.percentage / 100) * monthlyBudget,
  }));
}
