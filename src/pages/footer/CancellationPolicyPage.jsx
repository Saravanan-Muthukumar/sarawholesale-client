export default function CancellationPolicyPage() {
    return (
      <main className="bg-gray-50 min-h-screen">
        <section className="max-w-4xl mx-auto px-4 py-10">
          <div className="bg-white border border-gray-200 p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-5">
              Cancellation Policy
            </h1>
  
            <div className="space-y-4 text-sm md:text-base text-gray-700 leading-7">
              <p>
                Orders can be cancelled at any time before they have been dispatched.
              </p>
  
              <p>
                You can cancel your order online from <strong>My Orders</strong> in your
                account, or by emailing{" "}
                <a
                  href="mailto:sales@sarawholesale.co.uk"
                  className="text-green-700 font-semibold hover:underline"
                >
                  sales@sarawholesale.co.uk
                </a>{" "}
                with your order number.
              </p>
  
              <p>
                If your order has already been dispatched, it can no longer be
                cancelled. You may instead request to return the goods, subject to
                our Return Policy.
              </p>
  
              <p className="font-semibold text-gray-900">
                Please refer to our Return Policy before requesting a return.
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }