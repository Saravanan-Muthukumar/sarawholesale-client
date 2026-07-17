import {
    ArrowLeft,
    LockKeyhole,
    ShieldCheck,
    User,
  } from "lucide-react";
  import { useEffect } from "react";
  import { useNavigate } from "react-router-dom";
  import { useAuth } from "../context/AuthContext";
  
  export default function ProceedCheckoutPage() {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();
  
    useEffect(() => {
      if (isLoggedIn) {
        navigate("/checkout", {
          replace: true,
        });
      }
    }, [isLoggedIn, navigate]);
  
    const handleLogin = () => {
      navigate("/login", {
        state: {
          from: "/checkout",
        },
      });
    };
  
    const handleGuestCheckout = () => {
      navigate("/guest-checkout/email");
    };
  
    return (
      <main className="min-h-screen bg-[#f7f7f7] px-4 py-6 md:py-10">
        <section className="mx-auto max-w-3xl">
          <button
            type="button"
            onClick={() => navigate("/cart")}
            className="mb-5 flex cursor-pointer items-center gap-2 text-sm font-semibold text-black hover:text-gray-600"
          >
            <ArrowLeft size={18} />
            Back to basket
          </button>
  
          <div className="border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-5 py-6 md:px-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-black">
                <LockKeyhole size={23} />
              </div>
  
              <h1 className="text-2xl font-bold text-black md:text-3xl">
                Proceed to checkout
              </h1>
  
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Login to use your saved details or continue as a guest.
              </p>
            </div>
  
            <div className="grid gap-4 p-5 md:grid-cols-2 md:p-8">
              <div className="flex flex-col border border-gray-200 p-5">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-black">
                  <User size={22} />
                </div>
  
                <h2 className="text-lg font-bold text-black">Login</h2>
  
                <p className="mt-2 flex-1 text-sm leading-6 text-gray-600">
                  Login to view your saved delivery details and order history.
                </p>
  
                <button
                  type="button"
                  onClick={handleLogin}
                  className="mt-6 h-11 w-full cursor-pointer bg-black px-4 text-sm font-bold text-white transition hover:bg-gray-800"
                >
                  Login
                </button>
              </div>
            </div>
  
            <div className="border-t border-gray-200 bg-gray-50 px-5 py-4 md:px-8">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={20}
                  className="mt-0.5 shrink-0 text-black"
                />
  
                <div>
                  <p className="text-sm font-bold text-black">
                    Secure checkout
                  </p>
  
                  <p className="mt-1 text-xs leading-5 text-gray-600">
                    Your personal and payment information will be handled
                    securely. Card details will not be stored.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }