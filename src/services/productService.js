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

  // Crear un nuevo producto
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
      const response = await api.patch(`/products/${id}`, productData);
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

  // Actualizar stock de un producto
  updateStock: async (id, quantity, operation = 'add') => {
    try {
      const response = await api.patch(`/products/${id}/stock`, {
        quantity,
        operation, // 'add' o 'subtract'
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar stock',
      };
    }
  },

  // Buscar productos
  searchProducts: async (searchTerm) => {
    try {
      const response = await api.get(`/products?search=${searchTerm}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al buscar productos',
      };
    }
  },

  // Filtrar productos por categoría
  getProductsByCategory: async (categoryId) => {
    try {
      const response = await api.get(`/products?category=${categoryId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al filtrar productos',
      };
    }
  },

  // Obtener productos con bajo stock
  getLowStockProducts: async (threshold = 10) => {
    try {
      const response = await api.get(`/products?lowStock=${threshold}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener productos con bajo stock',
      };
    }
  },
};

export default productService;
