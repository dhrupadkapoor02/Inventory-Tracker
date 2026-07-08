import axiosInstance from './axiosInstance';

export const getSales = () => axiosInstance.get('/sales');
export const getSale = (id) => axiosInstance.get(`/sales/${id}`);
export const createSale = (data) => axiosInstance.post('/sales', data);
