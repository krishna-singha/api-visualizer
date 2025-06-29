import React from 'react';

interface Props {
  method: string;
  className?: string;
}

export const MethodBadge: React.FC<Props> = ({ method, className = '' }) => {
  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'POST':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'PUT':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'DELETE':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'PATCH':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'OPTIONS':
        return 'bg-teal-500/20 text-teal-400 border-teal-500/30';
      case 'HEAD':
        return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
      case 'CONNECT':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'TRACE':
        return 'bg-lime-500/20 text-lime-400 border-lime-500/30';
      default:
        return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    }

  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold border ${getMethodColor(method)} ${className}`}>
      {method}
    </span>
  );
};