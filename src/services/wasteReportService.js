import api from './api';

const wasteReportService = {
  // Obtener todos los reportes de desperdicio
  getAllReports: async () => {
    try {
      const response = await api.get('/waste-reports');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener reportes de desperdicio',
      };
    }
  },

  // Obtener un reporte por ID
  getReportById: async (id) => {
    try {
      const response = await api.get(`/waste-reports/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener reporte de desperdicio',
      };
    }
  },

  // Crear un nuevo reporte de desperdicio
  createReport: async (reportData) => {
    try {
      const response = await api.post('/waste-reports', reportData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al crear reporte de desperdicio',
      };
    }
  },

  // Actualizar un reporte
  updateReport: async (id, reportData) => {
    try {
      const response = await api.patch(`/waste-reports/${id}`, reportData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar reporte de desperdicio',
      };
    }
  },

  // Eliminar un reporte
  deleteReport: async (id) => {
    try {
      const response = await api.delete(`/waste-reports/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al eliminar reporte de desperdicio',
      };
    }
  },
};

export default wasteReportService;
