import axiosInstance from './axiosInstance';

export const getProducts = (params = {}) => axiosInstance.get('/products', { params });
export const getLowStockProducts = () => axiosInstance.get('/products/alerts/low-stock');
export const getExpiringProducts = (days = 7) =>
  axiosInstance.get('/products/alerts/expiring', { params: { days } });
export const getProduct = (id) => axiosInstance.get(`/products/${id}`);
export const createProduct = (data) => axiosInstance.post('/products', data);
export const updateProduct = (id, data) => axiosInstance.patch(`/products/${id}`, data);
export const deleteProduct = (id) => axiosInstance.delete(`/products/${id}`);
