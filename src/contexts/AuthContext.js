import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from 'services/authService';

/**
 * CONTEXTO DE AUTENTICACIÓN
 *
 * Este contexto proporciona gestión de estado global para la autenticación del usuario.
 *
 * FLUJO DE SECUENCIA TÍPICO:
 * App Load → AuthProvider.useEffect() → authService.validateToken()
 *                    ↓
 *          ¿Token válido? → Sí → setUser() + setIsAuthenticated(true)
 *                         → No → authService.logout()
 *
 * RESPONSABILIDADES PRINCIPALES:
 * - Gestionar estado de autenticación del usuario (user, isAuthenticated, loading)
 * - Validar token JWT al cargar la aplicación
 * - Proporcionar funciones de autenticación (login, logout, register)
 * - Gestionar cambio de contraseña
 * - Actualizar información del usuario
 * - Persistir datos en localStorage/sessionStorage
 *
 * ESTADO GESTIONADO:
 * - user: Objeto con datos del usuario autenticado (null si no autenticado)
 * - loading: Boolean que indica si está validando token inicial
 * - isAuthenticated: Boolean que indica si el usuario está autenticado
 *
 * FUNCIONES PROPORCIONADAS:
 * - login(email, password): Iniciar sesión
 * - register(userData): Registrar nuevo usuario
 * - logout(): Cerrar sesión y limpiar storage
 * - changePassword(oldPassword, newPassword): Cambiar contraseña
 * - updateUser(userData): Actualizar datos del usuario en contexto y storage
 *
 * USO EN COMPONENTES:
 * ```
 * const { user, isAuthenticated, login, logout } = useAuth();
 * ```
 *
 * PROTECCIÓN DE RUTAS:
 * - Los componentes verifican isAuthenticated para mostrar/ocultar contenido
 * - Las rutas privadas redirigen a /signin si !isAuthenticated
 */
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar si hay un usuario autenticado al cargar la app
  useEffect(() => {
    const checkAuth = async () => {
      const token = authService.getToken();
      if (token) {
        const result = await authService.validateToken();
        if (result.success) {
          const currentUser = authService.getCurrentUser();
          setUser(currentUser);
          setIsAuthenticated(true);
        } else {
          // Token inválido, limpiar
          authService.logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login
  const login = async (email, password) => {
    try {
      const result = await authService.login(email, password);
      if (result.success) {
        setUser(result.data.user);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: 'Error al iniciar sesión' };
    }
  };

  // Register
  const register = async (userData) => {
    try {
      const result = await authService.register(userData);
      return result;
    } catch (error) {
      return { success: false, error: 'Error al registrar usuario' };
    }
  };

  // Logout
  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Change Password
  const changePassword = async (oldPassword, newPassword) => {
    try {
      const result = await authService.changePassword(oldPassword, newPassword);
      return result;
    } catch (error) {
      return { success: false, error: 'Error al cambiar contraseña' };
    }
  };

  // Update User
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    changePassword,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;
