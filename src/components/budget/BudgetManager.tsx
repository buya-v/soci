import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  Target,
  Users,
  Zap,
  BarChart3,
  Settings,
  Sparkles,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CreditCard,
  Megaphone,
  Palette,
  LineChart,
  Shield,
  Check,
  ChevronDown,
  Info,
  RefreshCw,
  Plus,
  X,
  Trash2,
  Receipt,
  Calendar,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/store/useAppStore';
import type { BudgetCategory, BudgetConfig } from '@/types';

const categoryConfig: Record<BudgetCategory, { label: string; icon: React.ReactNode; color: string; description: string }> = {
  content_boost: {
    label: 'Content Boost',
    icon: <Zap size={16} />,
    color: 'text-primary bg-primary/10',
    description: 'Boost posts for higher visibility and engagement',
  },
  ad_campaigns: {
    label: 'Ad Campaigns',
    icon: <Megaphone size={16} />,
    color: 'text-accent-purple bg-accent-purple/10',
    description: 'Run targeted advertising campaigns',
  },
  influencer_collab: {
    label: 'Influencer Collaborations',
    icon: <Users size={16} />,
    color: 'text-accent-pink bg-accent-pink/10',
    description: 'Partner with influencers in your niche',
  },
  tools_software: {
    label: 'Tools & Software',
    icon: <Settings size={16} />,
    color: 'text-info bg-info/10',
    description: 'Premium tools and platform subscriptions',
  },
  content_creation: {
    label: 'Content Creation',
    icon: <Palette size={16} />,
    color: 'text-success bg-success/10',
    description: 'Professional content, graphics, and media',
  },
  analytics_insights: {
    label: 'Analytics & Insights',
    icon: <LineChart size={16} />,
    color: 'text-warning bg-warning/10',
    description: 'Advanced analytics and market research',
  },
  reserve: {
    label: 'Reserve Fund',
    icon: <Shield size={16} />,
    color: 'text-gray-400 bg-gray-400/10',
    description: 'Emergency and opportunity reserve',
  },
};

const optimizationModes: { mode: BudgetConfig['optimizationMode']; label: string; icon: React.ReactNode; description: string }[] = [
  {
    mode: 'balanced',
    label: 'Balanced',
    icon: <PieChart size={18} />,
    description: 'Even distribution for steady growth',
  },
  {
    mode: 'growth',
    label: 'Growth Focus',
    icon: <TrendingUp size={18} />,
    description: 'Maximize follower acquisition',
  },
  {
    mode: 'engagement',
    label: 'Engagement Focus',
    icon: <Target size={18} />,
    description: 'Boost interactions and community',
  },
  {
    mode: 'reach',
    label: 'Reach Focus',
    icon: <Megaphone size={18} />,
    description: 'Maximize content visibility',
  },
];

