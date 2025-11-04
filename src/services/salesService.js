import api from './api';

const salesService = {
  // Obtener todas las ventas
  getAllSales: async () => {
    try {
      const response = await api.get('/sales');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener ventas',
      };
    }
  },

  // Obtener una venta por ID
  getSaleById: async (id) => {
    try {
      const response = await api.get(`/sales/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener venta',
      };
    }
  },

  // Crear una nueva venta
  createSale: async (saleData) => {
    try {
      const response = await api.post('/sales', saleData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al crear venta',
      };
    }
  },

  // Eliminar una venta
  deleteSale: async (id) => {
    try {
      const response = await api.delete(`/sales/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al eliminar venta',
      };
    }
  },

  // Obtener estadísticas de ventas
  getSalesStats: async () => {
    try {
      const response = await api.get('/sales/stats');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener estadísticas',
      };
    }
  },

  // Anular una venta
  cancelSale: async (id, reason) => {
    try {
      const response = await api.patch(`/sales/${id}/cancel`, { reason });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al anular venta',
      };
    }
  },

  // Devolver una venta
  returnSale: async (id, reason) => {
    try {
      const response = await api.patch(`/sales/${id}/return`, { reason });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al devolver venta',
      };
    }
  },

  // Obtener pedidos online pendientes de confirmación de pago
  getPendingPaymentOrders: async () => {
    try {
      // Obtener todas las ventas y pedidos del backend
      const [salesResponse, ordersResponse] = await Promise.all([
        api.get('/sales'),
        api.get('/orders')
      ]);

      const allSales = salesResponse.data;
      const allOrders = ordersResponse.data;

      // Obtener datos de pago desde localStorage (incluye comprobantes)
      const localStorageOrders = JSON.parse(localStorage.getItem('pendingPaymentOrders') || '[]');

      // Fecha de hoy a las 00:00:00
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Filtrar ventas online sin pedido asociado y solo del día de hoy
      const pendingOrdersList = allSales
        .filter(sale => {
          // Es venta online si no tiene created_by_id
          const isOnline = !sale.created_by_id;

          // Verificar si ya tiene pedido
          const hasOrder = allOrders.some(order => order.saleId === sale.id);

          // Verificar si es del día de hoy
          const saleDate = new Date(sale.created_at);
          const isToday = saleDate >= today;

          // Verificar si ya fue confirmado en localStorage
          const localOrder = localStorageOrders.find(
            lo => lo.order_number === sale.sale_number
          );
          const isConfirmed = localOrder?.status === 'confirmed';

          // Verificar si tiene comprobante de pago
          const hasPaymentProof = sale.payment_proof && sale.payment_proof.length > 0;

          // Mostrar solo las que son online, no tienen pedido, son de hoy, no están confirmadas Y tienen comprobante
          return isOnline && !hasOrder && isToday && !isConfirmed && hasPaymentProof;
        });

      return { success: true, data: pendingOrdersList };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener pedidos pendientes',
      };
    }
  },
};

export default salesService;
