import React, { useState } from "react";
import { Save } from "lucide-react";

const PricingSettings = () => {
  const [pricing, setPricing] = useState({
    bwSingle: 4,
    bwDouble: 3,
    colorSingle: 12,
    colorDouble: 10,
    staple: 10,
    spiral: 40,
    thermal: 60,
  });

  const handlePricingChange = (field, value) => {
    setPricing({
      ...pricing,
      [field]: Number(value),
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">
        Pricing Settings
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        <div>
          <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-3 sm:mb-4">
            Document Printing
          </h3>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Black & White - Single Sided (per page)
              </label>
              <div className="flex items-center">
                <span className="mr-2 text-gray-500 text-sm sm:text-base">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={pricing.bwSingle}
                  onChange={(e) =>
                    handlePricingChange("bwSingle", e.target.value)
                  }
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Black & White - Double Sided (per page)
              </label>
              <div className="flex items-center">
                <span className="mr-2 text-gray-500 text-sm sm:text-base">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={pricing.bwDouble}
                  onChange={(e) =>
                    handlePricingChange("bwDouble", e.target.value)
                  }
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Color - Single Sided (per page)
              </label>
              <div className="flex items-center">
                <span className="mr-2 text-gray-500 text-sm sm:text-base">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={pricing.colorSingle}
                  onChange={(e) =>
                    handlePricingChange("colorSingle", e.target.value)
                  }
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Color - Double Sided (per page)
              </label>
              <div className="flex items-center">
                <span className="mr-2 text-gray-500 text-sm sm:text-base">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={pricing.colorDouble}
                  onChange={(e) =>
                    handlePricingChange("colorDouble", e.target.value)
                  }
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-3 sm:mb-4">
            Binding Options
          </h3>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Staple
              </label>
              <div className="flex items-center">
                <span className="mr-2 text-gray-500 text-sm sm:text-base">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={pricing.staple}
                  onChange={(e) =>
                    handlePricingChange("staple", e.target.value)
                  }
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Spiral Binding
              </label>
              <div className="flex items-center">
                <span className="mr-2 text-gray-500 text-sm sm:text-base">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={pricing.spiral}
                  onChange={(e) =>
                    handlePricingChange("spiral", e.target.value)
                  }
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Thermal Binding
              </label>
              <div className="flex items-center">
                <span className="mr-2 text-gray-500 text-sm sm:text-base">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={pricing.thermal}
                  onChange={(e) =>
                    handlePricingChange("thermal", e.target.value)
                  }
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 flex justify-end">
        <button className="flex items-center px-4 py-2 sm:px-6 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base">
          <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          Update Pricing
        </button>
      </div>
    </div>
  );
};

export default PricingSettings;
