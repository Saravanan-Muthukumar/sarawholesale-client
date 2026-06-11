import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  CheckCircle,
  Truck,
  ShoppingBag,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/orders/my-orders`, {
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setOrders(data);
      }
    } catch (error) {
      console.error("Dashboard orders error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

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

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";

    return new Date(dateValue).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const pendingCount = orders.filter(
    (order) => formatStatus(order.status) === "Pending Approval"
  ).length;

  const approvedCount = orders.filter(
    (order) => formatStatus(order.status) === "Approved"
  ).length;

  const dispatchedCount = orders.filter(
    (order) => formatStatus(order.status) === "Dispatched"
  ).length;

  const recentOrders = orders.slice(0, 4);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#071b3a]">
        Welcome, {user?.first_name || user?.full_name || "Customer"}
      </h1>

      <p className="text-sm text-[#071b3a]/70 mt-1">
        Manage your wholesale account, order requests, and business details.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <SummaryCard
          icon={<ClipboardList size={22} />}
          label="Total Orders"
          value={orders.length}
        />

        <SummaryCard
          icon={<ShoppingBag size={22} />}
          label="Pending Orders"
          value={pendingCount}
        />

        <SummaryCard
          icon={<CheckCircle size={22} />}
          label="Approved Orders"
          value={approvedCount}
        />

        <SummaryCard
          icon={<Truck size={22} />}
          label="Dispatched"
          value={dispatchedCount}
        />
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-5 mt-6">
        <div className="border border-[#edf1f7] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#071b3a]">Recent Orders</h2>

            <button
              onClick={() => navigate("/account/orders")}
              className="text-sm font-bold text-green-700 cursor-pointer"
              type="button"
            >
              View All
            </button>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-[#071b3a]/70">
              <Loader2 size={17} className="animate-spin" />
              Loading orders...
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-sm text-[#071b3a]/70">
              No orders yet. Start shopping and submit your first request.
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <button
                  key={order.order_request_id}
                  onClick={() =>
                    navigate(`/orders/${order.order_request_number}`)
                  }
                  className="w-full border border-[#edf1f7] rounded-lg p-3 flex items-center justify-between text-left cursor-pointer hover:bg-gray-50"
                  type="button"
                >
                  <div>
                    <p className="font-bold text-sm text-[#071b3a]">
                      {order.order_request_number}
                    </p>
                    <p className="text-xs text-[#071b3a]/60 mt-1">
                      {formatDate(order.created_at)} • {order.item_count} items
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={formatStatus(order.status)} />
                    <ChevronRight size={17} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border border-[#edf1f7] rounded-xl p-5">
          <h2 className="font-bold text-[#071b3a] mb-3">Quick Actions</h2>

          <div className="space-y-3">
            <button
              onClick={() => navigate("/")}
              className="w-full h-10 rounded-lg bg-green-700 text-white font-bold text-sm cursor-pointer hover:bg-green-800"
              type="button"
            >
              Continue Shopping
            </button>

            <button
              onClick={() => navigate("/account/orders")}
              className="w-full h-10 rounded-lg border border-[#e5eaf2] text-[#071b3a] font-bold text-sm cursor-pointer hover:bg-gray-50"
              type="button"
            >
              View My Orders
            </button>

            <button
              onClick={() => navigate("/account/details")}
              className="w-full h-10 rounded-lg border border-[#e5eaf2] text-[#071b3a] font-bold text-sm cursor-pointer hover:bg-gray-50"
              type="button"
            >
              Edit Customer Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value }) {
  return (
    <div className="border border-[#edf1f7] rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className="text-green-700">{icon}</div>
        <p className="text-2xl font-bold text-[#071b3a]">{value}</p>
      </div>

      <p className="text-sm text-[#071b3a]/70 mt-3">{label}</p>
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
      className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}