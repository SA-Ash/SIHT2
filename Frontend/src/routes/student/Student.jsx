import React, { useState } from "react";
import UploadSection from "../../Components/UploadSection";
import PrintOptions from "../../Components/PrintOptions";
import ShopSelector from "../../Components/ShopSelector";
import { useAuth } from "../../hooks/useAuth.jsx";
import { useOrders } from "../../hooks/useOrders.jsx";
import { showSuccess, showError } from "../../utils/errorHandler.js";

const Student = () => {
  const { user } = useAuth();
  const { createOrder } = useOrders();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [selectedShop, setSelectedShop] = useState(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [currentStep, setCurrentStep] = useState('upload'); // 'upload', 'shop', 'options'

  const handleFileUpload = (file) => {
    setUploadedFile(file);
    if (file) {
      setCurrentStep('shop'); // Move to shop selection after file upload
    }
  };

  const handleShopSelect = (shop) => {
    setSelectedShop(shop);
    setCurrentStep('options'); // Move to print options after shop selection
  };

  const handlePlaceOrder = async (printConfig) => {
    if (!uploadedFile) {
      showError("Please upload a file first");
      return;
    }

    if (!selectedShop) {
      showError("Please select a print shop");
      return;
    }

    if (!user) {
      showError("Please login to place an order");
      return;
    }

    try {
      setIsPlacingOrder(true);
      
      // Create a mock file URL - in real app, you'd upload to cloud storage
      const fileUrl = `https://example.com/uploads/${uploadedFile.name}`;
      
      // Calculate total cost based on print config
      const basePerPage = printConfig.color ? 2 : 1;
      const duplexMultiplier = printConfig.doubleSided ? 0.9 : 1;
      const totalCost = Math.round(basePerPage * printConfig.pages * printConfig.copies * duplexMultiplier * 100) / 100;
      
      const orderData = {
        fileName: uploadedFile.name,
        shopName: selectedShop.name,
        shopEmail: selectedShop.email || "rishi.kumar199550@gmail.com",
        shopId: selectedShop.id, // Add shop ID for backend
        fileUrl: fileUrl,
        printConfig: {
          pages: printConfig.pages || 1,
          color: printConfig.color || false,
          doubleSided: printConfig.doubleSided || false,
          copies: printConfig.copies || 1,
          paperSize: printConfig.paperSize || "A4",
          paperType: printConfig.paperType || "standard",
          binding: printConfig.binding || "No Binding"
        },
        totalCost: totalCost,
        college: user.college || ""
      };

      const order = await createOrder(orderData);
      showSuccess(`Order placed successfully at ${selectedShop.name}! Check "My Orders" to track progress.`);
      console.log("Order created:", order);
      
      // Reset form
      setUploadedFile(null);
      setSelectedShop(null);
      setCurrentStep('upload');
      
    } catch (error) {
      console.error("Order creation failed:", error);
      showError("Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen max-w-[85rem] mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-5 md:py-6">
      <div className="mb-4 sm:mb-5 md:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
          Upload & Print
        </h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base md:text-lg">
          Upload your documents and customize your printing preferences
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-6">
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center ${currentStep === 'upload' ? 'text-blue-600' : currentStep === 'shop' || currentStep === 'options' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === 'upload' ? 'bg-blue-100 text-blue-600' : 
              currentStep === 'shop' || currentStep === 'options' ? 'bg-green-100 text-green-600' : 
              'bg-gray-100 text-gray-400'
            }`}>
              1
            </div>
            <span className="ml-2 text-sm font-medium">Upload File</span>
          </div>
          
          <div className={`w-8 h-1 ${currentStep === 'shop' || currentStep === 'options' ? 'bg-green-200' : 'bg-gray-200'}`}></div>
          
          <div className={`flex items-center ${currentStep === 'shop' ? 'text-blue-600' : currentStep === 'options' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === 'shop' ? 'bg-blue-100 text-blue-600' : 
              currentStep === 'options' ? 'bg-green-100 text-green-600' : 
              'bg-gray-100 text-gray-400'
            }`}>
              2
            </div>
            <span className="ml-2 text-sm font-medium">Select Shop</span>
          </div>
          
          <div className={`w-8 h-1 ${currentStep === 'options' ? 'bg-green-200' : 'bg-gray-200'}`}></div>
          
          <div className={`flex items-center ${currentStep === 'options' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === 'options' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
            }`}>
              3
            </div>
            <span className="ml-2 text-sm font-medium">Print Options</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between gap-4 sm:gap-5 md:gap-6">
        {currentStep === 'upload' && (
          <UploadSection onFileUpload={handleFileUpload} uploadedFile={uploadedFile} />
        )}
        
        {currentStep === 'shop' && (
          <ShopSelector 
            onShopSelect={handleShopSelect} 
            selectedShop={selectedShop}
            userLocation={(() => {
              const storedLocation = localStorage.getItem('userLocation');
              if (storedLocation) {
                try {
                  return JSON.parse(storedLocation);
                } catch (error) {
                  console.error('Failed to parse stored location:', error);
                }
              }
              return { lng: 77.2090, lat: 28.6139 }; // Default location for prototype
            })()}
          />
        )}
        
        {currentStep === 'options' && (
          <PrintOptions 
            onPlaceOrder={handlePlaceOrder} 
            isPlacingOrder={isPlacingOrder}
            selectedShop={selectedShop}
          />
        )}
      </div>
    </div>
  );
};

export default Student;
