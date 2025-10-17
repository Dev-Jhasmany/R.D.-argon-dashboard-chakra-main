import api from './api';

const roleService = {
  // Obtener todos los roles
  getAllRoles: async () => {
    try {
      const response = await api.get('/roles');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener roles',
      };
    }
  },

  // Obtener un rol por ID
  getRoleById: async (id) => {
    try {
      const response = await api.get(`/roles/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener rol',
      };
    }
  },

  // Crear un nuevo rol
  createRole: async (roleData) => {
    try {
      const response = await api.post('/roles', roleData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al crear rol',
      };
    }
  },

  // Actualizar un rol
  updateRole: async (id, roleData) => {
    try {
      const response = await api.patch(`/roles/${id}`, roleData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar rol',
      };
    }
  },

  // Eliminar un rol
  deleteRole: async (id) => {
    try {
      const response = await api.delete(`/roles/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al eliminar rol',
      };
    }
  },
};

export default roleService;
