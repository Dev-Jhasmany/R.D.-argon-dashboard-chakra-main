/**
 * SERVICIO: cashRegisterService
 *
 * Maneja las peticiones HTTP relacionadas con el control de caja.
 *
 * MÉTODOS:
 * - openCashRegister(data): Abre una nueva caja
 * - closeCashRegister(data): Cierra la caja actual
 * - getOpenCashRegister(): Obtiene la caja abierta
 * - getCashRegisterSummary(): Obtiene resumen/arqueo de caja
 * - getAllCashRegisters(): Obtiene historial de cajas
 * - getCashRegisterById(id): Obtiene una caja por ID
 * - createCashMovement(data): Registra un movimiento
 * - getCashMovements(): Obtiene movimientos de la caja abierta
 */
import api from './api';

const cashRegisterService = {
  /**
   * Abre una nueva sesión de caja.
   */
  openCashRegister: async (data) => {
    try {
      const response = await api.post('/cash-register/open', data);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al abrir caja',
      };
    }
  },

  /**
   * Cierra la caja actual.
   */
  closeCashRegister: async (data) => {
    try {
      const response = await api.post('/cash-register/close', data);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al cerrar caja',
      };
    }
  },

  /**
   * Obtiene la caja actualmente abierta.
   */
  getOpenCashRegister: async () => {
    try {
      const response = await api.get('/cash-register/current');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'No hay caja abierta',
      };
    }
  },

  /**
   * Obtiene el resumen/arqueo de la caja abierta.
   */
  getCashRegisterSummary: async () => {
    try {
      const response = await api.get('/cash-register/summary');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener resumen',
      };
    }
  },

  /**
   * Obtiene el historial de todas las cajas.
   */
  getAllCashRegisters: async () => {
    try {
      const response = await api.get('/cash-register');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener historial de cajas',
      };
    }
  },

  /**
   * Obtiene una caja por ID.
   */
  getCashRegisterById: async (id) => {
    try {
      const response = await api.get(`/cash-register/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener caja',
      };
    }
  },

  /**
   * Registra un movimiento de caja.
   */
  createCashMovement: async (data) => {
    try {
      const response = await api.post('/cash-register/movements', data);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al registrar movimiento',
      };
    }
  },

  /**
   * Obtiene los movimientos de la caja abierta.
   */
  getCashMovements: async () => {
    try {
      const response = await api.get('/cash-register/movements/list');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener movimientos',
      };
    }
  },
};

export default cashRegisterService;
