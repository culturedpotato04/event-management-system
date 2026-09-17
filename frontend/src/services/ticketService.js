import api from './api';

export const getTicketTypesByEvent = async (eventId) => {
  const response = await api.get(`/tickets/types/event/${eventId}`);
  return response.data.data;
};

export const getTicketType = async (id) => {
  const response = await api.get(`/tickets/types/${id}`);
  return response.data.data;
};

export const createTicketType = async (data) => {
  const response = await api.post('/tickets/types', data);
  return response.data.data;
};

export const updateTicketType = async (id, data) => {
  const response = await api.put(`/tickets/types/${id}`, data);
  return response.data.data;
};

export const updateTicketTypeStatus = async (id, isActive) => {
  const response = await api.patch(`/tickets/types/${id}/status`, { isActive });
  return response.data.data;
};

export const deleteTicketType = async (id) => {
  const response = await api.delete(`/tickets/types/${id}`);
  return response.data.data;
};

export const getAvailability = async (id) => {
  const response = await api.get(`/tickets/types/${id}/availability`);
  return response.data.data;
};
