import { Link } from "react-router-dom";
import {
  Home,
  ClipboardList,
  User,
  MapPin,
  Lock,
  LogOut,
  Store,
  Headphones,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AccountPage() {
  const { user, logout } = useAuth();

  return (
    <main className="bg-white border-t">
      <section className="max-w-7xl mx-auto grid md:grid-cols-[260px_1fr] min-h-162.5">
        <aside className="hidden md:block border-r p-6">
          <h2 className="text-xl font-bold text-[#071b3a] mb-6">
            My Account
          </h2>

          <nav className="space-y-2 text-sm font-semibold text-[#071b3a]">
            <SideLink icon={<Home size={17} />} text="Dashboard" />
            <SideLink active icon={<ClipboardList size={17} />} text="My Orders" />
            <SideLink icon={<User size={17} />} text="Customer Details" />
            <SideLink icon={<MapPin size={17} />} text="Addresses" />
            <SideLink icon={<Lock size={17} />} text="Change Password" />

            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50"
            >
              <LogOut size={17} />
              Logout
            </button>
          </nav>

          <div className="mt-8 border rounded-xl p-4 text-sm text-[#071b3a]">
            <h3 className="flex items-center gap-2 font-bold mb-3">
              <Store size={17} />
              Customer Details
            </h3>

            <p>{user?.business_name || "Business Name"}</p>
            <p>{user?.full_name}</p>
            <p>{user?.email}</p>
            <p>{user?.phone}</p>

            <button className="mt-4 w-full h-9 border rounded-lg font-bold hover:bg-gray-50">
              Edit Details
            </button>
          </div>

          <div className="mt-4 border rounded-xl p-4 text-sm text-[#071b3a]">
            <h3 className="flex items-center gap-2 font-bold mb-3">
              <Headphones size={17} />
              Need Help?
            </h3>

            <p>07424715150</p>
            <p>sales@sarawholesale.co.uk</p>
          </div>
        </aside>

        <section className="p-4 md:p-7">
          <h1 className="text-2xl font-bold text-[#071b3a]">My Orders</h1>
          <p className="text-sm text-[#071b3a]/70 mt-1">
            View your order history and track order status
          </p>

          <div className="flex gap-6 overflow-x-auto mt-6 text-sm font-semibold text-[#071b3a]">
            <button className="text-green-700 border-b-2 border-green-700 pb-3">
              All Orders
            </button>
            <button>Pending Approval</button>
            <button>Approved</button>
            <button>Invoiced</button>
            <button>Dispatched</button>
            <button>Delivered</button>
            <button>Cancelled</button>
          </div>

          <div className="hidden md:block mt-4 border rounded-xl overflow-hidden">
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
                {orders.map((order) => (
                  <tr key={order.no} className="border-t">
                    <td className="p-4 font-bold">{order.no}</td>
                    <td className="p-4">{order.date}</td>
                    <td className="p-4">{order.items}</td>
                    <td className="p-4 font-bold">{order.total}</td>
                    <td className="p-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="p-4">
                      <button className="border rounded-lg px-5 py-2 font-bold hover:bg-gray-50">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden mt-4 space-y-3">
            {orders.map((order) => (
              <div key={order.no} className="border rounded-xl p-4">
                <div className="flex justify-between">
                  <p className="font-bold text-[#071b3a]">{order.no}</p>
                  <p className="font-bold text-[#071b3a]">{order.total}</p>
                </div>

                <div className="flex justify-between text-sm mt-2 text-[#071b3a]/70">
                  <p>{order.date}</p>
                  <p>{order.items} Items</p>
                </div>

                <div className="flex justify-between items-center mt-3">
                  <StatusBadge status={order.status} />
                  <button className="flex items-center gap-1 text-sm font-bold text-[#062b63]">
                    View Details <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function SideLink({ icon, text, active }) {
  return (
    <Link
      to="#"
      className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
        active ? "bg-green-50 text-green-700" : "hover:bg-gray-50"
      }`}
    >
      {icon}
      {text}
    </Link>
  );
}

function StatusBadge({ status }) {
  const styles = {
    "Pending Approval": "bg-yellow-100 text-yellow-700",
    Invoiced: "bg-blue-100 text-blue-700",
    Dispatched: "bg-purple-100 text-purple-700",
    Delivered: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
  };

  return (
    <span className={`px-3 py-1 rounded-md text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}
