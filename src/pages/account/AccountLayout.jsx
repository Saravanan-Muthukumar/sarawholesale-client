import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Home,
  ClipboardList,
  User,
  Lock,
  LogOut,
  Store,
  Headphones,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AccountLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <main className="bg-white border-t border-[#edf1f7]">
      <section className="max-w-7xl mx-auto grid md:grid-cols-[260px_1fr] min-h-162.5">
        <aside className="hidden md:block border-r border-[#edf1f7] p-6">
          <h2 className="text-xl font-bold text-[#071b3a] mb-6">
            My Account
          </h2>

          <nav className="space-y-2 text-sm font-semibold text-[#071b3a]">
            <SideLink to="/account" icon={<Home size={17} />} text="Dashboard" />

            <SideLink
              to="/account/orders"
              icon={<ClipboardList size={17} />}
              text="My Orders"
            />

            <SideLink
              to="/account/details"
              icon={<User size={17} />}
              text="Customer Details"
            />

            <SideLink
              to="/account/change-password"
              icon={<Lock size={17} />}
              text="Change Password"
            />

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 cursor-pointer"
              type="button"
            >
              <LogOut size={17} />
              Logout
            </button>
          </nav>

          {/* <div className="mt-8 border border-[#edf1f7] rounded-xl p-4 text-sm text-[#071b3a]">
            <h3 className="flex items-center gap-2 font-bold mb-3">
              <Store size={17} />
              Customer Details
            </h3>

            <p>{user?.business_name || user?.user_business_name || "Business Name"}</p>
            <p>
              {user?.first_name || user?.last_name
                ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
                : ""}
            </p>
            <p>{user?.email || ""}</p>
            <p>{user?.phone || ""}</p>

            <button
              onClick={() => navigate("/account/details")}
              className="mt-4 w-full h-9 border border-[#e5eaf2] rounded-lg font-bold hover:bg-gray-50 cursor-pointer"
              type="button"
            >
              Edit Details
            </button>
          </div> */}

          <div className="mt-4 border border-[#edf1f7] rounded-xl p-4 text-sm text-[#071b3a]">
            <h3 className="flex items-center gap-2 font-bold mb-3">
              <Headphones size={17} />
              Need Help?
            </h3>

            <p>07424715150</p>
            <p>info@sarawholesalesupplies.co.uk</p>
          </div>
        </aside>

        <section className="p-4 md:p-7">
          <Outlet />
        </section>
      </section>
    </main>
  );
}

function SideLink({ to, icon, text }) {
  return (
    <NavLink
      to={to}
      end={to === "/account"}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg ${
          isActive ? "bg-green-50 text-green-700" : "hover:bg-gray-50"
        }`
      }
    >
      {icon}
      {text}
    </NavLink>
  );
}