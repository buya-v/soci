import type { BudgetSlice, SliceCreator } from '../types';
import { defaultBudgetConfig } from '../defaults';
import { applyOptimizationStrategy, recalculateAllocations } from '../utils/budgetOptimization';

export const createBudgetSlice: SliceCreator<BudgetSlice> = (set) => ({
  budgetConfig: defaultBudgetConfig,
  budgetSpends: [],
  setBudgetConfig: (config) =>
    set((state) => ({
      budgetConfig: { ...state.budgetConfig, ...config },
    })),
  setMonthlyBudget: (amount) =>
    set((state) => ({
      budgetConfig: {
        ...state.budgetConfig,
        monthlyBudget: amount,
        allocations: recalculateAllocations(state.budgetConfig.allocations, amount),
      },
    })),
  updateAllocation: (category, percentage) =>
    set((state) => {
      const newAllocations = state.budgetConfig.allocations.map((alloc) =>
        alloc.category === category
          ? {
              ...alloc,
              percentage,
              amount: (percentage / 100) * state.budgetConfig.monthlyBudget,
            }
          : alloc
      );
      return {
        budgetConfig: {
          ...state.budgetConfig,
          allocations: newAllocations,
        },
      };
    }),
  addBudgetSpend: (spend) =>
    set((state) => ({
      budgetSpends: [spend, ...state.budgetSpends],
    })),
  deleteBudgetSpend: (id) =>
    set((state) => ({
      budgetSpends: state.budgetSpends.filter((s) => s.id !== id),
    })),
  optimizeBudget: (mode) =>
    set((state) => ({
      budgetConfig: {
        ...state.budgetConfig,
        optimizationMode: mode,
        allocations: applyOptimizationStrategy(
          state.budgetConfig.allocations,
          mode,
          state.budgetConfig.monthlyBudget
        ),
      },
    })),
});
