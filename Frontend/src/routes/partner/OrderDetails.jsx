import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Printer,
  User,
  ShoppingBag,
  MessageSquare,
  Phone,
  Calendar,
  CheckCircle,
  X,
} from "lucide-react";
import { usePartnerOrders } from "../../hooks/usePartnerOrders.jsx";

const OrderDetails = () => {
  const { id } = useParams();
  const { orders, updateOrderStatus } = usePartnerOrders();
  const [order, setOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    const foundOrder = orders.find(o => o.id === id);
    if (foundOrder) {
      setOrder(foundOrder);
    }
  }, [orders, id]);

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  const handleStatusUpdate = () => {
    setNewStatus(order.status);
    setShowStatusModal(true);
  };

  const confirmStatusUpdate = () => {
    if (newStatus && newStatus !== order.status) {
      updateOrderStatus(order.id, newStatus);
      setShowStatusModal(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-blue-100 text-blue-800";
      case "printing":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const statusLabels = {
    pending: "Pending",
    accepted: "Accepted",
    printing: "Printing",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  // Create print items from order data
  const printItems = [
    {
      id: 1,
      name: `${order.color ? 'Color' : 'Black & White'} - ${order.doubleSided ? 'Double Sided' : 'Single Sided'}`,
      qty: order.copies,
      price: order.color ? (order.doubleSided ? 12 : 8) : (order.doubleSided ? 3 : 2),
    }
  ];

  const subtotal = printItems.reduce((sum, item) => sum + (item.qty * item.price), 0);
  const tax = subtotal * 0.1;
  const grandTotal = subtotal + tax;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link
            to="/partner/orders"
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Back to Orders
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Order Details
          </h1>
          <div className="hidden md:flex w-0 sm:w-20"></div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Printer className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Order #{order.orderNumber}
                </h2>
                <div className="flex items-center gap-2 mt-1 text-gray-600">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">
                    Placed on {formatDate(order.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 text-center">
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm text-gray-500">
                  Payment Method
                </span>
                <span className="font-medium text-sm sm:text-base">
                  UPI
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-xs sm:text-sm text-gray-500">Status</span>
                <span
                  className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium ${getStatusColor(
                    order.status
                  )}`}
                >
                  {statusLabels[order.status]}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              Customer Details
            </h3>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">
                    Student Customer
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">Customer</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">
                    {order.college}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    College
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">
                    {order.fileName}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">File Name</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
              Order Actions
            </h3>

            <div className="space-y-2 sm:space-y-3">
              <button 
                onClick={handleStatusUpdate}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors text-sm sm:text-base"
              >
                Update Status
              </button>

              <button className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors text-sm sm:text-base">
                Contact Customer
              </button>

              <button 
                onClick={() => {
                  if (confirm('Are you sure you want to cancel this order?')) {
                    updateOrderStatus(order.id, 'cancelled');
                  }
                }}
                className="w-full bg-white border border-red-300 hover:bg-red-50 text-red-600 py-2 px-4 rounded-lg font-medium transition-colors text-sm sm:text-base"
              >
                Cancel Order
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4 sm:mb-6">
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            Print Items
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-2 sm:pb-3 text-left text-gray-500 font-medium text-xs sm:text-sm">
                    Print Type
                  </th>
                  <th className="pb-2 sm:pb-3 text-center text-gray-500 font-medium text-xs sm:text-sm">
                    Quantity
                  </th>
                  <th className="pb-2 sm:pb-3 text-right text-gray-500 font-medium text-xs sm:text-sm">
                    Price/Page
                  </th>
                  <th className="pb-2 sm:pb-3 text-right text-gray-500 font-medium text-xs sm:text-sm">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {printItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-3 sm:py-4 font-medium text-gray-900 text-xs sm:text-sm">
                      {item.name}
                    </td>
                    <td className="py-3 sm:py-4 text-center">
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md font-medium text-xs sm:text-sm">
                        {item.qty}
                      </span>
                    </td>
                    <td className="py-3 sm:py-4 text-right text-gray-900 text-xs sm:text-sm">
                      ₹{item.price.toFixed(2)}
                    </td>
                    <td className="py-3 sm:py-4 text-right font-medium text-gray-900 text-xs sm:text-sm">
                      ₹{(item.qty * item.price).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-200 pt-3 sm:pt-4 mt-3 sm:mt-4 flex justify-end">
            <div className="text-right">
              <div className="flex items-center gap-3 sm:gap-4 py-1 sm:py-2">
                <span className="text-gray-600 text-xs sm:text-sm">
                  Subtotal:
                </span>
                <span className="font-medium text-xs sm:text-sm">
                  ₹{subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 py-1 sm:py-2">
                <span className="text-gray-600 text-xs sm:text-sm">
                  Tax (10%):
                </span>
                <span className="font-medium text-xs sm:text-sm">
                  ₹{tax.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 py-1 sm:py-2 border-t border-gray-200 mt-1 sm:mt-2">
                <span className="text-base sm:text-lg font-semibold text-gray-900">
                  Grand Total:
                </span>
                <span className="text-base sm:text-lg font-bold text-blue-600">
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Update Modal */}
        {showStatusModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Update Order Status
                </h3>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Order:</span> {order.orderNumber}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">File:</span> {order.fileName}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">College:</span> {order.college}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="printing">Printing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStatusUpdate}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
