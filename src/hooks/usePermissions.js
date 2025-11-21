import { useState, useEffect, useCallback } from 'react';
import permissionService from 'services/permissionService';
import { getCategoryMap, ALWAYS_VISIBLE_CATEGORIES } from 'config/menuConfig';

// Mapeo de nombres de categorías a sus IDs - Obtenido desde configuración centralizada
const CATEGORY_MAP = getCategoryMap();

// Tiempo de recarga automática de permisos (5 minutos)
const PERMISSIONS_REFRESH_INTERVAL = 5 * 60 * 1000;

export const usePermissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  const loadUserPermissions = useCallback(async () => {
    try {
      // Obtener información del usuario desde localStorage o sessionStorage
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (!userStr) {
        setLoading(false);
        return;
      }

      const user = JSON.parse(userStr);
      setUserRole(user.role);

      // Solo Super Admin (nivel 0) tiene acceso total automático
      // Administrador (nivel 1) y otros roles deben tener permisos explícitos
      if (user.role?.hierarchyLevel === 0) {
        setPermissions('ALL'); // Marcador especial para acceso total
        setLoading(false);
        return;
      }

      // Obtener permisos del rol del usuario
      if (user.role?.id) {
        const result = await permissionService.getPermissionsByRole(user.role.id);
        if (result.success) {
          setPermissions(result.data);
        }
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserPermissions();

    // Configurar recarga periódica de permisos
    const intervalId = setInterval(() => {
      loadUserPermissions();
    }, PERMISSIONS_REFRESH_INTERVAL);

    // Limpiar intervalo al desmontar
    return () => clearInterval(intervalId);
  }, [loadUserPermissions]);

  // Verificar si el usuario tiene permiso para ver una categoría
  const hasAccessToCategory = (categoryName) => {
    // Categorías siempre visibles
    if (ALWAYS_VISIBLE_CATEGORIES.includes(categoryName)) {
      return true;
    }

    // Super Admin tiene acceso a todo
    if (permissions === 'ALL') {
      return true;
    }

    // Obtener el ID de la categoría
    const categoryId = CATEGORY_MAP[categoryName];
    if (!categoryId) {
      return false; // Si no está mapeada, no mostrar
    }

    // Verificar si existe un permiso para esta categoría
    return permissions.some(p => p.menuCategory === categoryId);
  };

  // Verificar si el usuario tiene permiso para ver un submenú específico
  const hasAccessToSubmenu = (categoryName, submenuName) => {
    // Categorías siempre visibles
    if (ALWAYS_VISIBLE_CATEGORIES.includes(categoryName)) {
      return true;
    }

    // Super Admin tiene acceso a todo
    if (permissions === 'ALL') {
      return true;
    }

    // Obtener el ID de la categoría
    const categoryId = CATEGORY_MAP[categoryName];
    if (!categoryId) {
      return false;
    }

    // Buscar el permiso de esta categoría
    const permission = permissions.find(p => p.menuCategory === categoryId);
    if (!permission) {
      return false;
    }

    // Verificar si el submenú está en la lista de submenús permitidos
    return permission.submenus && permission.submenus.includes(submenuName);
  };

  // Función para recargar permisos manualmente
  const refreshPermissions = async () => {
    setLoading(true);
    await loadUserPermissions();
  };

  return {
    permissions,
    loading,
    userRole,
    hasAccessToCategory,
    hasAccessToSubmenu,
    refreshPermissions
  };
};
