import { Truck, Tag, ShieldCheck, Users } from "lucide-react";

export default function WhyChooseUs() {
    const items = [
        {
          icon: Truck,
          title: "Fast UK Delivery",
          text: "Next day delivery across UK mainland. Same day within 50 miles of Slough. Delivery within 2 hours in Slough.",
        },
        {
          icon: Tag,
          title: "Bulk & Trade Pricing",
          text: "Trade prices available even for minimum quantity. Not happy with the price? Call us for the best price.",
        },
        {
          icon: ShieldCheck,
          title: "Quality Guaranteed",
          text: "Sourced from trusted UK suppliers.",
        },
        {
          icon: Users,
          title: "Business Accounts",
          text: "Credit accounts available. Call us for details.",
        },
      ];

  return (
    <section className="bg-[#eef6ff] py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-center text-2xl font-bold text-[#062b63] mb-7">
          Why Choose SARA Wholesale Supplies?
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.title} className="flex flex-col items-center text-center">
                <Icon className="text-[#062b63] mb-3" size={34} />
                <h3 className="font-bold text-[#062b63] text-sm">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1">{item.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}