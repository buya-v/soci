import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
}: SkeletonProps) {
  const variantStyles = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={clsx(
        'skeleton',
        variantStyles[variant],
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  );
}

// Pre-built skeleton components for common use cases
export function SkeletonCard() {
  return (
    <div className="glass-panel rounded-xl p-6 border border-glass-border">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton height={16} width="60%" />
          <Skeleton height={12} width="40%" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton height={14} />
        <Skeleton height={14} width="80%" />
        <Skeleton height={14} width="60%" />
      </div>
    </div>
  );
}

export function SkeletonTrendCard() {
  return (
    <div className="glass-panel rounded-xl p-5 border border-glass-border">
      <div className="flex gap-2 mb-3">
        <Skeleton height={20} width={60} className="rounded" />
        <Skeleton height={20} width={80} className="rounded" />
      </div>
      <Skeleton height={24} width="80%" className="mb-2" />
      <Skeleton height={16} width="30%" className="mb-4" />
      <Skeleton height={36} className="rounded-xl" />
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="glass-panel rounded-xl p-6 border border-glass-border">
      <div className="flex items-start justify-between mb-4">
        <Skeleton variant="rectangular" width={48} height={48} className="rounded-xl" />
        <Skeleton width={50} height={20} className="rounded" />
      </div>
      <Skeleton height={14} width="40%" className="mb-2" />
      <Skeleton height={32} width="60%" />
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="glass-panel rounded-xl p-6 border border-glass-border">
      <Skeleton height={20} width="30%" className="mb-4" />
      <div className="h-64 flex items-end gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1"
            height={`${30 + Math.random() * 70}%`}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonActivityItem() {
  return (
    <div className="flex items-center gap-4 py-3">
      <div className="flex-1 space-y-2">
        <Skeleton height={16} width="50%" />
        <Skeleton height={12} width="70%" />
      </div>
      <Skeleton height={24} width={60} className="rounded-md" />
    </div>
  );
}