const currencySymbols: Record<BudgetConfig['currency'], string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export function BudgetManager() {
  const {
    budgetConfig,
    budgetSpends,
    setMonthlyBudget,
    updateAllocation,
    optimizeBudget,
    setBudgetConfig,
    addNotification,
    addActivity,
    addBudgetSpend,
    deleteBudgetSpend,
  } = useAppStore();

  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(budgetConfig.monthlyBudget.toString());
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showSpendingModal, setShowSpendingModal] = useState(false);
  const [newSpend, setNewSpend] = useState({
    category: 'content_boost' as BudgetCategory,
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const currencySymbol = currencySymbols[budgetConfig.currency];

  // Calculate spent amounts per category this month
  const currentMonthSpends = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    return budgetSpends.filter((s) => s.date >= monthStart);
  }, [budgetSpends]);

  const spentByCategory = useMemo(() => {
    return currentMonthSpends.reduce(
      (acc, spend) => {
        acc[spend.category] = (acc[spend.category] || 0) + spend.amount;
        return acc;
      },
      {} as Record<BudgetCategory, number>
    );
  }, [currentMonthSpends]);

  const totalSpent = useMemo(() => {
    return Object.values(spentByCategory).reduce((sum, val) => sum + val, 0);
  }, [spentByCategory]);

  const remainingBudget = budgetConfig.monthlyBudget - totalSpent;
  const spentPercentage = budgetConfig.monthlyBudget > 0 ? (totalSpent / budgetConfig.monthlyBudget) * 100 : 0;

  // Handle adding new spend
  const handleAddSpend = () => {
    const amount = parseFloat(newSpend.amount);
    if (!amount || amount <= 0) {
      addNotification({
        type: 'error',
        title: 'Invalid Amount',
        message: 'Please enter a valid amount',
      });
      return;
    }

    const spend = {
      id: crypto.randomUUID(),
      category: newSpend.category,
      amount,
      description: newSpend.description || categoryConfig[newSpend.category].label,
      date: newSpend.date,
    };

    addBudgetSpend(spend);
    addNotification({
      type: 'success',
      title: 'Expense Logged',
      message: `${currencySymbol}${amount.toLocaleString()} added to ${categoryConfig[newSpend.category].label}`,
    });
    addActivity({
      id: crypto.randomUUID(),
      action: 'Expense Logged',
      description: `${currencySymbol}${amount.toLocaleString()} spent on ${categoryConfig[newSpend.category].label}`,
      timestamp: new Date().toISOString(),
      status: 'success',
    });

    // Reset form
    setNewSpend({
      category: 'content_boost',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
    setShowSpendingModal(false);
  };

  // Handle deleting a spend
  const handleDeleteSpend = (id: string, spend: (typeof budgetSpends)[0]) => {
    deleteBudgetSpend(id);
    addNotification({
      type: 'info',
      title: 'Expense Removed',
      message: `${currencySymbol}${spend.amount.toLocaleString()} removed from records`,
    });
  };

  // Handle budget update
  const handleBudgetSave = () => {
    const amount = parseFloat(tempBudget) || 0;
    setMonthlyBudget(amount);
    setIsEditingBudget(false);
    addNotification({
      type: 'success',
      title: 'Budget Updated',
      message: `Monthly budget set to ${currencySymbol}${amount.toLocaleString()}`,
    });
    addActivity({
      id: crypto.randomUUID(),
      action: 'Budget Updated',
      description: `Monthly budget set to ${currencySymbol}${amount.toLocaleString()}`,
      timestamp: new Date().toISOString(),
      status: 'success',
    });
  };

  // Handle optimization mode change
  const handleOptimize = (mode: BudgetConfig['optimizationMode']) => {
    optimizeBudget(mode);
    addNotification({
      type: 'success',
      title: 'Budget Optimized',
      message: `Allocations adjusted for ${mode} strategy`,
    });
    addActivity({
      id: crypto.randomUUID(),
      action: 'Budget Optimized',
      description: `Budget strategy changed to ${mode} mode`,
      timestamp: new Date().toISOString(),
      status: 'success',
    });
  };

  // Handle currency change
  const handleCurrencyChange = (currency: BudgetConfig['currency']) => {
    setBudgetConfig({ currency });
    setShowCurrencyDropdown(false);
  };

  // Handle allocation slider change
  const handleAllocationChange = (category: BudgetCategory, value: number) => {
    updateAllocation(category, value);
  };

  // Calculate projected ROI based on allocations
  const projectedROI = useMemo(() => {
    const roiMultipliers: Record<BudgetCategory, number> = {
      content_boost: 2.5,
      ad_campaigns: 3.0,
      influencer_collab: 4.0,
      tools_software: 1.5,
      content_creation: 2.0,
      analytics_insights: 1.8,
      reserve: 0,
    };

    let totalROI = 0;
    budgetConfig.allocations.forEach((alloc) => {
      totalROI += alloc.amount * roiMultipliers[alloc.category];
    });

    return totalROI;
  }, [budgetConfig.allocations]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold gradient-text mb-2">Budget Manager</h1>
          <p className="text-gray-400 text-sm lg:text-base">
            SOCI optimizes your budget for maximum growth efficiency
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Log Expense Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowSpendingModal(true)}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Log Expense
          </Button>
          {/* Currency Selector */}
          <div className="relative">
            <button
              onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-glass-border rounded-xl hover:border-primary/30 transition-colors"
            >
              <span className="text-sm font-medium text-white">{budgetConfig.currency}</span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
            <AnimatePresence>
              {showCurrencyDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowCurrencyDropdown(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-24 bg-surface border border-glass-border rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    {(['USD', 'EUR', 'GBP'] as const).map((curr) => (
                      <button
                        key={curr}
                        onClick={() => handleCurrencyChange(curr)}
                        className={`w-full px-3 py-2 text-sm text-left hover:bg-white/5 transition-colors ${
                          budgetConfig.currency === curr ? 'text-primary' : 'text-gray-300'
                        }`}
                      >
                        {currencySymbols[curr]} {curr}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Monthly Budget */}
        <GlassCard className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Wallet size={24} className="text-primary" />
            </div>
            {!isEditingBudget && (
              <button
                onClick={() => {
                  setTempBudget(budgetConfig.monthlyBudget.toString());
                  setIsEditingBudget(true);
                }}
                className="text-xs text-primary hover:text-primary-light transition-colors"
              >
                Edit
              </button>
            )}
          </div>
          <p className="text-gray-400 text-sm mb-1">Monthly Budget</p>
          {isEditingBudget ? (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  value={tempBudget}
                  onChange={(e) => setTempBudget(e.target.value)}
                  className="w-full bg-white/5 border border-primary rounded-lg py-2 pl-8 pr-4 text-white text-lg font-bold focus:outline-none"
                  autoFocus
                />
              </div>
              <Button size="sm" variant="primary" onClick={handleBudgetSave}>
                <Check size={16} />
              </Button>
            </div>
          ) : (
            <p className="text-3xl font-bold text-white">
              {currencySymbol}{budgetConfig.monthlyBudget.toLocaleString()}
            </p>
          )}
        </GlassCard>

        {/* Spent This Month */}
        <GlassCard className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-accent-purple/10">
              <CreditCard size={24} className="text-accent-purple" />
            </div>
            <div className={`flex items-center gap-1 text-sm ${spentPercentage > 80 ? 'text-warning' : 'text-success'}`}>
              {spentPercentage > 50 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              <span>{spentPercentage.toFixed(0)}%</span>
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-1">Spent This Month</p>
          <p className="text-3xl font-bold text-white">
            {currencySymbol}{totalSpent.toLocaleString()}
          </p>
          <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                spentPercentage > 90 ? 'bg-critical' : spentPercentage > 70 ? 'bg-warning' : 'bg-success'
              }`}
              style={{ width: `${Math.min(spentPercentage, 100)}%` }}
            />
          </div>
        </GlassCard>

        {/* Projected ROI */}
        <GlassCard className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-success/10">
              <BarChart3 size={24} className="text-success" />
            </div>
            <div className="flex items-center gap-1 text-sm text-success">
              <TrendingUp size={16} />
              <span>+{((projectedROI / Math.max(budgetConfig.monthlyBudget, 1) - 1) * 100).toFixed(0)}%</span>
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-1">Projected Returns</p>
          <p className="text-3xl font-bold text-white">
            {currencySymbol}{projectedROI.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-2">Based on current allocation strategy</p>
        </GlassCard>
      </div>

      {/* Optimization Modes */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-white">AI Optimization Strategy</h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Info size={14} />
            SOCI will auto-adjust allocations based on performance
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {optimizationModes.map((opt) => (
            <button
              key={opt.mode}
              onClick={() => handleOptimize(opt.mode)}
              className={`p-4 rounded-xl border text-left transition-all ${
                budgetConfig.optimizationMode === opt.mode
                  ? 'border-primary bg-primary/10'
                  : 'border-glass-border hover:border-primary/30 bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`${budgetConfig.optimizationMode === opt.mode ? 'text-primary' : 'text-gray-400'}`}>
                  {opt.icon}
                </div>
                {budgetConfig.optimizationMode === opt.mode && (
                  <Check size={14} className="text-primary ml-auto" />
                )}
              </div>
              <p className="font-medium text-white text-sm">{opt.label}</p>
              <p className="text-xs text-gray-500 mt-1">{opt.description}</p>
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Budget Allocations */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <PieChart size={20} className="text-accent-purple" />
            <h3 className="text-lg font-semibold text-white">Budget Allocations</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOptimize(budgetConfig.optimizationMode)}
            className="text-primary"
          >
            <RefreshCw size={14} className="mr-1" />
            Reset to Defaults
          </Button>
        </div>

        <div className="space-y-4">
          {budgetConfig.allocations.map((allocation) => {
            const config = categoryConfig[allocation.category];
            const spent = spentByCategory[allocation.category] || 0;
            const spentPct = allocation.amount > 0 ? (spent / allocation.amount) * 100 : 0;

            return (
              <div key={allocation.category} className="p-4 bg-white/5 rounded-xl">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${config.color}`}>{config.icon}</div>
                    <div>
                      <p className="font-medium text-white">{config.label}</p>
                      <p className="text-xs text-gray-500">{config.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">
                      {currencySymbol}{allocation.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">{allocation.percentage}% of budget</p>
                  </div>
                </div>

                {/* Allocation Slider */}
                <div className="relative mb-2">
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={allocation.percentage}
                    onChange={(e) => handleAllocationChange(allocation.category, parseInt(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:w-4
                      [&::-webkit-slider-thumb]:h-4
                      [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:bg-primary
                      [&::-webkit-slider-thumb]:cursor-pointer
                      [&::-webkit-slider-thumb]:transition-transform
                      [&::-webkit-slider-thumb]:hover:scale-110"
                  />
                </div>

                {/* Spent Progress */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    Spent: {currencySymbol}{spent.toLocaleString()} ({spentPct.toFixed(0)}%)
                  </span>
                  <span className={allocation.priority === 'high' ? 'text-primary' : allocation.priority === 'medium' ? 'text-warning' : 'text-gray-400'}>
                    {allocation.priority.charAt(0).toUpperCase() + allocation.priority.slice(1)} Priority
                  </span>
                </div>

                {/* Spent Bar */}
                <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      spentPct > 90 ? 'bg-critical' : spentPct > 70 ? 'bg-warning' : 'bg-success'
                    }`}
                    style={{ width: `${Math.min(spentPct, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Total Check */}
        {budgetConfig.allocations.reduce((sum, a) => sum + a.percentage, 0) !== 100 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-warning/10 border border-warning/30 rounded-xl flex items-center gap-2 text-warning"
          >
            <Info size={16} />
            <span className="text-sm">
              Allocations total {budgetConfig.allocations.reduce((sum, a) => sum + a.percentage, 0)}%.
              Adjust to reach 100% for optimal budget distribution.
            </span>
          </motion.div>
        )}
      </GlassCard>

      {/* AI Recommendations */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={20} className="text-warning" />
          <h3 className="text-lg font-semibold text-white">SOCI Recommendations</h3>
        </div>
        <div className="space-y-3">
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp size={16} className="text-primary" />
              </div>
              <div>
                <p className="font-medium text-white">Increase Content Boost Budget</p>
                <p className="text-sm text-gray-400 mt-1">
                  Your engagement rate is above average. Boosting content could yield 35% more reach this month.
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-success/5 border border-success/20 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Users size={16} className="text-success" />
              </div>
              <div>
                <p className="font-medium text-white">Consider Influencer Partnerships</p>
                <p className="text-sm text-gray-400 mt-1">
                  Based on your niche, micro-influencer collaborations could provide 4x ROI on investment.
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-white/5 border border-glass-border rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-gray-400/10">
                <Shield size={16} className="text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-white">Maintain Reserve Fund</p>
                <p className="text-sm text-gray-400 mt-1">
                  Keep at least 5% in reserve for trending opportunities and unexpected viral moments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Recent Transactions */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Receipt size={20} className="text-info" />
            <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Remaining:</span>
            <span className={remainingBudget < 0 ? 'text-critical font-bold' : 'text-success font-bold'}>
              {currencySymbol}{remainingBudget.toLocaleString()}
            </span>
          </div>
        </div>

        {currentMonthSpends.length === 0 ? (
          <div className="text-center py-8">
            <Receipt size={32} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No expenses logged this month</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3"
              onClick={() => setShowSpendingModal(true)}
            >
              <Plus size={14} className="mr-1" />
              Log Your First Expense
            </Button>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {[...currentMonthSpends]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((spend) => {
                const config = categoryConfig[spend.category];
                return (
                  <motion.div
                    key={spend.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-xl group hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${config.color}`}>
                        {config.icon}
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">{spend.description}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar size={12} />
                          <span>{new Date(spend.date).toLocaleDateString()}</span>
                          <span className="text-gray-600">•</span>
                          <span>{config.label}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white">
                        -{currencySymbol}{spend.amount.toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleDeleteSpend(spend.id, spend)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-critical/20 text-gray-400 hover:text-critical transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        )}
      </GlassCard>

      {/* Spending Tracker Modal */}
      <AnimatePresence>
        {showSpendingModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setShowSpendingModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-surface border border-glass-border rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-glass-border">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Receipt size={18} className="text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Log Expense</h3>
                </div>
                <button
                  onClick={() => setShowSpendingModal(false)}
                  className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 space-y-4">
                {/* Category Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(categoryConfig) as BudgetCategory[]).map((cat) => {
                      const config = categoryConfig[cat];
                      const isSelected = newSpend.category === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => setNewSpend((prev) => ({ ...prev, category: cat }))}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/10'
                              : 'border-glass-border hover:border-primary/30 bg-white/5'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg ${config.color}`}>
                            {config.icon}
                          </div>
                          <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                            {config.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={newSpend.amount}
                      onChange={(e) => setNewSpend((prev) => ({ ...prev, amount: e.target.value }))}
                      className="w-full bg-white/5 border border-glass-border rounded-xl py-3 pl-8 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                {/* Description Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description (optional)</label>
                  <input
                    type="text"
                    placeholder={`e.g., ${categoryConfig[newSpend.category].label}`}
                    value={newSpend.description}
                    onChange={(e) => setNewSpend((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-white/5 border border-glass-border rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                {/* Date Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                  <input
                    type="date"
                    value={newSpend.date}
                    onChange={(e) => setNewSpend((prev) => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-white/5 border border-glass-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center gap-3 p-4 border-t border-glass-border bg-white/5">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setShowSpendingModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleAddSpend}
                >
                  <Plus size={16} className="mr-1" />
                  Add Expense
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* No Budget Warning */}
      {budgetConfig.monthlyBudget === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-6 right-6 p-4 bg-surface border border-primary/30 rounded-2xl shadow-xl max-w-sm"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <DollarSign size={20} className="text-primary" />
            </div>
            <div>
              <p className="font-semibold text-white">Set Your Budget</p>
              <p className="text-sm text-gray-400 mt-1">
                Enter your monthly budget to let SOCI optimize your spending for maximum growth.
              </p>
              <Button
                variant="primary"
                size="sm"
                className="mt-3"
                onClick={() => {
                  setTempBudget('500');
                  setIsEditingBudget(true);
                }}
              >
                Get Started
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
