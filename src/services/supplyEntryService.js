import api from './api';

const supplyEntryService = {
  // Obtener todas las entradas de insumos
  getAllEntries: async () => {
    try {
      const response = await api.get('/supply-entries');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener entradas de insumos',
      };
    }
  },

  // Alias para getAllEntries
  getAllSupplyEntries: async () => {
    return supplyEntryService.getAllEntries();
  },

  // Obtener una entrada por ID
  getEntryById: async (id) => {
    try {
      const response = await api.get(`/supply-entries/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener entrada de insumo',
      };
    }
  },

  // Crear una nueva entrada
  createEntry: async (entryData) => {
    try {
      const response = await api.post('/supply-entries', entryData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al crear entrada de insumo',
      };
    }
  },

  // Actualizar una entrada
  updateEntry: async (id, entryData) => {
    try {
      const response = await api.put(`/supply-entries/${id}`, entryData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar entrada de insumo',
      };
    }
  },

  // Eliminar una entrada
  deleteEntry: async (id) => {
    try {
      const response = await api.delete(`/supply-entries/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al eliminar entrada de insumo',
      };
    }
  },

  // Obtener entradas por proveedor
  getEntriesBySupplier: async (supplierId) => {
    try {
      const response = await api.get(`/supply-entries/by-supplier/${supplierId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener entradas del proveedor',
      };
    }
  },

  // Obtener entradas por rango de fechas
  getEntriesByDateRange: async (startDate, endDate) => {
    try {
      const response = await api.get(`/supply-entries/by-date-range?startDate=${startDate}&endDate=${endDate}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener entradas por fecha',
      };
    }
  },
};

export default supplyEntryService;
