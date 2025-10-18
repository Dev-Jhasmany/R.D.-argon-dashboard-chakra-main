const API_URL = 'http://localhost:3000/activity-logs';

const activityLogService = {
  // Obtener todos los logs con paginación
  async getAllLogs(limit = 100, offset = 0) {
    try {
      const response = await fetch(`${API_URL}?limit=${limit}&offset=${offset}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.message || 'Error al obtener los logs' };
      }
    } catch (error) {
      console.error('Error en getAllLogs:', error);
      return { success: false, error: 'Error de conexión con el servidor' };
    }
  },

  // Obtener estadísticas de los logs
  async getStats() {
    try {
      const response = await fetch(`${API_URL}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.message || 'Error al obtener estadísticas' };
      }
    } catch (error) {
      console.error('Error en getStats:', error);
      return { success: false, error: 'Error de conexión con el servidor' };
    }
  },

  // Obtener logs por módulo
  async getByModule(module) {
    try {
      const response = await fetch(`${API_URL}/by-module?module=${module}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.message || 'Error al obtener logs por módulo' };
      }
    } catch (error) {
      console.error('Error en getByModule:', error);
      return { success: false, error: 'Error de conexión con el servidor' };
    }
  },

  // Obtener logs por usuario
  async getByUser(userId) {
    try {
      const response = await fetch(`${API_URL}/by-user?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.message || 'Error al obtener logs por usuario' };
      }
    } catch (error) {
      console.error('Error en getByUser:', error);
      return { success: false, error: 'Error de conexión con el servidor' };
    }
  },

  // Obtener logs por rango de fechas
  async getByDateRange(startDate, endDate) {
    try {
      const response = await fetch(
        `${API_URL}/by-date-range?startDate=${startDate}&endDate=${endDate}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return {
          success: false,
          error: data.message || 'Error al obtener logs por fecha',
        };
      }
    } catch (error) {
      console.error('Error en getByDateRange:', error);
      return { success: false, error: 'Error de conexión con el servidor' };
    }
  },

  // Crear un nuevo log (usualmente lo hace el backend automáticamente)
  async createLog(logData) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.message || 'Error al crear log' };
      }
    } catch (error) {
      console.error('Error en createLog:', error);
      return { success: false, error: 'Error de conexión con el servidor' };
    }
  },

  // Limpiar logs antiguos
  async cleanupOldLogs(daysToKeep = 90) {
    try {
      const response = await fetch(`${API_URL}/cleanup?daysToKeep=${daysToKeep}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.message || 'Error al limpiar logs' };
      }
    } catch (error) {
      console.error('Error en cleanupOldLogs:', error);
      return { success: false, error: 'Error de conexión con el servidor' };
    }
  },
};

export default activityLogService;
