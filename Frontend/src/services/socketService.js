import { io } from 'socket.io-client';
import {config} from '../config/env.js';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  // Connect to Socket.IO server
  connect() {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    try {
      this.socket = io(config.API_BASE_URL, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      this.socket.on('connect', () => {
        console.log('Socket.IO connected:', this.socket.id);
        this.isConnected = true;
        this.notifyListeners('connected');
      });

      this.socket.on('disconnect', () => {
        console.log('Socket.IO disconnected');
        this.isConnected = false;
        this.notifyListeners('disconnected');
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
        this.notifyListeners('error', error);
      });

      return this.socket;
    } catch (error) {
      console.error('Failed to initialize Socket.IO:', error);
      return null;
    }
  }

  // Disconnect from server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Join user room
  joinUserRoom(userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_user_room', userId);
      console.log(`Joined user room: ${userId}`);
    }
  }

  // Join shop room
  joinShopRoom(shopId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_shop_room', shopId);
      console.log(`Joined shop room: ${shopId}`);
    }
  }

  // Listen for order updates
  onOrderUpdate(callback) {
    if (this.socket) {
      this.socket.on('order_updated', callback);
      this.addListener('order_updated', callback);
    }
  }

  // Listen for new orders
  onNewOrder(callback) {
    if (this.socket) {
      this.socket.on('new_order_received', callback);
      this.addListener('new_order_received', callback);
    }
  }

  // Listen for order created
  onOrderCreated(callback) {
    if (this.socket) {
      this.socket.on('order_created', callback);
      this.addListener('order_created', callback);
    }
  }

  // Emit order status update
  emitOrderStatusUpdate(data) {
    if (this.socket && this.isConnected) {
      this.socket.emit('order_status_update', data);
    }
  }

  // Emit new order
  emitNewOrder(data) {
    if (this.socket && this.isConnected) {
      this.socket.emit('new_order', data);
    }
  }

  // Add event listener
  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // Remove event listener
  removeListener(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Notify all listeners for an event
  notifyListeners(event, data = null) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in listener for ${event}:`, error);
        }
      });
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id || null
    };
  }
}

// Create singleton instance
export const socketService = new SocketService();

// Export the class for testing
export { SocketService };
