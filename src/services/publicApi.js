/**
 * PUBLIC API (Axios)
 *
 * Instancia de API pública para acceso sin autenticación
 * Usado por clientes en el e-commerce
 *
 * A diferencia de api.js, esta instancia NO incluye:
 * - Token de autenticación en headers
 * - Redirección en errores 401
 *
 * Permite acceso público a:
 * - Catálogo de productos
 * - Creación de pedidos de clientes
 */
import axios from 'axios';

// Configuración base de la API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Crear instancia de axios sin autenticación
const publicApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos
});

// Interceptor para manejar respuestas (sin redirección en 401)
publicApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si es error 401, es esperado en modo demo (no mostrar en consola)
    if (error.response?.status === 401) {
      return Promise.reject(error);
    }

    // Manejo de errores de red
    if (!error.response) {
      console.warn('⚠️ Error de red:', error.message);
      return Promise.reject({
        message: 'No se pudo conectar al servidor. Verifica tu conexión.',
      });
    }

    return Promise.reject(error);
  }
);

export default publicApi;
