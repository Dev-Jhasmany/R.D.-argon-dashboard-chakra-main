import api from './api';

const supplierService = {
  // Obtener todos los proveedores
  getAllSuppliers: async () => {
    try {
      const response = await api.get('/suppliers');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener proveedores',
      };
    }
  },

  // Obtener un proveedor por ID
  getSupplierById: async (id) => {
    try {
      const response = await api.get(`/suppliers/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener proveedor',
      };
    }
  },

  // Crear un nuevo proveedor
  createSupplier: async (supplierData) => {
    try {
      const response = await api.post('/suppliers', supplierData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al crear proveedor',
      };
    }
  },

  // Actualizar un proveedor
  updateSupplier: async (id, supplierData) => {
    try {
      const response = await api.put(`/suppliers/${id}`, supplierData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar proveedor',
      };
    }
  },

  // Eliminar un proveedor
  deleteSupplier: async (id) => {
    try {
      const response = await api.delete(`/suppliers/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al eliminar proveedor',
      };
    }
  },

  // Cambiar estado activo/inactivo del proveedor
  toggleStatus: async (id) => {
    try {
      const response = await api.patch(`/suppliers/${id}/toggle-status`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al cambiar estado del proveedor',
      };
    }
  },
};

export default supplierService;
