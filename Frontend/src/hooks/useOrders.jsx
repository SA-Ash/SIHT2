import { useState, useEffect, createContext, useContext } from 'react';
import { ordersService } from '../services/orders.js';
import { useAuth } from './useAuth.jsx';
import { realtimeSync } from '../utils/realtimeSync.js';

// Create Orders Context
const OrdersContext = createContext();

// Orders Provider Component
export const OrdersProvider = ({ children }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Load user orders
  const loadOrders = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Try to load from backend first
      try {
        const backendOrders = await ordersService.getMyOrders();
        if (backendOrders && backendOrders.length > 0) {
          // Transform backend orders to frontend format
          const transformedOrders = backendOrders.map(order => ({
            id: order._id || order.id,
            orderNumber: `QP-2024-${String(order._id || order.id).slice(-3)}`,
            fileName: order.fileUrl ? order.fileUrl.split('/').pop() : 'Document.pdf',
            shopName: "Selected Shop", // This would come from shop service
            shopEmail: "rishi.kumar199550@gmail.com", // This would come from shop service
            status: order.status,
            statusText: order.status.charAt(0).toUpperCase() + order.status.slice(1),
            pages: order.printConfig?.pages || 1,
            color: order.printConfig?.color || false,
            doubleSided: order.printConfig?.doubleSided || false,
            copies: order.printConfig?.copies || 1,
            binding: "No Binding", // This would come from print config
            totalCost: order.totalCost || 0,
            createdAt: new Date(order.createdAt),
            updatedAt: new Date(order.updatedAt),
            college: order.college || user.college || "CBIT",
            fileUrl: order.fileUrl || "",
            userId: user.id
          }));
          
          setOrders(transformedOrders);
          // Store in localStorage for offline access
          localStorage.setItem(`orders_${user.id}`, JSON.stringify(transformedOrders));
          setLoading(false);
          return;
        }
      } catch (backendError) {
        console.log('Backend not available, using localStorage fallback:', backendError.message);
      }
      
      // Fallback to localStorage
      const storedOrders = localStorage.getItem(`orders_${user.id}`);
      if (storedOrders) {
        const parsedOrders = JSON.parse(storedOrders).map(order => ({
          ...order,
          createdAt: new Date(order.createdAt),
          updatedAt: new Date(order.updatedAt)
        }));
        setOrders(parsedOrders);
        setLoading(false);
        return;
      }
      
      // If no stored orders, create initial mock data
      const mockOrders = [
        {
          id: "order_1",
          orderNumber: "QP-2024-001",
          fileName: "Assignment_Chapter_3.pdf",
          shopName: "QuickPrint Hub - CBIT",
          shopEmail: "rishi.kumar199550@gmail.com",
          status: "pending",
          statusText: "Pending",
          pages: 12,
          color: false,
          doubleSided: false,
          copies: 1,
          binding: "Stapled",
          totalCost: 45,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
          college: user.college || "CBIT",
          fileUrl: "https://example.com/uploads/Assignment_Chapter_3.pdf"
        },
        {
          id: "order_2", 
          orderNumber: "QP-2024-002",
          fileName: "Research_Paper_Final.pdf",
          shopName: "Print Express - JNTU",
          shopEmail: "abcde@gmail.com",
          status: "accepted",
          statusText: "Accepted",
          pages: 25,
          color: true,
          doubleSided: true,
          copies: 1,
          binding: "Spiral Bound",
          totalCost: 120,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
          college: user.college || "CBIT",
          fileUrl: "https://example.com/uploads/Research_Paper_Final.pdf"
        }
      ];
      
      setOrders(mockOrders);
      // Store in localStorage
      localStorage.setItem(`orders_${user.id}`, JSON.stringify(mockOrders));
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create new order
  const createOrder = async (orderData) => {
    try {
      setLoading(true);
      
      // Try to create order via backend first
      try {
        const backendOrderData = {
          shopId: orderData.shopId || "60f7b3b3b3b3b3b3b3b3b3b3", // Default shop ID
          fileUrl: orderData.fileUrl || "https://example.com/uploads/document.pdf",
          printConfig: {
            pages: orderData.printConfig?.pages || 1,
            color: orderData.printConfig?.color || false,
            doubleSided: orderData.printConfig?.doubleSided || false,
            copies: orderData.printConfig?.copies || 1,
            paperSize: orderData.printConfig?.paperSize || "A4",
            paperType: orderData.printConfig?.paperType || "standard"
          },
          college: orderData.college || user.college || "CBIT"
        };
        
        const backendOrder = await ordersService.createOrder(backendOrderData);
        
        // Transform backend order to frontend format
        const newOrder = {
          id: backendOrder._id || backendOrder.id,
          orderNumber: `QP-2024-${String(backendOrder._id || backendOrder.id).slice(-3)}`,
          fileName: orderData.fileName || "Document.pdf",
          shopName: orderData.shopName || "Selected Shop",
          shopEmail: orderData.shopEmail || "rishi.kumar199550@gmail.com",
          status: backendOrder.status || "pending",
          statusText: (backendOrder.status || "pending").charAt(0).toUpperCase() + (backendOrder.status || "pending").slice(1),
          pages: backendOrder.printConfig?.pages || 1,
          color: backendOrder.printConfig?.color || false,
          doubleSided: backendOrder.printConfig?.doubleSided || false,
          copies: backendOrder.printConfig?.copies || 1,
          binding: orderData.printConfig?.binding || "No Binding",
          totalCost: backendOrder.totalCost || orderData.totalCost || 0,
          createdAt: new Date(backendOrder.createdAt),
          updatedAt: new Date(backendOrder.updatedAt),
          college: backendOrder.college || user.college || "CBIT",
          fileUrl: backendOrder.fileUrl || orderData.fileUrl || "",
          userId: user.id
        };
        
        // Emit Socket.IO event for new order
        const { socketService } = await import('../services/socketService.js');
        socketService.emitNewOrder({
          orderId: newOrder.id,
          userId: user.id,
          shopId: orderData.shopId,
          status: newOrder.status,
          totalCost: newOrder.totalCost,
          college: newOrder.college,
          createdAt: newOrder.createdAt
        });
        
        const updatedOrders = [newOrder, ...orders];
        setOrders(updatedOrders);
        
        // Persist to localStorage
        localStorage.setItem(`orders_${user.id}`, JSON.stringify(updatedOrders));
        
        // Also store in global orders for partners to see
        const allOrders = JSON.parse(localStorage.getItem('all_orders') || '[]');
        const updatedAllOrders = [newOrder, ...allOrders];
        localStorage.setItem('all_orders', JSON.stringify(updatedAllOrders));
        
        // Add notification for new order
        addNotification({
          id: `notif_${Date.now()}`,
          type: 'order_created',
          title: 'Order Placed Successfully',
          message: `Your order ${newOrder.orderNumber} has been placed at ${newOrder.shopName}`,
          timestamp: new Date(),
          read: false,
          orderId: newOrder.id
        });
        
        return newOrder;
      } catch (backendError) {
        console.log('Backend not available, using localStorage fallback:', backendError.message);
      }
      
      // Fallback to localStorage for offline mode
      const newOrder = {
        id: `order_${Date.now()}`,
        orderNumber: `QP-2024-${String(orders.length + 1).padStart(3, '0')}`,
        fileName: orderData.fileName || "Document.pdf",
        shopName: orderData.shopName || "Selected Shop",
        shopEmail: orderData.shopEmail || "rishi.kumar199550@gmail.com",
        status: "pending",
        statusText: "Pending",
        pages: orderData.printConfig?.pages || 1,
        color: orderData.printConfig?.color || false,
        doubleSided: orderData.printConfig?.doubleSided || false,
        copies: orderData.printConfig?.copies || 1,
        binding: orderData.printConfig?.binding || "No Binding",
        totalCost: orderData.totalCost || 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        college: user.college || "CBIT",
        fileUrl: orderData.fileUrl || "",
        userId: user.id
      };
      
      const updatedOrders = [newOrder, ...orders];
      setOrders(updatedOrders);
      
      // Persist to localStorage
      localStorage.setItem(`orders_${user.id}`, JSON.stringify(updatedOrders));
      
      // Also store in global orders for partners to see
      const allOrders = JSON.parse(localStorage.getItem('all_orders') || '[]');
      const updatedAllOrders = [newOrder, ...allOrders];
      localStorage.setItem('all_orders', JSON.stringify(updatedAllOrders));
      
      // Add notification for new order
      addNotification({
        id: `notif_${Date.now()}`,
        type: 'order_created',
        title: 'Order Placed Successfully',
        message: `Your order ${newOrder.orderNumber} has been placed at ${newOrder.shopName}`,
        timestamp: new Date(),
        read: false,
        orderId: newOrder.id
      });
      
      return newOrder;
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update order status (simulate partner actions)
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // Try to update via backend first
      try {
        await ordersService.updateOrderStatus(orderId, newStatus);
      } catch (backendError) {
        console.log('Backend not available, using localStorage fallback:', backendError.message);
      }
      
      // Update local state regardless of backend success
      const updatedOrders = orders.map(order => {
        if (order.id === orderId) {
          const statusMap = {
            'pending': 'Pending',
            'accepted': 'Accepted', 
            'printing': 'Printing',
            'completed': 'Completed',
            'cancelled': 'Cancelled'
          };
          
          const updatedOrder = {
            ...order,
            status: newStatus,
            statusText: statusMap[newStatus] || newStatus,
            updatedAt: new Date()
          };
          
          // Add notification for status change
          addNotification({
            id: `notif_${Date.now()}`,
            type: 'status_update',
            title: `Order ${order.orderNumber} Status Updated`,
            message: `Your order status has been updated to ${statusMap[newStatus]}`,
            timestamp: new Date(),
            read: false,
            orderId: orderId
          });
          
          return updatedOrder;
        }
        return order;
      });
      
      setOrders(updatedOrders);
      // Persist to localStorage
      localStorage.setItem(`orders_${user.id}`, JSON.stringify(updatedOrders));
    } catch (error) {
      console.error('Failed to update order status:', error);
      throw error;
    }
  };

  // Add notification
  const addNotification = (notification) => {
    const updatedNotifications = [notification, ...notifications];
    setNotifications(updatedNotifications);
    // Persist notifications
    localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updatedNotifications));
  };

  // Mark notification as read
  const markNotificationRead = (notificationId) => {
    const updatedNotifications = notifications.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    );
    setNotifications(updatedNotifications);
    localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updatedNotifications));
  };

  // Mark all notifications as read
  const markAllNotificationsRead = () => {
    const updatedNotifications = notifications.map(notif => ({ ...notif, read: true }));
    setNotifications(updatedNotifications);
    localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updatedNotifications));
  };

  // Get unread notification count
  const getUnreadCount = () => {
    return notifications.filter(notif => !notif.read).length;
  };

  // Load orders and notifications when user changes
  useEffect(() => {
    if (user) {
      loadOrders();
      loadNotifications();
      
      // Start real-time sync with Socket.IO
      realtimeSync.startRealtimeSync(user.id, user.role);
      
      // Add listener for real-time updates
      const handleRealtimeUpdate = (eventType, data) => {
        console.log('Real-time update received:', eventType, data);
        
        if (eventType === 'order_updated') {
          // Update specific order in state
          setOrders(prevOrders => 
            prevOrders.map(order => 
              order.id === data.orderId 
                ? { ...order, status: data.newStatus, updatedAt: new Date(data.updatedAt) }
                : order
            )
          );
          
          // Add notification for status change
          addNotification({
            id: `notif_${Date.now()}`,
            type: 'status_update',
            title: `Order Status Updated`,
            message: `Your order status has been updated to ${data.newStatus}`,
            timestamp: new Date(),
            read: false,
            orderId: data.orderId
          });
        } else if (eventType === 'order_created') {
          // Reload orders to get the new order
          loadOrders();
        } else if (eventType === 'polling_update' || eventType === 'manual_refresh') {
          // Reload orders to get latest data
          loadOrders();
        }
      };
      
      realtimeSync.addListener(handleRealtimeUpdate);
      
      // Cleanup on unmount or user change
      return () => {
        realtimeSync.removeListener(handleRealtimeUpdate);
        if (!user) {
          realtimeSync.stopRealtimeSync();
        }
      };
    } else {
      setOrders([]);
      setNotifications([]);
      realtimeSync.stopRealtimeSync();
    }
  }, [user]);

  // Load notifications from localStorage
  const loadNotifications = () => {
    const storedNotifications = localStorage.getItem(`notifications_${user.id}`);
    if (storedNotifications) {
      const parsedNotifications = JSON.parse(storedNotifications).map(notif => ({
        ...notif,
        timestamp: new Date(notif.timestamp)
      }));
      setNotifications(parsedNotifications);
    }
  };

  const value = {
    orders,
    notifications,
    loading,
    createOrder,
    updateOrderStatus,
    loadOrders,
    markNotificationRead,
    markAllNotificationsRead,
    getUnreadCount
  };

  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  );
};

// Custom hook to use orders context
export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
};
