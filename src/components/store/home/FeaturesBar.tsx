import { Truck, RefreshCw, ShieldCheck, Headphones } from "lucide-react";

export default function FeaturesBar() {
  const features = [
    {
      icon: <Truck size={32} className="text-brand-orange" />,
      title: "Fasted Delivery",
      description: "Delivery in 24/H"
    },
    {
      icon: <RefreshCw size={32} className="text-brand-orange" />,
      title: "24 Hours Return",
      description: "100% money-back guarantee"
    },
    {
      icon: <ShieldCheck size={32} className="text-brand-orange" />,
      title: "Secure Payment",
      description: "Your money is safe"
    },
    {
      icon: <Headphones size={32} className="text-brand-orange" />,
      title: "Support 24/7",
      description: "Live contact/message"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 border-y border-gray-200 my-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-4 px-4 py-2">
            <div>{feature.icon}</div>
            <div>
              <h4 className="font-bold text-gray-900">{feature.title}</h4>
              <p className="text-sm text-gray-500">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
