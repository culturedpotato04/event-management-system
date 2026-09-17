import api from './api';

export const getDashboard = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data.data;
};

export const getAdminEvents = async (params) => {
  const response = await api.get('/admin/events', { params });
  return response.data;
};

export const updateAdminEventStatus = async (id, status) => {
  const response = await api.patch(`/admin/events/${id}/status`, { status });
  return response.data.data;
};

export const deleteAdminEvent = async (id) => {
  const response = await api.delete(`/admin/events/${id}`);
  return response.data.data;
};

export const getAdminBookings = async (params) => {
  const response = await api.get('/admin/bookings', { params });
  return response.data;
};

export const getAdminPayments = async (params) => {
  const response = await api.get('/admin/payments', { params });
  return response.data;
};

export const broadcastNotification = async (data) => {
  const response = await api.post('/admin/notifications/broadcast', data);
  return response.data;
};

export const getAnalyticsBookings = async () => {
  const response = await api.get('/admin/analytics/bookings');
  return response.data.data;
};

export const getAnalyticsRevenue = async () => {
  const response = await api.get('/admin/analytics/revenue');
  return response.data.data;
};

export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data.data;
};

export const updateUserStatus = async (id, status) => {
  const response = await api.patch(`/users/${id}/status`, { status });
  return response.data.data;
};
