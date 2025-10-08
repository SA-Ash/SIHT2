import React, { useState } from "react";

const PrintOptions = ({ onPlaceOrder, isPlacingOrder = false, selectedShop }) => {
  const [printType, setPrintType] = useState("Black & White - Single Sided");
  const [binding, setBinding] = useState("No Binding");
  const [copies, setCopies] = useState(1);
  const [message, setMessage] = useState("");

  return (
    <div className="w-full lg:flex-1 bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm border border-gray-200 h-max mt-4 lg:mt-0">
      <div className="mb-4 sm:mb-5 md:mb-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-2">
          Print Options
        </h2>
        {selectedShop && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Selected Shop:</span> {selectedShop.name}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              {selectedShop.address} • {selectedShop.contact}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-3 sm:space-y-4 md:space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Print Type
          </label>
          <select
            value={printType}
            onChange={(e) => setPrintType(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
          >
            <option>Black & White - Single Sided</option>
            <option>Black & White - Double Sided</option>
            <option>Color - Single Sided</option>
            <option>Color - Double Sided</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Binding
          </label>
          <select
            value={binding}
            onChange={(e) => setBinding(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
          >
            <option>No Binding</option>
            <option>Stapled</option>
            <option>Spiral Binding</option>
            <option>Hard Binding</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Copies
          </label>
          <input
            type="number"
            min="1"
            value={copies}
            onChange={(e) => setCopies(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Message
          </label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Optional message to the print shop"
            className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
          />
        </div>

        <button 
          onClick={() => {
            const printConfig = {
              pages: 1, // This should be calculated from the uploaded file
              color: printType.includes("Color"),
              doubleSided: printType.includes("Double Sided"),
              copies: parseInt(copies),
              paperSize: "A4",
              paperType: "standard",
              binding: binding
            };
            if (onPlaceOrder) {
              onPlaceOrder(printConfig);
            }
          }}
          disabled={isPlacingOrder}
          className={`w-full font-medium py-2 sm:py-3 px-4 rounded-lg transition-colors text-sm sm:text-base ${
            isPlacingOrder 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          {isPlacingOrder ? "Placing Order..." : "Place Order"}
        </button>
      </div>
    </div>
  );
};

export default PrintOptions;
