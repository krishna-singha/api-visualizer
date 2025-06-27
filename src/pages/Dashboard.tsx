import { useMemo, useState } from "react";
import { useSocket } from "../hooks/useSocket";
import { Stats } from "../components/Stats";
import { Filters } from "../components/Filters";
import { RequestList } from "../components/RequestList";
import { RequestDetails } from "../components/RequestDetails";
import type { FilterOptions } from "../types/api";
import type { ApiData } from "../hooks/useSocket";

const DashBoard = () => {
  const { data } = useSocket();
  const [selectedRequest, setSelectedRequest] = useState<ApiData | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    method: '',
    status: '',
    search: '',
    timeRange: 'all',
  });

  const filteredRequests = useMemo(() => {
    return data.filter((request) => {
      // Filter by method
      if (filters.method && request.method !== filters.method) {
        return false;
      }

      // Filter by status category (2xx, 4xx, etc.)
      if (filters.status) {
        const statusPrefix = request.status.toString().charAt(0);
        if (statusPrefix !== filters.status) {
          return false;
        }
      }

      // Filter by search text
      if (filters.search) {
        const search = filters.search.toLowerCase();
        const inUrl = request.fullUrl.toLowerCase().includes(search);
        const inRequestBody = JSON.stringify(request.request.body || '').toLowerCase().includes(search);
        const inResponseBody = JSON.stringify(request.response.body || '').toLowerCase().includes(search);

        if (!inRequestBody && !inResponseBody) {
          return false;
        }
      }

      // Filter by time range
      if (filters.timeRange && filters.timeRange !== 'all') {
        const now = Date.now();
        const timestamp = request.timestamp;

        const threshold = {
          '1h': now - 60 * 60 * 1000,
          '24h': now - 24 * 60 * 60 * 1000,
          '7d': now - 7 * 24 * 60 * 60 * 1000,
        }[filters.timeRange];

        if (threshold && timestamp < threshold) {
          return false;
        }
      }

      return true;
    });
  }, [data, filters]);

  return (
    <div className="space-y-8 pb-8">
      <Stats data={filteredRequests} />

      <Filters filters={filters} onFiltersChange={setFilters} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <RequestList
            data={filteredRequests}
            selectedRequest={selectedRequest}
            onSelectRequest={setSelectedRequest}
          />
        </div>
        <div>
          <RequestDetails data={selectedRequest} />
        </div>
      </div>
    </div>
  );
};

export default DashBoard;
