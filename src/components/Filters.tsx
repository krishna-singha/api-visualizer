import React from 'react';
import { Search, Filter } from 'lucide-react';
import type { FilterOptions } from '../types/api';

interface Props {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

export const Filters: React.FC<Props> = ({ filters, onFiltersChange }) => {
  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  const statusRanges = [
    { label: 'All Status', value: '' },
    { label: '2xx Success', value: '2' },
    { label: '3xx Redirect', value: '3' },
    { label: '4xx Client Error', value: '4' },
    { label: '5xx Server Error', value: '5' },
  ];

  // const timeRanges = [
  //   { label: 'All Time', value: 'all' },
  //   { label: 'Last Hour', value: '1h' },
  //   { label: 'Last 24 Hours', value: '24h' },
  //   { label: 'Last 7 Days', value: '7d' },
  // ];

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Filter className="h-5 w-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Filters</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Search */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search URLs..."
            value={filters.search || ''}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
          />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {/* Method Filter */}
          <div>
            <select
              value={filters.method || ''}
              onChange={(e) => onFiltersChange({ ...filters, method: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
            >
              <option value="">All Methods</option>
              {methods.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filters.status || ''}
              onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
            >
              {statusRanges.map(({ label, value }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Time Range Filter */}
        {/* <div>
          <select
            value={filters.timeRange || 'all'}
            onChange={(e) => onFiltersChange({ ...filters, timeRange: e.target.value as FilterOptions['timeRange'] })}
            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
          >
            {timeRanges.map(({ label, value }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div> */}
      </div>
    </div>
  );
};