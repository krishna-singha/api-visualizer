import React, { useState } from 'react';
import { Globe, Clock, HardDrive, User, Code, FileText } from 'lucide-react';
import type { ApiData } from '../lib/parseToApiData';
import { StatusBadge } from './StatusBadge';
import { MethodBadge } from './MethodBadge';
import { ResponseBody } from './ResponseBody';
import { RequestBody } from './RequestBody';

interface Props {
  data: ApiData | null;
}

export const RequestDetails: React.FC<Props> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'authorization' | 'query' | 'headers' | 'request' | 'response'>('overview');

  if (!data) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-8 text-center">
        <Code className="h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50" />
        <p className="text-gray-400 text-lg">Select a request to view details</p>
        <p className="text-gray-500 text-sm mt-2">Choose any request from the list to inspect its details</p>
      </div>
    );
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Globe },
    { id: 'query', label: 'Query', icon: Code },
    { id: 'authorization', label: 'Authorization', icon: User },
    { id: 'headers', label: 'Headers', icon: FileText },
    { id: 'request', label: 'Request', icon: Code },
    { id: 'response', label: 'Response', icon: Code },
  ];

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Globe className="h-5 w-5 text-blue-400" />
            <span>Request Details</span>
          </h2>
          <div className="flex items-center space-x-2">
            <MethodBadge method={data.method} />
            <StatusBadge status={data.status} />
          </div>
        </div>

        <div className="flex space-x-1 justify-between bg-gray-700/30 rounded-lg p-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`cursor-pointer flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === id
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-600/30'
                }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 min-h-96 max-h-[30rem] overflow-y-auto">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Request URL */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Request URL</h3>
              <div className="flex space-x-2 text-blue-400 font-mono text-sm break-all">
                <Globe className="h-4 w-4 flex-shrink-0" />
                <span>{data.fullUrl}</span>
              </div>
            </div>

            {/* Timing and Size */}
            <div className="grid grid-cols-3 gap-4">
              {/* Duration */}
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Timing</span>
                </h3>
                <p className="text-white font-mono">{formatDuration(data.duration)}</p>
                <p className="text-xs text-gray-400 mt-1">{formatTime(data.timestamp)}</p>
              </div>

              {/* Request Size */}
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2">
                  <HardDrive className="h-4 w-4" />
                  <span>Request Size</span>
                </h3>
                <p className="text-white font-mono">{formatBytes(data.size.request)}</p>
                <p className="text-xs text-gray-400 mt-1">Request body</p>
              </div>

              {/* Response Size */}
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2">
                  <HardDrive className="h-4 w-4" />
                  <span>Response Size</span>
                </h3>
                <p className="text-white font-mono">{formatBytes(data.size.response)}</p>
                <p className="text-xs text-gray-400 mt-1">Response body</p>
              </div>
            </div>

            {/* Client Info */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Client Info</span>
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">IP Address:</span>
                  <span className="text-white font-mono">{data.meta.ip}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">User Agent:</span>
                  <span className="text-white font-mono ">{data.meta.userAgent?.slice(0, 40)}...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'query' && (
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-gray-300">Query Parameters</h3>
            {Object.keys(data.queryParams || {}).length > 0 ? (
              <div className="bg-gray-900/50 rounded-lg p-4 font-mono text-sm">
                {Object.entries(data.queryParams || {}).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex gap-4 py-2 border-b border-gray-700/30 last:border-0"
                  >
                    <span className="text-blue-400 max-w-1/3 break-all">{key} :</span>
                    <span className="text-gray-300 break-all"> {value} </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic">No query parameters found</p>
            )}
          </div>
        )}


        {activeTab === 'authorization' && (
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-gray-300">Authorization</h3>
            <div className="bg-gray-900/50 rounded-lg p-4 font-mono text-sm">
              {data.authorization.hasAuthHeader ? (
                <div className="space-y-1 text-green-300">
                  {typeof data.authorization.parsed === 'object' && data.authorization.parsed !== null ? (
                    Object.entries(data.authorization.parsed).map(([key, value]) => (
                      <div key={key} className="flex gap-2">
                        <span className="text-gray-400">{key} :</span>
                        <span className="break-all">{String(value)}</span>
                      </div>
                    ))
                  ) : (
                    <span>{data.authorization.parsed}</span>
                  )}
                </div>
              ) : (
                <p className="text-gray-400 italic">No authorization details</p>
              )}
            </div>
          </div>
        )}


        {activeTab === 'headers' && (
          <>
            <div className="space-y-4">
              <h3 className="text-xl font-medium text-gray-300">Request Headers</h3>
              <div className="bg-gray-900/50 rounded-lg p-4 font-mono text-sm">
                {Object.entries(data.request.headers).map(([key, value]) => (
                  <div key={key} className="flex gap-4 py-2 border-b border-gray-700/30 last:border-0">
                    <span className="text-blue-400 max-w-1/3">{key} :</span>
                    <span className="text-gray-300 break-all">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <h3 className="text-xl font-medium text-gray-300">Response Headers</h3>
              <div className="bg-gray-900/50 rounded-lg p-4 font-mono text-sm">
                {Object.entries(data.response.headers).map(([key, value]) => (
                  <div key={key} className="flex space-y-2 py-1 border-b border-gray-700/30 last:border-0">
                    <span className="text-blue-400">{key}:</span>
                    <span className="text-gray-300 ml-4 break-all">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'request' && (
          <RequestBody request={data.request} />
        )}


        {activeTab === 'response' && (
          <ResponseBody response={data.response} />
        )}
      </div>
    </div>
  );
};