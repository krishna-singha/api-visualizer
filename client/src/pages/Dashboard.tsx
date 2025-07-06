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
        // If history mode is disabled, clear any existing history data
        if (!historyMode) {
          setHistoryData([]);
        }
        return;
      }

      try {
        const res = await axios.get(`/api/request-log/get/${user.uid}`);
        if (res.data?.status && Array.isArray(res.data.data)) {
          const reversed = [...res.data.data].reverse();
          setHistoryData(reversed);
        }
      } catch (error) {
        console.error("❌ Failed to load request history:", error);
      }
    };

    fetchHistory();
  }, [user?.uid, setHistoryData, historyMode]);

  // Combine history and live data (remove duplicates by ID)
  const combinedData = useMemo(() => {
    const seen = new Set();
    // Only include history data if history mode is enabled
    const dataToMerge = historyMode ? [...liveData, ...historyData] : [...liveData];
    const merged = dataToMerge.filter((item) => {
      if (seen.has(item.timestamp)) return false;
      seen.add(item.timestamp);
      return true;
    });
    return merged;
  }, [liveData, historyData, historyMode]);


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

      return true;
    });
  }, [combinedData, filters]);


  // Clear selected request if it was from history data when history is cleared
  useEffect(() => {
    if (selectedRequest && historyData.length === 0 && liveData.length === 0) {
      // If both history and live data are empty, clear the selected request
      setSelectedRequest(null);
    } else if (selectedRequest && historyData.length === 0) {
      // Check if the selected request exists in live data
      const existsInLiveData = liveData.some(request => request.timestamp === selectedRequest.timestamp);
      if (!existsInLiveData) {
        setSelectedRequest(null);
      }
    }
  }, [historyData, liveData, selectedRequest]);

  return (
    <div className="space-y-8 py-8 w-full">
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
