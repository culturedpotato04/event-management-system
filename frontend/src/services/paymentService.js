import api from './api';

export const processPayment = async (data) => {
  const response = await api.post('/payments/process', data);
  return response.data.data;
};

export const getPayment = async (id) => {
  const response = await api.get(`/payments/${id}`);
  return response.data.data;
};
