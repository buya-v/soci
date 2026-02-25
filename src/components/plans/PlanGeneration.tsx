import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  X,
  Calendar,
  FileText,
  Loader2,
  Eye,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/store/useAppStore';
import { VIEW_TO_PATH } from '@/routes';
import { platformIcons, platformColors } from './MarketingPlanner';

interface PlanGenerationProps {
  planId: string;
  onBack: () => void;
}

export function PlanGeneration({ planId, onBack }: PlanGenerationProps) {
  const navigate = useNavigate();
  const plan = useAppStore((s) => s.plans.find((p) => p.id === planId)) || null;

  if (!plan) return null;

  const progress = plan.generationProgress;
  const isComplete = plan.status === 'completed';
  const isFailed = plan.status === 'failed';
  const posts = plan.plannedPosts.filter((pp) => pp.status !== 'skipped');
  const generatedCount = posts.filter((pp) => pp.status === 'generated').length;
  const totalCount = posts.length;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
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
              ? plan.error || 'An error occurred during generation'
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
          {isComplete && plan.postDestination === 'drafts' && (
            <Button
              variant="primary"
              onClick={() => navigate(VIEW_TO_PATH['drafts'])}
            >
              <FileText size={16} />
              View in Drafts
            </Button>
          )}
          {isComplete && plan.postDestination === 'scheduled' && (
            <Button
              variant="primary"
              onClick={() => navigate(VIEW_TO_PATH['calendar'])}
            >
              <Calendar size={16} />
              View in Calendar
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={onBack}
          >
            <Eye size={16} />
            Back to Plans
          </Button>
        </div>
      )}
    </div>
  );
}
