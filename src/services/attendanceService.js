import api from './api';

const attendanceService = {
  // Registrar asistencia
  registerAttendance: async (attendanceData) => {
    try {
      const response = await api.post('/attendance', attendanceData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al registrar asistencia',
      };
    }
  },

  // Obtener todas las asistencias
  getAllAttendances: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const url = params ? `/attendance?${params}` : '/attendance';
      const response = await api.get(url);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener asistencias',
      };
    }
  },

  // Obtener asistencia por ID
  getAttendanceById: async (id) => {
    try {
      const response = await api.get(`/attendance/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener asistencia',
      };
    }
  },

  // Actualizar asistencia
  updateAttendance: async (id, attendanceData) => {
    try {
      const response = await api.patch(`/attendance/${id}`, attendanceData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar asistencia',
      };
    }
  },

  // Eliminar asistencia
  deleteAttendance: async (id) => {
    try {
      const response = await api.delete(`/attendance/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al eliminar asistencia',
      };
    }
  },

  // Registrar asistencia por QR
  registerByQR: async (qrData) => {
    try {
      const response = await api.post('/attendance/qr', qrData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al registrar asistencia por QR',
      };
    }
  },

  // Ubicaciones autorizadas
  getAllLocations: async () => {
    try {
      const response = await api.get('/attendance/locations');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener ubicaciones',
      };
    }
  },

  createLocation: async (locationData) => {
    try {
      const response = await api.post('/attendance/locations', locationData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al crear ubicación',
      };
    }
  },

  updateLocation: async (id, locationData) => {
    try {
      const response = await api.patch(`/attendance/locations/${id}`, locationData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar ubicación',
      };
    }
  },

  deleteLocation: async (id) => {
    try {
      const response = await api.delete(`/attendance/locations/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al eliminar ubicación',
      };
    }
  },

  // Validar IP
  validateIP: async (ip) => {
    try {
      const response = await api.post('/attendance/validate-ip', { ip });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al validar IP',
      };
    }
  },
};

export default attendanceService;
