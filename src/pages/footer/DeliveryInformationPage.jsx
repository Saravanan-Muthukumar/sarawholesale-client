export default function DeliveryInformationPage() {
    return (
      <main className="bg-white px-4 py-8">
        <section className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-[#071b3a] mb-4">
            Delivery Information
          </h1>
  
          <div className="space-y-4 text-gray-700 leading-7">
            <p>
              We aim to dispatch orders as quickly as possible. Delivery times may
              vary depending on stock availability, order size and courier service.
            </p>
  
            <p>
              Orders placed before 1pm are usually processed the same working day.
              Orders placed after 1pm may be processed the next working day.
            </p>
  
            <p>
              Delivery charges and free delivery thresholds may vary depending on
              the order value and delivery location.
            </p>
  
            <p>
              For bulk orders or special delivery requirements, please contact us
              before placing your order.
            </p>
          </div>
        </section>
      </main>
    );
  }