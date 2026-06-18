import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function OrderDetailsPage() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOrder();
  }, [orderNumber]);

  const loadOrder = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_URL}/api/orders/${orderNumber}`,
        {
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load order");
      }

      setOrder(data.order);
      setItems(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8fb] flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-700" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4">
          {error}
        </div>

        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-blue-700 hover:underline"
        >
          Go Back
        </button>
      </main>
    );
  }

  return (
    <main className="bg-[#f7f8fb] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-700 hover:text-blue-900 mb-6"
        >
          <ArrowLeft size={18} />
          Previous Page
        </button>

        <div className="bg-white border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-[#071b3a] mb-4">
            Order Details
          </h1>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">Order Number:</span>{" "}
              {order.order_request_number}
            </div>

            <div>
              <span className="font-semibold">Status:</span>{" "}
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs">
                {order.status}
              </span>
            </div>

            <div>
              <span className="font-semibold">Date:</span>{" "}
              {new Date(order.created_at).toLocaleDateString("en-GB")}
            </div>

            <div>
              <span className="font-semibold">Subtotal:</span> £
              {Number(order.subtotal || 0).toFixed(2)}
            </div>

            <div>
              <span className="font-semibold">VAT:</span> £
              {Number(order.vat_amount || 0).toFixed(2)}
            </div>

            <div>
              <span className="font-semibold">Total:</span>{" "}
              <span className="font-bold text-green-700">
                £{Number(order.total_amount || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 overflow-hidden">
          <div className="bg-[#071b3a] text-white px-4 py-3 font-semibold">
            Order Items
          </div>

          {items.length === 0 ? (
            <div className="p-6 text-gray-500">
              No items found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-3">Product</th>
                    <th className="text-left p-3">SKU</th>
                    <th className="text-center p-3">Qty</th>
                    <th className="text-right p-3">Unit Price</th>
                    <th className="text-right p-3">Total</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.order_request_item_id}
                      className="border-t"
                    >
                      <td className="p-3">
                        {item.product_name}
                      </td>

                      <td className="p-3">
                        {item.sku || "-"}
                      </td>

                      <td className="p-3 text-center">
                        {item.quantity}
                      </td>

                      <td className="p-3 text-right">
                        £{Number(item.unit_price || 0).toFixed(2)}
                      </td>

                      <td className="p-3 text-right font-semibold">
                        £
                        {(
                          Number(item.quantity || 0) *
                          Number(item.unit_price || 0)
                        ).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6">
          <Link
            to="/account/orders"
            className="inline-flex items-center px-5 py-2 bg-[#071b3a] text-white hover:bg-[#0b2857]"
          >
            Back to My Orders
          </Link>
        </div>
      </div>
    </main>
  );
}