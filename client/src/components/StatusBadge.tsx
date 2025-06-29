import React from 'react';

interface Props {
  status: number;
  className?: string;
}

export const StatusBadge: React.FC<Props> = ({ status, className = '' }) => {
  const getStatusColor = (status: number): string => {
    // Informational
    if (status >= 100 && status < 200) {
      return 'bg-blue-400/20 text-blue-300 border-blue-400/30';
    }
    // Success
    if (status >= 200 && status < 300) {
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
    // Redirect
    if (status >= 300 && status < 400) {
      return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    }
    // Client error
    if (status >= 400 && status < 500) {
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
    // Server error
    if (status >= 500 && status < 600) {
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    }

    // Unknown or custom status
    return 'bg-gray-600/20 text-gray-300 border-gray-500/30';
  };


  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(status)} ${className}`}
    >
      {status}
    </span>
  );
};
