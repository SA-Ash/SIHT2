import React, { useState } from "react";
import {
  Download,
  Search,
  Filter,
  Calendar,
  FileText,
  Printer,
  Clock,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useOrders } from "../../hooks/useOrders.jsx";

const StudentOrders = () => {
  const { orders, loading } = useOrders();
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeFilter === "all") return matchesSearch;
    return matchesSearch && order.status === activeFilter;
  });

  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-blue-100 text-blue-800", 
    printing: "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPages = (order) => {
    const colorText = order.color ? 'Color' : 'B&W';
    const sideText = order.doubleSided ? 'Double' : 'Single';
    return `${order.pages} pages • ${colorText} ${sideText}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            My Orders
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Track your printing orders and download receipts
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between md:hidden">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-gray-700"
              >
                <Filter className="h-4 w-4" />
                Filters
                {showFilters ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              <div className="relative md:hidden">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 w-40 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div
              className={`${
                showFilters ? "flex" : "hidden"
              } md:flex flex-col md:flex-row md:items-center justify-between gap-4`}
            >
              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:space-x-2">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={`px-3 py-2 text-xs sm:text-sm font-medium transition-colors rounded-lg ${
                    activeFilter === "all"
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  All Orders
                </button>
                <button
                  onClick={() => setActiveFilter("pending")}
                  className={`px-3 py-2 text-xs sm:text-sm font-medium transition-colors rounded-lg ${
                    activeFilter === "pending"
                      ? "bg-yellow-100 text-yellow-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setActiveFilter("accepted")}
                  className={`px-3 py-2 text-xs sm:text-sm font-medium transition-colors rounded-lg ${
                    activeFilter === "accepted"
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Accepted
                </button>
                <button
                  onClick={() => setActiveFilter("printing")}
                  className={`px-3 py-2 text-xs sm:text-sm font-medium transition-colors rounded-lg ${
                    activeFilter === "printing"
                      ? "bg-purple-100 text-purple-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Printing
                </button>
                <button
                  onClick={() => setActiveFilter("completed")}
                  className={`px-3 py-2 text-xs sm:text-sm font-medium transition-colors rounded-lg ${
                    activeFilter === "completed"
                      ? "bg-green-100 text-green-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Completed
                </button>
              </div>

              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
              <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                No orders found
              </h3>
              <p className="text-sm sm:text-base text-gray-500">
                {orders.length === 0 ? "You haven't placed any orders yet." : "No orders match your search criteria."}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
                        <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-1 truncate">
                          {order.fileName}
                        </h3>
                        <p className="text-gray-600 text-xs sm:text-sm mb-2">
                          {order.orderNumber} • {formatPages(order)}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          <span>PDF</span>
                          <span>•</span>
                          <span>{order.binding}</span>
                          <span>•</span>
                          <span>
                            {order.copies} copy{order.copies > 1 ? "ies" : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-end lg:items-end gap-3 lg:gap-2">
                    <div className="text-right">
                      <div className="font-bold text-gray-900 text-base sm:text-lg">
                        ₹{order.totalCost}
                      </div>
                      <div className="flex items-center justify-end gap-1 text-gray-500 text-xs sm:text-sm">
                        <Calendar className="h-3 w-3" />
                        {formatDate(order.createdAt)}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 sm:gap-3">
                      <span
                        className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium ${
                          statusStyles[order.status]
                        }`}
                      >
                        {order.statusText}
                      </span>

                      <button className="p-1 sm:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 mt-4 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                    <Printer className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Shop: {order.shopName}</span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium flex items-center gap-1">
                    <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                    Download Receipt
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mt-6 sm:mt-8">
          <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-3 sm:mb-4">
            Order Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                {orders.length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">
                Total Orders
              </div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">
                ₹{orders.reduce((sum, order) => sum + order.totalCost, 0)}
              </div>
              <div className="text-xs sm:text-sm text-blue-600">
                Total Spent
              </div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {orders.filter((o) => o.status === "completed").length}
              </div>
              <div className="text-xs sm:text-sm text-green-600">
                Completed
              </div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-yellow-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-yellow-600">
                {orders.filter((o) => o.status === "pending" || o.status === "accepted" || o.status === "printing").length}
              </div>
              <div className="text-xs sm:text-sm text-yellow-600">
                In Progress
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentOrders;
