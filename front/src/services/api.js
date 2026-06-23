import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

// Injeta o token JWT em toda requisição autenticada
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redireciona para login se o token expirar (exceto nas rotas de autenticação)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthRoute = err.config?.url?.includes('/auth/login') || err.config?.url?.includes('/auth/cadastrar');
    const hasToken = localStorage.getItem('token');

    if (!isAuthRoute && hasToken && (err.response?.status === 401 || err.response?.status === 403)) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
