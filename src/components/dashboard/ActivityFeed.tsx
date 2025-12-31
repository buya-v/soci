import { useEffect, useRef } from 'react';
import { useSociStore } from '@/store/useSociStore';
import { cn, formatDate } from '@/lib/utils';
import { ActivityLog } from '@/types';
import { Terminal, CheckCircle2, AlertCircle, Info } from 'lucide-react';

const LogItem = ({ log }: { log: ActivityLog }) => {
  const icons = {
    info: <Info className="w-4 h-4 text-blue-400" />,
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    warning: <AlertCircle className="w-4 h-4 text-amber-400" />,
    error: <AlertCircle className="w-4 h-4 text-red-400" />,
  };

  return (
    <div className="flex gap-3 items-start py-2 border-l-2 border-zinc-800 pl-4 relative animate-in slide-in-from-left-2 duration-300 fade-in">
      <div className={cn(
        "absolute -left-[5px] top-3 w-2 h-2 rounded-full",
        log.type === 'success' ? "bg-emerald-500 shadow-glow-success" : 
        log.type === 'warning' ? "bg-amber-500" : "bg-blue-500"
      )} />
      <div className="mt-0.5 shrink-0 opacity-70">{icons[log.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-mono text-zinc-300 break-words">{log.message}</p>
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
          {formatDate(log.timestamp)}
        </span>
      </div>
    </div>
  );
};

export const ActivityFeed = () => {
  const { logs } = useSociStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-surface border border-border rounded-xl h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-border bg-zinc-900/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-muted" />
          <h3 className="text-sm font-semibold text-zinc-200">Live Engine Logs</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-emerald-500 font-mono">Connected</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-sm bg-[#0C0C0E]">
        {logs.length === 0 && (
          <div className="text-zinc-600 text-center py-10 italic">No activity recorded yet...</div>
        )}
        {[...logs].reverse().map((log) => (
          <LogItem key={log.id} log={log} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};