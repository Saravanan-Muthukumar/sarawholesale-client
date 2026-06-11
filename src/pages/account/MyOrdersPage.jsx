import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function MyOrdersPage() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All Orders");
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
    <div>
      <h1 className="text-2xl font-bold text-[#071b3a]">My Orders</h1>

      <p className="text-sm text-[#071b3a]/70 mt-1">
        View your order history and track order status.
      </p>

      <div className="flex gap-6 overflow-x-auto mt-6 text-sm font-semibold text-[#071b3a]">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`pb-3 whitespace-nowrap cursor-pointer ${
              activeFilter === filter
                ? "text-green-700 border-b-2 border-green-700"
                : ""
            }`}
            type="button"
          >
            {filter}
          </button>
        ))}
      </div>

      {loading && (
        <div className="mt-10 flex items-center gap-2 text-sm text-[#071b3a]/70">
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
        <div className="mt-6 border border-[#edf1f7] rounded-xl p-8 text-center">
          <p className="font-bold text-[#071b3a] mb-2">No orders found</p>

          <p className="text-sm text-[#071b3a]/70 mb-4">
            Your submitted order requests will appear here.
          </p>

          <button
            onClick={() => navigate("/")}
            className="h-10 px-5 bg-green-700 text-white rounded-lg font-bold text-sm cursor-pointer hover:bg-green-800"
            type="button"
          >
            Continue Shopping
          </button>
        </div>
      )}

      {!loading && !error && filteredOrders.length > 0 && (
        <>
          <div className="hidden md:block mt-4 border border-[#edf1f7] rounded-xl overflow-hidden">
            <table className="w-full text-sm text-[#071b3a]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4">Order No.</th>
                  <th className="text-left p-4">Date</th>
                  <th className="text-left p-4">Items</th>
                  <th className="text-left p-4">Total</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.order_request_id} className="border-t">
                    <td className="p-4 font-bold">
                      {order.order_request_number}
                    </td>

                    <td className="p-4">{formatDate(order.created_at)}</td>

                    <td className="p-4">{order.item_count}</td>

                    <td className="p-4 font-bold">
                      £{Number(order.subtotal || 0).toFixed(2)}
                    </td>

                    <td className="p-4">
                      <StatusBadge status={formatStatus(order.status)} />
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() =>
                          navigate(`/orders/${order.order_request_number}`)
                        }
                        className="border border-[#e5eaf2] rounded-lg px-5 py-2 font-bold hover:bg-gray-50 cursor-pointer"
                        type="button"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden mt-4 space-y-3">
            {filteredOrders.map((order) => (
              <div
                key={order.order_request_id}
                className="border border-[#edf1f7] rounded-xl p-4"
              >
                <div className="flex justify-between gap-3">
                  <p className="font-bold text-[#071b3a]">
                    {order.order_request_number}
                  </p>

                  <p className="font-bold text-[#071b3a]">
                    £{Number(order.subtotal || 0).toFixed(2)}
                  </p>
                </div>

                <div className="flex justify-between text-sm mt-2 text-[#071b3a]/70">
                  <p>{formatDate(order.created_at)}</p>
                  <p>{order.item_count} Items</p>
                </div>

                <div className="flex justify-between items-center mt-3">
                  <StatusBadge status={formatStatus(order.status)} />

                  <button
                    onClick={() =>
                      navigate(`/orders/${order.order_request_number}`)
                    }
                    className="flex items-center gap-1 text-sm font-bold text-[#062b63] cursor-pointer"
                    type="button"
                  >
                    View Details <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
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