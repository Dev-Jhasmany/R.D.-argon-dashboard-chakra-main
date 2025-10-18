import api from './api';

const authService = {
  // Login
  login: async (email, password, rememberMe = false) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user } = response.data;

      // Determinar el storage a usar basado en rememberMe
      const storage = rememberMe ? localStorage : sessionStorage;

      // Guardar token y usuario
      storage.setItem('token', access_token);
      storage.setItem('user', JSON.stringify(user));

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
