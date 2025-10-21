import api from './api';

const activityLogService = {
  // Obtener todos los logs con paginación
  async getAllLogs(limit = 100, offset = 0) {
    try {
      const response = await api.get(`/activity-logs?limit=${limit}&offset=${offset}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error en getAllLogs:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error de conexión con el servidor'
      };
    }
  },

  // Obtener estadísticas de los logs
  async getStats() {
    try {
      const response = await api.get('/activity-logs/stats');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error en getStats:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error de conexión con el servidor'
      };
    }
  },

  // Obtener logs por módulo
  async getByModule(module) {
    try {
      const response = await api.get(`/activity-logs/by-module?module=${module}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error en getByModule:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error de conexión con el servidor'
      };
    }
  },

  // Obtener logs por usuario
  async getByUser(userId) {
    try {
      const response = await api.get(`/activity-logs/by-user?userId=${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error en getByUser:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error de conexión con el servidor'
      };
    }
  },

  // Obtener logs por rango de fechas
  async getByDateRange(startDate, endDate) {
    try {
      const response = await api.get(
        `/activity-logs/by-date-range?startDate=${startDate}&endDate=${endDate}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error en getByDateRange:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error de conexión con el servidor'
      };
    }
  },

  // Crear un nuevo log (usualmente lo hace el backend automáticamente)
  async createLog(logData) {
    try {
      const response = await api.post('/activity-logs', logData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error en createLog:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error de conexión con el servidor'
      };
    }
  },

  // Limpiar logs antiguos
  async cleanupOldLogs(daysToKeep = 90) {
    try {
      const response = await api.delete(`/activity-logs/cleanup?daysToKeep=${daysToKeep}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error en cleanupOldLogs:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error de conexión con el servidor'
      };
    }
  },
};

export default activityLogService;
