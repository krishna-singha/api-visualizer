import React from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  Timer,
  Zap
} from "lucide-react";
import type { ApiData } from "../lib/parseToApiData";

interface Props {
  data: ApiData[];
}

export const Stats: React.FC<Props> = React.memo(({ data }) => {

  const totalRequests = data.length;

  const successful = data.filter((r) => r.status >= 200 && r.status < 300);
  const errors = data.filter((r) => r.status >= 400 && r.status < 600);

  const successPercent = totalRequests
    ? Math.round((successful.length / totalRequests) * 100)
    : 0;

  const errorPercent = totalRequests
    ? Math.round((errors.length / totalRequests) * 100)
    : 0;

  const avgResponseTime =
    totalRequests > 0
      ? Math.round(data.reduce((sum, r) => sum + (r.duration || 0), 0) / totalRequests)
      : 0;

  const median = (arr: number[]) => {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
      : sorted[mid];
  };

  const medianResponse = median(data.map(r => r.duration || 0));

  const slowestRequest = data.reduce(
    (max, r) => (r.duration > max ? r.duration : max),
    0
  );

  const methodCounts: Record<string, number> = {};
  data.forEach(r => {
    const m = r.method.toUpperCase();
    methodCounts[m] = (methodCounts[m] || 0) + 1;
  });

  const mostUsedMethod = Object.entries(methodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

  const stats = [
    {
      icon: CheckCircle,
      label: "Success %",
      value: `${successPercent}%`,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/20",
      borderColor: "border-emerald-500/30",
    },
    {
      icon: XCircle,
      label: "Error %",
      value: `${errorPercent}%`,
      color: "text-rose-400",
      bgColor: "bg-rose-500/20",
      borderColor: "border-rose-500/30",
    },
    {
      icon: Clock,
      label: "Avg Time",
      value: `${avgResponseTime}ms`,
      color: "text-amber-400",
      bgColor: "bg-amber-500/20",
      borderColor: "border-amber-500/30",
    },
    {
      icon: Timer,
      label: "Median Time",
      value: `${medianResponse}ms`,
      color: "text-lime-400",
      bgColor: "bg-lime-500/20",
      borderColor: "border-lime-500/30",
    },
    {
      icon: Timer,
      label: "Slowest",
      value: `${slowestRequest}ms`,
      color: "text-fuchsia-400",
      bgColor: "bg-fuchsia-500/20",
      borderColor: "border-fuchsia-500/30",
    },
    {
      icon: Zap,
      label: "Top Method",
      value: mostUsedMethod,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/20",
      borderColor: "border-cyan-500/30",
    }

  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
      {stats.map(({ icon: Icon, label, value, color, bgColor, borderColor }) => (
        <div
          key={label}
          className={`${bgColor} backdrop-blur-sm rounded-xl border ${borderColor} p-4 transition-all duration-200 hover:scale-105`}
        >
          <div className="flex items-center space-x-3">
            <Icon className={`h-5 w-5 ${color}`} />
            <div>
              <p className={`text-lg font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

Stats.displayName = "Stats";
