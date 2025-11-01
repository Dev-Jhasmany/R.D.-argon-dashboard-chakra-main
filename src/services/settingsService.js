/**
 * SERVICIO: settingsService
 *
 * Maneja las peticiones HTTP relacionadas con la configuración del negocio.
 *
 * MÉTODOS:
 * - getBusinessSettings(): Obtiene la configuración del negocio
 * - updateBusinessSettings(data): Actualiza la configuración del negocio
 *
 * FLUJO TÍPICO:
 * Componente → settingsService.getBusinessSettings() → api.get('/settings/business') → Backend
 *
 * RESPUESTA ESTÁNDAR:
 * { success: boolean, data: {...} } o { success: boolean, error: string }
 */
import api from './api';

const settingsService = {
  /**
   * Obtiene la configuración del negocio.
   *
   * @returns {Promise<{success: boolean, data: object} | {success: boolean, error: string}>}
   */
  getBusinessSettings: async () => {
    try {
      const response = await api.get('/settings/business');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener configuración del negocio',
      };
    }
  },

  /**
   * Actualiza la configuración del negocio.
   *
   * @param {object} settingsData - Datos de configuración a actualizar
   * @returns {Promise<{success: boolean, data: object} | {success: boolean, error: string}>}
   */
  updateBusinessSettings: async (settingsData) => {
    try {
      const response = await api.put('/settings/business', settingsData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar configuración del negocio',
      };
    }
  },
};

export default settingsService;
