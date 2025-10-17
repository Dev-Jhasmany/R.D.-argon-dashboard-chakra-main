import api from './api';

const promotionService = {
  // Obtener todas las promociones
  getAllPromotions: async () => {
    try {
      const response = await api.get('/promotions');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener promociones',
      };
    }
  },

  // Obtener promociones por tipo
  getPromotionsByType: async (type) => {
    try {
      const response = await api.get(`/promotions?type=${type}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener promociones',
      };
    }
  },

  // Obtener promociones activas
  getActivePromotions: async () => {
    try {
      const response = await api.get('/promotions/active');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener promociones activas',
      };
    }
  },

  // Obtener una promoción por ID
  getPromotionById: async (id) => {
    try {
      const response = await api.get(`/promotions/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener promoción',
      };
    }
  },

  // Crear una nueva promoción
  createPromotion: async (promotionData) => {
    try {
      const response = await api.post('/promotions', promotionData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al crear promoción',
      };
    }
  },

  // Actualizar una promoción
  updatePromotion: async (id, promotionData) => {
    try {
      const response = await api.patch(`/promotions/${id}`, promotionData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar promoción',
      };
    }
  },

  // Activar/Desactivar una promoción
  toggleActivePromotion: async (id) => {
    try {
      const response = await api.patch(`/promotions/${id}/toggle-active`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al cambiar estado de promoción',
      };
    }
  },

  // Eliminar una promoción
  deletePromotion: async (id) => {
    try {
      const response = await api.delete(`/promotions/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al eliminar promoción',
      };
    }
  },
};

export default promotionService;
