import { useEffect, useMemo, useState } from "react";
import { Stats } from "../components/Stats";
import { Filters } from "../components/Filters";
import { RequestList } from "../components/RequestList";
import { RequestDetails } from "../components/RequestDetails";
import type { FilterOptions } from "../types/api";
import type { ApiData } from "../context/SocketContext";
import { useSocketContext } from "../context/SocketContext";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const DashBoard = () => {
  const { user } = useAuth();
  const { data: liveData } = useSocketContext();

  const [selectedRequest, setSelectedRequest] = useState<ApiData | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    method: "",
    status: "",
    search: "",
    timeRange: "all",
  });

  const [historyData, setHistoryData] = useState<ApiData[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.uid) return;

      try {
        const res = await axios.get(`/api/request-log/get/${user.uid}`);
        if (res.data?.status && Array.isArray(res.data.data)) {
          const transformed = res.data.data.map((entry: any) => ({
            ...entry.data,
            timestamp: new Date(entry.createdAt).getTime(),
            timestampString: new Date(entry.createdAt).toLocaleString(),
          })) as ApiData[];
          setHistoryData(transformed.reverse());
        }
      } catch (error) {
        console.error("❌ Failed to load request history:", error);
      }
    };

    fetchHistory();
  }, [user?.uid]);

  // Combine history and live data (remove duplicates by ID)
  const combinedData = useMemo(() => {
    const seen = new Set();
    const merged = [...liveData, ...historyData].filter((item) => {
      if (seen.has(item.timestamp)) return false;
      seen.add(item.timestamp);
      return true;
    });
    return merged;
  }, [liveData, historyData]);

  const filteredRequests = useMemo(() => {
    return combinedData.filter((request) => {
      // Method filter
      if (filters.method && request.method !== filters.method) return false;

      // Status filter
      if (filters.status) {
        const statusPrefix = request.status.toString().charAt(0);
        if (statusPrefix !== filters.status) return false;
      }

      // Search filter
      if (filters.search) {
        const search = filters.search.toLowerCase();
        const inUrl = request.fullUrl.toLowerCase().includes(search);
        const inReq = JSON.stringify(request.request.body || "").toLowerCase().includes(search);
        const inRes = JSON.stringify(request.response.body || "").toLowerCase().includes(search);
        if (!inUrl && !inReq && !inRes) return false;
      }

      // Time range filter
      if (filters.timeRange && filters.timeRange !== "all") {
        const now = Date.now();
        const threshold = {
          "1h": now - 60 * 60 * 1000,
          "24h": now - 24 * 60 * 60 * 1000,
          "7d": now - 7 * 24 * 60 * 60 * 1000,
        }[filters.timeRange];
        if (threshold && request.timestamp < threshold) return false;
      }

      return true;
    });
  }, [combinedData, filters]);

  return (
    <div className="space-y-8 pb-8 w-full">
      <Stats data={filteredRequests} />
      <Filters filters={filters} onFiltersChange={setFilters} />
      <div className="flex gap-8 w-full">
        <div className="w-[35rem] flex-shrink-0">
          <RequestList
            data={filteredRequests}
            selectedRequest={selectedRequest}
            onSelectRequest={setSelectedRequest}
          />
        </div>

        <div className="flex-1 min-w-[0]">
          <div className="w-full max-w-full">
            <RequestDetails data={selectedRequest} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashBoard;
