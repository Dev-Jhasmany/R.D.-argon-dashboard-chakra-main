import api from './api';

const userService = {
  // Obtener todos los usuarios
  getAllUsers: async () => {
    try {
      const response = await api.get('/users');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener usuarios',
      };
    }
  },

  // Obtener un usuario por ID
  getUserById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener usuario',
      };
    }
  },

  // Crear un nuevo usuario (usa endpoint de registro de auth)
  createUser: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al crear usuario',
      };
    }
  },

  // Actualizar un usuario
  updateUser: async (id, userData) => {
    try {
      const response = await api.patch(`/users/${id}`, userData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar usuario',
      };
    }
  },

  // Eliminar un usuario
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al eliminar usuario',
      };
    }
  },

  // Cambiar estado de un usuario (activar/desactivar)
  toggleUserStatus: async (id, isActive) => {
    try {
      const response = await api.patch(`/users/${id}`, { isActive });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al cambiar estado del usuario',
      };
    }
  },

  // Asignar rol a un usuario
  assignRole: async (userId, roleId) => {
    try {
      const response = await api.post(`/users/${userId}/roles`, { roleId });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al asignar rol',
      };
    }
  },

  // Buscar usuarios
  searchUsers: async (searchTerm) => {
    try {
      const response = await api.get(`/users?search=${searchTerm}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al buscar usuarios',
      };
    }
  },
};

export default userService;
