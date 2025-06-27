import React from 'react';
import { Clock, HardDrive, Monitor, Globe } from 'lucide-react';
import type { ApiData } from '../context/SocketContext';
import { StatusBadge } from './StatusBadge';
import { MethodBadge } from './MethodBadge';

interface Props {
  data: ApiData[];
  selectedRequest: ApiData | null;
  onSelectRequest: (request: ApiData) => void;
}

export const RequestList: React.FC<Props> = ({ data, selectedRequest, onSelectRequest }) => {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
      <div className="p-4 border-b border-gray-700/50">
        <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Monitor className="h-5 w-5 text-blue-400" />
          <span>Live Requests</span>
          <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-medium">
            {data.length}
          </span>
        </h2>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {data.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No requests yet. Waiting for API calls...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-[0.1rem] bg-gray-700/50">
            {data.map((request) => (
              <div
                key={request.id}
                onClick={() => onSelectRequest(request)}
                className={`p-4 cursor-pointer transition-all duration-200 hover:bg-gray-700/30 ${
                  selectedRequest?.id === request.id ? 'bg-blue-500/10 border-r-2 border-blue-400' : 'bg-gray-800/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <MethodBadge method={request.method} />
                    <StatusBadge status={request.status} />
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(request.timestamp)}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mb-2">
                  <Globe className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-300 truncate">http://localhost:3000{request.route}</span>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatDuration(request.duration)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <HardDrive className="h-3 w-3" />
                      <span>{formatBytes(request.size.total)}</span>
                    </div>
                  </div>
                  <div className="text-gray-500">
                    {request.meta.ip} 
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};