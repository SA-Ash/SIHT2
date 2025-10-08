import React, { useState, useEffect } from 'react';
import { MapPin, Star, Clock, Phone, CheckCircle } from 'lucide-react';
import { shopsService } from '../services/shops.js';

const ShopSelector = ({ onShopSelect, selectedShop, userLocation }) => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadNearbyShops();
  }, [userLocation]); // eslint-disable-line react-hooks/exhaustive-deps

  // Get user location from localStorage if not provided
  useEffect(() => {
    if (!userLocation) {
      const storedLocation = localStorage.getItem('userLocation');
      if (storedLocation) {
        try {
          const location = JSON.parse(storedLocation);
          // Use the location for shop loading
          loadNearbyShopsWithLocation(location);
        } catch (error) {
          console.error('Failed to parse stored location:', error);
        }
      }
    }
  }, [userLocation]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadNearbyShops = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use default location if user location not available
      const location = userLocation || { lng: 77.2090, lat: 28.6139 };
      
      const nearbyShops = await shopsService.getNearbyShops(
        location.lng, 
        location.lat, 
        5000 // 5km radius
      );
      
      setShops(nearbyShops.shops || []);
    } catch (err) {
      console.error('Failed to load shops:', err);
      setError('Failed to load nearby shops');
      // Fallback to mock data for prototype
      setShops(getMockShops());
    } finally {
      setLoading(false);
    }
  };

  const loadNearbyShopsWithLocation = async (location) => {
    try {
      setLoading(true);
      setError(null);
      
      const nearbyShops = await shopsService.getNearbyShops(
        location.lng, 
        location.lat, 
        5000 // 5km radius
      );
      
      setShops(nearbyShops.shops || []);
    } catch (err) {
      console.error('Failed to load shops:', err);
      setError('Failed to load nearby shops');
      // Fallback to mock data for prototype
      setShops(getMockShops());
    } finally {
      setLoading(false);
    }
  };

  const getMockShops = () => [
    {
      id: "60f7b3b3b3b3b3b3b3b3b3b3",
      name: "QuickPrint Hub - CBIT",
      address: "Near CBIT College, Hyderabad",
      contact: "+91 98765 43210",
      email: "rishi.kumar199550@gmail.com",
      rating: 4.5,
      distance: 0.8,
      services: ["Color Printing", "Binding", "Laminating"],
      capacity: { currentQueue: 3, maxQueue: 15 },
      isActive: true
    },
    {
      id: "60f7b3b3b3b3b3b3b3b3b3b4",
      name: "Print Express - JNTU",
      address: "JNTU Campus Area, Hyderabad",
      contact: "+91 98765 43211",
      email: "abcde@gmail.com",
      rating: 4.2,
      distance: 1.2,
      services: ["Color Printing", "Binding"],
      capacity: { currentQueue: 8, maxQueue: 20 },
      isActive: true
    },
    {
      id: "60f7b3b3b3b3b3b3b3b3b3b5",
      name: "Student Print Center",
      address: "Near Osmania University, Hyderabad",
      contact: "+91 98765 43212",
      email: "abcd@gmail.com",
      rating: 4.0,
      distance: 2.1,
      services: ["Color Printing", "Binding", "Laminating"],
      capacity: { currentQueue: 5, maxQueue: 12 },
      isActive: true
    }
  ];

  const handleShopSelect = (shop) => {
    onShopSelect(shop);
  };

  if (loading) {
    return (
      <div className="w-full bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-4 sm:mb-5 md:mb-6">
          Select Print Shop
        </h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading nearby shops...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm border border-gray-200">
      <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-4 sm:mb-5 md:mb-6">
        Select Print Shop
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">{error}</p>
          <p className="text-yellow-700 text-xs mt-1">Showing demo shops for prototype</p>
        </div>
      )}

      <div className="space-y-3">
        {shops.map((shop) => (
          <div
            key={shop.id}
            onClick={() => handleShopSelect(shop)}
            className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
              selectedShop?.id === shop.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                    {shop.name}
                  </h3>
                  {selectedShop?.id === shop.id && (
                    <CheckCircle className="ml-2 h-4 w-4 text-blue-600" />
                  )}
                </div>
                
                <div className="flex items-center text-gray-600 text-xs sm:text-sm mb-1">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span>{shop.address}</span>
                </div>
                
                <div className="flex items-center text-gray-600 text-xs sm:text-sm mb-2">
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span>{shop.contact}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-yellow-600 text-xs sm:text-sm">
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1 fill-current" />
                      <span>{shop.rating}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600 text-xs sm:text-sm">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span>{shop.distance} km away</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-gray-500">
                      Queue: {shop.capacity?.currentQueue || 0}/{shop.capacity?.maxQueue || 0}
                    </div>
                    <div className="text-xs text-green-600 font-medium">
                      {shop.capacity?.currentQueue < shop.capacity?.maxQueue ? 'Available' : 'Busy'}
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap gap-1">
                  {shop.services?.map((service, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {shops.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-sm">No shops found in your area</p>
          <p className="text-xs text-gray-400 mt-1">
            Try expanding your search radius or check back later
          </p>
        </div>
      )}
    </div>
  );
};

export default ShopSelector;
