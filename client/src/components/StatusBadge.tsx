import React from 'react';

interface Props {
  status: number;
  className?: string;
}

export const StatusBadge: React.FC<Props> = ({ status, className = '' }) => {
  const getStatusColor = (status: number) => {
    if (status >= 100 && status < 200) {
      return 'bg-sky-500/20 text-sky-400 border-sky-500/30'; // Informational
    }
    if (status >= 200 && status < 300) {
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'; // Success
    }
    if (status >= 300 && status < 400) {
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30'; // Redirect
    }
    if (status >= 400 && status < 500) {
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30'; // Client error
    }
    if (status >= 500 && status < 600) {
      return 'bg-rose-500/20 text-rose-400 border-rose-500/30'; // Server error
    }
    return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'; // Unknown/fallback
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(status)} ${className}`}
    >
      {status}
    </span>
  );
};
