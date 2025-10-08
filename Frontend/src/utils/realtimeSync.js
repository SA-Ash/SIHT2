// Real-time synchronization utilities for orders
import { socketService } from '../services/socketService.js';

class RealtimeSync {
  constructor() {
    this.pollingInterval = null;
    this.isPolling = false;
    this.listeners = new Set();
    this.socketListeners = new Map();
  }

  // Start real-time sync with Socket.IO
  startRealtimeSync(userId, userRole = 'client', shopId = null) {
    // Connect to Socket.IO
    socketService.connect();
    
    // Join appropriate rooms
    socketService.joinUserRoom(userId);
    if (userRole === 'shop' && shopId) {
      socketService.joinShopRoom(shopId);
    }
    
    // Set up Socket.IO listeners
    this.setupSocketListeners();
  }

  // Set up Socket.IO event listeners
  setupSocketListeners() {
    // Listen for order updates
    const orderUpdateHandler = (data) => {
      console.log('Order updated via Socket.IO:', data);
      this.notifyListeners('order_updated', data);
    };
    
    socketService.onOrderUpdate(orderUpdateHandler);
    this.socketListeners.set('order_updated', orderUpdateHandler);
    
    // Listen for new orders (for partners)
    const newOrderHandler = (data) => {
      console.log('New order received via Socket.IO:', data);
      this.notifyListeners('new_order', data);
    };
    
    socketService.onNewOrder(newOrderHandler);
    this.socketListeners.set('new_order', newOrderHandler);
    
    // Listen for order created (for students)
    const orderCreatedHandler = (data) => {
      console.log('Order created via Socket.IO:', data);
      this.notifyListeners('order_created', data);
    };
    
    socketService.onOrderCreated(orderCreatedHandler);
    this.socketListeners.set('order_created', orderCreatedHandler);
  }

  // Start polling for order updates (fallback)
  startPolling(interval = 10000) { // 10 seconds default
    if (this.isPolling) return;
    
    this.isPolling = true;
    this.pollingInterval = setInterval(async () => {
      try {
        await this.checkForUpdates();
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, interval);
  }

  // Stop real-time sync
  stopRealtimeSync() {
    // Disconnect Socket.IO
    socketService.disconnect();
    
    // Clear socket listeners
    this.socketListeners.clear();
    
    // Stop polling fallback
    this.stopPolling();
  }

  // Stop polling
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isPolling = false;
  }

  // Check for updates and notify listeners
  async checkForUpdates() {
    try {
      // This would typically check for new orders or status updates
      // For now, we'll just notify listeners that a check happened
      this.notifyListeners('polling_update');
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  }

  // Add a listener for real-time updates
  addListener(callback) {
    this.listeners.add(callback);
  }

  // Remove a listener
  removeListener(callback) {
    this.listeners.delete(callback);
  }

  // Notify all listeners
  notifyListeners(eventType, data = null) {
    this.listeners.forEach(callback => {
      try {
        callback(eventType, data);
      } catch (error) {
        console.error('Listener error:', error);
      }
    });
  }

  // Manual refresh trigger
  async triggerRefresh() {
    try {
      await this.checkForUpdates();
      this.notifyListeners('manual_refresh');
    } catch (error) {
      console.error('Failed to trigger refresh:', error);
    }
  }
}

// Create a singleton instance
export const realtimeSync = new RealtimeSync();

// Export the class for testing
export { RealtimeSync };
