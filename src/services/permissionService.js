import api from './api';

const permissionService = {
  // Obtener todos los permisos
  getAllPermissions: async () => {
    try {
      const response = await api.get('/permissions');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener permisos',
      };
    }
  },

  // Obtener un permiso por ID
  getPermissionById: async (id) => {
    try {
      const response = await api.get(`/permissions/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener permiso',
      };
    }
  },

  // Crear un nuevo permiso
  createPermission: async (permissionData) => {
    try {
      const response = await api.post('/permissions', permissionData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al crear permiso',
      };
    }
  },

  // Actualizar un permiso
  updatePermission: async (id, permissionData) => {
    try {
      const response = await api.patch(`/permissions/${id}`, permissionData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar permiso',
      };
    }
  },

  // Eliminar un permiso
  deletePermission: async (id) => {
    try {
      const response = await api.delete(`/permissions/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al eliminar permiso',
      };
    }
  },

  // Obtener permisos por recurso
  getPermissionsByResource: async (resource) => {
    try {
      const response = await api.get(`/permissions?resource=${resource}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener permisos por recurso',
      };
    }
  },

  // Obtener permisos por acción
  getPermissionsByAction: async (action) => {
    try {
      const response = await api.get(`/permissions?action=${action}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener permisos por acción',
      };
    }
  },

  // Obtener permisos por rol
  getPermissionsByRole: async (roleId) => {
    try {
      const response = await api.get(`/permissions?roleId=${roleId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener permisos del rol',
      };
    }
  },
};

export default permissionService;
