// Partner-specific data service
export const partnerDataService = {
  // Get partner data based on email
  getPartnerData: (email) => {
    const partnerDatabase = {
      'rishi.kumar199550@gmail.com': {
        id: 'partner_1',
        name: 'Rishi Kumar',
        email: 'rishi.kumar199550@gmail.com',
        phone: '+91 98765 43210',
        shopName: 'QuickPrint Hub - CBIT',
        address: 'Near CBIT College, Hyderabad',
        contact: '+91 98765 43210',
        rating: 4.5,
        services: ['Color Printing', 'Binding', 'Laminating'],
        capacity: { currentQueue: 3, maxQueue: 15 },
        isActive: true,
        role: 'shop'
      },
      'abcde@gmail.com': {
        id: 'partner_2',
        name: 'Print Express Owner',
        email: 'abcde@gmail.com',
        phone: '+91 98765 43211',
        shopName: 'Print Express - JNTU',
        address: 'JNTU Campus Area, Hyderabad',
        contact: '+91 98765 43211',
        rating: 4.2,
        services: ['Color Printing', 'Binding'],
        capacity: { currentQueue: 8, maxQueue: 20 },
        isActive: true,
        role: 'shop'
      },
      'abcd@gmail.com': {
        id: 'partner_3',
        name: 'Student Print Center Owner',
        email: 'abcd@gmail.com',
        phone: '+91 98765 43212',
        shopName: 'Student Print Center',
        address: 'Near Osmania University, Hyderabad',
        contact: '+91 98765 43212',
        rating: 4.0,
        services: ['Color Printing', 'Binding', 'Laminating'],
        capacity: { currentQueue: 5, maxQueue: 12 },
        isActive: true,
        role: 'shop'
      }
    };

    return partnerDatabase[email] || null;
  },

  // Get orders for a specific partner
  getPartnerOrders: (partnerEmail) => {
    const storedOrders = localStorage.getItem('all_orders');
    if (!storedOrders) return [];

    try {
      const allOrders = JSON.parse(storedOrders);
      return allOrders.filter(order => order.shopEmail === partnerEmail);
    } catch (error) {
      console.error('Failed to load partner orders:', error);
      return [];
    }
  },

  // Get notifications for a specific partner
  getPartnerNotifications: (partnerEmail) => {
    const storedNotifications = localStorage.getItem(`notifications_${partnerEmail}`);
    if (!storedNotifications) return [];

    try {
      return JSON.parse(storedNotifications).map(notif => ({
        ...notif,
        timestamp: new Date(notif.timestamp)
      }));
    } catch (error) {
      console.error('Failed to load partner notifications:', error);
      return [];
    }
  },

  // Create partner notification
  createPartnerNotification: (partnerEmail, notification) => {
    const existingNotifications = partnerDataService.getPartnerNotifications(partnerEmail);
    const updatedNotifications = [notification, ...existingNotifications];
    localStorage.setItem(`notifications_${partnerEmail}`, JSON.stringify(updatedNotifications));
  },

  // Update order status and notify students
  updateOrderStatus: (orderId, newStatus, partnerEmail) => {
    // Get all orders from localStorage
    const storedOrders = localStorage.getItem('all_orders');
    if (!storedOrders) return;

    try {
      const allOrders = JSON.parse(storedOrders);
      const updatedOrders = allOrders.map(order => {
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

          // Notify the student who placed the order
          if (order.userId) {
            const studentNotifications = localStorage.getItem(`notifications_${order.userId}`);
            if (studentNotifications) {
              const parsedNotifications = JSON.parse(studentNotifications);
              const newNotification = {
                id: `notif_${Date.now()}`,
                type: 'status_update',
                title: `Order ${order.orderNumber} Status Updated`,
                message: `Your order status has been updated to ${statusMap[newStatus]}`,
                timestamp: new Date(),
                read: false,
                orderId: orderId
              };
              const updatedStudentNotifications = [newNotification, ...parsedNotifications];
              localStorage.setItem(`notifications_${order.userId}`, JSON.stringify(updatedStudentNotifications));
            }
          }

          return updatedOrder;
        }
        return order;
      });

      // Update all orders
      localStorage.setItem('all_orders', JSON.stringify(updatedOrders));

      // Update individual user orders
      const orderToUpdate = allOrders.find(order => order.id === orderId);
      if (orderToUpdate && orderToUpdate.userId) {
        const userOrders = localStorage.getItem(`orders_${orderToUpdate.userId}`);
        if (userOrders) {
          const parsedUserOrders = JSON.parse(userOrders);
          const updatedUserOrders = parsedUserOrders.map(userOrder => {
            if (userOrder.id === orderId) {
              return {
                ...userOrder,
                status: newStatus,
                statusText: statusMap[newStatus] || newStatus,
                updatedAt: new Date()
              };
            }
            return userOrder;
          });
          localStorage.setItem(`orders_${orderToUpdate.userId}`, JSON.stringify(updatedUserOrders));
        }
      }

    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  }
};
