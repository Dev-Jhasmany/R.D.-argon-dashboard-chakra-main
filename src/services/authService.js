/**
 * SERVICIO DE AUTENTICACIÓN
 *
 * Este servicio maneja todas las operaciones de autenticación y autorización del frontend.
 *
 * FLUJO DE SECUENCIA TÍPICO (Login):
 * SignIn.js → authService.login(email, password, rememberMe)
 *                    ↓
 *          api.post('/auth/login') → Backend
 *                    ↓
 *          Backend valida credenciales → Retorna { access_token, user }
 *                    ↓
 *          authService guarda token y user en localStorage/sessionStorage
 *                    ↓
 *          Si rememberMe: Guarda email en localStorage
 *                    ↓
 *          Retorna { success: true, data } a SignIn.js
 *                    ↓
 *          AuthContext actualiza estado global
 *
 * RESPONSABILIDADES PRINCIPALES:
 * - Gestionar login con soporte de "Recordarme"
 * - Registrar nuevos usuarios
 * - Logout y limpieza de storage
 * - Obtener usuario actual desde storage
 * - Validar token JWT
 * - Cambiar contraseña
 * - Recuperar contraseña olvidada
 * - Gestionar token en localStorage/sessionStorage
 *
 * STORAGE STRATEGY:
 * - localStorage: Persistente (no se borra al cerrar navegador)
 * - sessionStorage: Temporal (se borra al cerrar navegador)
 * - Si rememberMe = true: Solo usa localStorage
 * - Si rememberMe = false: Usa ambos (sessionStorage tiene prioridad al leer)
 *
 * MÉTODOS DISPONIBLES:
 * - login(email, password, rememberMe): Iniciar sesión
 * - register(userData): Registrar usuario
 * - logout(): Cerrar sesión y limpiar storage
 * - getCurrentUser(): Obtener usuario desde storage
 * - isAuthenticated(): Verificar si hay token válido
 * - getToken(): Obtener token JWT
 * - validateToken(): Validar token con backend
 * - changePassword(oldPassword, newPassword): Cambiar contraseña
 * - forgotPassword(email): Solicitar recuperación
 * - resetPassword(token, newPassword): Restablecer contraseña
 *
 * SEGURIDAD:
 * - Token JWT almacenado en localStorage/sessionStorage
 * - Contraseñas nunca almacenadas en frontend
 * - Validación de token al cargar app
 * - Auto-logout en token expirado (manejado por api.js interceptor)
 */
import api from './api';

const authService = {
  /**
   * MÉTODO: Login
   *
   * FLUJO:
   * 1. Enviar credenciales al backend
   * 2. Recibir token y datos de usuario
   * 3. Guardar en localStorage (siempre)
   * 4. Si !rememberMe, también guardar en sessionStorage
   * 5. Si rememberMe, guardar email para pre-llenar formulario
   *
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña en texto plano
   * @param {boolean} rememberMe - Mantener sesión activa
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  login: async (email, password, rememberMe = false) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user } = response.data;

      // Siempre guardar en localStorage para que los permisos funcionen correctamente
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));

      // Si rememberMe NO está activado, también guardar en sessionStorage
      // para que se limpie al cerrar el navegador
      if (!rememberMe) {
        sessionStorage.setItem('token', access_token);
        sessionStorage.setItem('user', JSON.stringify(user));
      }

      // Si rememberMe está activado, guardar las credenciales
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberMe', 'true');
      } else {
        // Limpiar credenciales recordadas si no se seleccionó remember me
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberMe');
      }

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al iniciar sesión',
      };
    }
  },

  // Register
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al registrar usuario',
      };
    }
  },

  // Logout
  logout: () => {
    // Limpiar ambos storages
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    // No limpiar rememberedEmail ni rememberMe para mantener el email guardado
    window.location.href = '/#/auth/signin';
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        return null;
      }
    }
    return null;
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    return !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
  },

  // Obtener token
  getToken: () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  },

  // Obtener email recordado
  getRememberedEmail: () => {
    const rememberMe = localStorage.getItem('rememberMe');
    if (rememberMe === 'true') {
      return localStorage.getItem('rememberedEmail');
    }
    return null;
  },

  // Verificar si remember me está activo
  isRememberMeActive: () => {
    return localStorage.getItem('rememberMe') === 'true';
  },

  // Cambiar contraseña
  changePassword: async (oldPassword, newPassword) => {
    try {
      const response = await api.post('/auth/change-password', {
        oldPassword,
        newPassword,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al cambiar contraseña',
      };
    }
  },

  // Validar token
  validateToken: async () => {
    try {
      const response = await api.get('/auth/profile');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false };
    }
  },

  // Solicitar restablecimiento de contraseña
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al solicitar restablecimiento de contraseña',
      };
    }
  },

  // Restablecer contraseña con token
  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', { token, newPassword });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al restablecer contraseña',
      };
    }
  },
};

export default authService;
