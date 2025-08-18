import { useEffect, useMemo, useState } from "react";
import { Stats } from "../components/Stats";
import { Filters } from "../components/Filters";
import { RequestList } from "../components/RequestList";
import { RequestDetails } from "../components/RequestDetails";
import type { FilterOptions } from "../types/api";
import type { ApiData } from "../lib/parseToApiData";
import { useSocketContext } from "../context/SocketContext";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const DashBoard = () => {
  const { user } = useAuth();
  const { data: liveData, historyData, setHistoryData, historyMode } = useSocketContext();

  const [selectedRequest, setSelectedRequest] = useState<ApiData | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    method: "",
    status: "",
    search: "",
  });

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.uid || !historyMode) {
        if (!historyMode) setHistoryData([]);
        return;
      }
      try {
        const res = await axios.get(`/api/request-log/get/${user.uid}`);
        if (res.data?.status && Array.isArray(res.data.data)) {
          const reversed = [...res.data.data].reverse();
          setHistoryData(reversed);
        }
      } catch (error) {
        console.error("Failed to load request history:", error);
      }
    };
    fetchHistory();
  }, [user?.uid, setHistoryData, historyMode]);

  const combinedData = useMemo(() => {
    const seen = new Set();
    const dataToMerge = historyMode ? [...liveData, ...historyData] : [...liveData];
    return dataToMerge.filter((item) => {
      if (seen.has(item.timestamp)) return false;
      seen.add(item.timestamp);
      return true;
    });
  }, [liveData, historyData, historyMode]);

  const filteredRequests = useMemo(() => {
    return combinedData.filter((request) => {
      if (filters.method && request.method !== filters.method) return false;

      if (filters.status) {
        const statusPrefix = request.status.toString().charAt(0);
        if (statusPrefix !== filters.status) return false;
      }

      if (filters.search) {
        const search = filters.search.toLowerCase();
        const inUrl = request.fullUrl.toLowerCase().includes(search);
        const inReq = JSON.stringify(request.request.body || "").toLowerCase().includes(search);
        const inRes = JSON.stringify(request.response.body || "").toLowerCase().includes(search);
        if (!inUrl && !inReq && !inRes) return false;
      }

      return true;
    });
  }, [combinedData, filters]);

  useEffect(() => {
    if (selectedRequest && historyData.length === 0 && liveData.length === 0) {
      setSelectedRequest(null);
    } else if (selectedRequest && historyData.length === 0) {
      const existsInLiveData = liveData.some(
        (request) => request.timestamp === selectedRequest.timestamp
      );
      if (!existsInLiveData) setSelectedRequest(null);
    }
  }, [historyData, liveData, selectedRequest]);

  return (
    <div className="flex-1 w-full py-6 sm:py-8 px-3 sm:px-6 lg:px-10 space-y-6 sm:space-y-8">
      <Stats data={filteredRequests} />
      <Filters filters={filters} onFiltersChange={setFilters} />

      {/* Responsive layout */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 w-full">
        {/* Request List (sidebar) */}
        <div className="w-full lg:w-[28rem] xl:w-[32rem] flex-shrink-0">
          <RequestList
            data={filteredRequests}
            selectedRequest={selectedRequest}
            onSelectRequest={setSelectedRequest}
          />
        </div>

        {/* Request Details (main content) */}
        <div className="flex-1 min-w-0">
          <RequestDetails data={selectedRequest} />
        </div>
      </div>
    </div>
  );
};

export default DashBoard;
