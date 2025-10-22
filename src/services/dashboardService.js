import api from './api';

// Obtener estadísticas generales del dashboard
export const getDashboardStats = async () => {
  try {
    const response = await api.get('/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    throw error;
  }
};

// Obtener ventas del día
export const getTodaySales = async () => {
  try {
    const response = await api.get('/dashboard/today-sales');
    return response.data;
  } catch (error) {
    console.error('Error al obtener ventas del día:', error);
    throw error;
  }
};

// Obtener productos más vendidos
export const getTopProducts = async (limit = 5) => {
  try {
    const response = await api.get(`/dashboard/top-products?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener productos más vendidos:', error);
    throw error;
  }
};

// Obtener ventas por período
export const getSalesByPeriod = async (period = 'month') => {
  try {
    const response = await api.get(`/dashboard/sales-by-period?period=${period}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener ventas por período:', error);
    throw error;
  }
};

// Obtener productos con bajo stock
export const getLowStockProducts = async (threshold = 10) => {
  try {
    const response = await api.get(`/dashboard/low-stock?threshold=${threshold}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener productos con bajo stock:', error);
    throw error;
  }
};

// Obtener actividad reciente
export const getRecentActivity = async (limit = 10) => {
  try {
    const response = await api.get(`/dashboard/recent-activity?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener actividad reciente:', error);
    throw error;
  }
};
