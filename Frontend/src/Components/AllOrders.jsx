import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronDown,
  Eye,
  Printer,
  Download,
  Calendar,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
} from "lucide-react";
import { usePartnerOrders } from "../hooks/usePartnerOrders.jsx";

const AllOrders = () => {
  const { orders, updateOrderStatus } = usePartnerOrders();
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  const navigate = useNavigate();

  const statusOptions = ["All", "pending", "accepted", "printing", "completed", "cancelled"];
  
  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-blue-100 text-blue-800",
    printing: "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const statusLabels = {
    pending: "Pending",
    accepted: "Accepted",
    printing: "Printing",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      selectedStatus === "All" || order.status === selectedStatus;
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.college.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = dateFilter === "" || formatDate(order.createdAt).includes(dateFilter);

    return matchesStatus && matchesSearch && matchesDate;
  });

  const handleStatusUpdate = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setShowStatusModal(true);
  };

  const confirmStatusUpdate = () => {
    if (selectedOrder && newStatus) {
      updateOrderStatus(selectedOrder.id, newStatus);
      setShowStatusModal(false);
      setSelectedOrder(null);
      setNewStatus("");
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-300 p-4 sm:p-6">
      <div className="flex flex-col gap-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-900">All Orders</h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search orders..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="relative flex-1 sm:flex-none sm:w-40">
            <select
              className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer appearance-none"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>

          <div className="relative flex-1 sm:flex-none sm:w-40">
            <input
              type="text"
              placeholder="Filter by date..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            <Calendar
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          </div>

          <button className="px-4 py-2 flex items-center gap-2 border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-50 transition-colors sm:w-auto justify-center">
            <Download size={16} />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr className="text-gray-600 text-sm">
              <th className="px-3 py-2 sm:px-4 sm:py-3 font-medium">
                Order ID
              </th>
              <th className="px-3 py-2 sm:px-4 sm:py-3 font-medium hidden sm:table-cell">
                Customer
              </th>
              <th className="px-3 py-2 sm:px-4 sm:py-3 font-medium hidden md:table-cell">
                Date
              </th>
              <th className="px-3 py-2 sm:px-4 sm:py-3 font-medium hidden lg:table-cell">
                College
              </th>
              <th className="px-3 py-2 sm:px-4 sm:py-3 font-medium hidden md:table-cell">
                Items
              </th>
              <th className="px-3 py-2 sm:px-4 sm:py-3 font-medium">Total</th>
              <th className="px-3 py-2 sm:px-4 sm:py-3 font-medium hidden lg:table-cell">
                Payment
              </th>
              <th className="px-3 py-2 sm:px-4 sm:py-3 font-medium">Status</th>
              <th className="px-3 py-2 sm:px-4 sm:py-3 font-medium text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2 sm:px-4 sm:py-3 font-medium text-blue-800 text-sm">
                    <div className="flex flex-col">
                      <span>{order.orderNumber}</span>
                      <span className="text-xs text-gray-500 sm:hidden">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 sm:px-4 sm:py-3 text-sm">
                    <div>
                      <div className="font-medium hidden sm:block">
                        Student Customer
                      </div>
                      <div className="sm:hidden text-xs">
                        <div className="font-medium">Student</div>
                        <div className="text-gray-500">{order.college}</div>
                      </div>
                      <div className="text-xs text-gray-500 hidden sm:block">
                        {order.college}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 sm:px-4 sm:py-3 text-sm hidden md:table-cell">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-3 py-2 sm:px-4 sm:py-3 text-sm hidden lg:table-cell">
                    {order.college}
                  </td>
                  <td className="px-3 py-2 sm:px-4 sm:py-3 text-sm text-center hidden md:table-cell">
                    {order.fileName}
                  </td>
                  <td className="px-3 py-2 sm:px-4 sm:py-3 text-sm font-medium">
                    ₹{order.totalCost}
                  </td>
                  <td className="px-3 py-2 sm:px-4 sm:py-3 hidden lg:table-cell">
                    <span className="px-2 py-1 text-xs rounded-full font-medium bg-green-100 text-green-800">
                      Paid
                    </span>
                  </td>
                  <td className="px-3 py-2 sm:px-4 sm:py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium ${
                        statusStyles[order.status]
                      }`}
                    >
                      {statusLabels[order.status]}
                    </span>
                  </td>
                  <td className="px-3 py-2 sm:px-4 sm:py-3">
                    <div className="flex justify-end gap-1 sm:gap-2">
                      <button
                        onClick={() => navigate(`/partner/orders/${order.id}`)}
                        className="p-1 sm:p-1.5 rounded-md border border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-colors"
                        title="View details"
                      >
                        <Eye size={14} className="sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(order)}
                        className="p-1 sm:p-1.5 rounded-md border border-gray-300 hover:border-green-500 hover:text-green-600 transition-colors"
                        title="Update status"
                      >
                        <CheckCircle size={14} className="sm:w-4 sm:h-4" />
                      </button>
                      <button
                        className="p-1 sm:p-1.5 rounded-md border border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-colors hidden sm:block"
                        title="Print receipt"
                      >
                        <Printer size={14} className="sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No orders found matching your criteria.
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-3">
        <div className="text-sm text-gray-600">
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-50 transition-colors">
            Previous
          </button>
          <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-50 transition-colors">
            Next
          </button>
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

            {selectedOrder && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Order:</span> {selectedOrder.orderNumber}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">File:</span> {selectedOrder.fileName}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">College:</span> {selectedOrder.college}
                </p>
              </div>
            )}

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
  );
};

export default AllOrders;
