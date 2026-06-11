import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle, ShoppingBag, PackageSearch } from "lucide-react";

export default function OrderSuccessPage() {
  const navigate = useNavigate();
  const { orderNumber } = useParams();

  return (
    <main className="bg-white border-t border-[#edf1f7] min-h-[70vh]">
      <section className="max-w-3xl mx-auto px-4 py-12">
        <div className="border border-[#edf1f7] rounded-2xl p-6 md:p-8 text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-700" />
          </div>

          <h1 className="text-xl md:text-2xl font-bold text-[#071b3a] mb-2">
            Order Request Submitted
          </h1>

          <p className="text-sm text-[#071b3a]/70 mb-5">
            Thank you. We have received your order request. Our sales team will
            review it and contact you shortly.
          </p>

          <div className="bg-gray-50 border border-[#edf1f7] rounded-xl p-4 mb-6">
            <p className="text-xs text-[#071b3a]/60 mb-1">
              Order Request Number
            </p>
            <p className="text-lg font-bold text-green-700">
              {orderNumber}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/")}
              className="h-11 rounded-lg border border-[#e5eaf2] font-bold text-sm text-[#071b3a] flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50"
              type="button"
            >
              <ShoppingBag size={17} />
              Continue Shopping
            </button>

            <button
              onClick={() => navigate("/account")}
              className="h-11 rounded-lg bg-green-700 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-green-800"
              type="button"
            >
              <PackageSearch size={17} />
              View My Orders
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}