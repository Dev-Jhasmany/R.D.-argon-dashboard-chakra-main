import api from './api';

const orderService = {
  // Obtener todos los pedidos
  getAllOrders: async (status = null) => {
    try {
      const url = status ? `/orders?status=${status}` : '/orders';
      const response = await api.get(url);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener pedidos',
      };
    }
  },

  // Obtener pedidos activos (para cocinero)
  getActiveOrders: async () => {
    try {
      const response = await api.get('/orders/active');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener pedidos activos',
      };
    }
  },

  // Obtener un pedido por ID
  getOrderById: async (id) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener pedido',
      };
    }
  },

  // Crear un nuevo pedido
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/orders', orderData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al crear pedido',
      };
    }
  },

  // Actualizar estado del pedido
  updateOrderStatus: async (id, statusData) => {
    try {
      const response = await api.patch(`/orders/${id}/status`, statusData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar estado',
      };
    }
  },

  // Marcar pedido como recepcionado
  markAsReceived: async (id, cookId) => {
    try {
      const response = await api.patch(`/orders/${id}/receive`, { cookId });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al recepcionar pedido',
      };
    }
  },

  // Marcar pedido como concluido
  markAsCompleted: async (id) => {
    try {
      const response = await api.patch(`/orders/${id}/complete`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al completar pedido',
      };
    }
  },

  // Actualizar tiempo de preparación
  updatePreparationTime: async (itemType, itemId, preparationTime) => {
    try {
      const response = await api.patch('/orders/preparation-time', {
        itemType,
        itemId,
        preparationTime,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar tiempo de preparación',
      };
    }
  },

  // Obtener estadísticas de pedidos
  getStatistics: async () => {
    try {
      const response = await api.get('/orders/statistics');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener estadísticas',
      };
    }
  },

  // Cancelar un pedido
  cancelOrder: async (id) => {
    try {
      const response = await api.patch(`/orders/${id}/cancel`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al cancelar pedido',
      };
    }
  },

  // Eliminar un pedido
  deleteOrder: async (id) => {
    try {
      const response = await api.delete(`/orders/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al eliminar pedido',
      };
    }
  },
};

export default orderService;
