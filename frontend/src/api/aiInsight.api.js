import axiosInstance from './axiosInstance';

export const generateProductInsights = (productId) =>
  axiosInstance.post(`/products/${productId}/ai-insights`);
