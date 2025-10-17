import api from './api';

const stockMovementService = {
  // Obtener todos los movimientos de stock
  getAllMovements: async () => {
    try {
      const response = await api.get('/stock-movements');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener movimientos de stock',
      };
    }
  },

  // Obtener un movimiento por ID
  getMovementById: async (id) => {
    try {
      const response = await api.get(`/stock-movements/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener movimiento',
      };
    }
  },

  // Obtener movimientos de un producto específico
  getMovementsByProduct: async (productId) => {
    try {
      const response = await api.get(`/stock-movements/product/${productId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener movimientos del producto',
      };
    }
  },

  // Obtener historial de stock de un producto
  getStockHistory: async (productId, limit) => {
    try {
      const url = limit
        ? `/stock-movements/product/${productId}/history?limit=${limit}`
        : `/stock-movements/product/${productId}/history`;
      const response = await api.get(url);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener historial de stock',
      };
    }
  },

  // Crear un movimiento de stock (entrada o salida)
  createMovement: async (movementData) => {
    try {
      const response = await api.post('/stock-movements', movementData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al crear movimiento de stock',
      };
    }
  },

  // Eliminar un movimiento
  deleteMovement: async (id) => {
    try {
      const response = await api.delete(`/stock-movements/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al eliminar movimiento',
      };
    }
  },
};

export default stockMovementService;
