import api from './api';

const categoryService = {
  // Obtener todas las categorías
  getAllCategories: async () => {
    try {
      const response = await api.get('/categories');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener categorías',
      };
    }
  },

  // Obtener una categoría por ID
  getCategoryById: async (id) => {
    try {
      const response = await api.get(`/categories/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener categoría',
      };
    }
  },

  // Crear una nueva categoría
  createCategory: async (categoryData) => {
    try {
      const response = await api.post('/categories', categoryData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al crear categoría',
      };
    }
  },

  // Actualizar una categoría
  updateCategory: async (id, categoryData) => {
    try {
      const response = await api.put(`/categories/${id}`, categoryData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar categoría',
      };
    }
  },

  // Eliminar una categoría
  deleteCategory: async (id) => {
    try {
      const response = await api.delete(`/categories/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al eliminar categoría',
      };
    }
  },

  // Cambiar estado activo/inactivo
  toggleStatus: async (id) => {
    try {
      const response = await api.patch(`/categories/${id}/toggle-status`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al cambiar estado de categoría',
      };
    }
  },
};

export default categoryService;
