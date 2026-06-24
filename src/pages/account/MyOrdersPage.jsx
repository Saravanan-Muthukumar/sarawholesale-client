import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  Filter,
  Loader2,
  PackageSearch,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function MyOrdersPage() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All Orders");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const filters = [
    "All Orders",
    "Pending Approval",
    "Approved",
    "Invoiced",
    "Dispatched",
    "Delivered",
    "Cancelled",
  ];

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_URL}/api/orders/my-orders`, {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load orders");
      }

      setOrders(data);
    } catch (err) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";

    return new Date(dateValue).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatStatus = (status) => {
    const statusMap = {
      REQUEST_SUBMITTED: "Pending Approval",
      PENDING_APPROVAL: "Pending Approval",
      APPROVED: "Approved",
      INVOICED: "Invoiced",
      DISPATCHED: "Dispatched",
      DELIVERED: "Delivered",
      CANCELLED: "Cancelled",
    };

    return statusMap[status] || status || "Pending Approval";
  };

  const filteredOrders =
    activeFilter === "All Orders"
      ? orders
      : orders.filter((order) => formatStatus(order.status) === activeFilter);

  return (
    <div className="w-full min-w-0">
      <div className="bg-white border border-[#edf1f7] rounded-xl p-4 md:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#071b3a]">
              My Orders
            </h1>

            <p className="text-sm text-[#071b3a]/70 mt-1">
              View your order history and track order status.
            </p>
          </div>

          <div className="relative">
          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className="h-9 px-2.5 border border-[#e5eaf2] rounded-lg bg-white text-xs md:text-sm font-semibold text-[#071b3a] flex items-center gap-1.5 hover:bg-gray-50 whitespace-nowrap"
            type="button"
          >
              <Filter size={14} />
                <span className="max-w-30 truncate">
                  {activeFilter}
                </span>
                <ChevronDown size={14} />
            </button>

            {showFilters && (
              <div className="absolute right-0 z-30 mt-2 w-56 bg-white border border-[#edf1f7] rounded-xl shadow-lg overflow-hidden">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      setActiveFilter(filter);
                      setShowFilters(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 ${
                      activeFilter === filter
                        ? "bg-green-50 text-green-700 font-bold"
                        : "text-[#071b3a] font-semibold"
                    }`}
                    type="button"
                  >
                    {filter}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {loading && (
          <div className="mt-8 flex items-center gap-2 text-sm text-[#071b3a]/70">
            <Loader2 size={18} className="animate-spin" />
            Loading orders...
          </div>
        )}

        {error && !loading && (
          <div className="mt-6 border border-red-100 bg-red-50 text-red-700 rounded-xl p-4 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && filteredOrders.length === 0 && (
          <div className="mt-6 border border-[#edf1f7] rounded-xl p-8 text-center bg-gray-50">
            <PackageSearch size={34} className="mx-auto text-[#071b3a]/40 mb-3" />

            <p className="font-bold text-[#071b3a] mb-2">No orders found</p>

            <p className="text-sm text-[#071b3a]/70 mb-4">
              Your submitted order requests will appear here.
            </p>

            <button
              onClick={() => navigate("/")}
              className="h-10 px-5 bg-green-700 text-white rounded-lg font-bold text-sm hover:bg-green-800"
              type="button"
            >
              Continue Shopping
            </button>
          </div>
        )}

        {!loading && !error && filteredOrders.length > 0 && (
          <div className="mt-5 space-y-3">
            {filteredOrders.map((order) => (
              <button
                key={order.order_request_id}
                onClick={() => navigate(`/orders/${order.order_request_number}`)}
                className="w-full border border-[#edf1f7] rounded-xl p-4 bg-white hover:bg-gray-50 text-left"
                type="button"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-[#071b3a] text-sm break-all">
                      {order.order_request_number}
                    </p>

                    <p className="text-xs text-[#071b3a]/60 mt-1">
                      {formatDate(order.created_at)} • {order.item_count} items
                    </p>
                  </div>

                  <ChevronRight size={18} className="shrink-0 text-[#071b3a]/50" />
                </div>

                <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-[#edf1f7]">
                  <StatusBadge status={formatStatus(order.status)} />

                  <p className="text-lg font-bold text-green-700">
                    £{Number(order.subtotal || 0).toFixed(2)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    "Pending Approval": "bg-yellow-100 text-yellow-700",
    Approved: "bg-green-100 text-green-700",
    Invoiced: "bg-blue-100 text-blue-700",
    Dispatched: "bg-purple-100 text-purple-700",
    Delivered: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-md text-xs font-semibold ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}