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
      console.error('Error completo:', error.response);

      // Extraer el mensaje de error más específico
      let errorMessage = 'Error al crear usuario';

      if (error.response?.data) {
        // Si el error es un objeto con mensaje
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          // Puede ser un string o un array de mensajes
          if (Array.isArray(error.response.data.message)) {
            errorMessage = error.response.data.message.join(', ');
          } else {
            errorMessage = error.response.data.message;
          }
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  // Actualizar un usuario
  updateUser: async (id, userData) => {
    try {
      // Intentar con PATCH primero
      const response = await api.patch(`/users/${id}`, userData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error al actualizar usuario con PATCH:', error);

      // Si PATCH falla con 404, intentar con PUT
      if (error.response?.status === 404) {
        try {
          console.log('Intentando con PUT...');
          const response = await api.put(`/users/${id}`, userData);
          return { success: true, data: response.data };
        } catch (putError) {
          console.error('Error al actualizar usuario con PUT:', putError);
          return {
            success: false,
            error: putError.response?.data?.message || 'Error al actualizar usuario',
          };
        }
      }

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
      console.error('Error completo al eliminar usuario:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);

      // Extraer mensaje de error específico
      let errorMessage = 'Error al eliminar usuario';

      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          if (Array.isArray(error.response.data.message)) {
            errorMessage = error.response.data.message.join(', ');
          } else {
            errorMessage = error.response.data.message;
          }
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }

        // Mensajes específicos según el código de estado
        if (error.response.status === 500) {
          // Error del servidor
          errorMessage = `Error del servidor: ${errorMessage}. El usuario podría tener registros asociados (ventas, asistencias, etc.) que impiden su eliminación.`;
        } else if (error.response.status === 409 || error.response.status === 400) {
          // Conflicto - usuario tiene dependencias
          if (!errorMessage.includes('dependen') && !errorMessage.includes('relacionad') && !errorMessage.includes('asociados')) {
            errorMessage = `No se puede eliminar el usuario porque tiene registros asociados en el sistema. ${errorMessage}`;
          }
        } else if (error.response.status === 403) {
          errorMessage = 'No tiene permisos para eliminar este usuario';
        } else if (error.response.status === 404) {
          errorMessage = 'Usuario no encontrado';
        }
      }

      return {
        success: false,
        error: errorMessage,
        status: error.response?.status,
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
