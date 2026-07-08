import axiosInstance from './axiosInstance';

export const getPurchases = () => axiosInstance.get('/purchases');
export const getPurchase = (id) => axiosInstance.get(`/purchases/${id}`);
export const createPurchase = (data) => axiosInstance.post('/purchases', data);
