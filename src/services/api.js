/**
 * CONFIGURACIÓN DE API (Axios)
 *
 * Este módulo configura la instancia de Axios para todas las llamadas API del frontend.
 *
 * FLUJO DE SECUENCIA TÍPICO (Request):
 * Componente → Service → api.request() → Request Interceptor → Backend
 *                                              ↓
 *                                  Agrega Bearer token automáticamente
 *
 * FLUJO DE SECUENCIA TÍPICO (Response):
 * Backend → Response → Response Interceptor → ¿Status 401?
 *                                                  ↓ Sí
 *                                    Limpia localStorage y redirige a /signin
 *                                                  ↓ No
 *                                    Retorna respuesta al Service
 *
 * RESPONSABILIDADES PRINCIPALES:
 * - Configurar base URL del backend
 * - Establecer timeout de 10 segundos para todas las peticiones
 * - Agregar automáticamente el token JWT a cada request (Request Interceptor)
 * - Manejar errores de autenticación (401) con auto-logout (Response Interceptor)
 * - Manejar errores de red y conexión
 * - Proporcionar mensajes de error amigables
 *
 * INTERCEPTORES:
 *
 * 1. REQUEST INTERCEPTOR:
 *    - Obtiene token de localStorage
 *    - Agrega header 'Authorization: Bearer {token}' a todas las peticiones
 *    - Se ejecuta antes de cada request
 *
 * 2. RESPONSE INTERCEPTOR:
 *    - Detecta errores 401 (Unauthorized)
 *    - Limpia localStorage (token, user)
 *    - Redirige automáticamente a /auth/signin
 *    - Maneja errores de red (sin conexión al servidor)
 *
 * CONFIGURACIÓN:
 * - Base URL: process.env.REACT_APP_API_URL (default: http://localhost:3000)
 * - Timeout: 10000ms (10 segundos)
 * - Content-Type: application/json
 *
 * USO EN SERVICIOS:
 * ```
 * import api from './api';
 * const response = await api.get('/users');
 * const response = await api.post('/auth/login', { email, password });
 * ```
 *
 * SEGURIDAD:
 * - Token almacenado en localStorage (considerar httpOnly cookies en producción)
 * - Auto-logout en token expirado/inválido
 * - CORS configurado en backend para permitir origen del frontend
 */
import axios from 'axios';

// Configuración base de la API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos
});

// Interceptor para agregar el token a cada request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si el token expiró o es inválido
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/#/auth/signin';
    }

    // Manejo de errores de red
    if (!error.response) {
      console.error('Error de red:', error.message);
      return Promise.reject({
        message: 'No se pudo conectar al servidor. Verifica tu conexión.',
      });
    }

    return Promise.reject(error);
  }
);

export default api;
