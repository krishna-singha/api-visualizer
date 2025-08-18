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
import { ConnectionStatus } from "../components/ConnectionStatus";

const DashBoard = () => {
  const { user } = useAuth();
  const { data: liveData, historyData, setHistoryData, historyMode, connect, disconnect, connectionStatus, isConnecting } = useSocketContext();

  const [selectedRequest, setSelectedRequest] = useState<ApiData | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    method: "",
    status: "",
    search: "",
  });

  // Detect mobile screen
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 1024);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    <div className="flex-1 w-full py-6 sm:py-8 space-y-6 sm:space-y-8">
      <Stats data={filteredRequests} />
      <Filters filters={filters} onFiltersChange={setFilters} />

      <div className="sm:hidden bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-3 md:p-6 shadow-lg w-full">
        <div className="flex items-center gap-2 mb-6">
          <h3 className="text-lg font-semibold text-white">Connection</h3>
          <ConnectionStatus status={connectionStatus} isConnecting={isConnecting} />
        </div>

        <button
          onClick={connectionStatus ? disconnect : connect}
          disabled={isConnecting}
          className={`cursor-pointer w-full py-2 rounded-lg text-sm font-medium transition ${isConnecting
            ? "bg-gray-600 opacity-50 cursor-not-allowed"
            : connectionStatus
              ? "bg-red-500 hover:bg-red-600"
              : "bg-emerald-500 hover:bg-emerald-600"
            }`}
        >
          {isConnecting ? "Connecting..." : connectionStatus ? "Disconnect" : "Connect"}
        </button>
      </div>

      {/* Responsive layout */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 w-full">
        <div className="w-full lg:w-[28rem] xl:w-[32rem] flex-shrink-0">
          <RequestList
            data={filteredRequests}
            selectedRequest={selectedRequest}
            onSelectRequest={setSelectedRequest}
          />
        </div>

        {/* Request Details inline for desktop */}
        {!isMobile && (
          <div className="flex-1 min-w-0">
            <RequestDetails data={selectedRequest} />
          </div>
        )}
      </div>

      {/* Request Details Modal for mobile */}
      {isMobile && selectedRequest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black/80"
          onClick={() => setSelectedRequest(null)}
        >
          <div
            className="rounded-xl shadow-lg max-w-3xl w-full p-2 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-right absolute top-6 right-4 z-10">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white"
              >
                Close
              </button>
            </div>
            <RequestDetails data={selectedRequest} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashBoard;
