import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';

interface ConnectionStatusProps {
  status: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ status }) => {

  return (
    <div className="flex items-center space-x-3 backdrop-blur-sm rounded-lg px-4 py-2 cursor-pointer">
      <div className="flex items-center space-x-2">
        {status ? (
          <Wifi className="h-4 w-4 text-emerald-400" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-400" />
        )}
        <span className={`text-sm font-medium ${status ? 'text-emerald-400' : 'text-red-400'}`}>
          {status ? 'Connected' : 'Disconnected'}
        </span>
      </div>


      <div className={`h-2 w-2 rounded-full ${status ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`} />
    </div>
  );
};