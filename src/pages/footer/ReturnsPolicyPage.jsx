import React from "react";

export default function ReturnsPolicyPage() {
  return (
    <main className="bg-white px-4 py-8 pb-20">
      <section className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-[#071b3a] mb-2">
          Returns Policy
        </h1>

        <p className="text-sm text-gray-500 mb-8">
          Last Updated: June 2026
        </p>

        <div className="space-y-6 text-gray-700 leading-7">
          <p>
            At SARA Wholesale Supplies, we are committed to providing quality
            products and excellent customer service. If you are not completely
            satisfied with your purchase, please review our returns policy below.
          </p>

          <div>
            <h2 className="text-lg font-semibold text-[#071b3a] mb-2">
              Damaged, Faulty or Incorrect Items
            </h2>

            <p>
              If you receive goods that are damaged, defective, or supplied in
              error, please notify us within 48 hours of delivery.
            </p>

            <p className="mt-2">
              To help us investigate your claim, we may request photographs of
              the products, packaging and delivery labels before arranging a
              replacement, refund or collection.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[#071b3a] mb-2">
              Standard Returns
            </h2>

            <p>
              Return requests should be submitted within 14 days of delivery.
            </p>

            <ul className="list-disc ml-6 mt-3 space-y-1">
              <li>Items must be unused and in resalable condition.</li>
              <li>Items must be returned in their original packaging.</li>
              <li>Returns require prior approval from our team.</li>
              <li>Proof of purchase may be required.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[#071b3a] mb-2">
              Non-Returnable Items
            </h2>

            <ul className="list-disc ml-6 mt-3 space-y-1">
              <li>Custom-made or personalised products.</li>
              <li>Special order products.</li>
              <li>Clearance or end-of-line stock.</li>
              <li>Bulk discounted items supplied to special order.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[#071b3a] mb-2">
              Refunds
            </h2>

            <p>
              Once returned goods have been received and inspected, we will
              notify you of the outcome.
            </p>

            <p className="mt-2">
              Approved refunds will be processed promptly using the original
              payment method where applicable.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[#071b3a] mb-2">
              Return Shipping Costs
            </h2>

            <p>
              Customers may be responsible for return shipping costs unless the
              goods are faulty, damaged or supplied incorrectly.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[#071b3a] mb-2">
              Contact Us
            </h2>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-3">
              <p className="font-semibold text-[#071b3a]">
                SARA Wholesale Supplies
              </p>

              <p>Email: sales@sarawholesale.co.uk</p>

              <p>Phone: 07424 715150</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}