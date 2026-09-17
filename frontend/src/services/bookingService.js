import api from './api';

export const createBooking = async (data) => {
  const response = await api.post('/bookings', data);
  return response.data.data;
};

export const getBookings = async (params) => {
  const response = await api.get('/bookings', { params });
  return response.data;
};

export const getBooking = async (id) => {
  const response = await api.get(`/bookings/${id}`);
  return response.data.data;
};

export const cancelBooking = async (id, reason) => {
  const response = await api.patch(`/bookings/${id}/cancel`, { reason });
  return response.data.data;
};
