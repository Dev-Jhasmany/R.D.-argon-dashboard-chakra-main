import api from './api';

const groupService = {
  // Obtener todos los grupos
  getAllGroups: async () => {
    try {
      const response = await api.get('/groups');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener grupos',
      };
    }
  },

  // Obtener un grupo por ID
  getGroupById: async (id) => {
    try {
      const response = await api.get(`/groups/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener grupo',
      };
    }
  },

  // Crear un nuevo grupo
  createGroup: async (groupData) => {
    try {
      const response = await api.post('/groups', groupData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al crear grupo',
      };
    }
  },

  // Actualizar un grupo
  updateGroup: async (id, groupData) => {
    try {
      const response = await api.patch(`/groups/${id}`, groupData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar grupo',
      };
    }
  },

  // Eliminar un grupo
  deleteGroup: async (id) => {
    try {
      const response = await api.delete(`/groups/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al eliminar grupo',
      };
    }
  },
};

export default groupService;
