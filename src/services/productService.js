import api from './api';

const productService = {
  // Obtener todos los productos
  getAllProducts: async () => {
    try {
      const response = await api.get('/products');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener productos',
      };
    }
  },

  // Obtener un producto por ID
  getProductById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener producto',
      };
    }
  },

  // Obtener productos por categoría
  getProductsByCategory: async (categoryId) => {
    try {
      const response = await api.get(`/products/by-category/${categoryId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener productos por categoría',
      };
    }
  },

  // Crear un nuevo producto (el código se genera automáticamente en el backend)
  createProduct: async (productData) => {
    try {
      const response = await api.post('/products', productData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al crear producto',
      };
    }
  },

  // Actualizar un producto
  updateProduct: async (id, productData) => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar producto',
      };
    }
  },

  // Eliminar un producto
  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/products/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al eliminar producto',
      };
    }
  },

  // Cambiar estado activo/inactivo
  toggleStatus: async (id) => {
    try {
      const response = await api.patch(`/products/${id}/toggle-status`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al cambiar estado del producto',
      };
    }
  },
};

export default productService;
