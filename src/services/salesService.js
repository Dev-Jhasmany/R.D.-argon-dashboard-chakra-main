import api from './api';

const salesService = {
  // Obtener todas las ventas
  getAllSales: async () => {
    try {
      const response = await api.get('/sales');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener ventas',
      };
    }
  },

  // Obtener una venta por ID
  getSaleById: async (id) => {
    try {
      const response = await api.get(`/sales/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener venta',
      };
    }
  },

  // Crear una nueva venta
  createSale: async (saleData) => {
    try {
      const response = await api.post('/sales', saleData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al crear venta',
      };
    }
  },

  // Eliminar una venta
  deleteSale: async (id) => {
    try {
      const response = await api.delete(`/sales/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al eliminar venta',
      };
    }
  },

  // Obtener estadísticas de ventas
  getSalesStats: async () => {
    try {
      const response = await api.get('/sales/stats');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener estadísticas',
      };
    }
  },

  // Anular una venta
  cancelSale: async (id, reason) => {
    try {
      const response = await api.patch(`/sales/${id}/cancel`, { reason });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al anular venta',
      };
    }
  },

  // Devolver una venta
  returnSale: async (id, reason) => {
    try {
      const response = await api.patch(`/sales/${id}/return`, { reason });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al devolver venta',
      };
    }
  },
};

export default salesService;
