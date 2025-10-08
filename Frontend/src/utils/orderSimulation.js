// Order Status Simulation for Prototype
// This simulates real-time order status updates

export const simulateOrderStatusUpdates = (updateOrderStatus) => {
  // Simulate order status changes every 30 seconds for demo purposes
  const statusSequence = ['pending', 'accepted', 'printing', 'completed'];
  
  const simulateStatusChange = () => {
    // In a real app, this would be triggered by partner actions
    // For prototype, we'll simulate automatic status progression
    
    // Get a random order to update (if any exist)
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    if (orders.length === 0) return;
    
    // Find an order that's not completed
    const pendingOrders = orders.filter(order => 
      order.status !== 'completed' && order.status !== 'cancelled'
    );
    
    if (pendingOrders.length === 0) return;
    
    // Pick a random order to update
    const randomOrder = pendingOrders[Math.floor(Math.random() * pendingOrders.length)];
    const currentStatusIndex = statusSequence.indexOf(randomOrder.status);
    
    if (currentStatusIndex < statusSequence.length - 1) {
      const nextStatus = statusSequence[currentStatusIndex + 1];
      updateOrderStatus(randomOrder.id, nextStatus);
    }
  };
  
  // Start simulation
  const interval = setInterval(simulateStatusChange, 30000); // 30 seconds
  
  // Return cleanup function
  return () => clearInterval(interval);
};

export const createMockOrderStatusUpdate = (orderId, newStatus) => {
  const statusMessages = {
    'pending': 'Your order has been received and is being reviewed',
    'accepted': 'Your order has been accepted and is being prepared',
    'printing': 'Your order is currently being printed',
    'completed': 'Your order is ready for pickup!',
    'cancelled': 'Your order has been cancelled'
  };
  
  return {
    id: `notif_${Date.now()}`,
    type: 'status_update',
    title: `Order Status Updated`,
    message: statusMessages[newStatus] || 'Your order status has been updated',
    timestamp: new Date(),
    read: false,
    orderId: orderId
  };
};
