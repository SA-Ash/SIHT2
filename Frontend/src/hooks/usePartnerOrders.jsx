import { useState, useEffect, createContext, useContext } from 'react';
import { useAuth } from './useAuth.jsx';
import { partnerDataService } from '../services/partnerData.js';
import { ordersService } from '../services/orders.js';
import { realtimeSync } from '../utils/realtimeSync.js';

// Create Partner Orders Context
const PartnerOrdersContext = createContext();

// Partner Orders Provider Component
export const PartnerOrdersProvider = ({ children }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load partner orders
  const loadOrders = async () => {
    if (!user || user.role !== 'shop') return;
    
    try {
      setLoading(true);
      
      // Try to load from backend first
      try {
        const backendOrders = await ordersService.getPartnerOrders();
        if (backendOrders && backendOrders.length > 0) {
          // Transform backend orders to frontend format
          const transformedOrders = backendOrders.map(order => ({
            id: order._id || order.id,
            orderNumber: `QP-2024-${String(order._id || order.id).slice(-3)}`,
            fileName: order.fileUrl ? order.fileUrl.split('/').pop() : 'Document.pdf',
            shopName: "My Shop", // Partner's own shop
            shopEmail: user.email,
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
            college: order.college || "CBIT",
            fileUrl: order.fileUrl || "",
            userId: order.userId
          }));
          
          setOrders(transformedOrders);
          setLoading(false);
          return;
        }
      } catch (backendError) {
        console.log('Backend not available, using localStorage fallback:', backendError.message);
      }
      
      // Fallback to localStorage
      const partnerOrders = partnerDataService.getPartnerOrders(user.email);
      setOrders(partnerOrders);
      
      // Load partner notifications
      const partnerNotifications = partnerDataService.getPartnerNotifications(user.email);
      setNotifications(partnerNotifications);
      
    } catch (error) {
      console.error('Failed to load partner orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // Try to update via backend first
      try {
        await ordersService.updateOrderStatus(orderId, newStatus);
        
        // Emit Socket.IO event for status update
        const { socketService } = await import('../services/socketService.js');
        socketService.emitOrderStatusUpdate({
          orderId: orderId,
          userId: user.id,
          shopId: user.shopId || "60f7b3b3b3b3b3b3b3b3b3b3",
          newStatus: newStatus,
          updatedAt: new Date()
        });
      } catch (backendError) {
        console.log('Backend not available, using localStorage fallback:', backendError.message);
      }
      
      // Update in global orders (fallback)
      partnerDataService.updateOrderStatus(orderId, newStatus, user.email);
      
      // Update local state
      const updatedOrders = orders.map(order => {
        if (order.id === orderId) {
          const statusMap = {
            'pending': 'Pending',
            'accepted': 'Accepted',
            'printing': 'Printing',
            'completed': 'Completed',
            'cancelled': 'Cancelled'
          };
          
          return {
            ...order,
            status: newStatus,
            statusText: statusMap[newStatus] || newStatus,
            updatedAt: new Date()
          };
        }
        return order;
      });
      
      setOrders(updatedOrders);
      
      // Add notification for partner
      const notification = {
        id: `notif_${Date.now()}`,
        type: 'order_updated',
        title: `Order ${orderId} Status Updated`,
        message: `You updated order status to ${newStatus}`,
        timestamp: new Date(),
        read: false,
        orderId: orderId
      };
      
      const updatedNotifications = [notification, ...notifications];
      setNotifications(updatedNotifications);
      partnerDataService.createPartnerNotification(user.email, notification);
      
    } catch (error) {
      console.error('Failed to update order status:', error);
      throw error;
    }
  };

  // Mark notification as read
  const markNotificationRead = (notificationId) => {
    const updatedNotifications = notifications.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    );
    setNotifications(updatedNotifications);
    localStorage.setItem(`notifications_${user.email}`, JSON.stringify(updatedNotifications));
  };

  // Mark all notifications as read
  const markAllNotificationsRead = () => {
    const updatedNotifications = notifications.map(notif => ({ ...notif, read: true }));
    setNotifications(updatedNotifications);
    localStorage.setItem(`notifications_${user.email}`, JSON.stringify(updatedNotifications));
  };

  // Get unread notification count
  const getUnreadCount = () => {
    return notifications.filter(notif => !notif.read).length;
  };

  // Load orders when user changes
  useEffect(() => {
    if (user && user.role === 'shop') {
      loadOrders();
      
      // Start real-time sync with Socket.IO for partners
      const shopId = user.shopId || "60f7b3b3b3b3b3b3b3b3b3b3"; // Default shop ID
      realtimeSync.startRealtimeSync(user.id, user.role, shopId);
      
      // Add listener for real-time updates
      const handleRealtimeUpdate = (eventType, data) => {
        console.log('Partner real-time update received:', eventType, data);
        
        if (eventType === 'new_order') {
          // New order received - reload orders
          loadOrders();
          
          // Add notification for new order
          const notification = {
            id: `notif_${Date.now()}`,
            type: 'new_order',
            title: 'New Order Received',
            message: `New order from ${data.college || 'Student'}`,
            timestamp: new Date(),
            read: false,
            orderId: data.orderId
          };
          
          const updatedNotifications = [notification, ...notifications];
          setNotifications(updatedNotifications);
        } else if (eventType === 'order_updated') {
          // Order status updated - update local state
          setOrders(prevOrders => 
            prevOrders.map(order => 
              order.id === data.orderId 
                ? { ...order, status: data.newStatus, updatedAt: new Date(data.updatedAt) }
                : order
            )
          );
        } else if (eventType === 'polling_update' || eventType === 'manual_refresh') {
          // Reload orders to get latest data
          loadOrders();
        }
      };
      
      realtimeSync.addListener(handleRealtimeUpdate);
      
      // Cleanup on unmount or user change
      return () => {
        realtimeSync.removeListener(handleRealtimeUpdate);
        if (!user || user.role !== 'shop') {
          realtimeSync.stopRealtimeSync();
        }
      };
    } else {
      setOrders([]);
      setNotifications([]);
      realtimeSync.stopRealtimeSync();
    }
  }, [user]);

  const value = {
    orders,
    notifications,
    loading,
    updateOrderStatus,
    loadOrders,
    markNotificationRead,
    markAllNotificationsRead,
    getUnreadCount
  };

  return (
    <PartnerOrdersContext.Provider value={value}>
      {children}
    </PartnerOrdersContext.Provider>
  );
};

// Custom hook to use partner orders context
export const usePartnerOrders = () => {
  const context = useContext(PartnerOrdersContext);
  if (!context) {
    throw new Error('usePartnerOrders must be used within a PartnerOrdersProvider');
  }
  return context;
};
