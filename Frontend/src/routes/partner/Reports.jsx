import React from "react";
import RevenueTrends from "../../Components/RevenueTrends";
import PopularServices from "../../Components/PopularServices";

const Reports = () => {
  const stats = [
    {
      number: "₹12,500",
      label: "Revenue This Month",
      trend: "+12%",
      positive: true,
    },
    { number: "142", label: "Orders This Month", trend: "+8%", positive: true },
    {
      number: "₹87",
      label: "Average Order Value",
      trend: "-3%",
      positive: false,
    },
    { number: "90%", label: "On-Time Delivery", trend: "+2%", positive: true },
  ];

  return (
    <div className="min-h-screen max-w-[90rem] mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
          Reports & Analytics
        </h1>
        <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
          Track your business performance and get insights into your operations.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 mb-6 sm:mb-8">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-200 transition-all hover:shadow-md"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-gray-600 text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                  {stat.label}
                </h3>
                <h1 className="font-bold text-lg sm:text-xl md:text-2xl text-gray-800">
                  {stat.number}
                </h1>
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  stat.positive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6 sm:space-y-8">
        <RevenueTrends />
        <PopularServices />
      </div>
    </div>
  );
};

export default Reports;
