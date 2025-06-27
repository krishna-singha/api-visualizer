import React from 'react';
import { Activity, Clock, AlertTriangle, CheckCircle, XCircle, Zap } from 'lucide-react';
// import type { ApiRequest } from '../types/api';
import type { ApiData } from '../hooks/useSocket';

interface Props {
  data: ApiData[];
}

export const Stats: React.FC<Props> = ({ data }) => {
  const totalRequests = data.length;
  const successfulRequests = data.filter(r => r.status >= 200 && r.status < 400).length;
  const errorRequests = data.filter(r => r.status >= 400).length;
  const avgResponseTime = data.length > 0 
    ? Math.round(data.reduce((sum, r) => sum + r.duration, 0) / data.length)
    : 0;

  const recentRequests = data.slice(0, 10);
  const recentAvgTime = recentRequests.length > 0
    ? Math.round(recentRequests.reduce((sum, r) => sum + r.duration, 0) / recentRequests.length)
    : 0;

  const requestsPerMinute = data.filter(r => 
    Date.now() - r.timestamp < 60000
  ).length;

  const stats = [
    {
      icon: Activity,
      label: 'Total Requests',
      value: totalRequests.toString(),
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30',
    },
    {
      icon: CheckCircle,
      label: 'Successful',
      value: successfulRequests.toString(),
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20',
      borderColor: 'border-emerald-500/30',
    },
    {
      icon: XCircle,
      label: 'Errors',
      value: errorRequests.toString(),
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/30',
    },
    {
      icon: Clock,
      label: 'Avg Response',
      value: `${avgResponseTime}ms`,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20',
      borderColor: 'border-amber-500/30',
    },
    {
      icon: Zap,
      label: 'Recent Avg',
      value: `${recentAvgTime}ms`,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500/30',
    },
    {
      icon: AlertTriangle,
      label: 'Requests/min',
      value: requestsPerMinute.toString(),
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      borderColor: 'border-orange-500/30',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
      {stats.map(({ icon: Icon, label, value, color, bgColor, borderColor }) => (
        <div key={label} className={`${bgColor} backdrop-blur-sm rounded-xl border ${borderColor} p-4 transition-all duration-200 hover:scale-105`}>
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
};