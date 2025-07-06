import React from 'react';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

interface ConnectionStatusProps {
  status: boolean;
  isConnecting?: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ status, isConnecting = false }) => {
  const getStatusInfo = () => {
    if (isConnecting) {
      return {
        icon: <Loader2 className="h-4 w-4 text-yellow-400 animate-spin" />,
        text: 'Connecting...',
        textColor: 'text-yellow-400',
        dotColor: 'bg-yellow-400'
      };
    }
    
    if (status) {
      return {
        icon: <Wifi className="h-4 w-4 text-emerald-400" />,
        text: 'Connected',
        textColor: 'text-emerald-400',
        dotColor: 'bg-emerald-400'
      };
    }
    
    return {
      icon: <WifiOff className="h-4 w-4 text-red-400" />,
      text: 'Disconnected',
      textColor: 'text-red-400',
      dotColor: 'bg-red-400'
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="flex items-center space-x-3 backdrop-blur-sm rounded-lg px-4 py-2 cursor-pointer">
      <div className="flex items-center space-x-2">
        {statusInfo.icon}
        <span className={`text-sm font-medium ${statusInfo.textColor}`}>
          {statusInfo.text}
        </span>
      </div>

      <div className={`h-2 w-2 rounded-full ${statusInfo.dotColor} ${isConnecting ? 'animate-pulse' : status ? 'animate-pulse' : ''}`} />
    </div>
  );
};