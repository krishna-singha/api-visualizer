import React, { useState } from 'react';
import { Clock, HardDrive, Monitor, Globe, Eye, EyeOff } from 'lucide-react';
import type { ApiData } from '../lib/parseToApiData';
import { StatusBadge } from './StatusBadge';
import { MethodBadge } from './MethodBadge';

interface Props {
  data: ApiData[];
  selectedRequest: ApiData | null;
  onSelectRequest: (request: ApiData) => void;
}

export const RequestList: React.FC<Props> = ({ data, selectedRequest, onSelectRequest }) => {
  const [showOptions, setShowOptions] = useState(false);

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });

  const formatTime = (timestamp: number) =>
    new Date(timestamp).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDuration = (ms: number) => (ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Monitor className="h-5 w-5 text-blue-400" />
          <span>Live Requests</span>
          <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-medium">
            {data.length}
          </span>
        </h2>

        {/* Toggle Button */}
        <button
          onClick={() => setShowOptions((prev) => !prev)}
          className={`cursor-pointer flex items-center space-x-1 text-xs font-medium px-3 py-1 rounded-full transition-all duration-150
            ${showOptions ? 'bg-pink-600/20 text-pink-400 hover:bg-pink-600/30' : 'bg-green-600/20 text-green-400 hover:bg-green-600/30'}`}
        >
          {showOptions ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          <span>{showOptions ? 'Showing OPTIONS' : 'Hiding OPTIONS'}</span>
        </button>
      </div>

      {/* List */}
      <div className="min-h-80 max-h-[20rem] sm:max-h-[30rem] overflow-y-auto">
        {data.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No requests yet. Waiting for API calls...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-[0.1rem] bg-gray-700/50">
            {data
              .filter((request) => showOptions || request.method !== 'OPTIONS')
              .map((request) => (
                <div
                  key={request.timestamp}
                  onClick={() => onSelectRequest(request)}
                  className={`p-4 cursor-pointer transition-all duration-200 hover:bg-gray-700/30 ${
                    selectedRequest?.timestamp === request.timestamp
                      ? 'bg-blue-500/10 border-r-2 border-blue-400'
                      : 'bg-gray-800/50'
                  }`}
                >
                  {/* Top Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-3">
                      <MethodBadge method={request.method} />
                      <StatusBadge status={request.status} />
                    </div>
                    <div className="flex flex-col items-end text-xs text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(request.timestamp)}</span>
                      </div>
                      <span className="text-[10px] text-gray-500">
                        {formatDate(request.timestamp)}
                      </span>
                    </div>
                  </div>

                  {/* URL */}
                  <div className="flex items-start space-x-2 mb-2">
                    <Globe className="h-4 w-4 text-gray-400 flex-shrink-0 mt-[2px]" />
                    <span className="text-sm text-gray-300 break-all md:truncate">
                      {request.fullUrl}
                    </span>
                  </div>

                  {/* Bottom Row */}
                  <div className="flex flex-wrap items-center justify-between text-xs text-gray-400 gap-2">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDuration(request.duration)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <HardDrive className="h-3 w-3" />
                        <span>{formatBytes(request.size.total)}</span>
                      </div>
                    </div>
                    <div className="text-gray-500 break-words">{request.meta.ip}</div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};
